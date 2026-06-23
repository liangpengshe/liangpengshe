import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, date, location, maxCapacity } = body

    const { data: salon } = await supabase
      .from('salons')
      .update({
        title,
        description,
        date: new Date(date).toISOString(),
        location,
        maxCapacity: maxCapacity || 50,
      })
      .eq('id', params.id)
      .select()
      .single()

    return NextResponse.json({ success: true, data: salon })
  } catch (error) {
    console.error('更新沙龙失败:', error)
    return NextResponse.json(
      { error: '更新失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    await supabase
      .from('salons')
      .delete()
      .eq('id', params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除沙龙失败:', error)
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    )
  }
}