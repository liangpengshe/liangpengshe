import { NextResponse } from 'next/server'

/**
 * POST /api/payment/mock-checkout
 * 留空占位：未来真实接入微信/支付宝支付
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    await new Promise((r) => setTimeout(r, 500))
    return NextResponse.json({
      success: true,
      message: 'Mock 支付成功（占位接口）',
      data: {
        orderId: `mock_${Date.now()}`,
        amount: body.amount ?? 9.9,
        paidAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
