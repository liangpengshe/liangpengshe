import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
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

    const projects = await prisma.project.findMany({
      where: { cityId: user.cityId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: projects })
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

    if (!title || !description) {
      return NextResponse.json(
        { error: '请填写完整信息' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        content: content || '',
        category: category || '项目库',
        cityId: user.cityId || '',
      },
    })

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('创建项目失败:', error)
    return NextResponse.json(
      { error: '创建失败' },
      { status: 500 }
    )
  }
}