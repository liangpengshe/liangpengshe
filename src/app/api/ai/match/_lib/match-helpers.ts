/**
 * match-helpers · ai/match 工具函数
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 ai/match（W3.1）
 * 抽离原因：calculateMatchScore / computeMockMatches / extractLocalKeywords
 *           是纯函数，与"读数据源"解耦，路由文件只保留编排。
 * ------------------------------------------------------------
 */
import { MOCK_PARTNERS, type MockPartner } from '../_data/mockPartners'

export interface MatchedPartner extends MockPartner {}

export interface MatchResult {
  matches: MatchedPartner[]
  extracted: {
    tags: string[]
    intent: string
    city: string
  }
  source: string
  total: number
}

/**
 * 计算标签相似度（基于 Jaccard 相似度 + 城市加权）
 */
export function calculateMatchScore(
  userTags: string[],
  partnerTags: string[],
  userCity: string,
  partnerCity: string
): number {
  if (!userTags.length || !partnerTags.length) return 0

  // 标签转小写以便比较
  const userSet = new Set(userTags.map((t) => t.toLowerCase().trim()))
  const partnerSet = new Set(partnerTags.map((t) => t.toLowerCase().trim()))

  // Jaccard 相似度
  const intersection = new Set(Array.from(userSet).filter((x) => partnerSet.has(x)))
  const union = new Set([...Array.from(userSet), ...Array.from(partnerSet)])
  let score = (intersection.size / union.size) * 100

  // 城市匹配加权（+15 分）
  if (userCity && partnerCity && userCity.trim() === partnerCity.trim()) {
    score += 15
  }

  // 包含匹配加分（处理同义词/部分匹配）
  for (const ut of Array.from(userSet)) {
    if (ut.length < 2) continue
    for (const pt of Array.from(partnerSet)) {
      if (pt.length < 2) continue
      if (ut !== pt && (ut.includes(pt) || pt.includes(ut))) {
        score += 5
        break
      }
    }
  }

  return Math.min(Math.round(score), 100)
}

/**
 * 从用户输入中粗略提取关键词（Dify 不可用时的降级方案）
 */
export function extractLocalKeywords(input: string): string[] {
  return input
    .replace(/[，。！？、,.!?\s]+/g, ' ')
    .split(' ')
    .filter((w) => w.length >= 2 && w.length <= 12)
}

/**
 * 对合伙人列表计算匹配分数并排序
 */
export function rankPartners(
  partners: readonly MockPartner[],
  userTags: string[],
  userCity: string
): MatchedPartner[] {
  return partners
    .map((p) => ({
      ...p,
      matchScore: calculateMatchScore(userTags, p.tags, userCity, p.city),
    }))
    .filter((p) => p.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
}

/**
 * 构造标准 match 接口响应
 */
export function buildMatchResponse(args: {
  matches: MatchedPartner[]
  tags: string[]
  intent: string
  city: string
  source: string
}): MatchResult {
  return {
    matches: args.matches,
    extracted: { tags: args.tags, intent: args.intent, city: args.city },
    source: args.source,
    total: args.matches.length,
  }
}

/**
 * 完全本地降级版本：仅用 mock 数据 + 关键词匹配
 * （用于 Dify + Supabase 双双失败的场景）
 */
export function computeMockMatches(
  userInput: string,
  city: string
): MatchedPartner[] {
  const keywords = extractLocalKeywords(userInput)
  const allTags = keywords.includes(city) ? keywords : [city, ...keywords]
  return rankPartners(MOCK_PARTNERS, allTags, city)
}
