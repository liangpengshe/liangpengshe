import { NextResponse } from 'next/server'
import {
  listSubmissions,
  getSubmissionById,
} from '@/lib/resource-submission-store'
import { getBatchAverageRatings } from '@/lib/resource-interaction-store'
import { isSubmittableCategory, type ResourceCategory } from '@/lib/resource-categories'

/**
 * 资源库 · 已通过投稿列表 API（前端展示用）
 * ------------------------------------------------------------
 * GET /api/resources/submissions
 *   Query:
 *     category: 物理产品库 / ai-self-tools / ai-hardware / opc-ecology（可选）
 *     limit:    返回数量上限（默认 20）
 *   Response:
 *     items: ResourceSubmissionRecord[] （仅返回 APPROVED 状态的）
 *     ratings: { [id]: { average, count } }
 *     total: number
 * ------------------------------------------------------------
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const categoryParam = url.searchParams.get('category')
    const limit = parseInt(url.searchParams.get('limit') || '20', 10)

    const category =
      categoryParam && isSubmittableCategory(categoryParam)
        ? (categoryParam as ResourceCategory)
        : undefined

    const items = listSubmissions({ status: 'APPROVED', category })
      .slice(0, limit)

    const ratings = getBatchAverageRatings(items.map((i) => i.id))

    // 合并平均评分到 items
    const itemsWithRating = items.map((item) => ({
      ...item,
      rating: ratings[item.id] || { average: 0, count: 0 },
    }))

    return NextResponse.json({
      success: true,
      data: itemsWithRating,
      total: itemsWithRating.length,
    })
  } catch (err) {
    console.error('[resources/submissions] error:', err)
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    )
  }
}
