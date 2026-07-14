import { NextResponse } from 'next/server'
import { serviceItems } from '@/data/service-items'

/**
 * 服务库 · 需求收集接口
 * ------------------------------------------------------------
 * POST /api/services/inquiry
 *
 * Body:
 *   {
 *     selectedServices: string[],   // ServiceItem['id'][]
 *     form: {
 *       name: string
 *       phone: string
 *       wechat?: string
 *       description?: string
 *     }
 *   }
 *
 * 后端分流逻辑：
 *   - type: 'ai'      → 模拟 Dify 对话流开启
 *   - type: 'expert'  → 模拟写入 Supabase ConsultationRecord 表 + 站内信/短信
 *   - 所有提交都附带：根据用户城市推荐当地 OPC 主理人
 *
 * 当前实现：mock 返回（前端展示用）
 * 接入真实后端时：把 mock 块替换为 Supabase.from('ConsultationRecord').insert(...)
 *                和 fetch(DIFY_API_URL, { ... })
 * ------------------------------------------------------------
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface InquiryBody {
  selectedServices: string[]
  form: {
    name: string
    phone: string
    wechat?: string
    description?: string
    city?: string
    /**
     * 用户的 OPC 类型（由前端从 localStorage 'opc_level' 透传）
     * 不传或 null 表示"未诊断"，走默认专家池
     */
    opcLevel?: 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET' | null
  }
}

interface MatchedManager {
  city: string
  name: string
  phone: string
  wechat: string
}

/** 4 大 OPC 类型对应的专属专家 */
interface AssignedExpert {
  opcLevel: 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET'
  name: string
  avatar: string
  specialty: string
  wechat: string
}

const OPC_LEVEL_TO_EXPERT: Record<
  'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET',
  AssignedExpert
> = {
  TRADER: { opcLevel: 'TRADER', name: '弓老师', avatar: '🏹', specialty: '交易型 OPC 专家 · 网店 SOP', wechat: 'gong_opc_trader' },
  FLOW:   { opcLevel: 'FLOW',   name: '林薇老师', avatar: '🌸', specialty: '流量型 OPC 专家 · 自媒体增长', wechat: 'linwei_opc_flow' },
  SYSTEM: { opcLevel: 'SYSTEM', name: '于老师', avatar: '⚙️', specialty: '系统型 OPC 专家 · 数字员工搭建', wechat: 'yu_opc_system' },
  ASSET:  { opcLevel: 'ASSET',  name: '吕老师', avatar: '💎', specialty: '资产型 OPC 专家 · 资产倍增', wechat: 'lv_opc_asset' },
}

// 模拟：OPC 主理人库（按城市索引）
const CITY_MANAGERS: Record<string, MatchedManager> = {
  北京: { city: '北京', name: '王主理人', phone: '138-0000-0001', wechat: 'wang_bj' },
  上海: { city: '上海', name: '李主理人', phone: '138-0000-0002', wechat: 'li_sh' },
  深圳: { city: '深圳', name: '陈主理人', phone: '138-0000-0003', wechat: 'chen_sz' },
  广州: { city: '广州', name: '黄主理人', phone: '138-0000-0004', wechat: 'huang_gz' },
  杭州: { city: '杭州', name: '张主理人', phone: '138-0000-0005', wechat: 'zhang_hz' },
  成都: { city: '成都', name: '刘主理人', phone: '138-0000-0006', wechat: 'liu_cd' },
  武汉: { city: '武汉', name: '赵主理人', phone: '138-0000-0007', wechat: 'zhao_wh' },
  // 默认 fallback
  default: { city: '深圳', name: '陈主理人', phone: '138-0000-0003', wechat: 'chen_sz' },
}

/**
 * 根据 type 字段分流（ai / expert）
 */
function dispatchByType(selectedIds: string[]) {
  const aiSessions: string[] = []
  const expertTickets: string[] = []

  for (const id of selectedIds) {
    const item = serviceItems.find((s) => s.id === id)
    if (!item) continue

    if (item.type === 'ai') {
      // ----- AI 智能体分流 -----
      // TODO: 接入 Dify
      // const difyRes = await fetch(process.env.DIFY_API_URL!, {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${process.env.DIFY_API_KEY}` },
      //   body: JSON.stringify({ inputs: { service: item.title }, user: phone }),
      // })
      aiSessions.push(`${item.title} · AI 顾问已上线，可随时开启对话`)
    } else if (item.type === 'expert') {
      // ----- 转人工专家分流 -----
      // TODO: 写入 Supabase
      // const { data } = await supabase.from('ConsultationRecord').insert({
      //   service_id: item.id,
      //   service_title: item.title,
      //   user_phone: phone,
      //   status: 'pending',
      //   created_at: new Date().toISOString(),
      // })
      // TODO: 发送站内信/短信给专家
      const ticketId = `EXP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`
      expertTickets.push(`${item.title} · 工单 #${ticketId} 已派发，24h 内联系您`)
    }
  }

  return { aiSessions, expertTickets }
}

export async function POST(request: Request) {
  try {
    const body: InquiryBody = await request.json()
    const { selectedServices, form } = body

    // 基础校验
    if (!Array.isArray(selectedServices) || selectedServices.length === 0) {
      return NextResponse.json(
        { success: false, message: '请至少选择一项服务' },
        { status: 400 }
      )
    }
    if (!form?.name?.trim() || !form?.phone?.trim()) {
      return NextResponse.json(
        { success: false, message: '姓名和手机号必填' },
        { status: 400 }
      )
    }

    // 1. AI / 专家分流
    const { aiSessions, expertTickets } = dispatchByType(selectedServices)

    // 2. 专属专家分配（按 opc_level 智能路由）
    const opcLevel = form.opcLevel
    const assignedExpert: AssignedExpert | { name: string; specialty: string; fallback: true } | null =
      opcLevel && OPC_LEVEL_TO_EXPERT[opcLevel]
        ? OPC_LEVEL_TO_EXPERT[opcLevel]
        : null

    // 3. 主理人推荐（按城市匹配）
    const city = form.city || '深圳' // TODO: 接入 IP 解析
    const matched = CITY_MANAGERS[city] || CITY_MANAGERS.default
    const matchedManagers = [matched]

    // 4. 模拟网络延迟（让前端 loading 有视觉反馈）
    await new Promise((r) => setTimeout(r, 600))

    return NextResponse.json({
      success: true,
      message: '需求已提交，通道已开启',
      aiSessions,
      expertTickets,
      matchedManagers,
      assignedExpert: assignedExpert ?? {
        name: '总部专家池',
        specialty: '根据您的需求画像智能匹配 · 24h 内联系您',
        fallback: true as const,
      },
    })
  } catch (err) {
    console.error('[services/inquiry] error:', err)
    return NextResponse.json(
      { success: false, message: '服务异常，请稍后再试' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/services/inquiry',
    method: 'POST',
    description: '服务库 · 需求收集接口（按 type 字段分流 AI/专家）',
  })
}
