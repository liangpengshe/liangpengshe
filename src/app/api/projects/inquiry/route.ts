import { NextResponse } from 'next/server'
import { projectItems } from '@/data/project-items'

/**
 * 项目库 · 需求对接接口
 * ------------------------------------------------------------
 * POST /api/projects/inquiry
 *
 * Body:
 *   {
 *     projectId: string,
 *     intent: 'executor' | 'partner' | 'manager',
 *     form: { name, phone, role }
 *   }
 *
 * 后端分流：
 *   - executor（执行者）  → AI 启动清单（Dify 模拟）
 *   - partner （合作方）  → 转人工专家（Supabase mock）+ 匹配主理人
 *   - manager （主理人）  → 推荐当地 OPC 主理人对接
 *
 * 当前实现：mock 返回（前端展示用）
 * 接入真实后端时：把 mock 块替换为：
 *   - Dify API: fetch(process.env.DIFY_API_URL, ...)
 *   - Supabase: supabase.from('ConsultationRecord').insert(...)
 *   - 主理人:   supabase.from('City').select('*').eq('code', cityCode)
 * ------------------------------------------------------------
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface InquiryBody {
  projectId: string
  intent: 'executor' | 'partner' | 'manager'
  form: {
    name: string
    phone: string
    role: string
  }
}

interface MatchedManager {
  city: string
  name: string
  phone: string
  wechat: string
  specialty: string
}

const CITY_MANAGERS: Record<string, MatchedManager[]> = {
  北京: [
    { city: '北京', name: '王主理人', phone: '138-0000-0001', wechat: 'wang_bj', specialty: '数字产品' },
    { city: '北京', name: '周主理人', phone: '138-0000-0011', wechat: 'zhou_bj', specialty: '企业 GEO' },
  ],
  上海: [
    { city: '上海', name: '李主理人', phone: '138-0000-0002', wechat: 'li_sh', specialty: '跨境电商' },
  ],
  深圳: [
    { city: '深圳', name: '陈主理人', phone: '138-0000-0003', wechat: 'chen_sz', specialty: '工具销售' },
    { city: '深圳', name: '林主理人', phone: '138-0000-0013', wechat: 'lin_sz', specialty: '系统开发' },
  ],
  广州: [
    { city: '广州', name: '黄主理人', phone: '138-0000-0004', wechat: 'huang_gz', specialty: '无货源网店' },
  ],
  杭州: [
    { city: '杭州', name: '张主理人', phone: '138-0000-0005', wechat: 'zhang_hz', specialty: '自媒体' },
  ],
  // 默认
  default: [
    { city: '深圳', name: '陈主理人', phone: '138-0000-0003', wechat: 'chen_sz', specialty: '工具销售' },
  ],
}

/**
 * 根据项目 category 关键词匹配对应专长的主理人
 */
function matchManagersByCategory(category: string): MatchedManager[] {
  for (const list of Object.values(CITY_MANAGERS)) {
    if (list === CITY_MANAGERS.default) continue
    const hit = list.find((m) => category.includes(m.specialty))
    if (hit) return [hit]
  }
  return CITY_MANAGERS.default
}

export async function POST(request: Request) {
  try {
    const body: InquiryBody = await request.json()
    const { projectId, intent, form } = body

    // 基础校验
    if (!projectId) {
      return NextResponse.json(
        { success: false, message: '缺少项目 ID' },
        { status: 400 }
      )
    }
    if (!['executor', 'partner', 'manager'].includes(intent)) {
      return NextResponse.json(
        { success: false, message: '意向角色无效' },
        { status: 400 }
      )
    }
    if (!form?.name?.trim() || !form?.phone?.trim()) {
      return NextResponse.json(
        { success: false, message: '姓名和手机号必填' },
        { status: 400 }
      )
    }

    const project = projectItems.find((p) => p.id === projectId)
    if (!project) {
      return NextResponse.json(
        { success: false, message: '项目不存在' },
        { status: 404 }
      )
    }

    const result: {
      success: boolean
      message: string
      projectTitle: string
      intent: string
      aiChecklist?: string[]
      expertTicket?: string
      matchedManagers?: MatchedManager[]
    } = {
      success: true,
      message: '需求已提交，通道已开启',
      projectTitle: project.title,
      intent,
    }

    // 1. 分流处理
    if (intent === 'executor') {
      // AI 启动清单（Dify mock）
      // TODO: 接入真实 Dify API
      // const difyRes = await fetch(process.env.DIFY_API_URL!, {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${process.env.DIFY_API_KEY}` },
      //   body: JSON.stringify({ inputs: { project: project.title }, user: form.phone }),
      // })
      result.aiChecklist = [
        `🎯 ${project.title} · 30 天启动清单（AI 生成）`,
        ...project.startChecklist.map((step, i) => `第 ${i + 1} 步：${step}`),
        '每日复盘 + 90 天里程碑跟进',
      ]
    } else if (intent === 'partner') {
      // 转人工专家（Supabase mock）
      // TODO: 写入 Supabase
      // await supabase.from('ConsultationRecord').insert({...})
      const ticketId = `PRJ-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`
      result.expertTicket = `工单 #${ticketId} · ${project.title} · 24h 内匹配合作方`

      // 同步推荐主理人
      result.matchedManagers = matchManagersByCategory(project.category)
    } else if (intent === 'manager') {
      // 主理人对接
      result.matchedManagers = matchManagersByCategory(project.category)
    }

    // 2. 模拟网络延迟
    await new Promise((r) => setTimeout(r, 700))

    return NextResponse.json(result)
  } catch (err) {
    console.error('[projects/inquiry] error:', err)
    return NextResponse.json(
      { success: false, message: '服务异常，请稍后再试' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/projects/inquiry',
    method: 'POST',
    description: '项目库 · 需求对接接口（按 intent 字段分流 AI/专家/主理人）',
    supportedIntents: ['executor', 'partner', 'manager'],
  })
}
