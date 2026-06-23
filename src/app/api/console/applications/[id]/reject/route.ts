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

    await prisma.partnerApplication.update({
      where: { id: params.id },
      data: { status: 'REJECTED' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('拒绝申请失败:', error)
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    )
  }
}