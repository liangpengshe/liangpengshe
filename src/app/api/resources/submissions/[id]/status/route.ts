import { NextResponse } from 'next/server'
import {
  getSubmissionById,
  updateSubmissionStatus,
  type SubmissionStatus,
} from '@/lib/resource-submission-store'

/**
 * 资源库 · 投稿审核状态 API（后台管理用）
 * ------------------------------------------------------------
 * PATCH /api/resources/submissions/[id]/status
 *   Body: { status: 'APPROVED' | 'REJECTED', rejectReason?: string }
 *   Response: 更新后的投稿记录
 *
 * GET /api/resources/submissions/[id]/status
 *   获取单个投稿详情（含 status）
 * ------------------------------------------------------------
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少投稿 id' },
        { status: 400 }
      )
    }
    const existing = getSubmissionById(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '投稿不存在' },
        { status: 404 }
      )
    }

    const body = (await request.json().catch(() => ({}))) as {
      status?: SubmissionStatus
      rejectReason?: string
    }
    const { status, rejectReason } = body

    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { success: false, error: '状态值不合法（必须是 APPROVED / REJECTED / PENDING）' },
        { status: 400 }
      )
    }

    if (status === 'REJECTED' && !rejectReason?.trim()) {
      return NextResponse.json(
        { success: false, error: '驳回时必须填写驳回理由' },
        { status: 400 }
      )
    }

    const updated = updateSubmissionStatus(id, status, rejectReason)
    return NextResponse.json({
      success: true,
      data: updated,
      message:
        status === 'APPROVED'
          ? '✅ 审核通过，已在资源库展示'
          : status === 'REJECTED'
            ? '❌ 已驳回，已通知作者'
            : '已重置为待审核',
    })
  } catch (err) {
    console.error('[resources/submissions/[id]/status] PATCH error:', err)
    return NextResponse.json(
      { success: false, error: '操作失败' },
      { status: 500 }
    )
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const record = getSubmissionById(params?.id)
    if (!record) {
      return NextResponse.json(
        { success: false, error: '投稿不存在' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: record })
  } catch (err) {
    console.error('[resources/submissions/[id]/status] GET error:', err)
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    )
  }
}
