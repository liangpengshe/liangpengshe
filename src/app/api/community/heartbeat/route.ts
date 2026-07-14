import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 模拟活跃人数（基于时间的动态数字）
    const baseNumber = 234
    const randomDelta =
      Math.floor(Math.sin(Date.now() / 30000) * 30) + Math.floor(Math.random() * 20)
    const activeNumber = baseNumber + randomDelta

    return NextResponse.json({
      success: true,
      data: {
        activeCount: activeNumber,
        onlineCount: activeNumber + 12,
      },
    })
  } catch (error) {
    console.error('[community/heartbeat] API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
