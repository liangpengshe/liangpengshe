import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, date, location, maxCapacity } = body

    const salon = await prisma.salon.update({
      where: { id: params.id },
      data: {
        title,
        description,
        date: new Date(date),
        location,
        maxCapacity: maxCapacity || 50,
      },
    })

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
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    await prisma.salon.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除沙龙失败:', error)
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    )
  }
}