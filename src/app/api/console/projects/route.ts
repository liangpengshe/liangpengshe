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

    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('cityId', userData.cityId)
      .order('createdAt', { ascending: false })

    return NextResponse.json({ success: true, data: projects || [] })
  } catch (error) {
    console.error('获取项目列表失败:', error)
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
    const { title, description, content, category } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: '请填写完整信息' },
        { status: 400 }
      )
    }

    const { data: project } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        content: content || '',
        category: category || '项目库',
        cityId: userData.cityId || '',
      })
      .select()
      .single()

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('创建项目失败:', error)
    return NextResponse.json(
      { error: '创建失败' },
      { status: 500 }
    )
  }
}