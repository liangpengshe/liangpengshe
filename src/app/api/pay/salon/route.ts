import { NextRequest, NextResponse } from 'next/server'
import { recordMemberEvent } from '@/lib/member-store'

export async function POST(request: NextRequest) {
  try {
    const { amount, salonId, salonTitle, phone, salonDate } = await request.json()

    // 同步写入会员路线图 store
    try {
      recordMemberEvent(phone || `anon-salon-${Date.now()}`, 'salon', {
        id: salonId || `salon-${Date.now()}`,
        title: salonTitle || '沙龙报名',
        date: salonDate || new Date(Date.now() + 7 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
        status: 'PENDING',
      })
    } catch {}

    return NextResponse.json({
      success: true,
      message: '报名成功！我们会在24小时内联系您确认席位。',
      orderId: `SALON-${Date.now()}`,
      amount,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '报名失败，请稍后重试' },
      { status: 500 }
    )
  }
}