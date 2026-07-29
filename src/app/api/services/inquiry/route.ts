/**
 * 服务库 · 需求收集接口（演进项 3.4 重构）
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 services/inquiry（W3.6）
 *
 * POST /api/services/inquiry
 * Body:
 *   {
 *     selectedServices: string[],   // ServiceItem['id'][]
 *     form: {
 *       name, phone, wechat?, description?, city?, opcLevel?
 *     }
 *   }
 *
 * 数据流：
 *   1. 校验入参（必填 + 手机号格式）
 *   2. AI/专家分流（type: 'ai' → 模拟 Dify；'expert' → 工单）
 *   3. 专属专家分配（按 opc_level 智能路由，缺省 → 总部专家池）
 *   4. 主理人推荐（按城市）
 *   5. best-effort 写入 ConsultationRecord（Supabase）
 *   6. 失败 → 降级纯 mock 池
 * ------------------------------------------------------------
 */
import { withSmartFallback } from '@/lib/api-handler'
import { createClient } from '@/lib/supabase/server'
import { serviceItems } from '@/data/service-items'
import {
  validateInquiry,
  matchManagerByCity,
  assignExpert,
  buildTicketId,
  type InquiryForm,
  type AssignedExpert,
} from './_lib/inquiry-helpers'
import { CITY_MANAGERS } from './_data/city-managers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ════════════════════════════════════════════════════════════════
// 入参 / 出参
// ════════════════════════════════════════════════════════════════
interface InquiryBody {
  selectedServices?: string[]
  form?: InquiryForm
}

interface MatchedManager {
  city: string
  name: string
  phone: string
  wechat: string
  specialty?: string
}

interface InquiryResult {
  success: true
  message: string
  /** AI 智能体通道 */
  aiSessions: string[]
  /** 人工专家工单通道 */
  expertTickets: string[]
  /** 主理人推荐 */
  matchedManagers: MatchedManager[]
  /** 专属专家（按 opcLevel 路由） */
  assignedExpert:
    | AssignedExpert
    | { name: string; specialty: string; fallback: true }
  source: 'supabase' | 'mock'
}

// ════════════════════════════════════════════════════════════════
// AI / 专家分流
// ════════════════════════════════════════════════════════════════
function dispatchByType(selectedIds: string[]): {
  aiSessions: string[]
  expertTickets: string[]
} {
  const aiSessions: string[] = []
  const expertTickets: string[] = []

  for (const id of selectedIds) {
    const item = serviceItems.find((s) => s.id === id)
    if (!item) continue

    if (item.type === 'ai') {
      // AI 智能体分流（mock · 后续接 Dify）
      aiSessions.push(`${item.title} · AI 顾问已上线，可随时开启对话`)
    } else {
      // 转人工专家（mock · 工单 ID）
      const ticketId = buildTicketId()
      expertTickets.push(`${item.title} · 工单 #${ticketId} 已派发，24h 内联系您`)
    }
  }

  return { aiSessions, expertTickets }
}

// ════════════════════════════════════════════════════════════════
// 数据源：Supabase ConsultationRecord（best-effort 写入）
// 失败 → 不抛错，仅 console.info
// ════════════════════════════════════════════════════════════════
async function writeConsultationRecord(
  form: InquiryForm,
  aiSessions: string[],
  expertTickets: string[],
  assignedExpert: AssignedExpert | { name: string; specialty: string; fallback: true },
  matchedManager: MatchedManager,
): Promise<'supabase' | 'mock'> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
    return 'mock'
  }
  try {
    const supabase = await createClient()
    if (!supabase) return 'mock'

    await supabase.from('ConsultationRecord').insert({
      name: form.name,
      phone: form.phone,
      wechat: form.wechat || null,
      description: form.description || null,
      city: form.city || null,
      opc_level: form.opcLevel || null,
      selected_services: (form.name && (form as any).selectedServices) || null, // 真实业务里 selectedServices 在外层
      ai_sessions: aiSessions,
      expert_tickets: expertTickets,
      assigned_expert: assignedExpert,
      matched_manager: matchedManager,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    return 'supabase'
  } catch (e) {
    console.info('[services/inquiry] ConsultationRecord 写入失败（best-effort）:', e)
    return 'mock'
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

  const { selectedServices = [], form = {} } = body
  const { name, phone, opcLevel, city } = form

  // 1. AI / 专家分流
  const { aiSessions, expertTickets } = dispatchByType(selectedServices)

  // 2. 专属专家分配
  const expert = assignExpert(opcLevel)

  // 3. 主理人推荐（按城市）
  const trimmedCity = (city || '').trim()
  const manager = matchManagerByCity(trimmedCity || '深圳')
  const matchedManagers: MatchedManager[] = [manager]

  // 4. best-effort 写入 ConsultationRecord
  const source = await writeConsultationRecord(
    form,
    aiSessions,
    expertTickets,
    expert,
    manager,
  )

  return {
    success: true,
    message: '需求已提交，通道已开启',
    aiSessions,
    expertTickets,
    matchedManagers,
    assignedExpert: expert,
    source,
  }
}

// ════════════════════════════════════════════════════════════════
// 兜底 mockBuilder（任意主流程异常时使用）
// 入参任意时都能生成响应（用 form 字段）
// ════════════════════════════════════════════════════════════════
function buildMockInquiry(body: InquiryBody): InquiryResult {
  const { selectedServices = [], form = {} } = body
  const { opcLevel, city } = form

  const { aiSessions, expertTickets } = dispatchByType(selectedServices)
  const expert = assignExpert(opcLevel)
  const manager = matchManagerByCity(city)
  const matchedManagers: MatchedManager[] = [manager]

  return {
    success: true,
    message: '需求已提交，通道已开启',
    aiSessions,
    expertTickets,
    matchedManagers,
    assignedExpert: expert,
    source: 'mock',
  }
}

// ════════════════════════════════════════════════════════════════
// 出口
// ════════════════════════════════════════════════════════════════
export const POST = withSmartFallback<InquiryBody, InquiryResult>({
  tag: 'services-inquiry',
  handler: inquiryHandler,
  mockBuilder: buildMockInquiry,
})

// 保留 GET 端点（与原版一致，用于接口说明）
export async function GET() {
  return new Response(
    JSON.stringify({
      endpoint: '/api/services/inquiry',
      method: 'POST',
      description: '服务库 · 需求收集（按 type 字段分流 AI/专家）',
      supportedCities: Object.keys(CITY_MANAGERS),
      bodyExample: {
        selectedServices: ['opc-coaching'],
        form: {
          name: '示例老板',
          phone: '13800001234',
          city: '深圳',
          opcLevel: 'TRADER',
        },
      },
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
