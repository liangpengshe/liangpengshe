import { NextResponse } from 'next/server'

/**
 * POST /api/consultations
 * 留空占位：未来真实接入专家预约系统
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    await new Promise((r) => setTimeout(r, 400))
    return NextResponse.json({
      success: true,
      message: 'Mock 预约成功（占位接口）',
      data: {
        bookingId: `bk_${Date.now()}`,
        name: body.name,
        phone: body.phone,
        createdAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
