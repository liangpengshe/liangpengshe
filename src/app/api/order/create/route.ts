/**
 * ════════════════════════════════════════════════════════════════
 *  良朋社 OPC · 统一订单生成器 (Order Creator)
 * ════════════════════════════════════════════════════════════════
 *  作用：接收前端传来的 planKey + usePoints，生成统一订单
 *
 *  注意：原 /api/order/create（分润账本）已迁至 /api/order/record-revenue
 *
 *  流程：
 *    1. 校验 planKey 有效性
 *    2. 检查防重复（同 userId + planKey 已 paid/active → 409）
 *    3. 计算实付金额（积分抵扣）
 *    4. 写入 Order 表（status=pending）
 *    5. 返回 checkout_url（mock 模式 → /api/payment/mock-checkout）
 * ════════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPlan, calcPointsDiscount, POINTS_DISCOUNT } from '@/config/plan-benefits'

export const dynamic = 'force-dynamic'

interface CreateOrderRequest {
  planKey: string
  userId: string
  email?: string
  /** 是否使用积分抵扣 */
  usePoints?: boolean
  /** 业务参数（如 cityCode 用于 CITY_5980） */
  metadata?: Record<string, any>
  /** 网关（mock / stripe / polar），默认 mock */
  provider?: 'mock' | 'stripe' | 'polar'
}

export async function POST(request: Request) {
  try {
    const body: CreateOrderRequest = await request.json()
    const { planKey, userId, email, usePoints = false, metadata = {}, provider = 'mock' } = body

    // ── 1. 校验 ──
    if (!planKey || !userId) {
      return NextResponse.json(
        { success: false, error: 'planKey 和 userId 必填' },
        { status: 400 }
      )
    }

    const plan = getPlan(planKey)
    if (!plan || !plan.active) {
      return NextResponse.json(
        { success: false, error: '无效的 planKey: ' + planKey },
        { status: 400 }
      )
    }

    // ── 合作档禁止直接支付（必须走 /partner 申请表单） ──
    if (plan.productType === 'partner') {
      return NextResponse.json(
        {
          success: false,
          error: 'CITY_5980 城市主理人需通过 /partner 申请表单提交，不支持直接支付',
          redirectTo: '/partner',
        },
        { status: 400 }
      )
    }

    // ── 2. 防重复：检查已订阅的同 planKey ──
    const dup = await checkDuplicate(userId, planKey)
    if (dup.isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          error: '已订阅该套餐',
          code: 'ALREADY_PURCHASED',
          existingSubscription: dup.subscription,
        },
        { status: 409 }
      )
    }

    // ── 3. 计算实付金额（积分抵扣） ──
    const userPoints = await getUserPoints(userId)
    const discount = calcPointsDiscount(plan.price, usePoints, userPoints)
    const finalAmount = discount.finalPrice
    const pointsUsed = discount.pointsUsed || 0

    // ── 4. 生成订单 ID（mem- 开头表示内存订单） ──
    const orderId = `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    // ── 5. 写入 Order 表（pending） ──
    const order = await saveOrder({
      id: orderId,
      userId,
      planKey,
      amount: finalAmount,
      pointsUsed,
      pointsDiscount: discount.discount || 0,
      provider,
      metadata: { ...metadata, email },
      status: 'pending',
    })

    // ── 6. 返回 checkout_url ──
    const checkoutUrl = buildCheckoutUrl(orderId, provider)

    return NextResponse.json({
      success: true,
      orderId,
      planKey,
      planName: plan.name,
      productType: plan.productType,
      amount: finalAmount,
      originalAmount: plan.price,
      pointsUsed,
      pointsDiscount: discount.discount || 0,
      userPointsAfterDiscount: userPoints - pointsUsed,
      checkoutUrl,
      provider,
      status: 'pending',
      message: '订单已生成，请跳转到 checkoutUrl 完成支付',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '订单创建失败' },
      { status: 500 }
    )
  }
}

// ════════════════════════════════════════════════════════════════
// 辅助
// ════════════════════════════════════════════════════════════════

async function checkDuplicate(userId: string, planKey: string) {
  // 1. Prisma
  try {
    const order = await prisma.order.findFirst({
      where: { userId, planKey, status: 'paid' },
    })
    if (order) return { isDuplicate: true, subscription: { type: 'paid_order', orderId: order.id } }
  } catch (e) {
    console.warn('[order/create] Prisma checkDuplicate 失败:', e)
  }

  // 2. 内存 store
  const memStore: any[] = (globalThis as any).__orderStoreV2 || []
  if (memStore.some((o) => o.userId === userId && o.planKey === planKey && o.status === 'paid')) {
    return { isDuplicate: true, subscription: { type: 'paid_order_mem' } }
  }

  // 3. 订阅型（MONTHLY_69）还需检查 User.subscription_status
  const plan = getPlan(planKey)
  if (plan?.productType === 'subscription') {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (user?.subscription_type === planKey && user.subscription_status === 'ACTIVE') {
        return { isDuplicate: true, subscription: { type: 'active_subscription', end: user.subscription_end } }
      }
    } catch {}
  }

  return { isDuplicate: false }
}

async function getUserPoints(userId: string): Promise<number> {
  try {
    const balance = await prisma.assetBalance.findUnique({ where: { phone: userId } })
    if (balance) return balance.points
  } catch {}
  // 内存兜底：__pointsStore 是 { balances: Map, logs: [] } 结构（见 subscription-middleware）
  const memStore: any = (globalThis as any).__pointsStore
  if (!memStore) return 0
  if (memStore.balances instanceof Map) {
    const acc = memStore.balances.get(userId)
    return acc?.points ?? 0
  }
  // 兼容旧的扁平数组结构（防止历史代码遗漏）
  if (Array.isArray(memStore)) {
    return memStore
      .filter((p: any) => p.userId === userId)
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
  }
  return 0
}

async function saveOrder(order: any) {
  // 1. Prisma
  try {
    await prisma.order.create({
      data: {
        id: order.id,
        userId: order.userId,
        planKey: order.planKey,
        amount: order.amount,
        pointsUsed: order.pointsUsed,
        pointsDiscount: order.pointsDiscount,
        status: order.status,
        provider: order.provider,
        metadata: order.metadata ? JSON.stringify(order.metadata) : null,
      },
    })
  } catch (e) {
    console.warn('[order/create] Prisma saveOrder 失败:', e)
  }

  // 2. 内存兜底（必须在 globalThis 上持久化，让 mock-checkout 能读到）
  const memStore: any[] = ((globalThis as any).__orderStoreV2 ||= [])
  memStore.unshift({
    ...order,
    metadata: order.metadata ? JSON.stringify(order.metadata) : null,
    createdAt: new Date().toISOString(),
  })
  return order
}

function buildCheckoutUrl(orderId: string, provider: string): string {
  if (provider === 'mock') {
    // Mock 网关：前端跳转到 /api/payment/mock-checkout 并带上 orderId
    // 真实使用场景：window.location.href = checkoutUrl
    return `/api/payment/mock-checkout?orderId=${orderId}`
  }
  if (provider === 'stripe') {
    return `https://checkout.stripe.com/c/pay/cs_test_${orderId}`
  }
  if (provider === 'polar') {
    return `https://buy.polar.sh/polar_${orderId}`
  }
  return `/api/payment/mock-checkout?orderId=${orderId}`
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'POST 统一订单生成器' })
}
