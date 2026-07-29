/**
 * ════════════════════════════════════════════════════════════════
 *  良朋社 OPC · 统一付费档位 (plan_benefits)
 * ════════════════════════════════════════════════════════════════
 *  重构后版本：6 档 → 4 档布局
 *
 *  入门档 (intro)   : PIONEER_19 (19.9 诊断卡) + MONTHLY_69 (69 元/月)
 *  进阶档 (mid)     : BASIC_199 (199 元/年 基础会员)
 *  高阶档 (high)    : PRO_598 (598 元/年) + DEEP_1980 (1980 元/年 深度陪跑)
 *  合作档 (partner) : CITY_5980 (5980 元 城市主理人，【了解主理人权益】跳 /partner)
 *
 *  所有档位权益从此处读取，不在 UI 中硬编码。
 * ════════════════════════════════════════════════════════════════
 */

export type ProductType = 'one_time' | 'subscription' | 'yearly' | 'partner'

/** UI 区块分组（决定在 /pricing 哪一栏展示） */
export type PlanGroup = 'intro' | 'mid' | 'high' | 'partner'

export interface PlanFulfillment {
  /** 业务动作类型 */
  action:
    | 'GRANT_POINTS'          // 赠送积分（PIONEER_19）
    | 'ACTIVATE_SUBSCRIPTION' // 月度订阅（MONTHLY_69）
    | 'ACTIVATE_YEARLY'       // 年度会员（BASIC_199 / PRO_598 / DEEP_1980）
    | 'ACTIVATE_PARTNER'      // 城市主理人（CITY_5980）
  /** 动作参数 */
  params: {
    points?: number
    durationDays?: number
    opcLevel?: string
    cityCodeParam?: boolean
  }
}

export interface PlanBenefit {
  title: string
  description: string
  highlights: string[]
  discountTag?: string
  fulfillment: PlanFulfillment
}

export interface PlanConfig {
  key: string
  name: string
  /** 显示价格（元） */
  price: number
  originalPrice?: number
  productType: ProductType
  /** UI 分组（intro/mid/high/partner） */
  group: PlanGroup
  /** 角标 */
  badge?: string
  active: boolean
  benefits: PlanBenefit
}

// ════════════════════════════════════════════════════════════════
// 4 档核心定义（注意：合作档走 /partner 申请表单，不走支付）
// ════════════════════════════════════════════════════════════════

export const PLAN_REGISTRY: Record<string, PlanConfig> = {
  // ─────── 入门档 #1：19.9 诊断卡 ───────
  PIONEER_19: {
    key: 'PIONEER_19',
    name: '智富先锋卡',
    price: 19.9,
    productType: 'one_time',
    group: 'intro',
    badge: '破冰',
    active: true,
    benefits: {
      title: 'OPC 启蒙 · AI 诊断',
      description: '解锁 1v1 商业诊断 + 智富积分 50 个',
      highlights: [
        '✅ 1v1 商业诊断报告',
        '✅ +50 智富积分（可抵扣订阅）',
        '✅ AI 教练 7 天体验',
      ],
      fulfillment: {
        action: 'GRANT_POINTS',
        params: { points: 50, opcLevel: 'DIAGNOSED' },
      },
    },
  },

  // ─────── 入门档 #2：69 元/月 实操卡 ───────
  MONTHLY_69: {
    key: 'MONTHLY_69',
    name: '单店实操月卡',
    price: 69,
    productType: 'subscription',
    group: 'intro',
    badge: '推荐',
    active: true,
    benefits: {
      title: '实战陪跑 · 月度订阅',
      description: '解锁完整 SOP + AI 教练 + 工具模板',
      discountTag: '首月 9.9 元 · 自动续费 · 随时取消',
      highlights: [
        '✅ 完整 4 阶段 SOP 拆解',
        '✅ AI 教练随行（实战脚本/避坑指南）',
        '✅ 工具模板库 + 资源对接',
        '✅ 续费即送 100 积分',
      ],
      fulfillment: {
        action: 'ACTIVATE_SUBSCRIPTION',
        params: { durationDays: 30 },
      },
    },
  },

  // ─────── 进阶档：199 元/年 ───────
  BASIC_199: {
    key: 'BASIC_199',
    name: '基础会员',
    price: 199,
    productType: 'yearly',
    group: 'mid',
    active: true,
    benefits: {
      title: '1 年基础会员',
      description: '入门档权益升级 + 主理人私域 + 周案例拆解',
      highlights: [
        '✅ 入门档全部权益',
        '✅ 1 年基础会员资格',
        '✅ 智富主理人私域通道',
        '✅ 每周案例拆解直播',
        '✅ 进阶 SOP 模板',
      ],
      fulfillment: {
        action: 'ACTIVATE_YEARLY',
        params: { durationDays: 365 },
      },
    },
  },

  // ─────── 高阶档 #1：598 元/年 ───────
  PRO_598: {
    key: 'PRO_598',
    name: '轻陪跑会员',
    price: 598,
    productType: 'yearly',
    group: 'high',
    active: true,
    benefits: {
      title: '3 个月 1v1 陪跑',
      description: '90 天轻陪跑 + 1 年会员权益',
      highlights: [
        '✅ 进阶档全部权益',
        '✅ 90 天 1v1 陪跑',
        '✅ 1 年会员权益',
        '✅ 7 天无理由退款',
      ],
      fulfillment: {
        action: 'ACTIVATE_YEARLY',
        params: { durationDays: 365 },
      },
    },
  },

  // ─────── 高阶档 #2：1980 元/年 深度陪跑 ───────
  DEEP_1980: {
    key: 'DEEP_1980',
    name: '深度陪跑',
    price: 1980,
    productType: 'yearly',
    group: 'high',
    badge: '🔥 热门',
    active: true,
    benefits: {
      title: '180 天 1v1 深度陪跑',
      description: '高强度 1v1 + 定制方案 + 1 年权益',
      highlights: [
        '✅ 进阶档全部权益',
        '✅ 180 天 1v1 深度陪跑',
        '✅ 定制化方案 + 资源对接',
        '✅ 1 年会员权益',
        '✅ 30 天启动退款',
      ],
      fulfillment: {
        action: 'ACTIVATE_YEARLY',
        params: { durationDays: 365 },
      },
    },
  },

  // ─────── 合作档：5980 元 城市主理人（走 /partner 申请，不直接支付） ───────
  CITY_5980: {
    key: 'CITY_5980',
    name: '城市主理人',
    price: 5980,
    productType: 'partner',
    group: 'partner',
    badge: '👑 核心',
    active: true,
    benefits: {
      title: '城市分站永久授权',
      description: '绑定城市分站 + 永久权益 + 5980 积分',
      highlights: [
        '✅ 城市分站永久授权',
        '✅ +5980 智富积分（生态内消费）',
        '✅ 全平台工具优先使用',
        '✅ 30 天启动退款',
      ],
      fulfillment: {
        action: 'ACTIVATE_PARTNER',
        params: { cityCodeParam: true },
      },
    },
  },
}

// ════════════════════════════════════════════════════════════════
// 辅助函数
// ════════════════════════════════════════════════════════════════

/** 按 UI 分组排序的档位列表 */
export const PLAN_LIST: PlanConfig[] = [
  PLAN_REGISTRY.PIONEER_19,
  PLAN_REGISTRY.MONTHLY_69,
  PLAN_REGISTRY.BASIC_199,
  PLAN_REGISTRY.PRO_598,
  PLAN_REGISTRY.DEEP_1980,
  PLAN_REGISTRY.CITY_5980,
]

/** 按 group 聚合，供 /pricing 渲染使用 */
export function getPlansByGroup(group: PlanGroup): PlanConfig[] {
  return PLAN_LIST.filter((p) => p.group === group && p.active)
}

export function getPlan(planKey: string): PlanConfig | null {
  return PLAN_REGISTRY[planKey] || null
}

export function isPlanActive(planKey: string): boolean {
  return PLAN_REGISTRY[planKey]?.active === true
}

/** 积分抵扣：200 积分 = 2 元（仅对 monthly / yearly 档生效） */
export const POINTS_DISCOUNT = {
  threshold: 200,
  ratio: 100,
  fixedUsePoints: 200,
  fixedDiscount: 2,
}

export function calcPointsDiscount(price: number, usePoints: boolean, userPoints: number) {
  if (!usePoints) return { finalPrice: price, pointsUsed: 0, discount: 0 }
  if (userPoints < POINTS_DISCOUNT.threshold) {
    return { finalPrice: price, pointsUsed: 0, discount: 0, reason: 'insufficient_points' as const }
  }
  const discount = POINTS_DISCOUNT.fixedDiscount
  const finalPrice = Math.max(0, +(price - discount).toFixed(2))
  return { finalPrice, pointsUsed: POINTS_DISCOUNT.fixedUsePoints, discount }
}
