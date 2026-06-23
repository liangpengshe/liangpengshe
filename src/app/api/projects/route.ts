import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cityCode = searchParams.get('city') || 'shenzhen'

    const projects = await prisma.project.findMany({
      where: {
        city: {
          code: cityCode,
        },
      },
      include: {
        city: true,
      },
    })

    const groupedByCategory = projects.reduce((acc, project) => {
      if (!acc[project.category]) {
        acc[project.category] = []
      }
      acc[project.category].push(project)
      return acc
    }, {} as Record<string, typeof projects>)

    return NextResponse.json({
      success: true,
      data: groupedByCategory,
    })
  } catch (error) {
    console.error('获取项目数据失败:', error)
    return NextResponse.json(
      { error: '获取数据失败，请稍后重试' },
      { status: 500 }
    )
  }
}