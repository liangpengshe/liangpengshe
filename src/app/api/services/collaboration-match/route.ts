import { NextResponse } from 'next/server'
import { serviceItems } from '@/data/service-items'

/**
 * 服务库 · 协作匹配接口（学习入门 → 找人合作 联动）
 * ------------------------------------------------------------
 * POST /api/services/collaboration-match
 *
 * Body:
 *   {
 *     serviceId: 'opc-coaching' | 'shop-daiyun',
 *     opcLevel?: 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET' | null,
 *     city?: string
 *   }
 *
 * 业务逻辑：
 *   1. 根据 serviceId 定位服务（opc-coaching 优先匹配 CITY_MAINTAINER；
 *      shop-daiyun 优先匹配有实物电商标签的资深主理人 + 资产型 OPC）
 *   2. 从主理人池中按 city + opcLevel + score 综合排序，取前 3 名
 *   3. 返回 3 个匹配的资深主理人 + 1-2 个资产型 OPC 兜底
 *
 * 当前实现：纯 mock
 * 接入真实后端时：替换为 Supabase 查询 opc_maintainers / opc_experts 表
 * ------------------------------------------------------------
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface MatchBody {
  serviceId?: string
  opcLevel?: 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET' | null
  city?: string | null
}

export interface CollaborationExpert {
  id: string
  name: string
  city: string
  phone: string
  wechatMasked: string
  /** 专家类型：CITY_MAINTAINER | ASSET_OPC */
  type: 'CITY_MAINTAINER' | 'ASSET_OPC'
  /** 擅长领域标签 */
  expertise_tags: string[]
  /** 简短 bio */
  bio: string
  /** 已操盘同类项目数 */
  handledProjectCount: number
  /** 匹配度评分 */
  matchScore: number
  /** 是否为兜底推荐 */
  fallback?: boolean
}

interface CollaborationMatchResponse {
  success: boolean
  message?: string
  serviceId: string
  serviceTitle: string
  /** 命中本城市的城市主理人（CITY_MAINTAINER） */
  cityMaintainers: CollaborationExpert[]
  /** 资产型 OPC 专家（ASSET_OPC） */
  assetExperts: CollaborationExpert[]
  /** 综合推荐（前 3 名） */
  recommend: CollaborationExpert[]
}

// ════════════════════════════════════════════════════════════════
// Mock 城市主理人池（CITY_MAINTAINER）
// 与 api/projects/find-opc/route.ts 保持风格一致
// ════════════════════════════════════════════════════════════════
const CITY_MAINTAINERS: CollaborationExpert[] = [
  {
    id: 'm-sz-gong',
    name: '弓老师',
    city: '深圳',
    phone: '138-0011-8801',
    wechatMasked: 'opc_g***1',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['AI数字网店', '数字产品', '无货源', '选品'],
    bio: '前阿里 P7，连续创业者，主攻数字产品变现，孵化 50+ 数字店铺。',
    handledProjectCount: 5,
    matchScore: 0,
  },
  {
    id: 'm-sz-chen',
    name: '陈主理人',
    city: '深圳',
    phone: '138-0011-8802',
    wechatMasked: 'opc_c***2',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['实物电商', '无货源', '1688 选品', '淘宝'],
    bio: '深耕 1688 一件代发 3 年，实战操盘 30+ 实物店铺，首月出单率 95%。',
    handledProjectCount: 3,
    matchScore: 0,
  },
  {
    id: 'm-dg-li',
    name: '李主理人',
    city: '东莞',
    phone: '138-0011-8811',
    wechatMasked: 'opc_dg_li',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['AI网店代运营', 'Shopee', 'Lazada', '跨境电商'],
    bio: '东莞制造业带 AI 网店代运营，Shopee 单月 GMV 破 30 万。',
    handledProjectCount: 4,
    matchScore: 0,
  },
  {
    id: 'm-dg-zhao',
    name: '赵主理人',
    city: '东莞',
    phone: '138-0011-8812',
    wechatMasked: 'opc_dg_zhao',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['数字网店', '拼多多', '抖音小店'],
    bio: '本地抖音小店代运营，30 天从 0 到日出百单。',
    handledProjectCount: 2,
    matchScore: 0,
  },
  {
    id: 'm-lz-wang',
    name: '王老板',
    city: '柳州',
    phone: '138-0011-8821',
    wechatMasked: 'opc_lz_wang',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['AI网店代运营', '螺蛳粉供应链', '天猫'],
    bio: '柳州本地供应链主理人，AI 数字网店 3 天完成 SKU 铺货。',
    handledProjectCount: 3,
    matchScore: 0,
  },
  {
    id: 'm-lz-luo',
    name: '罗主理人',
    city: '柳州',
    phone: '138-0011-8822',
    wechatMasked: 'opc_lz_luo',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['OPC 陪跑', 'AI 落地', '流量运营'],
    bio: '前字节运营，擅长从诊断到陪跑一条龙。',
    handledProjectCount: 4,
    matchScore: 0,
  },
  {
    id: 'm-wh-li',
    name: '李主理人',
    city: '乌海',
    phone: '138-0011-8831',
    wechatMasked: 'opc_wh_li',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['OPC 陪跑', '本地沙龙', 'AI 数字网店'],
    bio: '乌海本地 OPC 主理人，1 周招募 12 个种子用户。',
    handledProjectCount: 2,
    matchScore: 0,
  },
  {
    id: 'm-wh-gao',
    name: '高主理人',
    city: '乌海',
    phone: '138-0011-8832',
    wechatMasked: 'opc_wh_gao',
    type: 'CITY_MAINTAINER',
    expertise_tags: ['AI 落地', '代运营', '本地化'],
    bio: '本地企业 AI 转型陪跑，已服务 5 家区域企业。',
    handledProjectCount: 2,
    matchScore: 0,
  },
]

// ════════════════════════════════════════════════════════════════
// Mock 资产型 OPC 池（ASSET_OPC）
// 重点匹配 opcLevel=ASSET / SYSTEM 的用户
// ════════════════════════════════════════════════════════════════
const ASSET_EXPERTS: CollaborationExpert[] = [
  {
    id: 'a-lv',
    name: '吕老师',
    city: '深圳',
    phone: '138-0022-8801',
    wechatMasked: 'lv_opc_a***1',
    type: 'ASSET_OPC',
    expertise_tags: ['数字资产', 'AI 数字员工', 'SaaS 化'],
    bio: '资产型 OPC 专家，专注把工具沉淀为可订阅的数字员工产品。',
    handledProjectCount: 3,
    matchScore: 0,
  },
  {
    id: 'a-yu',
    name: '于老师',
    city: '深圳',
    phone: '138-0022-8802',
    wechatMasked: 'yu_opc_s***2',
    type: 'ASSET_OPC',
    expertise_tags: ['系统型 OPC', '工作流编排', 'Dify'],
    bio: '系统型 OPC 专家，搭建企业级 AI 客服与工作流系统。',
    handledProjectCount: 4,
    matchScore: 0,
  },
  {
    id: 'a-lin',
    name: '林薇老师',
    city: '深圳',
    phone: '138-0022-8803',
    wechatMasked: 'linwei_opc_***3',
    type: 'ASSET_OPC',
    expertise_tags: ['流量型 OPC', '自媒体矩阵', 'AI 增长'],
    bio: '流量型 OPC 专家，0 粉冷启动，30 天百万曝光。',
    handledProjectCount: 5,
    matchScore: 0,
  },
]

/**
 * 计算单专家与服务的匹配分
 */
function calcMatchScore(expert: CollaborationExpert, serviceId: string): number {
  let score = 0
  // 命中 service 标签
  if (serviceId === 'opc-coaching') {
    if (expert.expertise_tags.some((t) => t.includes('陪跑') || t.includes('落地'))) score += 5
    if (expert.expertise_tags.some((t) => t.includes('AI'))) score += 2
  } else if (serviceId === 'shop-daiyun') {
    if (expert.expertise_tags.some((t) => t.includes('网店') || t.includes('代运营'))) score += 6
    if (expert.expertise_tags.some((t) => t.includes('电商'))) score += 3
    if (expert.expertise_tags.some((t) => t.includes('1688') || t.includes('选品'))) score += 2
  }
  // 资产型额外加分
  if (expert.type === 'ASSET_OPC' && (serviceId === 'opc-coaching')) score += 3
  // 项目数越多越好
  score += Math.min(expert.handledProjectCount, 5)
  return score
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as MatchBody
    const { serviceId, opcLevel, city } = body

    if (!serviceId) {
      return NextResponse.json(
        { success: false, message: '缺少 serviceId' },
        { status: 400 }
      )
    }

    const service = serviceItems.find((s) => s.id === serviceId)
    if (!service) {
      return NextResponse.json(
        { success: false, message: '服务不存在' },
        { status: 404 }
      )
    }

    // 模拟网络延迟
    await new Promise((r) => setTimeout(r, 350))

    // 1. 主理人池打分（按 service + 同城优先 + opcLevel 偏好）
    const scoredMaintainers = CITY_MAINTAINERS.map((m) => {
      let s = calcMatchScore(m, serviceId)
      // 同城加权
      if (city && m.city === city) s += 8
      // opcLevel = ASSET 时优先命中"陪跑 / 落地"标签主理人
      if (opcLevel === 'ASSET' && m.expertise_tags.some((t) => t.includes('陪跑') || t.includes('落地'))) {
        s += 2
      }
      return { ...m, matchScore: s }
    })
      .sort((a, b) => b.matchScore - a.matchScore)

    // 2. 资产型 OPC 打分
    const scoredAssets = ASSET_EXPERTS.map((m) => {
      let s = calcMatchScore(m, serviceId)
      // 用户的 opcLevel 与 asset 专家的标签匹配
      if (opcLevel === 'ASSET') s += 4
      if (opcLevel === 'SYSTEM') s += 2
      return { ...m, matchScore: s }
    })
      .sort((a, b) => b.matchScore - a.matchScore)

    // 3. 资产型 OPC：按匹配度取前 1-2 名（不足时全部）
    const assetExperts = scoredAssets.filter((m) => m.matchScore > 0).slice(0, 2)
    const assetFallback = assetExperts.length > 0
      ? assetExperts
      : scoredAssets.slice(0, 1).map((m) => ({ ...m, fallback: true }))

    // 4. 城市主理人：取匹配度 > 0 的前 2-3 名
    const cityFiltered = scoredMaintainers.filter((m) => m.matchScore > 0).slice(0, 3)
    const cityMaintainers = cityFiltered.length > 0
      ? cityFiltered
      : scoredMaintainers.slice(0, 2).map((m) => ({ ...m, fallback: true }))

    // 5. 综合推荐：城市主理人 + 资产型 OPC，按 matchScore 排序取前 3
    const recommend = [...cityMaintainers, ...assetFallback]
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3)

    return NextResponse.json({
      success: true,
      serviceId,
      serviceTitle: service.title,
      cityMaintainers: cityMaintainers.slice(0, 3),
      assetExperts: assetFallback,
      recommend,
    } as CollaborationMatchResponse)
  } catch (err) {
    console.error('[services/collaboration-match] error:', err)
    return NextResponse.json(
      { success: false, message: '服务异常，请稍后再试' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/services/collaboration-match',
    method: 'POST',
    description: '服务库 · 协作匹配（学习入门 → 找人合作 联动）',
    bodyExample: { serviceId: 'opc-coaching', opcLevel: 'TRADER', city: '深圳' },
  })
}
