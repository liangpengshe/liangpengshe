import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
    })

    if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'CITY_MAINTAINER')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const application = await prisma.partnerApplication.findUnique({
      where: { id: params.id },
    })

    if (!application) {
      return NextResponse.json({ error: '申请不存在' }, { status: 404 })
    }

    const city = await prisma.city.findUnique({
      where: { code: application.city },
    })

    if (!city) {
      return NextResponse.json({ error: '城市不存在' }, { status: 404 })
    }

    await prisma.partnerApplication.update({
      where: { id: params.id },
      data: { status: 'APPROVED' },
    })

    const existingUser = await prisma.user.findUnique({
      where: { email: `${application.phone}@liangpengshe.com` },
    })

    if (!existingUser) {
      await prisma.user.create({
        data: {
          name: application.name,
          email: `${application.phone}@liangpengshe.com`,
          password: '',
          role: 'CITY_MAINTAINER',
          cityId: city.id,
        },
      })
    } else {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: 'CITY_MAINTAINER', cityId: city.id },
      })
    }

    await prisma.city.update({
      where: { id: city.id },
      data: { maintainerId: existingUser?.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('审批申请失败:', error)
    return NextResponse.json(
      { error: '审批失败' },
      { status: 500 }
    )
  }
}