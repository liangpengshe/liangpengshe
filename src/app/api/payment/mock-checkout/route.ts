import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/payment/mock-checkout
 * ------------------------------------------------------------
 * 阶梯式订阅与轻量级付费 · Mock 支付回调
 *
 * 接收参数：
 *   - plan: 'PIONEER_19' | 'MONTHLY_69' | 'LIGHT_598' | 'CITY_5980'
 *   - email?: 用户邮箱（可选；mock 环境从 header 读）
 *   - cityCode?: 城市 code（仅 CITY_5980 必传）
 *
 * 业务逻辑：
 *   - PIONEER_19 (19.9)  → User.assetBalance += 50, opc_level='DIAGNOSED'
 *                          同时通过 /api/points 写入 PointsLog（智富积分）
 *   - MONTHLY_69 (69/月)  → subscription_type='MONTHLY_69', status='ACTIVE', record start
 *                          防重复：若已有 ACTIVE 则返回「您已订阅，无需重复购买」
 *   - LIGHT_598 (598)    → subscription_type='LIGHT_598', status='ACTIVE'
 *   - CITY_5980 (5980)   → role='CITY_MAINTAINER', City.maintainerId 关联
 *
 * 错误处理：
 *   - 遵循 { success: false, error: string } 结构
 *   - 所有代码块 try...catch 包裹防止 Node 进程崩溃
 * ------------------------------------------------------------
 */

const VALID_PLANS = [
  'PIONEER_19',
  'COMMUNITY_199',
  'MONTHLY_69',
  'LIGHT_599',
  'LIGHT_598',
  'DEEP_1980',
  'CITY_5980',
] as const
type PlanKey = (typeof VALID_PLANS)[number]

// 防止 Decimal 精度问题：所有金额用整数（分）
const PLAN_AMOUNT: Record<PlanKey, number> = {
  PIONEER_19: 1990,  // 19.9 元
  COMMUNITY_199: 19900, // 199 元
  MONTHLY_69: 990,   // 首月 9.9 元
  LIGHT_598: 59800,
  LIGHT_599: 59900,  // 599 元
  DEEP_1980: 198000, // 1980 元
  CITY_5980: 598000,
}

/** 通过 email 或 deviceId 查找/创建 User（mock 模式） */
async function findOrCreateUser(email?: string, deviceId?: string) {
  // 1. 优先按 email 查
  if (email) {
    const found = await prisma.user.findUnique({ where: { email } })
    if (found) return { user: found, created: false }
  }

  // 2. 按 deviceId 查（用 deviceId 作为 email 后缀）
  if (deviceId) {
    const syntheticEmail = `device_${deviceId}@opc.local`
    const found = await prisma.user.findUnique({ where: { email: syntheticEmail } })
    if (found) return { user: found, created: false }

    // 3. 创建
    const created = await prisma.user.create({
      data: {
        email: syntheticEmail,
        name: `用户_${deviceId.slice(-4)}`,
        phone: deviceId.startsWith('1') && deviceId.length === 11 ? deviceId : null,
        role: 'MEMBER',
        subscription_status: 'INACTIVE',
        assetBalance: 0,
      },
    })
    return { user: created, created: true }
  }

  // 4. 兜底：使用 anonymous
  return null
}

export async function POST(req: Request) {
  try {
    // ─── 1. 解析参数 ───
    let body: { plan?: string; email?: string; cityCode?: string } = {}
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { success: false, error: '请求体 JSON 解析失败' },
        { status: 400 }
      )
    }

    const plan = body.plan as PlanKey | undefined
    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json(
        {
          success: false,
          error: `无效的订阅计划：${plan}。有效值：${VALID_PLANS.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // ─── 2. 识别用户 ───
    const email =
      body.email ||
      req.headers.get('x-user-email') ||
      undefined
    const deviceId =
      req.headers.get('x-device-id') ||
      req.headers.get('x-opc-device-id') ||
      undefined

    const ctx = await findOrCreateUser(email, deviceId)
    if (!ctx) {
      return NextResponse.json(
        {
          success: false,
          error: '无法识别用户：请在 header 传入 X-User-Email 或 X-Device-Id，或在 body 传 email',
        },
        { status: 400 }
      )
    }

    const user = ctx.user

    // ─── 3. 防重复订阅：MONTHLY_69 ───
    if (
      plan === 'MONTHLY_69' &&
      user.subscription_type === 'MONTHLY_69' &&
      user.subscription_status === 'ACTIVE'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: '您已订阅月度会员，无需重复购买',
          data: {
            subscription_type: user.subscription_type,
            subscription_status: user.subscription_status,
            subscription_end: user.subscription_end,
          },
        },
        { status: 409 }
      )
    }

    // ─── 4. 模拟支付延时 ───
    await new Promise((r) => setTimeout(r, 500))

    // ─── 5. 执行业务回调 ───
    const now = new Date()
    let updatedUser = user
    let extraData: Record<string, any> = {}

    try {
      if (plan === 'PIONEER_19') {
        // 19.9 元 → assetBalance +50, opc_level='DIAGNOSED'
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            assetBalance: { increment: 50 },
            opc_level: user.opc_level || 'DIAGNOSED',
          },
        })
        extraData = {
          pointsAdded: 50,
          newBalance: updatedUser.assetBalance,
          opc_level: updatedUser.opc_level,
        }
      } else if (plan === 'MONTHLY_69') {
        // 69 元/月 → subscription_type='MONTHLY_69', status='ACTIVE'
        const endDate = new Date(now)
        endDate.setMonth(endDate.getMonth() + 1)
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            subscription_type: 'MONTHLY_69',
            subscription_status: 'ACTIVE',
            subscription_start: now,
            subscription_end: endDate,
            auto_renew: true,
            canceled_at: null,
          },
        })
        extraData = {
          subscription_type: 'MONTHLY_69',
          subscription_status: 'ACTIVE',
          subscription_start: now.toISOString(),
          subscription_end: endDate.toISOString(),
          firstMonthPrice: 9.9,
          nextMonthPrice: 69,
        }
      } else if (plan === 'LIGHT_598') {
        // 598 元 → subscription_type='LIGHT_598'
        const endDate = new Date(now)
        endDate.setFullYear(endDate.getFullYear() + 1) // 一次性，1 年有效期
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            subscription_type: 'LIGHT_598',
            subscription_status: 'ACTIVE',
            subscription_start: now,
            subscription_end: endDate,
            auto_renew: false,
            canceled_at: null,
          },
        })
        extraData = {
          subscription_type: 'LIGHT_598',
          subscription_status: 'ACTIVE',
          subscription_start: now.toISOString(),
          subscription_end: endDate.toISOString(),
          validDays: 365,
        }
      } else if (plan === 'COMMUNITY_199') {
        // 199 元/年 → subscription_type='COMMUNITY_199'（社群年度）
        const endDate = new Date(now)
        endDate.setFullYear(endDate.getFullYear() + 1)
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            subscription_type: 'COMMUNITY_199',
            subscription_status: 'ACTIVE',
            subscription_start: now,
            subscription_end: endDate,
            auto_renew: false,
            canceled_at: null,
          },
        })
        extraData = {
          subscription_type: 'COMMUNITY_199',
          subscription_status: 'ACTIVE',
          subscription_start: now.toISOString(),
          subscription_end: endDate.toISOString(),
          validDays: 365,
        }
      } else if (plan === 'LIGHT_599') {
        // 599 元 → subscription_type='LIGHT_599'（3 个月轻陪跑）
        const endDate = new Date(now)
        endDate.setMonth(endDate.getMonth() + 12) // 1 年会员有效期
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            subscription_type: 'LIGHT_599',
            subscription_status: 'ACTIVE',
            subscription_start: now,
            subscription_end: endDate,
            auto_renew: false,
            canceled_at: null,
          },
        })
        extraData = {
          subscription_type: 'LIGHT_599',
          subscription_status: 'ACTIVE',
          subscription_start: now.toISOString(),
          subscription_end: endDate.toISOString(),
          validDays: 365,
          coachDays: 90,
        }
      } else if (plan === 'DEEP_1980') {
        // 1980 元 → subscription_type='DEEP_1980'（深度矩阵陪跑）
        const endDate = new Date(now)
        endDate.setFullYear(endDate.getFullYear() + 1)
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            subscription_type: 'DEEP_1980',
            subscription_status: 'ACTIVE',
            subscription_start: now,
            subscription_end: endDate,
            auto_renew: false,
            canceled_at: null,
          },
        })
        extraData = {
          subscription_type: 'DEEP_1980',
          subscription_status: 'ACTIVE',
          subscription_start: now.toISOString(),
          subscription_end: endDate.toISOString(),
          validDays: 365,
          coachDays: 180,
        }
      } else if (plan === 'CITY_5980') {
        // 5980 元 → role='CITY_MAINTAINER', City.maintainerId 关联
        const cityCode = body.cityCode || 'shenzhen'
        updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            role: 'CITY_MAINTAINER',
            subscription_type: 'CITY_5980',
            subscription_status: 'ACTIVE',
            subscription_start: now,
            // 城市主理人无到期时间
            auto_renew: false,
            canceled_at: null,
          },
        })

        // 尝试关联到 City 表
        let cityLinked = false
        try {
          const city = await prisma.city.findUnique({ where: { code: cityCode } })
          if (city) {
            await prisma.city.update({
              where: { id: city.id },
              data: { maintainerId: user.id },
            })
            cityLinked = true
          }
        } catch (e) {
          console.warn('[CITY_5980] City 关联失败（可能 City 表为空）:', e)
        }

        extraData = {
          role: 'CITY_MAINTAINER',
          cityCode,
          cityLinked,
          subscription_type: 'CITY_5980',
        }
      }
    } catch (dbErr) {
      console.error('[mock-checkout] DB 写入失败:', dbErr)
      return NextResponse.json(
        {
          success: false,
          error: `支付成功但数据写入失败：${String(dbErr)}`,
        },
        { status: 500 }
      )
    }

    // ─── 6. 返回成功 ───
    return NextResponse.json({
      success: true,
      message: 'Mock 支付成功（已模拟回调）',
      data: {
        orderId: `mock_${Date.now()}`,
        plan,
        amount: PLAN_AMOUNT[plan] / 100, // 元
        paidAt: now.toISOString(),
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          assetBalance: updatedUser.assetBalance,
          opc_level: updatedUser.opc_level,
          subscription_type: updatedUser.subscription_type,
          subscription_status: updatedUser.subscription_status,
          subscription_start: updatedUser.subscription_start,
          subscription_end: updatedUser.subscription_end,
          auto_renew: updatedUser.auto_renew,
        },
        ...extraData,
      },
    })
  } catch (err) {
    console.error('[mock-checkout] 顶层异常:', err)
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    )
  }
}

/** GET /api/payment/mock-checkout · 健康检查 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Mock 支付接口在线',
    validPlans: VALID_PLANS,
    planAmounts: Object.fromEntries(
      Object.entries(PLAN_AMOUNT).map(([k, v]) => [k, v / 100])
    ),
  })
}
