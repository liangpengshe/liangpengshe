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
      .select('cityId')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const { data: salons } = await supabase
      .from('salons')
      .select('*')
      .eq('cityId', userData.cityId)
      .order('date', { ascending: true })

    return NextResponse.json({ success: true, data: salons || [] })
  } catch (error) {
    console.error('获取沙龙列表失败:', error)
    return NextResponse.json(
      { error: '获取数据失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('cityId')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, date, location, maxCapacity } = body

    if (!title || !date || !location) {
      return NextResponse.json(
        { error: '请填写完整信息' },
        { status: 400 }
      )
    }

    const { data: salon } = await supabase
      .from('salons')
      .insert({
        title,
        description,
        date: new Date(date).toISOString(),
        location,
        maxCapacity: maxCapacity || 50,
        cityId: userData.cityId || '',
      })
      .select()
      .single()

    return NextResponse.json({ success: true, data: salon })
  } catch (error) {
    console.error('创建沙龙失败:', error)
    return NextResponse.json(
      { error: '创建失败' },
      { status: 500 }
    )
  }
}