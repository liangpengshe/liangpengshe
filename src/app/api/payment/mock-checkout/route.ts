/**
 * ════════════════════════════════════════════════════════════════
 *  良朋社 OPC · Mock 支付网关 (Gateway Simulator)
 * ════════════════════════════════════════════════════════════════
 *  重构后：纯网关模拟，**不执行业务逻辑**。
 *
 *  流程：
 *    1. 接收订单 ID（来自 /api/order/create）
 *    2. 模拟 600ms 支付延时
 *    3. 生成模拟支付成功信号
 *    4. 调用 /api/order/fulfill 触发履约引擎
 *
 *  真实接入 Stripe/Polar：
 *    - 在 /api/order/create 中生成 Stripe checkout_url
 *    - Stripe webhook 回调 /api/order/fulfill
 *    - 本文件无需任何改动
 * ════════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET - 模拟网关跳转页面（前端跳转到此 URL 时，浏览器展示支付完成页）
 * POST - 网关回调（直接执行 fulfill）
 */
export async function GET(request: Request) {
  // 1. 解析 query 参数
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json({ success: false, error: 'orderId 必填' }, { status: 400 })
  }

  // 2. 加载订单
  const order = await loadOrder(orderId)
  if (!order) {
    return NextResponse.json({ success: false, error: '订单不存在', orderId }, { status: 404 })
  }

  // 3. 模拟支付延时（仅 GET 用于页面跳转时）
  await new Promise((r) => setTimeout(r, 600))

  // 4. 直接调用 fulfill（同步执行履约）
  const fulfillResult = await callFulfill(orderId, order)

  // 5. 返回 JSON（前端可解析后跳转成功页）
  return NextResponse.json({
    success: true,
    mock: true,
    orderId,
    planKey: order.planKey,
    amount: order.amount,
    status: 'paid',
    provider: 'mock',
    providerOrderId: `mock-${Date.now()}`,
    fulfillResult,
    message: 'Mock 支付成功，已触发履约',
  })
}

export async function POST(request: Request) {
  // POST 用于 webhook 风格的回调
  try {
    const body = await request.json()
    const { orderId, paymentStatus = 'succeeded', providerOrderId } = body

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId 必填' }, { status: 400 })
    }

    const order = await loadOrder(orderId)
    if (!order) {
      return NextResponse.json({ success: false, error: '订单不存在' }, { status: 404 })
    }

    const fulfillResult = await callFulfill(orderId, order, paymentStatus, providerOrderId)
    return NextResponse.json({
      success: true,
      mock: true,
      orderId,
      paymentStatus,
      fulfillResult,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Mock 支付回调失败' },
      { status: 500 }
    )
  }
}

// ════════════════════════════════════════════════════════════════
// 辅助
// ════════════════════════════════════════════════════════════════

async function loadOrder(orderId: string): Promise<any | null> {
  // 1. 内存（globalThis 持久化，跨模块共享）
  const memStore: any[] = ((globalThis as any).__orderStoreV2 ||= [])
  const memOrder = memStore.find((o) => o.id === orderId)
  if (memOrder) return memOrder
  // 2. Prisma
  try {
    return await prisma.order.findUnique({ where: { id: orderId } })
  } catch {
    return null
  }
}

async function callFulfill(
  orderId: string,
  order: any,
  paymentStatus: string = 'succeeded',
  providerOrderId?: string
): Promise<any> {
  try {
    // 同进程直接调用履约引擎（共享内存）
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const res = await fetch(`${baseUrl}/api/order/fulfill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        paymentStatus,
        provider: 'mock',
        providerOrderId: providerOrderId || `mock-${Date.now()}`,
      }),
    }).catch((e) => {
      console.warn('[mock-checkout] fetch fulfill 失败:', e)
      return null
    })

    if (res && res.ok) {
      return await res.json()
    }
    return { skipped: true, reason: 'fulfill request failed' }
  } catch (e: any) {
    return { error: e.message }
  }
}
