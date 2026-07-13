import { NextResponse } from 'next/server'

/**
 * 资源库 · 招商加盟对接接口
 * ------------------------------------------------------------
 * POST /api/resources/partner-inquiry
 *
 * Body:
 *   {
 *     name: string,
 *     wechat: string,
 *     city: string,
 *     resourceId?: string
 *   }
 *
 * 后端分流：
 *   1. 根据 意向城市 匹配已有 City 表（mock 数据）
 *   2. 匹配成功 → 返回主理人企业微信 + 加盟政策要点
 *   3. 匹配失败 → 转入"人工专家"线索池
 *
 * 当前实现：纯 mock（未接 Supabase）
 * 接入真实后端时替换：
 *   - supabase.from('City').select('*').ilike('name', `%${city}%`)
 *   - supabase.from('PartnerLead').insert({...})
 * ------------------------------------------------------------
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface InquiryBody {
  name: string
  wechat: string
  city: string
  resourceId?: string
}

interface MatchedManager {
  city: string
  name: string
  wechat: string
  phone: string
  /** 主理的资源方向 */
  specialty: string
}

/** 城市 → 主理人映射（mock，覆盖 7 个核心城市） */
const CITY_MANAGERS: Record<string, MatchedManager[]> = {
  北京: [
    { city: '北京', name: '王主理人', wechat: 'wang_bj', phone: '138-0000-0001', specialty: '数字产品 / 企业 GEO' },
  ],
  上海: [
    { city: '上海', name: '李主理人', wechat: 'li_sh', phone: '138-0000-0002', specialty: '跨境电商 / 智能硬件' },
  ],
  深圳: [
    { city: '深圳', name: '陈主理人', wechat: 'chen_sz', phone: '138-0000-0003', specialty: '工具销售 / 系统开发' },
  ],
  广州: [
    { city: '广州', name: '黄主理人', wechat: 'huang_gz', phone: '138-0000-0004', specialty: '无货源网店 / 实物产品' },
  ],
  杭州: [
    { city: '杭州', name: '张主理人', wechat: 'zhang_hz', phone: '138-0000-0005', specialty: '自媒体 / 内容赛道' },
  ],
  成都: [
    { city: '成都', name: '刘主理人', wechat: 'liu_cd', phone: '138-0000-0006', specialty: '本地生活 / 企业 GEO' },
  ],
  武汉: [
    { city: '武汉', name: '赵主理人', wechat: 'zhao_wh', phone: '138-0000-0007', specialty: 'AI 培训 / 陪跑服务' },
  ],
}

/** 关键词 → 城市兜底映射（用于模糊匹配） */
const KEYWORD_TO_CITY: Array<{ keywords: string[]; city: string }> = [
  { keywords: ['京', '北京', 'beijing', 'BJ'], city: '北京' },
  { keywords: ['沪', '上海', 'shanghai', 'SH'], city: '上海' },
  { keywords: ['深', '深圳', 'shenzhen', 'SZ'], city: '深圳' },
  { keywords: ['穗', '广州', 'guangzhou', 'GZ'], city: '广州' },
  { keywords: ['杭', '杭州', 'hangzhou', 'HZ'], city: '杭州' },
  { keywords: ['蓉', '成都', 'chengdu', 'CD'], city: '成都' },
  { keywords: ['汉', '武汉', 'wuhan', 'WH'], city: '武汉' },
]

/**
 * 根据用户填写的"意向城市"匹配主理人
 * 匹配规则：
 *   1. 精确匹配
 *   2. 关键词模糊匹配
 *   3. 未匹配 → 返回 null（转入人工）
 */
function matchManagerByCity(city: string): MatchedManager | null {
  if (!city) return null
  const trimmed = city.trim()
  if (!trimmed) return null

  // 1. 精确匹配
  if (CITY_MANAGERS[trimmed]) {
    return CITY_MANAGERS[trimmed][0]
  }

  // 2. 关键词模糊匹配
  const lower = trimmed.toLowerCase()
  for (const { keywords, city: matchedCity } of KEYWORD_TO_CITY) {
    if (keywords.some((k) => lower.includes(k.toLowerCase()))) {
      return CITY_MANAGERS[matchedCity]?.[0] || null
    }
  }

  // 3. 未匹配
  return null
}

export async function POST(request: Request) {
  try {
    const body: InquiryBody = await request.json()
    const { name, wechat, city, resourceId } = body

    // 基础校验
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: '请填写姓名' },
        { status: 400 }
      )
    }
    if (!wechat?.trim()) {
      return NextResponse.json(
        { success: false, message: '请填写微信号' },
        { status: 400 }
      )
    }
    if (!city?.trim()) {
      return NextResponse.json(
        { success: false, message: '请填写意向城市' },
        { status: 400 }
      )
    }

    // 模拟网络延迟
    await new Promise((r) => setTimeout(r, 600))

    const manager = matchManagerByCity(city)

    if (manager) {
      // 路径 1：匹配到主理人 → 直接返回企业微信
      return NextResponse.json({
        success: true,
        routed: 'manager',
        message: `已为您匹配 ${manager.city} 主理人 ${manager.name}`,
        manager: {
          city: manager.city,
          name: manager.name,
          wechat: manager.wechat,
          phone: manager.phone,
          specialty: manager.specialty,
        },
        policy: [
          '🎁 加盟即送 199 周卡会员（价值 ¥199）',
          '🤝 主理人 1v1 答疑 + 资源对接',
          '📈 享受本城市 OPC 生态流量扶持',
          '🚀 总部专家陪跑 + 30 天启动 SOP',
        ],
      })
    }

    // 路径 2：未匹配到 → 转入人工专家线索池
    // TODO: 写入 Supabase PartnerLead 表
    // await supabase.from('PartnerLead').insert({...})
    const ticketId = `PRJ-FRANCHISE-${Date.now().toString().slice(-6)}`
    return NextResponse.json({
      success: true,
      routed: 'expert',
      message: '未匹配到当地主理人，已转入总部专家线索池',
      ticketId,
      eta: '24 小时内由总部专家主动联系您',
      fallback: [
        '我们将在 24 小时内由总部专家为您对接',
        '您也可以加入"OPC 城市主理人共建群"先了解生态',
      ],
    })
  } catch (err) {
    console.error('[resources/partner-inquiry] error:', err)
    return NextResponse.json(
      { success: false, message: '服务异常，请稍后再试' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/resources/partner-inquiry',
    method: 'POST',
    description: '资源库 · 招商加盟对接（按意向城市匹配 OPC 主理人）',
    supportedCities: Object.keys(CITY_MANAGERS),
  })
}
