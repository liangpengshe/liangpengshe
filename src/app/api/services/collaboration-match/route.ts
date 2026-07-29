/**
 * 服务库 · 协作匹配接口（演进项 3.4 重构）
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 services/collaboration-match（W3.5）
 *
 * POST /api/services/collaboration-match
 * Body:
 *   {
 *     serviceId: 'opc-coaching' | 'shop-group-daiyun',
 *     opcLevel?: 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET' | null,
 *     city?: string
 *   }
 *
 * 数据流：
 *   1. 校验 serviceId
 *   2. 优先查 Supabase users 表 role in (CITY_MAINTAINER, ASSET_OPC)
 *   3. 失败 → 降级到 collaboration-experts.ts mock 池
 *   4. 计算 matchScore 并排序，返回前 3 主理人 + 1-2 资产型 OPC
 * ------------------------------------------------------------
 */
import { withSmartFallback } from '@/lib/api-handler'
import { createClient } from '@/lib/supabase/server'
import { serviceItems } from '@/data/service-items'
import {
  MOCK_CITY_MAINTAINERS,
  MOCK_ASSET_EXPERTS,
  scoreCityMaintainers,
  scoreAssetExperts,
  pickAssetExperts,
  pickCityMaintainers,
  toDisplayExpert,
  type RawExpert,
  type RankedExpert,
} from './_lib/collaboration-match-helpers'
import type { CollaborationExpert } from './_data/collaboration-experts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ════════════════════════════════════════════════════════════════
// 入参 / 出参
// ════════════════════════════════════════════════════════════════
interface MatchBody {
  serviceId?: string
  opcLevel?: 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET' | null
  city?: string | null
}

interface CollaborationMatchResult {
  serviceId: string
  serviceTitle: string
  /** 命中本城市的城市主理人（CITY_MAINTAINER） */
  cityMaintainers: CollaborationExpert[]
  /** 资产型 OPC 专家（ASSET_OPC） */
  assetExperts: CollaborationExpert[]
  /** 综合推荐（前 3 名） */
  recommend: CollaborationExpert[]
  source: 'supabase' | 'mock'
}

// ════════════════════════════════════════════════════════════════
// 数据源：Supabase users 表
// role in (CITY_MAINTAINER, ASSET_OPC) + is_active=true
// 失败 → throw，由 withSmartFallback 兜底
// ════════════════════════════════════════════════════════════════
async function fetchExpertsFromDB(): Promise<RawExpert[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
    throw new Error('Supabase not configured')
  }
  const supabase = await createClient()
  if (!supabase) {
    throw new Error('Supabase client is null')
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .in('role', ['CITY_MAINTAINER', 'ASSET_OPC'])
    .eq('is_active', true)

  if (error) {
    throw new Error(`users query failed: ${error.message}`)
  }
  if (!data || data.length === 0) {
    throw new Error('No active experts matched')
  }

  return data.map((u: any) => ({
    id: u.id,
    name: u.name || '匿名专家',
    city: u.city || '',
    phone: u.phone || '',
    wechat: u.wechat || '',
    wechatMasked: u.wechat_masked || undefined,
    expertise_tags: Array.isArray(u.expertise_tags) ? u.expertise_tags : [],
    bio: u.bio || u.description || '',
    handledProjectCount: u.handled_project_count ?? 0,
    type: (u.role === 'ASSET_OPC' ? 'ASSET_OPC' : 'CITY_MAINTAINER') as RawExpert['type'],
    score: u.score ?? 80,
  }))
}

// ════════════════════════════════════════════════════════════════
// 主 handler
// ════════════════════════════════════════════════════════════════
async function matchHandler(body: MatchBody): Promise<CollaborationMatchResult> {
  const { serviceId, opcLevel, city } = body

  if (!serviceId) {
    throw new Error('缺少 serviceId')
  }

  const service = serviceItems.find((s) => s.id === serviceId)
  if (!service) {
    throw new Error('服务不存在')
  }

  // 数据源：Supabase（失败 → mock）
  let allExperts: RawExpert[]
  let source: 'supabase' | 'mock'
  try {
    allExperts = await fetchExpertsFromDB()
    source = 'supabase'
  } catch (sbErr) {
    console.info('[services/collaboration-match] Supabase 失败，降级 mock:', sbErr)
    allExperts = [...MOCK_CITY_MAINTAINERS, ...MOCK_ASSET_EXPERTS]
    source = 'mock'
  }

  // 拆分两个池
  const cityMaintainersRaw = allExperts.filter((e) => e.type === 'CITY_MAINTAINER')
  const assetExpertsRaw = allExperts.filter((e) => e.type === 'ASSET_OPC')
  // 兜底：DB 池若缺少某类型，合并 mock 数据
  const finalCityMaintainers =
    cityMaintainersRaw.length > 0 ? cityMaintainersRaw : [...MOCK_CITY_MAINTAINERS]
  const finalAssetExperts = assetExpertsRaw.length > 0 ? assetExpertsRaw : [...MOCK_ASSET_EXPERTS]

  // 打分 + 排序（统一对所有数据源应用）
  const scoredMaintainers = scoreCityMaintainers(finalCityMaintainers, serviceId, city, opcLevel)
  const scoredAssets = scoreAssetExperts(finalAssetExperts, serviceId, opcLevel)

  // 选 Top + 兜底
  const cityMaintainers = pickCityMaintainers(scoredMaintainers)
  const assetExperts = pickAssetExperts(scoredAssets)

  // 综合推荐：主理人 + 资产型 OPC，按 matchScore 排序取前 3
  const recommend: RankedExpert[] = [...cityMaintainers, ...assetExperts]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)

  return {
    serviceId,
    serviceTitle: service.title,
    cityMaintainers: cityMaintainers.map(toDisplayExpert),
    assetExperts: assetExperts.map(toDisplayExpert),
    recommend: recommend.map(toDisplayExpert),
    source,
  }
}

// ════════════════════════════════════════════════════════════════
// 兜底 mockBuilder（serviceId 缺失 / 服务不存在时使用）
// ════════════════════════════════════════════════════════════════
function buildMockMatch(body: MatchBody): CollaborationMatchResult {
  const { serviceId = 'opc-coaching', opcLevel, city } = body
  const service = serviceItems.find((s) => s.id === serviceId)
  const serviceTitle = service?.title || serviceId

  const scoredMaintainers = scoreCityMaintainers(
    [...MOCK_CITY_MAINTAINERS],
    serviceId,
    city,
    opcLevel,
  )
  const scoredAssets = scoreAssetExperts([...MOCK_ASSET_EXPERTS], serviceId, opcLevel)
  const cityMaintainers = pickCityMaintainers(scoredMaintainers)
  const assetExperts = pickAssetExperts(scoredAssets)
  const recommend: RankedExpert[] = [...cityMaintainers, ...assetExperts]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)

  return {
    serviceId,
    serviceTitle,
    cityMaintainers: cityMaintainers.map(toDisplayExpert),
    assetExperts: assetExperts.map(toDisplayExpert),
    recommend: recommend.map(toDisplayExpert),
    source: 'mock',
  }
}

// ════════════════════════════════════════════════════════════════
// 出口
// ════════════════════════════════════════════════════════════════
export const POST = withSmartFallback<MatchBody, CollaborationMatchResult>({
  tag: 'services-collaboration-match',
  handler: matchHandler,
  mockBuilder: buildMockMatch,
})

// 保留 GET 端点（与原版一致，用于接口说明）
export async function GET() {
  return new Response(
    JSON.stringify({
      endpoint: '/api/services/collaboration-match',
      method: 'POST',
      description: '服务库 · 协作匹配（学习入门 → 找人合作 联动）',
      bodyExample: { serviceId: 'opc-coaching', opcLevel: 'TRADER', city: '深圳' },
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
