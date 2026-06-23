import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const memoryReviewStore: Record<string, Array<any>> = {
  tool: [],
  service: [],
}

// 审核 action: 通过/驳回/要求修改
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, id, action, comment } = body

    if (!type || !id || !action) {
      return NextResponse.json({ success: false, error: '参数不完整' }, { status: 400 })
    }
    if (!['tool', 'service'].includes(type)) {
      return NextResponse.json({ success: false, error: '不支持的审核类型' }, { status: 400 })
    }
    if (!['approve', 'reject', 'revise'].includes(action)) {
      return NextResponse.json({ success: false, error: '不支持的审核动作' }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'REVISE'

    // Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

    const table = type === 'tool' ? 'ToolSubmission' : 'ServiceProvider'
    const update: any = { status: newStatus, updatedAt: new Date().toISOString() }
    if (type === 'service') {
      update.isVerified = action === 'approve'
    }

    if (hasSupabase) {
      try {
        const supabase = await createClient()
        await supabase.from(table).update(update).eq('id', id)
      } catch (e) {
        console.warn(`[review] Supabase ${type} 失败:`, e)
      }
    }

    // Prisma
    try {
      if (type === 'tool') {
        await prisma.toolSubmission.update({ where: { id }, data: { status: newStatus } })
      } else {
        await prisma.serviceProvider.update({
          where: { id },
          data: { status: newStatus, isVerified: action === 'approve' },
        })
      }
    } catch (e) {
      console.warn(`[review] Prisma ${type} 失败:`, e)
    }

    // 内存
    const list = memoryReviewStore[type]
    const idx = list.findIndex((x) => x.id === id)
    if (idx >= 0) {
      list[idx].status = newStatus
      if (type === 'service') list[idx].isVerified = action === 'approve'
    }

    // 记录审核意见
    const review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      targetId: id,
      action,
      comment: comment || '',
      reviewer: '主理人',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      review,
      message:
        action === 'approve'
          ? '已通过审核，将通过站内信通知申请人'
          : action === 'reject'
          ? '已驳回，将通知申请人'
          : '已要求修改，将通知申请人',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '审核失败' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'POST 接口，提交审核动作' })
}
