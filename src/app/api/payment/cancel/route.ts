import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/payment/cancel
 * ------------------------------------------------------------
 * 取消月度会员订阅（MONTHLY_69）
 *
 * 业务规则：
 *   - 仅支持取消 ACTIVE 状态的 MONTHLY_69 订阅
 *   - 取消后 status='CANCELED'，auto_renew=false，记录 canceled_at
 *   - 仍可使用至当前 subscription_end（不立即断权）
 *   - 一次性付费（PIONEER_19 / LIGHT_598 / CITY_5980）不支持取消
 *
 * 错误处理：
 *   - 遵循 { success: false, error: string } 结构
 *   - 所有代码块 try...catch 包裹防止 Node 进程崩溃
 * ------------------------------------------------------------
 */

export async function POST(req: Request) {
  try {
    // ─── 1. 解析参数 ───
    let body: { email?: string; deviceId?: string } = {}
    try {
      body = await req.json()
    } catch {
      // body 可空，使用 header 兜底
    }

    const email =
      body.email ||
      req.headers.get('x-user-email') ||
      undefined
    const deviceId =
      body.deviceId ||
      req.headers.get('x-device-id') ||
      req.headers.get('x-opc-device-id') ||
      undefined

    if (!email && !deviceId) {
      return NextResponse.json(
        {
          success: false,
          error: '请在 body 或 header 传入 email / deviceId',
        },
        { status: 400 }
      )
    }

    // ─── 2. 查找用户 ───
    let user = null
    if (email) {
      user = await prisma.user.findUnique({ where: { email } })
    }
    if (!user && deviceId) {
      user = await prisma.user.findUnique({
        where: { email: `device_${deviceId}@opc.local` },
      })
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // ─── 3. 校验订阅状态 ───
    if (user.subscription_type !== 'MONTHLY_69') {
      return NextResponse.json(
        {
          success: false,
          error: `当前订阅为「${user.subscription_type || '未订阅'}」，不支持取消（仅月度会员可取消）`,
          data: {
            subscription_type: user.subscription_type,
            subscription_status: user.subscription_status,
          },
        },
        { status: 400 }
      )
    }

    if (user.subscription_status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: `当前订阅状态为「${user.subscription_status}」，无需重复取消`,
          data: {
            subscription_type: user.subscription_type,
            subscription_status: user.subscription_status,
          },
        },
        { status: 400 }
      )
    }

    // ─── 4. 取消订阅 ───
    const now = new Date()
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        subscription_status: 'CANCELED',
        auto_renew: false,
        canceled_at: now,
        // 保留 subscription_end，到期前仍可使用
      },
    })

    return NextResponse.json({
      success: true,
      message: '已成功取消订阅，您仍可使用至当前周期结束',
      data: {
        subscription_type: updated.subscription_type,
        subscription_status: updated.subscription_status,
        canceled_at: updated.canceled_at,
        subscription_end: updated.subscription_end,
        auto_renew: updated.auto_renew,
      },
    })
  } catch (err) {
    console.error('[payment/cancel] 异常:', err)
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    )
  }
}

/** GET /api/payment/cancel · 健康检查 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: '取消订阅接口在线',
    usage: 'POST { email?: string, deviceId?: string }',
  })
}
