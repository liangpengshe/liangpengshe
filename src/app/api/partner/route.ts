import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, city, phone } = body

    if (!name || !city || !phone) {
      return NextResponse.json(
        { error: '请填写完整信息' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: application } = await supabase
      .from('partner_applications')
      .insert({
        name,
        city,
        phone,
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      message: '申请已提交，工作人员将在1个工作日内联系您',
      data: application,
    })
  } catch (error) {
    console.error('提交合伙人申请失败:', error)
    return NextResponse.json(
      { error: '提交失败，请稍后重试' },
      { status: 500 }
    )
  }
}