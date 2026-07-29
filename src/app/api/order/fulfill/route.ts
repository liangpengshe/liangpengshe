/**
 * ════════════════════════════════════════════════════════════════
 *  良朋社 OPC · 统一履约引擎 (Order Fulfillment Engine)
 * ════════════════════════════════════════════════════════════════
 *  作用：支付网关（Mock / Stripe / Polar）回调时，执行业务动作
 *
 *  设计原则：
 *    - 只在 payment_status === 'succeeded' 时执行
 *    - 业务动作由 planKey 决定（在 plan-benefits.ts 中定义）
 *    - 数据库 + 内存 双写（与现有 mock-checkout 风格保持一致）
 *    - 幂等：同 orderId 二次调用不会重复履约
 *
 *  调用入口：
 *    - Mock 模式：/api/payment/mock-checkout 同步调用
 *    - 真实模式：Stripe/Polar Webhook 异步回调
 * ════════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPlan } from '@/config/plan-benefits'

export const dynamic = 'force-dynamic'

/** 履约状态缓存（避免重复履约） */
const fulfilledOrders = new Set<string>()
;(globalThis as any).__fulfilledOrders ||= fulfilledOrders
const FULFILLED: Set<string> = (globalThis as any).__fulfilledOrders

interface FulfillRequest {
  /** 订单 ID（来自 /api/order/create） */
  orderId: string
  /** 支付状态（succeeded / failed / pending） */
  paymentStatus: 'succeeded' | 'failed' | 'pending'
  /** 网关类型（mock / stripe / polar） */
  provider?: string
  /** 网关订单号 */
  providerOrderId?: string
}

/** 业务履约结果 */
interface FulfillmentResult {
  orderId: string
  planKey: string
  action: string
  userId: string
  applied: boolean
  details: Record<string, any>
}

export async function POST(request: Request) {
  try {
    const body: FulfillRequest = await request.json()
    const { orderId, paymentStatus, provider = 'mock', providerOrderId } = body

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId 必填' },
        { status: 400 }
      )
    }

    if (paymentStatus !== 'succeeded') {
      // 仅记录失败，不执行业务
      return NextResponse.json(
        {
          success: true,
          orderId,
          paymentStatus,
          applied: false,
          reason: 'payment_not_succeeded',
        },
        { status: 200 }
      )
    }

    // ── 幂等检查 ──
    if (FULFILLED.has(orderId)) {
      return NextResponse.json(
        { success: true, orderId, applied: false, reason: 'already_fulfilled' },
        { status: 200 }
      )
    }

    // ── 读取订单 + planKey ──
    const order = await loadOrder(orderId)
    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在', orderId },
        { status: 404 }
      )
    }

    const plan = getPlan(order.planKey)
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'planKey 不存在: ' + order.planKey, orderId },
        { status: 400 }
      )
    }

    // ── 解析 metadata（cityCode 等） ──
    const metadata = parseMetadata(order.metadata)

    // ── 分发执行 ──
    const result = await dispatchFulfillment({
      order,
      plan,
      provider,
      providerOrderId,
      metadata,
    })

    // ── 标记已履约 ──
    FULFILLED.add(orderId)
    await markOrderPaid(orderId, provider, providerOrderId)

    return NextResponse.json({
      success: true,
      orderId,
      planKey: order.planKey,
      action: plan.benefits.fulfillment.action,
      userId: order.userId,
      applied: true,
      details: result,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '履约失败' },
      { status: 500 }
    )
  }
}

// ════════════════════════════════════════════════════════════════
// 履约动作分发
// ════════════════════════════════════════════════════════════════

async function dispatchFulfillment({
  order,
  plan,
  provider,
  providerOrderId,
  metadata,
}: {
  order: any
  plan: any
  provider: string
  providerOrderId?: string
  metadata: Record<string, any>
}): Promise<Record<string, any>> {
  const action = plan.benefits.fulfillment.action
  const params = plan.benefits.fulfillment.params
  const userId = order.userId
  const now = new Date()

  switch (action) {
    case 'GRANT_POINTS': {
      // ── PIONEER_19: 赠送积分 + 标记 opc_level ──
      const points = params.points || 0
      await grantPoints(userId, points, 'PURCHASE_BONUS', `购买 ${plan.name} 赠送 ${points} 积分`, order.id)
      if (params.opcLevel) {
        await updateUser(userId, { opc_level: params.opcLevel })
      }
      return { grantedPoints: points, opcLevel: params.opcLevel || null }
    }

    case 'ACTIVATE_SUBSCRIPTION': {
      // ── MONTHLY_69: 月度订阅（end = +durationDays） ──
      const days = params.durationDays || 30
      const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
      // 续费时叠加原 end，否则从 now 开始
      const existing = await getUser(userId)
      const newEnd =
        existing?.subscription_end && new Date(existing.subscription_end) > now
          ? new Date(new Date(existing.subscription_end).getTime() + days * 24 * 60 * 60 * 1000)
          : end

      await updateUser(userId, {
        subscription_type: 'MONTHLY_69',
        subscription_status: 'ACTIVE',
        subscription_start: now,
        subscription_end: newEnd,
        auto_renew: true,
      })
      // 订阅即送 100 积分
      await grantPoints(userId, 100, 'SUBSCRIPTION_BONUS', '月度订阅奖励', order.id)
      return { subscriptionEnd: newEnd.toISOString(), auto_renew: true, bonusPoints: 100 }
    }

    case 'ACTIVATE_YEARLY': {
      // ── BASIC_199 / PRO_598 / DEEP_1980: 年度会员（统一字段 ANNUAL_<key>） ──
      const days = params.durationDays || 365
      const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
      // 订阅类型用 ANNUAL_<key> 标准化（按 planKey 决定最终字段）
      const annualKey = order.planKey === 'DEEP_1980' ? 'ANNUAL_1980' : `ANNUAL_${plan.key.replace(/_.*$/, '').replace('BASIC', 'BASIC')}`
      // 简化：用 planKey 命名（ANNUAL_1980 / ANNUAL_PRO / ANNUAL_BASIC）
      const subscriptionType = `ANNUAL_${order.planKey.replace(/^(BASIC|PRO|DEEP)_/, '')}`

      await updateUser(userId, {
        subscription_type: subscriptionType, // 'ANNUAL_1980' / 'ANNUAL_598' / 'ANNUAL_199'
        subscription_status: 'ACTIVE',
        subscription_start: now,
        subscription_end: end,
        auto_renew: false,
      })
      return { subscriptionType, subscriptionEnd: end.toISOString() }
    }

    case 'ACTIVATE_PARTNER': {
      // ── CITY_5980: 激活主理人（仅当走 /api/payment/create-checkout 路径时由原业务处理） ──
      // 注：CITY_5980 现走 /partner 申请表单 + 业务方人工对接，不在此履约
      return { skipped: true, reason: 'CITY_5980 走 /partner 申请表单，不由 fulfill 处理' }
    }

    default:
      return { skipped: true, reason: 'unknown action: ' + action }
  }
}

// ════════════════════════════════════════════════════════════════
// 辅助：订单/用户/积分读写（Prisma + 内存双写）
// ════════════════════════════════════════════════════════════════

async function loadOrder(orderId: string): Promise<any | null> {
  // 1. 内存 store（mock 模式）— globalThis 持久化
  const memStore: any[] = ((globalThis as any).__orderStoreV2 ||= [])
  const memOrder = memStore.find((o) => o.id === orderId)
  if (memOrder) return memOrder

  // 2. Prisma
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    return order
  } catch (e) {
    console.warn('[fulfill] Prisma loadOrder 失败:', e)
    return null
  }
}

async function markOrderPaid(orderId: string, provider: string, providerOrderId?: string) {
  const memStore: any[] = (globalThis as any).__orderStoreV2 || []
  const memOrder = memStore.find((o) => o.id === orderId)
  if (memOrder) {
    memOrder.status = 'paid'
    memOrder.paidAt = new Date().toISOString()
    memOrder.provider = provider
    memOrder.providerOrderId = providerOrderId || null
  }
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'paid', paidAt: new Date(), provider, providerOrderId },
    })
  } catch (e) {
    console.warn('[fulfill] Prisma markOrderPaid 失败:', e)
  }
}

async function getUser(userId: string): Promise<any | null> {
  try {
    return await prisma.user.findUnique({ where: { id: userId } })
  } catch (e) {
    // 内存兜底
    const memUsers: any[] = (globalThis as any).__userStore || []
    return memUsers.find((u) => u.id === userId) || null
  }
}

async function updateUser(userId: string, data: Record<string, any>) {
  // 1. Prisma
  try {
    await prisma.user.update({ where: { id: userId }, data })
  } catch (e) {
    console.warn('[fulfill] Prisma updateUser 失败:', e)
  }
  // 2. 内存兜底
  const memUsers: any[] = (globalThis as any).__userStore || []
  const idx = memUsers.findIndex((u) => u.id === userId)
  if (idx >= 0) {
    memUsers[idx] = { ...memUsers[idx], ...data }
  } else {
    memUsers.push({ id: userId, ...data })
  }
}

async function grantPoints(
  userId: string,
  amount: number,
  type: string,
  remark: string,
  relatedId: string
) {
  if (amount <= 0) return
  const logId = `fulfill-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

  // 1. AssetBalance upsert（Prisma）
  try {
    await prisma.assetBalance.upsert({
      where: { phone: userId },
      create: {
        phone: userId,
        points: amount,
        totalEarned: amount,
      },
      update: {
        points: { increment: amount },
        totalEarned: { increment: amount },
      },
    })
  } catch (e) {
    console.warn('[fulfill] Prisma grantPoints 失败:', e)
  }

  // 2. PointsLog 写入
  try {
    await prisma.pointsLog.create({
      data: {
        id: logId,
        userId,
        type,
        amount,
        balance: amount, // 简化：实际应查询 upsert 后余额
        remark,
        relatedId,
      },
    })
  } catch (e) {
    console.warn('[fulfill] Prisma pointsLog 写入失败:', e)
  }

  // 3. 内存兜底
  const memPoints: any[] = (globalThis as any).__pointsStore || []
  memPoints.unshift({
    id: logId,
    userId,
    type,
    amount,
    remark,
    relatedId,
    createdAt: new Date().toISOString(),
  })
}

function parseMetadata(raw: string | null | undefined): Record<string, any> {
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'POST 履约引擎（webhook 入口）' })
}
