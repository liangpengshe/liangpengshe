/**
 * collaboration-match · 业务工具函数
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 services/collaboration-match（W3.5）
 * 抽离所有纯函数（不依赖 IO），便于路由层 + 单元测试复用。
 * ------------------------------------------------------------
 */
import {
  CITY_MAINTAINER_POOL,
  ASSET_EXPERT_POOL,
  type CollaborationExpert,
} from '../_data/collaboration-experts'

// ════════════════════════════════════════════════════════════════
// 类型
// ════════════════════════════════════════════════════════════════
export type ExpertType = 'CITY_MAINTAINER' | 'ASSET_OPC'

export interface RawExpert {
  id: string
  name: string
  city: string
  phone: string
  /** 可选：原 mock 数据池中可能没有 wechat 原文（只有 wechatMasked） */
  wechat?: string
  /** 兼容原 mock 字段：wechatMasked；DB 可能只有 wechat */
  wechatMasked?: string
  expertise_tags: string[]
  bio?: string
  handledProjectCount?: number
  type: ExpertType
  score?: number
}

// ════════════════════════════════════════════════════════════════
// 匹配分计算
// ════════════════════════════════════════════════════════════════

/**
 * 计算单专家与服务的匹配分
 * 兼容 serviceId 与 OPCLevel 两个维度
 */
export function calcMatchScore(
  expert: { expertise_tags: string[]; handledProjectCount?: number; type: ExpertType },
  serviceId: string,
): number {
  let score = 0
  // 命中 service 标签
  if (serviceId === 'opc-coaching') {
    if (expert.expertise_tags.some((t) => t.includes('陪跑') || t.includes('落地'))) score += 5
    if (expert.expertise_tags.some((t) => t.includes('AI'))) score += 2
  } else if (serviceId === 'shop-group-daiyun') {
    if (expert.expertise_tags.some((t) => t.includes('网店') || t.includes('代运营'))) score += 6
    if (expert.expertise_tags.some((t) => t.includes('电商'))) score += 3
    if (expert.expertise_tags.some((t) => t.includes('1688') || t.includes('选品'))) score += 2
  }
  // 资产型 + 陪跑服务额外加分
  if (expert.type === 'ASSET_OPC' && serviceId === 'opc-coaching') score += 3
  // 项目数越多越好（封顶 5）
  score += Math.min(expert.handledProjectCount || 0, 5)
  return score
}

// ════════════════════════════════════════════════════════════════
// 评分 + 排序（统一对所有数据源应用）
// ════════════════════════════════════════════════════════════════

export interface RankedExpert extends CollaborationExpert {
  matchScore: number
  fallback?: boolean
}

/**
 * 主理人池打分（service + 同城优先 + opcLevel 偏好）
 */
export function scoreCityMaintainers(
  experts: RawExpert[],
  serviceId: string,
  city: string | null | undefined,
  opcLevel: 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET' | null | undefined,
): RankedExpert[] {
  return (experts
    .map((m) => {
      let s = calcMatchScore(m, serviceId)
      if (city && m.city === city) s += 8
      if (
        opcLevel === 'ASSET' &&
        m.expertise_tags.some((t) => t.includes('陪跑') || t.includes('落地'))
      ) {
        s += 2
      }
      return { ...m, matchScore: s }
    })
    .sort((a, b) => b.matchScore - a.matchScore) as RankedExpert[])
}

/**
 * 资产型 OPC 打分
 */
export function scoreAssetExperts(
  experts: RawExpert[],
  serviceId: string,
  opcLevel: 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET' | null | undefined,
): RankedExpert[] {
  return (experts
    .map((m) => {
      let s = calcMatchScore(m, serviceId)
      if (opcLevel === 'ASSET') s += 4
      if (opcLevel === 'SYSTEM') s += 2
      return { ...m, matchScore: s }
    })
    .sort((a, b) => b.matchScore - a.matchScore) as RankedExpert[])
}

/**
 * 资产型 OPC：按匹配度取前 1-2 名（不足时全部 + fallback 标记）
 */
export function pickAssetExperts(scored: RankedExpert[]): RankedExpert[] {
  const hits = scored.filter((m) => m.matchScore > 0).slice(0, 2)
  if (hits.length > 0) return hits
  return scored.slice(0, 1).map((m) => ({ ...m, fallback: true }))
}

/**
 * 城市主理人：取匹配度 > 0 的前 2-3 名
 */
export function pickCityMaintainers(scored: RankedExpert[]): RankedExpert[] {
  const hits = scored.filter((m) => m.matchScore > 0).slice(0, 3)
  if (hits.length > 0) return hits
  return scored.slice(0, 2).map((m) => ({ ...m, fallback: true }))
}

// ════════════════════════════════════════════════════════════════
// 展示层转换（统一脱敏）
// ════════════════════════════════════════════════════════════════

/**
 * 把 raw 数据转成展示结构（脱敏微信、统一字段）
 */
export function toDisplayExpert(e: { id: string; name: string; city: string; phone: string; wechat?: string; wechatMasked?: string; type: ExpertType; expertise_tags: string[]; bio?: string; handledProjectCount?: number; matchScore: number; fallback?: boolean }): CollaborationExpert {
  return {
    id: e.id,
    name: e.name,
    city: e.city,
    phone: e.phone,
    wechatMasked: e.wechatMasked || maskWechat(e.wechat || ''),
    type: e.type,
    expertise_tags: e.expertise_tags || [],
    bio: e.bio || '该主理人暂未填写简介',
    handledProjectCount: e.handledProjectCount || 0,
    matchScore: e.matchScore,
    fallback: e.fallback,
  }
}

/** 微信脱敏：保留前 3 + *** + 末 1 */
export function maskWechat(wechat: string): string {
  if (!wechat) return ''
  if (wechat.length <= 4) return wechat[0] + '***' + (wechat[wechat.length - 1] || '')
  return wechat.slice(0, 3) + '***' + wechat.slice(-1)
}

// ════════════════════════════════════════════════════════════════
// Mock 池（与原 route.ts 完全一致，作为兜底数据源）
// ════════════════════════════════════════════════════════════════

/** mock 池 · 城市主理人 */
export const MOCK_CITY_MAINTAINERS: readonly RawExpert[] = CITY_MAINTAINER_POOL.map((e) => ({
  id: e.id,
  name: e.name,
  city: e.city,
  phone: e.phone,
  wechat: '',
  wechatMasked: e.wechatMasked,
  expertise_tags: e.expertise_tags,
  bio: e.bio,
  handledProjectCount: e.handledProjectCount,
  type: e.type,
  score: 80,
}))

/** mock 池 · 资产型 OPC */
export const MOCK_ASSET_EXPERTS: readonly RawExpert[] = ASSET_EXPERT_POOL.map((e) => ({
  id: e.id,
  name: e.name,
  city: e.city,
  phone: e.phone,
  wechat: '',
  wechatMasked: e.wechatMasked,
  expertise_tags: e.expertise_tags,
  bio: e.bio,
  handledProjectCount: e.handledProjectCount,
  type: e.type,
  score: 80,
}))

/** 合并 mock 池（兜底用） */
export function getAllMockExperts(): RawExpert[] {
  return [...MOCK_CITY_MAINTAINERS, ...MOCK_ASSET_EXPERTS]
}
