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
    const { title, description, content, category } = body

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        title,
        description,
        content: content || '',
        category: category || '项目库',
      },
    })

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('更新项目失败:', error)
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

    await prisma.project.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除项目失败:', error)
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    )
  }
}