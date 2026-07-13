/**
 * 用户会员状态管理（资源库门锁专用）
 *
 * 用于 AI智富资源库 中"会员专享解锁"按钮的权限判断：
 *   - 199 周卡会员
 *   - 1980 陪跑会员
 *
 * 当前为前端 Mock 实现（localStorage + 内存），后续接入 Supabase 时
 * 只需替换 readUserMembership / setUserMembershipTwo 个函数即可。
 */

export type MembershipTier = 'none' | 'weekly_card' | 'coaching'

/** 资源库需要的最低会员等级 */
export const RESOURCE_UNLOCK_MIN_TIER: MembershipTier = 'weekly_card'

/** 会员等级描述（用于弹窗提示） */
export const MEMBERSHIP_TIER_META: Record<
  MembershipTier,
  { label: string; price: string; color: string; bg: string }
> = {
  none: {
    label: '未开通会员',
    price: '免费',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
  weekly_card: {
    label: '199 周卡会员',
    price: '¥199 / 周',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
  },
  coaching: {
    label: '1980 陪跑会员',
    price: '¥1980 / 90 天',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
  },
}

export interface UserMembership {
  userId: string
  tier: MembershipTier
  /** 会员到期时间（ISO 字符串） */
  expiresAt?: string
  updatedAt: string
}

/** localStorage 键名 */
const STORAGE_KEY = 'opc_membership_tier'

// ════════════════════════════════════════════════════════════════
// 内存 Mock（演示用）
// ════════════════════════════════════════════════════════════════

const membershipStore: Map<string, UserMembership> = new Map()

function defaultMembership(userId: string): UserMembership {
  return {
    userId,
    tier: 'none',
    updatedAt: new Date().toISOString(),
  }
}

/**
 * 同步读取 localStorage 中的会员等级（用于客户端立即判断）
 */
export function readMembershipTierFromStorage(): MembershipTier {
  if (typeof window === 'undefined') return 'none'
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    if (v === 'weekly_card' || v === 'coaching' || v === 'none') {
      return v
    }
    return 'none'
  } catch {
    return 'none'
  }
}

/**
 * 同步写入 localStorage（便于其他组件立即读取）
 */
export function writeMembershipTierToStorage(tier: MembershipTier): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, tier)
  } catch {
    // 静默失败
  }
}

/**
 * 异步获取用户会员信息（mock）
 */
export async function getUserMembership(userId: string): Promise<UserMembership> {
  await new Promise((r) => setTimeout(r, 150))
  // 优先以 localStorage 为准（便于演示时立即切换）
  const local = readMembershipTierFromStorage()
  const existing = membershipStore.get(userId)
  if (existing) {
    // 同步 localStorage 的最新值
    if (existing.tier !== local) {
      existing.tier = local
      existing.updatedAt = new Date().toISOString()
    }
    return existing
  }
  const fresh: UserMembership = {
    ...defaultMembership(userId),
    tier: local,
  }
  membershipStore.set(userId, fresh)
  return fresh
}

/**
 * 设置/更新用户会员等级（mock）
 */
export async function setUserMembership(
  userId: string,
  tier: MembershipTier
): Promise<UserMembership> {
  await new Promise((r) => setTimeout(r, 100))
  writeMembershipTierToStorage(tier)
  const next: UserMembership = {
    userId,
    tier,
    updatedAt: new Date().toISOString(),
  }
  membershipStore.set(userId, next)
  return next
}

/**
 * 工具函数：判断用户是否可访问资源库会员内容
 *
 * 规则：weekly_card / coaching 都视为已解锁
 */
export function canUnlockResource(tier: MembershipTier | undefined): boolean {
  if (!tier) return false
  return tier === 'weekly_card' || tier === 'coaching'
}

/**
 * 工具函数：判断是否满足指定最低等级
 */
export function meetsMinimumTier(
  current: MembershipTier,
  minRequired: MembershipTier
): boolean {
  const order: MembershipTier[] = ['none', 'weekly_card', 'coaching']
  return order.indexOf(current) >= order.indexOf(minRequired)
}
