/**
 * 项目库 · 寻找资深 OPC 主理人 接口（演进项 3.4 重构）
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 projects/find-opc（W3.3）
 *
 * POST /api/projects/find-opc
 * Body: { projectId: string, projectCategory?: string }
 *
 * 数据流：
 *   1. Supabase users 表 role='CITY_MAINTAINER' + is_active=true + expertise_tags 包含 category
 *   2. 失败 → 降级到 city-maintainers.ts mock 池
 *   3. 计算 matchScore 并排序，取前 3
 *   4. 脱敏微信，返回展示字段
 *
 * 真实接入时把 throw 替换为生产 Supabase 查询即可。
 * ------------------------------------------------------------
 */
import { withSmartFallback } from '@/lib/api-handler'
import { createClient } from '@/lib/supabase/server'
import { getProjectById } from '@/data/project-items'
import {
  rankMaintainers,
  scoreMatch,
  toDisplay,
  type DisplayMaintainer,
  type MatchedMaintainer,
} from './_lib/find-opc-helpers'
import { CITY_MAINTAINERS, type CityMaintainer } from './_data/city-maintainers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ════════════════════════════════════════════════════════════════
// 入参 / 出参
// ════════════════════════════════════════════════════════════════
interface FindOPCBody {
  projectId?: string
  projectCategory?: string
}

interface FindOPCResult {
  projectId: string
  projectTitle: string
  projectCategory: string
  maintainers: DisplayMaintainer[]
  total: number
  source: 'supabase' | 'mock'
}

// ════════════════════════════════════════════════════════════════
// 数据源：Supabase users 表
// role='CITY_MAINTAINER' + is_active=true + expertise_tags @> [category]
// 失败 → throw，由 withSmartFallback 兜底到 mockBuilder
// ════════════════════════════════════════════════════════════════
async function fetchMaintainersFromDB(category: string): Promise<CityMaintainer[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
    throw new Error('Supabase not configured')
  }
  const supabase = await createClient()
  if (!supabase) {
    throw new Error('Supabase client is null')
  }

  let query = supabase
    .from('users')
    .select('*')
    .eq('role', 'CITY_MAINTAINER')
    .eq('is_active', true)

  if (category) {
    // PG 数组包含：expertise_tags @> [category]
    query = query.contains('expertise_tags', [category])
  }

  const { data, error } = await query
  if (error) {
    throw new Error(`users query failed: ${error.message}`)
  }
  if (!data || data.length === 0) {
    throw new Error('No active city maintainers matched')
  }

  return data.map((u: any) => ({
    id: u.id,
    name: u.name || '匿名主理人',
    city: u.city || '',
    phone: u.phone || '',
    wechat: u.wechat || '',
    expertise_tags: Array.isArray(u.expertise_tags) ? u.expertise_tags : [],
    handledProjectCount: u.handled_project_count ?? 0,
    bio: u.bio || u.description || '该主理人暂未填写简介',
    score: u.score ?? 80,
  }))
}

// ════════════════════════════════════════════════════════════════
// 主 handler
// ════════════════════════════════════════════════════════════════
async function findOPCHandler(body: FindOPCBody): Promise<FindOPCResult> {
  const { projectId, projectCategory } = body

  if (!projectId) {
    throw new Error('缺少 projectId')
  }

  const project = getProjectById(projectId)
  if (!project) {
    throw new Error('项目不存在')
  }

  const category = projectCategory || project.category

  // 数据源：Supabase（失败 → mock）
  let maintainers: CityMaintainer[]
  let source: 'supabase' | 'mock'
  try {
    maintainers = await fetchMaintainersFromDB(category)
    source = 'supabase'
  } catch (sbErr) {
    console.info('[projects/find-opc] Supabase 失败，降级 mock:', sbErr)
    maintainers = [...CITY_MAINTAINERS]
    source = 'mock'
  }

  // 计算匹配 + 脱敏展示
  // 统一对所有数据源应用 scoreMatch，保证 matchScore 字段始终存在
  const pool: MatchedMaintainer[] = maintainers.map((m) => ({
    ...m,
    matchScore: scoreMatch(m, category),
  }))
  const ranked = pool
    .filter((m) => m.matchScore > 0)
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
      return b.score - a.score
    })
    .slice(0, 3)

  // 无任何命中时按 score 降序兜底
  const finalPool: MatchedMaintainer[] =
    ranked.length > 0
      ? ranked
      : pool
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((m) => ({ ...m, fallback: true }))

  const display = finalPool.map(toDisplay)

  return {
    projectId,
    projectTitle: project.title,
    projectCategory: category,
    maintainers: display,
    total: display.length,
    source,
  }
}

// ════════════════════════════════════════════════════════════════
// 兜底 mockBuilder（项目不存在 / 主流程异常时使用）
// ════════════════════════════════════════════════════════════════
function buildMockFindOPC(body: FindOPCBody): FindOPCResult {
  const projectId = body.projectId || 'unknown'
  const project = getProjectById(projectId)
  const projectTitle = project?.title || projectId
  const projectCategory = body.projectCategory || project?.category || ''

  const display = rankMaintainers(projectCategory).slice(0, 3).map(toDisplay)
  return {
    projectId,
    projectTitle,
    projectCategory,
    maintainers: display,
    total: display.length,
    source: 'mock',
  }
}

// ════════════════════════════════════════════════════════════════
// 出口
// ════════════════════════════════════════════════════════════════
export const POST = withSmartFallback<FindOPCBody, FindOPCResult>({
  tag: 'projects-find-opc',
  handler: findOPCHandler,
  mockBuilder: buildMockFindOPC,
})

// 保留 GET 端点（与原版一致，用于接口说明）
export async function GET() {
  return new Response(
    JSON.stringify({
      endpoint: '/api/projects/find-opc',
      method: 'POST',
      description: '寻找资深 OPC 主理人（按项目 category 匹配 expertise_tags）',
      bodyExample: { projectId: 'digital-shop' },
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
