/**
 * 定价页 · 6 档价格档 + 4 维权益矩阵的类型定义
 * 与 _data/plans.ts 中的 PLANS 配套使用
 */

import type { LucideIcon } from 'lucide-react'

/** 6 档价格档枚举 */
export type PlanKey =
  | 'PIONEER_19'
  | 'BASIC_199'
  | 'MONTHLY_69'
  | 'PRO_598'
  | 'DEEP_1980'
  | 'CITY_5980'

/** 3 区块 */
export type SectionKey = 'ice' | 'battle' | 'expansion'

/** 锚点横幅强调色 */
export type AnchorTone = 'red' | 'amber' | 'blue' | 'purple' | 'emerald'

/** 单条权益（LucideIcon 兼容 lucide-react 的 ForwardRefExoticComponent 类型） */
export interface BenefitItem {
  icon: LucideIcon
  text: string
  highlight?: boolean
}

/** 卡片主题 */
export interface PlanTheme {
  accent: string
  bg: string
  headerBg: string
  priceColor: string
  buttonBg: string
  iconBg: string
  badgeBg: string
}

/** 4 维权益权限矩阵 */
export interface PlanMatrix {
  singleStore: boolean
  matrix: boolean
  coach: boolean
  cityAgent: boolean
}

/** 锚点横幅 */
export interface PlanAnchor {
  emoji: string
  text: string
  tone: AnchorTone
}

/** 单档价格档位 */
export interface PricePlan {
  key: PlanKey
  tier: number
  name: string
  tagline: string
  price: number
  cycle: string
  originalPrice?: number
  anchor: PlanAnchor
  theme: PlanTheme
  target: string
  /** 核心价值（仅 599/1980/5980 展示） */
  coreValue?: string
  benefits: BenefitItem[]
  cta: string
  ctaAction?: 'pay' | 'goto_partner'
  recommended?: boolean
  badges: string[]
  bonusNote?: string
  section: SectionKey
  matrix: PlanMatrix
  /** 月度会员首月优惠提示（仅 MONTHLY_69） */
  headlinePromo?: string
  /** 9.9 vs 19.9 区别引导（仅 MONTHLY_69） */
  compareNote?: string
  /** 升级补差价提示（仅 PRO_598 / DEEP_1980） */
  upgradeNote?: string
  /** 阶梯递进标识 */
  tierFlow?: 'ladder'
  ladderStep?: number
}
