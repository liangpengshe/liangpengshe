import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { data: admin } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'CITY_MAINTAINER')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    await supabase
      .from('partner_applications')
      .update({ status: 'REJECTED' })
      .eq('id', params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('拒绝申请失败:', error)
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    )
  }
}