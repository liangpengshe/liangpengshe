import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ role: 'MEMBER' }, { status: 200 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email || '' },
    select: { role: true, cityId: true },
  })

  return NextResponse.json(user || { role: 'MEMBER' })
}