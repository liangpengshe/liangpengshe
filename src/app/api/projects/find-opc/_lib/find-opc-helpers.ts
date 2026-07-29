/**
 * find-opc-helpers · 项目主理人匹配工具
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 projects/find-opc（W3.3）
 * ------------------------------------------------------------
 */
import { CITY_MAINTAINERS, type CityMaintainer } from '../_data/city-maintainers'

export interface MatchedMaintainer extends CityMaintainer {
  matchScore: number
  fallback?: boolean
}

export interface DisplayMaintainer {
  id: string
  name: string
  city: string
  phone: string
  wechatMasked: string
  expertise_tags: string[]
  handledProjectCount: number
  bio: string
  matchScore: number
  fallback: boolean
}

/**
 * 关键词与 expertise_tags 的命中度评分
 */
export function scoreMatch(maintainer: CityMaintainer, category: string): number {
  if (!category) return 0
  const cat = category.toLowerCase()
  let hit = 0
  for (const tag of maintainer.expertise_tags) {
    if (cat.includes(tag.toLowerCase()) || tag.toLowerCase().includes(cat)) {
      hit += 1
    }
  }
  return hit
}

/**
 * 按 category 计算匹配并排序，取前 3
 * 若无任何匹配 → 返回 score 降序的前 3，并标记 fallback
 */
export function rankMaintainers(category: string): MatchedMaintainer[] {
  const matched = CITY_MAINTAINERS.map((m) => ({
    ...m,
    matchScore: scoreMatch(m, category),
  }))
    .filter((m) => m.matchScore > 0)
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
      return b.score - a.score
    })
    .slice(0, 3)

  if (matched.length > 0) return matched

  return [...CITY_MAINTAINERS]
    .sort((a: CityMaintainer, b: CityMaintainer) => b.score - a.score)
    .slice(0, 3)
    .map((m: CityMaintainer) => ({ ...m, matchScore: 0, fallback: true }))
}

/**
 * 脱敏微信（保留 3+1 位）并整理展示字段
 */
export function toDisplay(m: MatchedMaintainer): DisplayMaintainer {
  return {
    id: m.id,
    name: m.name,
    city: m.city,
    phone: m.phone,
    wechatMasked:
      m.wechat.length > 4
        ? m.wechat.slice(0, 3) + '***' + m.wechat.slice(-1)
        : m.wechat,
    expertise_tags: m.expertise_tags,
    handledProjectCount: m.handledProjectCount,
    bio: m.bio,
    matchScore: m.matchScore,
    fallback: m.fallback ?? false,
  }
}
