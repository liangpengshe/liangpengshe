import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { data: applications } = await supabase
      .from('partner_applications')
      .select('*')
      .order('createdAt', { ascending: false })

    return NextResponse.json({ success: true, data: applications || [] })
  } catch (error) {
    console.error('获取申请列表失败:', error)
    return NextResponse.json(
      { error: '获取数据失败' },
      { status: 500 }
    )
  }
}