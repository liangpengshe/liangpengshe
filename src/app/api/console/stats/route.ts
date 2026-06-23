import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*, city:cityId(*)')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const cityName = userData.city?.name || ''
    const cityId = userData.cityId

    const { count: totalMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('cityId', cityId)

    const { count: salonRegistrations } = await supabase
      .from('salons')
      .select('*', { count: 'exact', head: true })
      .eq('cityId', cityId)
      .eq('status', 'upcoming')

    const { count: pendingApplications } = await supabase
      .from('partner_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING')

    return NextResponse.json({
      success: true,
      data: { totalMembers: totalMembers || 0, salonRegistrations: salonRegistrations || 0, pendingApplications: pendingApplications || 0 },
      cityName,
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    return NextResponse.json(
      { error: '获取数据失败' },
      { status: 500 }
    )
  }
}