/**
 * 定价页 · 价格档 → 锚点 ID 映射
 *
 * 命名规则：plan-{tier}-{price}
 *   - tier:   diagnose / monthly / annual / light / deep / city
 *   - price:  主价格数字（无小数点，方便 URL hash）
 *
 * 用法：首页 / Guide / Projects 页面可通过 /pricing#plan-light-598 精准跳转到对应卡片。
 * scroll-mt-20 (scroll-margin-top: 5rem = 80px) 已在 PlanCard 最外层 div 附加，
 * 避免被顶部 sticky 导航栏 + 区块吸顶导航遮挡。
 */

import type { PlanKey } from './plan-types'

export const PLAN_ANCHOR_IDS: Record<PlanKey, string> = {
  PIONEER_19: 'plan-diagnose-19',
  BASIC_199: 'plan-annual-199',
  MONTHLY_69: 'plan-monthly-69',
  PRO_598: 'plan-light-598',
  DEEP_1980: 'plan-deep-1980',
  CITY_5980: 'plan-city-5980',
}

export function getPlanAnchorId(key: PlanKey): string {
  return PLAN_ANCHOR_IDS[key] || `plan-${key.toLowerCase()}`
}
