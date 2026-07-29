/**
 * partner-inquiry-helpers · 招商加盟对接工具
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 resources/partner-inquiry（W3.4）
 * ------------------------------------------------------------
 */
import { CITY_MANAGERS, KEYWORD_TO_CITY, type CityManager } from '../_data/city-managers'

/**
 * 根据用户填写的"意向城市"匹配主理人
 * 匹配规则：
 *   1. 精确匹配
 *   2. 关键词模糊匹配
 *   3. 未匹配 → 返回 null（转入人工）
 */
export function matchManagerByCity(city: string): CityManager | null {
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

  return null
}

/** 加盟政策要点（统一常量） */
export const FRANCHISE_POLICY: readonly string[] = [
  '🎁 加盟即送 199 周卡会员（价值 ¥199）',
  '🤝 主理人 1v1 答疑 + 资源对接',
  '📈 享受本城市 OPC 生态流量扶持',
  '🚀 总部专家陪跑 + 30 天启动 SOP',
] as const

/** 兜底专家线索池说明 */
export const EXPERT_FALLBACK_TIPS: readonly string[] = [
  '我们将在 24 小时内由总部专家为您对接',
  '您也可以加入"OPC 城市主理人共建群"先了解生态',
] as const

/**
 * 构造专家工单号
 * 格式：PRJ-FRANCHISE-后 6 位时间戳
 */
export function buildTicketId(): string {
  return `PRJ-FRANCHISE-${Date.now().toString().slice(-6)}`
}

/** 入参校验（返回首个错误消息或 null） */
export function validateInquiry(body: {
  name?: string
  wechat?: string
  city?: string
}): string | null {
  if (!body.name?.trim()) return '请填写姓名'
  if (!body.wechat?.trim()) return '请填写微信号'
  if (!body.city?.trim()) return '请填写意向城市'
  return null
}
