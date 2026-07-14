/**
 * 项目库 · SOP 步骤进度同步接口（任务 4 后端）
 * ------------------------------------------------------------
 * PATCH /api/projects/step-progress
 *
 * Body:
 *   {
 *     slug: string,             // 项目 slug
 *     completedSteps: number,   // 已完成步骤数 (0..totalSteps)
 *     totalSteps?: number       // 可选：总步骤数（默认 5）
 *   }
 *
 * 响应:
 *   { success: true, data: { slug, completedSteps, totalSteps, percent, updatedAt } }
 *
 * 业务逻辑：
 *   1. 校验 slug 是否在 projectItems 中存在
 *   2. 校验 completedSteps 范围 [0, totalSteps]
 *   3. 内存 Map 持久化（生产环境替换为 Supabase / Redis）
 *   4. 100% 完成时自动追加日志，便于后续解锁矩阵放大
 *
 * 关键约束（来自 project_memory）：
 *   - API 路由必须 try...catch 包裹，防止 Node 进程崩溃
 *   - 错误响应统一 { success: false, error: string }
 * ------------------------------------------------------------
 */
import { NextResponse } from 'next/server'
import { getProjectBySlug } from '@/data/project-items'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface StepProgressBody {
  slug?: string
  completedSteps?: number
  totalSteps?: number
}

interface ProgressEntry {
  slug: string
  completedSteps: number
  totalSteps: number
  percent: number
  /** 是否已全部完成 */
  isCompleted: boolean
  /** 完成时间（仅 100% 时记录） */
  completedAt?: string
  updatedAt: string
}

// 内存进度池（生产环境替换为 Supabase: 'project_step_progress' 表）
const progressStore: Map<string, ProgressEntry> = new Map()

export async function PATCH(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as StepProgressBody
    const { slug, completedSteps, totalSteps = 5 } = body

    // 1. 字段校验
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { success: false, error: '缺少 slug 字段' },
        { status: 400 }
      )
    }

    if (typeof completedSteps !== 'number' || isNaN(completedSteps)) {
      return NextResponse.json(
        { success: false, error: 'completedSteps 必须为数字' },
        { status: 400 }
      )
    }

    if (completedSteps < 0 || completedSteps > totalSteps) {
      return NextResponse.json(
        {
          success: false,
          error: `completedSteps 必须在 [0, ${totalSteps}] 范围内`,
        },
        { status: 400 }
      )
    }

    // 2. 校验 slug 是否存在
    const project = getProjectBySlug(slug)
    if (!project) {
      return NextResponse.json(
        { success: false, error: `项目不存在: ${slug}` },
        { status: 404 }
      )
    }

    // 3. 写入进度池
    const now = new Date().toISOString()
    const percent = Math.round((completedSteps / totalSteps) * 100)
    const isCompleted = completedSteps >= totalSteps

    const existing = progressStore.get(slug)
    const entry: ProgressEntry = {
      slug,
      completedSteps,
      totalSteps,
      percent,
      isCompleted,
      completedAt:
        isCompleted && !existing?.isCompleted
          ? now
          : existing?.completedAt,
      updatedAt: now,
    }
    progressStore.set(slug, entry)

    // 4. 100% 完成时，模拟"解锁矩阵放大"日志
    if (isCompleted && !existing?.isCompleted) {
      // 生产环境可在此触发：supabase.from('events').insert({...})
      // 或解锁用户的 STEP 04 入口
      console.log(
        `[projects/step-progress] 🎉 ${project.title} 全部 ${totalSteps} 步完成，解锁矩阵放大`
      )
    }

    return NextResponse.json({
      success: true,
      data: entry,
    })
  } catch (err) {
    console.error('[projects/step-progress] error:', err)
    return NextResponse.json(
      { success: false, error: '服务异常，请稍后再试' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/projects/step-progress?slug=xxx
 * 查询某个项目的当前进度
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({
        success: true,
        data: { progress: {}, total: progressStore.size },
      })
    }

    const entry = progressStore.get(slug) || null
    return NextResponse.json({
      success: true,
      data: { progress: entry },
    })
  } catch (err) {
    console.error('[projects/step-progress] GET error:', err)
    return NextResponse.json(
      { success: false, error: '服务异常' },
      { status: 500 }
    )
  }
}
