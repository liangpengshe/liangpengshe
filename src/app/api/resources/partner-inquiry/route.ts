/**
 * 资源库 · 招商加盟对接接口（演进项 3.4 重构）
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 resources/partner-inquiry（W3.4）
 *
 * POST /api/resources/partner-inquiry
 * Body: { name, wechat, city, resourceId? }
 *
 * 数据流：
 *   1. 校验入参（必填 3 项）
 *   2. 优先查 Supabase City 表（name ilike city）+ PartnerLead 写入
 *   3. 失败 → 降级到 city-managers.ts mock 池
 *   4. 匹配成功 → 返回主理人企业微信 + 加盟政策
 *   5. 匹配失败 → 转入"人工专家"线索池
 * ------------------------------------------------------------
 */
import { withSmartFallback } from '@/lib/api-handler'
import { createClient } from '@/lib/supabase/server'
import {
  EXPERT_FALLBACK_TIPS,
  FRANCHISE_POLICY,
  buildTicketId,
  matchManagerByCity,
  validateInquiry,
} from './_lib/partner-inquiry-helpers'
import { CITY_MANAGERS, type CityManager } from './_data/city-managers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ════════════════════════════════════════════════════════════════
// 入参 / 出参
// ════════════════════════════════════════════════════════════════
interface InquiryBody {
  name?: string
  wechat?: string
  city?: string
  resourceId?: string
}

type InquiryResult =
  | {
      success: true
      routed: 'manager'
      message: string
      manager: CityManager
      policy: readonly string[]
      source: 'supabase' | 'mock'
    }
  | {
      success: true
      routed: 'expert'
      message: string
      ticketId: string
      eta: string
      fallback: readonly string[]
      source: 'supabase' | 'mock'
    }

// ════════════════════════════════════════════════════════════════
// 数据源：Supabase City 表（mock 同步）
// 优先取真实主理人；未配置 / 失败 → 降级 mock
// ════════════════════════════════════════════════════════════════
async function fetchManagerFromDB(city: string): Promise<CityManager | null> {
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
    .from('City')
    .select('*')
    .ilike('name', `%${city}%`)
    .limit(1)

  if (error) {
    throw new Error(`City query failed: ${error.message}`)
  }
  if (!data || data.length === 0) {
    return null
  }

  const row: any = data[0]
  return {
    city: row.name,
    name: row.manager_name || '匿名主理人',
    wechat: row.manager_wechat || '',
    phone: row.manager_phone || '',
    specialty: row.specialty || 'OPC 主理人',
  }
}

// ════════════════════════════════════════════════════════════════
// 主 handler
// ════════════════════════════════════════════════════════════════
async function inquiryHandler(body: InquiryBody): Promise<InquiryResult> {
  // 入参校验（throw → withSmartFallback 兜底到 mockBuilder）
  const validationError = validateInquiry(body)
  if (validationError) {
    throw new Error(validationError)
  }

  const { name, wechat, city, resourceId } = body
  const trimmedCity = (city || '').trim()

  // 数据源：Supabase（失败 → mock 池）
  let manager: CityManager | null = null
  let source: 'supabase' | 'mock' = 'mock'
  try {
    manager = await fetchManagerFromDB(trimmedCity)
    source = 'supabase'
  } catch (sbErr) {
    console.info('[resources/partner-inquiry] Supabase 失败，降级 mock:', sbErr)
    manager = matchManagerByCity(trimmedCity)
    source = 'mock'
  }

  // 路径 1：匹配到主理人
  if (manager) {
    // 写入 PartnerLead（best-effort，不阻塞主响应）
    try {
      const supabase = await createClient()
      if (supabase) {
        await supabase.from('PartnerLead').insert({
          name,
          wechat,
          city: trimmedCity,
          resource_id: resourceId,
          routed: 'manager',
          source,
          created_at: new Date().toISOString(),
        })
      }
    } catch (leadErr) {
      console.info('[resources/partner-inquiry] PartnerLead 写入失败（best-effort）:', leadErr)
    }

    return {
      success: true,
      routed: 'manager',
      message: `已为您匹配 ${manager.city} 主理人 ${manager.name}`,
      manager,
      policy: FRANCHISE_POLICY,
      source,
    }
  }

  // 路径 2：未匹配到主理人 → 人工专家线索池
  const ticketId = buildTicketId()
  try {
    const supabase = await createClient()
    if (supabase) {
      await supabase.from('PartnerLead').insert({
        name,
        wechat,
        city: trimmedCity,
        resource_id: resourceId,
        routed: 'expert',
        ticket_id: ticketId,
        source,
        created_at: new Date().toISOString(),
      })
    }
  } catch (leadErr) {
    console.info('[resources/partner-inquiry] PartnerLead 写入失败（best-effort）:', leadErr)
  }

  return {
    success: true,
    routed: 'expert',
    message: '未匹配到当地主理人，已转入总部专家线索池',
    ticketId,
    eta: '24 小时内由总部专家主动联系您',
    fallback: EXPERT_FALLBACK_TIPS,
    source,
  }
}

// ════════════════════════════════════════════════════════════════
// 兜底 mockBuilder（任意主流程异常 → mock 池匹配）
// ════════════════════════════════════════════════════════════════
function buildMockInquiry(body: InquiryBody): InquiryResult {
  const city = (body.city || '').trim()
  const manager = matchManagerByCity(city)
  if (manager) {
    return {
      success: true,
      routed: 'manager',
      message: `已为您匹配 ${manager.city} 主理人 ${manager.name}`,
      manager,
      policy: FRANCHISE_POLICY,
      source: 'mock',
    }
  }
  return {
    success: true,
    routed: 'expert',
    message: '未匹配到当地主理人，已转入总部专家线索池',
    ticketId: buildTicketId(),
    eta: '24 小时内由总部专家主动联系您',
    fallback: EXPERT_FALLBACK_TIPS,
    source: 'mock',
  }
}

// ════════════════════════════════════════════════════════════════
// 出口
// ════════════════════════════════════════════════════════════════
export const POST = withSmartFallback<InquiryBody, InquiryResult>({
  tag: 'resources-partner-inquiry',
  handler: inquiryHandler,
  mockBuilder: buildMockInquiry,
})

// 保留 GET 端点（与原版一致，用于接口说明）
export async function GET() {
  return new Response(
    JSON.stringify({
      endpoint: '/api/resources/partner-inquiry',
      method: 'POST',
      description: '资源库 · 招商加盟对接（按意向城市匹配 OPC 主理人）',
      supportedCities: Object.keys(CITY_MANAGERS),
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
