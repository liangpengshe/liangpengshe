import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getProjectBySlug } from '@/data/project-items'

/**
 * POST /api/consultations
 * ------------------------------------------------------------
 * AI 助手"找专家"表单提交（任务 4）
 *
 * Body:
 *   {
 *     name: string,         // 姓名（必填）
 *     phone: string,        // 手机号（必填，11 位）
 *     projectSlug: string,  // 当前项目 slug
 *     step: number,         // 当前步骤（1-indexed）
 *     issue: string,        // 用户填写的卡点描述（可选）
 *     stepTitle?: string,   // 步骤标题（可选）
 *     source?: string       // 来源，默认 ai_assistant
 *   }
 *
 * 响应:
 *   { success: true, message, data: { id, status, createdAt } }
 *
 * 业务逻辑：
 *   1. 字段校验（必填 + 手机号格式）
 *   2. 优先尝试 Prisma 写入 ConsultationRecord 表
 *   3. DB 不可用时降级到 __consultationStore 内存表（与 project_memory 一致）
 *   4. 返回 { success: true, message: '预约成功，专家将在 1 小时内通过微信联系您。' }
 *
 * 关键约束（来自 project_memory）：
 *   - API 路由必须 try...catch 包裹，防止 Node 进程崩溃
 *   - 错误响应统一 { success: false, error: string }
 *   - Payment routes must include memory fallback mechanisms when database is unavailable
 * ------------------------------------------------------------
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ConsultationBody {
  name?: string
  phone?: string
  projectSlug?: string
  step?: number
  stepTitle?: string
  issue?: string
  source?: string
  city?: string
}

interface ConsultationEntry {
  id: string
  name: string
  phone: string
  projectSlug: string
  projectTitle: string | null
  step: number
  stepTitle: string | null
  issue: string | null
  source: string
  status: string
  city: string | null
  userId: string | null
  createdAt: string
  updatedAt: string
}

// 内存 fallback 池（DB 不可用时降级用）
declare global {
  // eslint-disable-next-line no-var
  var __consultationStore: Map<string, ConsultationEntry> | undefined
}
const memoryStore: Map<string, ConsultationEntry> =
  globalThis.__consultationStore || new Map<string, ConsultationEntry>()
globalThis.__consultationStore = memoryStore

function genId(): string {
  return `ct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as ConsultationBody
    const { name, phone, projectSlug, step, stepTitle, issue, source, city } = body

    // 1. 字段校验
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: '请填写姓名' },
        { status: 400 }
      )
    }
    if (!phone || typeof phone !== 'string' || !/^1[3-9]\d{9}$/.test(phone.trim())) {
      return NextResponse.json(
        { success: false, error: '请填写正确的 11 位手机号' },
        { status: 400 }
      )
    }

    // 2. 项目信息（用于冗余 projectTitle）
    const project = projectSlug ? getProjectBySlug(projectSlug) : null
    const projectTitle = project?.title || null

    // 3. 标准化字段
    const cleanName = name.trim().slice(0, 20)
    const cleanPhone = phone.trim()
    const cleanProjectSlug = (projectSlug || '').trim() || 'unknown'
    const cleanStep = typeof step === 'number' && Number.isFinite(step) && step >= 0 ? Math.floor(step) : 0
    const cleanIssue = (issue || '').toString().trim().slice(0, 500) || null
    const cleanStepTitle = stepTitle ? String(stepTitle).trim().slice(0, 100) : null
    const cleanSource = source || 'ai_assistant'
    const cleanCity = city || null
    const now = new Date().toISOString()

    // 4. 优先尝试 Prisma 写入
    let entry!: ConsultationEntry
    let dbWriteSuccess = false
    try {
      const created = await prisma.consultationRecord.create({
        data: {
          name: cleanName,
          phone: cleanPhone,
          projectSlug: cleanProjectSlug,
          projectTitle,
          step: cleanStep,
          stepTitle: cleanStepTitle,
          issue: cleanIssue,
          source: cleanSource,
          city: cleanCity,
          status: 'PENDING',
        },
        select: {
          id: true,
          name: true,
          phone: true,
          projectSlug: true,
          projectTitle: true,
          step: true,
          stepTitle: true,
          issue: true,
          source: true,
          status: true,
          city: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      entry = {
        ...created,
        userId: null,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      }
      dbWriteSuccess = true
      console.info(
        `[consultations] ✅ Prisma 写入成功: ${cleanProjectSlug} step=${cleanStep} phone=${cleanPhone.slice(0, 3)}***`
      )
    } catch (dbErr: any) {
      // DB 不可用（Supabase 未配置 / 本地无 DB）→ 降级到内存
      console.info(
        `[consultations] ⚠️ Prisma 不可用，降级到内存表: ${dbErr?.message || dbErr}`
      )
      entry = {
        id: genId(),
        name: cleanName,
        phone: cleanPhone,
        projectSlug: cleanProjectSlug,
        projectTitle,
        step: cleanStep,
        stepTitle: cleanStepTitle,
        issue: cleanIssue,
        source: cleanSource,
        status: 'PENDING',
        city: cleanCity,
        userId: null,
        createdAt: now,
        updatedAt: now,
      }
      memoryStore.set(entry.id, entry)
    }

    // 5. 业务日志
    console.log(
      `[consultations] 📞 ${dbWriteSuccess ? 'DB' : 'MEM'} 预约: ${cleanName} → ${cleanPhone} | ${cleanProjectSlug} 第 ${cleanStep} 步 | ${cleanIssue ? cleanIssue.slice(0, 30) + '...' : '无描述'}`
    )

    return NextResponse.json({
      success: true,
      message: '预约成功，专家将在 1 小时内通过微信联系您。',
      data: {
        id: entry.id,
        status: entry.status,
        createdAt: entry.createdAt,
        source: entry.source,
        storage: dbWriteSuccess ? 'database' : 'memory_fallback',
      },
    })
  } catch (err: any) {
    console.error('[consultations] 异常:', err?.message || err)
    return NextResponse.json(
      {
        success: false,
        error: '预约失败，请稍后重试',
        detail: err?.message || String(err),
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/consultations?projectSlug=xxx[&status=PENDING]
 * 查询线索池（仅供后台 / 调试用）
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectSlug = searchParams.get('projectSlug')
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 100)

    // 优先查 DB
    try {
      const where: any = {}
      if (projectSlug) where.projectSlug = projectSlug
      if (status) where.status = status
      const rows = await prisma.consultationRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
      return NextResponse.json({
        success: true,
        data: {
          records: rows,
          source: 'database',
        },
      })
    } catch (dbErr) {
      // 降级到内存
      let list = Array.from(memoryStore.values())
      if (projectSlug) list = list.filter((r) => r.projectSlug === projectSlug)
      if (status) list = list.filter((r) => r.status === status)
      list = list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit)
      return NextResponse.json({
        success: true,
        data: {
          records: list,
          source: 'memory_fallback',
        },
      })
    }
  } catch (err: any) {
    console.error('[consultations] GET 异常:', err?.message || err)
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    )
  }
}
