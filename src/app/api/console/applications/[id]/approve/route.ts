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

    const { data: application } = await supabase
      .from('partner_applications')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!application) {
      return NextResponse.json({ error: '申请不存在' }, { status: 404 })
    }

    const { data: city } = await supabase
      .from('cities')
      .select('id')
      .eq('code', application.city)
      .single()

    if (!city) {
      return NextResponse.json({ error: '城市不存在' }, { status: 404 })
    }

    await supabase
      .from('partner_applications')
      .update({ status: 'APPROVED' })
      .eq('id', params.id)

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', `${application.phone}@liangpengshe.com`)
      .single()

    if (!existingUser) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          name: application.name,
          email: `${application.phone}@liangpengshe.com`,
          role: 'CITY_MAINTAINER',
          cityId: city.id,
        })
        .select('id')
        .single()

      await supabase
        .from('cities')
        .update({ maintainerId: newUser?.id })
        .eq('id', city.id)
    } else {
      await supabase
        .from('users')
        .update({ role: 'CITY_MAINTAINER', cityId: city.id })
        .eq('id', existingUser.id)

      await supabase
        .from('cities')
        .update({ maintainerId: existingUser.id })
        .eq('id', city.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('审批申请失败:', error)
    return NextResponse.json(
      { error: '审批失败' },
      { status: 500 }
    )
  }
}