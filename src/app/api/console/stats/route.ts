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
      include: { city: true },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const cityName = user.city?.name || ''
    const cityId = user.cityId

    const totalMembers = await prisma.user.count({
      where: { cityId },
    })

    const salonRegistrations = await prisma.salon.count({
      where: { cityId, status: 'upcoming' },
    })

    const pendingApplications = await prisma.partnerApplication.count({
      where: { status: 'PENDING' },
    })

    return NextResponse.json({
      success: true,
      data: { totalMembers, salonRegistrations, pendingApplications },
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