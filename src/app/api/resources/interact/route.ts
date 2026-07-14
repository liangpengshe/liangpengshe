import { NextResponse } from 'next/server'
import {
  createInteraction,
  listInteractions,
  type InteractionType,
} from '@/lib/resource-interaction-store'
import { getSubmissionById } from '@/lib/resource-submission-store'

/**
 * 资源库 · 互动 API（评分/评论/实操笔记）
 * ------------------------------------------------------------
 * POST /api/resources/interact
 *   Body: { resourceId, userId, userName?, type, content, rating? }
 *     type:    'COMMENT' | 'REVIEW' | 'NOTE'
 *     rating:  1-5（仅 REVIEW 类型必填）
 *
 * GET /api/resources/interact?resourceId=xxx&type=COMMENT
 *   获取互动列表
 * ------------------------------------------------------------
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface InteractBody {
  resourceId?: string
  userId?: string
  userName?: string
  type?: InteractionType
  content?: string
  rating?: number
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as InteractBody
    const { resourceId, userId, userName, type, content, rating } = body

    // 校验
    if (!resourceId) {
      return NextResponse.json(
        { success: false, error: '缺少 resourceId' },
        { status: 400 }
      )
    }
    if (!getSubmissionById(resourceId)) {
      return NextResponse.json(
        { success: false, error: '资源不存在' },
        { status: 404 }
      )
    }
    if (!userId || !userId.trim()) {
      return NextResponse.json(
        { success: false, error: '请先登录 OPC 账号' },
        { status: 401 }
      )
    }
    if (!type || !['COMMENT', 'REVIEW', 'NOTE'].includes(type)) {
      return NextResponse.json(
        { success: false, error: '互动类型不合法（COMMENT/REVIEW/NOTE）' },
        { status: 400 }
      )
    }
    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: '互动内容不能为空' },
        { status: 400 }
      )
    }
    if (type === 'REVIEW') {
      if (rating == null || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return NextResponse.json(
          { success: false, error: '评分必须是 1-5 的整数' },
          { status: 400 }
        )
      }
    }

    const record = createInteraction({
      resourceId,
      userId: userId.trim(),
      userName: userName || null,
      type,
      content: content.trim().slice(0, 1000),
      rating: type === 'REVIEW' ? rating : null,
    })

    return NextResponse.json({
      success: true,
      data: record,
      message:
        type === 'REVIEW'
          ? '⭐ 感谢您的评分！'
          : type === 'NOTE'
            ? '📝 实操笔记发布成功！'
            : '💬 评论已发布',
    })
  } catch (err) {
    console.error('[resources/interact] POST error:', err)
    return NextResponse.json(
      { success: false, error: '互动失败' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const resourceId = url.searchParams.get('resourceId')
    const type = url.searchParams.get('type') as InteractionType | null

    if (!resourceId) {
      return NextResponse.json(
        { success: false, error: '缺少 resourceId' },
        { status: 400 }
      )
    }

    const items = listInteractions({
      resourceId,
      type: type || undefined,
    })

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length,
    })
  } catch (err) {
    console.error('[resources/interact] GET error:', err)
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    )
  }
}
