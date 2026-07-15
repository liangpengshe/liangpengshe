/**
 * 良朋社 OPC · 订阅中间件
 * ------------------------------------------------------------
 * 1. getSubscriptionStatus(user)         → 解析订阅状态
 * 2. isExpiringSoon(user, days=3)        → 是否在 N 天内到期
 * 3. getRemainingDays(user)              → 剩余天数（负数=已过期）
 * 4. calcRenewalDiscount(user, points)   → 积分抵扣续费（200 积分 = ¥2）
 * 5. calcApplyPoints(orderAmount, usePoints) → 通用积分抵扣计算
 * 6. buildExpiringBanner(user)           → 到期预警气泡文案生成器
 * 7. attachPointsLog(userId, type, amount, balance, remark) → 写入 PointsLog
 *
 * 用途：
 *   - /member 页面顶部订阅徽章检测到期气泡
 *   - /api/points/apply-discount 复用抵扣算法
 *   - /api/payment/mock-checkout 续费时自动赠送积分
 * ------------------------------------------------------------
 */

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// ═══════ 积分 ↔ 现金 兑换规则 ═══════
export const POINTS_TO_YUAN_RATIO = 100 // 100 积分 = 1 元（基础）
export const RENEWAL_BONUS_POINTS = 100 // 月度会员订阅即送 100 积分

// ════════════════════════════════════════════════════════════════
// 1. 订阅状态解析
// ════════════════════════════════════════════════════════════════
export type SubscriptionStatus =
  | 'INACTIVE' // 未订阅
  | 'ACTIVE' // 生效中
  | 'CANCELED' // 已取消（到期前仍可用）
  | 'EXPIRED' // 已过期

export interface SubscriptionInfo {
  type: string | null
  status: SubscriptionStatus
  start: Date | null
  end: Date | null
  remainingDays: number
  isExpiringSoon: boolean // ≤ 3 天
  autoRenew: boolean
  canceledAt: Date | null
}

export function parseSubscription(user: {
  subscription_type?: string | null
  subscription_status?: string | null
  subscription_start?: Date | string | null
  subscription_end?: Date | string | null
  auto_renew?: boolean
  canceled_at?: Date | string | null
}): SubscriptionInfo {
  const status = (user.subscription_status || 'INACTIVE') as SubscriptionStatus
  const end = user.subscription_end
    ? new Date(user.subscription_end)
    : null
  const remainingDays = end
    ? Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0
  const isExpiringSoon =
    status === 'ACTIVE' && end ? remainingDays > 0 && remainingDays <= 3 : false

  return {
    type: user.subscription_type || null,
    status,
    start: user.subscription_start
      ? new Date(user.subscription_start)
      : null,
    end,
    remainingDays,
    isExpiringSoon,
    autoRenew: !!user.auto_renew,
    canceledAt: user.canceled_at ? new Date(user.canceled_at) : null,
  }
}

// ════════════════════════════════════════════════════════════════
// 2. 通用积分抵扣计算
//    orderAmount: 订单金额（元）
//    usePoints:   使用积分数
//    返回：{ discount, finalAmount, actualPointsUsed }
// ════════════════════════════════════════════════════════════════
export function calcApplyPoints(
  orderAmount: number,
  usePoints: number,
  maxRatio: number = POINTS_TO_YUAN_RATIO
): {
  discount: number
  finalAmount: number
  actualPointsUsed: number
  capped: boolean
} {
  const safeAmount = Math.max(0, Number(orderAmount) || 0)
  const safePoints = Math.max(0, Math.floor(Number(usePoints) || 0))

  // 最多抵扣订单金额的 20%（防滥用）
  const maxDiscount = Math.floor(safeAmount * 0.2 * 100) / 100
  // 积分可抵扣上限：usePoints / maxRatio
  const pointsBasedDiscount = Math.floor((safePoints / maxRatio) * 100) / 100

  // 取小者（不能超过订单 20%）
  const discount = Math.min(maxDiscount, pointsBasedDiscount)
  const actualPointsUsed = Math.ceil(discount * maxRatio) // 实际消耗的积分
  const finalAmount = Math.max(0, Math.round((safeAmount - discount) * 100) / 100)

  return {
    discount,
    finalAmount,
    actualPointsUsed,
    capped: pointsBasedDiscount > maxDiscount,
  }
}

// ════════════════════════════════════════════════════════════════
// 3. 续费专属：积分抵扣 200 积分 = 2 元
//    points: 用户当前积分
//    返回：{ canUse, pointsCost, yuanDiscount, finalPrice }
// ════════════════════════════════════════════════════════════════
export function calcRenewalDiscount(
  points: number,
  monthlyPrice: number = 69
): {
  canUse: boolean
  pointsCost: number
  yuanDiscount: number
  finalPrice: number
  message: string
} {
  // 续费：每 100 积分 = 1 元，最多扣 3 元（300 积分）
  const MAX_RENEWAL_DISCOUNT = 3
  const MAX_RENEWAL_POINTS = 300
  const usablePoints = Math.min(points, MAX_RENEWAL_POINTS)
  const yuanDiscount = Math.floor(usablePoints / 100) * 1
  const pointsCost = yuanDiscount * 100
  const finalPrice = Math.max(0, monthlyPrice - yuanDiscount)
  return {
    canUse: yuanDiscount > 0,
    pointsCost,
    yuanDiscount,
    finalPrice,
    message:
      yuanDiscount > 0
        ? `使用 ${pointsCost} 积分可抵扣 ¥${yuanDiscount}，续费仅需 ¥${finalPrice}`
        : '积分不足（每 100 积分抵扣 1 元，最多 3 元）',
  }
}

// ════════════════════════════════════════════════════════════════
// 4. 到期预警气泡文案生成器
//    返回：{ show, tone, emoji, title, body, ctaHref, ctaLabel, pointsTip }
// ════════════════════════════════════════════════════════════════
export interface ExpiringBanner {
  show: boolean
  tone: 'amber' | 'red' | 'rose' | null
  emoji: string
  title: string
  body: string
  ctaHref: string
  ctaLabel: string
  pointsTip: string
}

export function buildExpiringBanner(
  user: any,
  userPoints: number = 0
): ExpiringBanner {
  const info = parseSubscription(user)

  // 非月度会员 / 未订阅 / 已取消 → 不展示
  if (info.type !== 'MONTHLY_69' || info.status !== 'ACTIVE' || !info.end) {
    return emptyBanner()
  }

  // 已过期 → 红条警告
  if (info.remainingDays <= 0) {
    return {
      show: true,
      tone: 'red',
      emoji: '🚨',
      title: '您的 69 元会员已到期',
      body: '会员权益已停用 · 现在续费可继续享受全部权益',
      ctaHref: '/pricing',
      ctaLabel: '立即续费',
      pointsTip: `💎 您还有 ${userPoints} 积分，续费时可直接抵扣`,
    }
  }

  // 即将到期（≤ 3 天）→ 琥珀色温和提醒
  if (info.remainingDays <= 3) {
    const renew = calcRenewalDiscount(userPoints, 69)
    return {
      show: true,
      tone: 'amber',
      emoji: '⏰',
      title: `您的 69 元会员将于 ${info.remainingDays} 天后到期`,
      body: renew.canUse
        ? `使用 200 积分可抵扣 ${renew.yuanDiscount} 元，现在续费仅需 ${renew.finalPrice} 元`
        : `续费仅需 69 元，建议尽快续费避免权益中断`,
      ctaHref: '/pricing',
      ctaLabel: renew.canUse ? `用 ${renew.pointsCost} 积分抵扣续费` : '立即续费',
      pointsTip: `💎 您当前有 ${userPoints} 积分，续费最高可抵 3 元`,
    }
  }

  // 长期订阅（> 3 天） → 不展示到期气泡
  return emptyBanner()
}

function emptyBanner(): ExpiringBanner {
  return {
    show: false,
    tone: null,
    emoji: '',
    title: '',
    body: '',
    ctaHref: '/pricing',
    ctaLabel: '',
    pointsTip: '',
  }
}

// ════════════════════════════════════════════════════════════════
// 5. PointsLog 写入辅助（带 try/catch 兜底）
//    自动从内存 → Prisma → 三级降级
// ════════════════════════════════════════════════════════════════

// 内存 store（兜底 · 避免 dev server 崩溃）
const memoryPointsStore: any = (global as any).__pointsStore ||= {
  balances: new Map<string, { points: number; totalEarned: number; updatedAt: string }>(),
  logs: [] as Array<{
    id: string
    userId: string
    type: string
    amount: number
    balance: number
    remark: string | null
    relatedId: string | null
    createdAt: string
  }>,
}

function ensureMemoryPoints(userId: string) {
  if (!memoryPointsStore.balances.has(userId)) {
    memoryPointsStore.balances.set(userId, {
      points: 0,
      totalEarned: 0,
      updatedAt: new Date().toISOString(),
    })
  }
  return memoryPointsStore.balances.get(userId)!
}

export interface PointsChangeResult {
  userId: string
  type: string
  amount: number
  balance: number
  totalEarned: number
  source: 'prisma' | 'memory'
  logId: string
}

/** 增/减积分（统一以 Prisma 优先 + 内存兜底） */
export async function changePoints(
  userId: string,
  type: string,
  amount: number,
  remark?: string,
  relatedId?: string
): Promise<PointsChangeResult> {
  if (!userId) throw new Error('userId 必填')
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('amount 必须是数字')
  }

  const acc = ensureMemoryPoints(userId)
  const newBalance = Math.max(0, acc.points + amount)
  const newTotal =
    acc.totalEarned + (amount > 0 ? amount : 0)
  const logId = `mem-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

  // 1. 内存更新（最终一致源）
  acc.points = newBalance
  acc.totalEarned = newTotal
  acc.updatedAt = new Date().toISOString()
  memoryPointsStore.logs.unshift({
    id: logId,
    userId,
    type,
    amount,
    balance: newBalance,
    remark: remark || null,
    relatedId: relatedId || null,
    createdAt: new Date().toISOString(),
  })
  if (memoryPointsStore.logs.length > 500) memoryPointsStore.logs.length = 500

  // 2. Prisma 同步（失败不抛错）
  let source: 'prisma' | 'memory' = 'memory'
  try {
    await prisma.pointsLog.create({
      data: {
        userId,
        type,
        amount,
        balance: newBalance,
        remark: remark || null,
        relatedId: relatedId || null,
      },
    })
    // 同步 AssetBalance（按 phone 或 userId）
    if (amount !== 0) {
      const ab = await prisma.assetBalance
        .findUnique({ where: { phone: userId } })
        .catch(() => null)
      if (ab) {
        await prisma.assetBalance.update({
          where: { phone: userId },
          data: {
            points: newBalance,
            totalEarned: newTotal,
            updatedAt: new Date(),
          },
        })
      } else {
        await prisma.assetBalance
          .create({
            data: {
              phone: userId,
              points: newBalance,
              totalEarned: newTotal,
            },
          })
          .catch(() => null) // 忽略唯一键冲突
      }
    }
    source = 'prisma'
  } catch (e) {
    console.warn('[changePoints] Prisma 同步失败，使用内存 store:', (e as Error).message)
  }

  return {
    userId,
    type,
    amount,
    balance: newBalance,
    totalEarned: newTotal,
    source,
    logId,
  }
}

/** 查询余额（内存优先） */
export async function getPointsBalance(userId: string): Promise<{
  userId: string
  points: number
  totalEarned: number
}> {
  const acc = ensureMemoryPoints(userId)
  return {
    userId,
    points: acc.points,
    totalEarned: acc.totalEarned,
  }
}

/** 读取最近流水（最多 50 条） */
export async function getPointsLogs(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  return memoryPointsStore.logs
    .filter((l: any) => l.userId === userId)
    .slice(0, limit)
}

// ════════════════════════════════════════════════════════════════
// 6. 路由辅助：统一 JSON 响应格式
// ════════════════════════════════════════════════════════════════
export function ok<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    message: message || '操作成功',
    data,
  })
}

export function fail(error: string, status: number = 400) {
  return NextResponse.json({ success: false, error }, { status })
}
