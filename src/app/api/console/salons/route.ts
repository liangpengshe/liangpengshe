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

    const salons = await prisma.salon.findMany({
      where: { cityId: user.cityId },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ success: true, data: salons })
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

    if (!title || !date || !location) {
      return NextResponse.json(
        { error: '请填写完整信息' },
        { status: 400 }
      )
    }

    const salon = await prisma.salon.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        maxCapacity: maxCapacity || 50,
        cityId: user.cityId || '',
      },
    })

    return NextResponse.json({ success: true, data: salon })
  } catch (error) {
    console.error('创建沙龙失败:', error)
    return NextResponse.json(
      { error: '创建失败' },
      { status: 500 }
    )
  }
}