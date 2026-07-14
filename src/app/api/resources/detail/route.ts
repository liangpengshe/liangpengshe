import { NextResponse } from 'next/server'
import { getSubmissionById } from '@/lib/resource-submission-store'
import {
  listInteractions,
  getAverageRating,
  getInteractionStats,
} from '@/lib/resource-interaction-store'

/**
 * 资源库 · 投稿详情 API（详情页用）
 * ------------------------------------------------------------
 * GET /api/resources/detail?id=xxx
 *   Response: {
 *     submission: ResourceSubmissionRecord,
 *     rating: { average, count },
 *     interactions: { comments[], reviews[], notes[] },
 *     stats: { COMMENT, REVIEW, NOTE }
 *   }
 * ------------------------------------------------------------
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少资源 id' },
        { status: 400 }
      )
    }

    const submission = getSubmissionById(id)
    if (!submission) {
      return NextResponse.json(
        { success: false, error: '资源不存在' },
        { status: 404 }
      )
    }

    const all = listInteractions({ resourceId: id })
    const rating = getAverageRating(id)
    const stats = getInteractionStats(id)

    return NextResponse.json({
      success: true,
      data: {
        submission,
        rating,
        stats,
        comments: all.filter((i) => i.type === 'COMMENT'),
        reviews: all.filter((i) => i.type === 'REVIEW'),
        notes: all.filter((i) => i.type === 'NOTE'),
      },
    })
  } catch (err) {
    console.error('[resources/detail] error:', err)
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    )
  }
}
