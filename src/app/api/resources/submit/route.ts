import { NextResponse } from 'next/server'
import {
  createSubmission,
  listSubmissions,
} from '@/lib/resource-submission-store'
import { isSubmittableCategory, type ResourceCategory } from '@/lib/resource-categories'

/**
 * 资源库 · OPC 共创投稿 API
 * ------------------------------------------------------------
 * POST /api/resources/submit
 *   提交新投稿（默认状态 PENDING，等待审核）
 *   Body: { authorId, authorName?, authorLevel?, title, description, category, fileUrl? }
 *
 * GET /api/resources/submit?status=PENDING&category=ai-software
 *   获取投稿列表（按 status / category 过滤）
 * ------------------------------------------------------------
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SubmitBody {
  authorId?: string
  authorName?: string
  authorLevel?: string
  title?: string
  description?: string
  category?: string
  fileUrl?: string
}

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr-device'
  let id = window.localStorage.getItem('opc_device_id')
  if (!id) {
    id = `dev-${Date.now()}-${Math.floor(Math.random() * 100000)}`
    window.localStorage.setItem('opc_device_id', id)
  }
  return id
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as SubmitBody
    const { authorId, authorName, authorLevel, title, description, category, fileUrl } = body

    // 入参校验
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: '资源名称不能为空' },
        { status: 400 }
      )
    }
    if (!description || !description.trim()) {
      return NextResponse.json(
        { success: false, error: '资源简介不能为空' },
        { status: 400 }
      )
    }
    if (!category || !isSubmittableCategory(category)) {
      return NextResponse.json(
        { success: false, error: '资源类别不合法（仅允许 4 大可投稿分类）' },
        { status: 400 }
      )
    }
    if (!authorId || !authorId.trim()) {
      return NextResponse.json(
        { success: false, error: '请先登录 OPC 账号' },
        { status: 401 }
      )
    }

    // 创建投稿
    const record = createSubmission({
      authorId: authorId.trim(),
      authorName: authorName || null,
      authorLevel: authorLevel || null,
      title: title.trim().slice(0, 100),
      description: description.trim().slice(0, 2000),
      category: category as ResourceCategory,
      fileUrl: fileUrl?.trim() || null,
    })

    return NextResponse.json({
      success: true,
      data: record,
      message: '投稿成功！您的资源已进入审核队列，预计 1-3 个工作日内完成审核',
    })
  } catch (err) {
    console.error('[resources/submit] POST error:', err)
    return NextResponse.json(
      { success: false, error: '投稿服务异常，请稍后再试' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get('status') as
      | 'PENDING'
      | 'APPROVED'
      | 'REJECTED'
      | null
    const category = url.searchParams.get('category') || undefined
    const authorId = url.searchParams.get('authorId') || undefined

    const items = listSubmissions({
      status: status || undefined,
      category: category as ResourceCategory | undefined,
      authorId,
    })

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length,
    })
  } catch (err) {
    console.error('[resources/submit] GET error:', err)
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    )
  }
}
