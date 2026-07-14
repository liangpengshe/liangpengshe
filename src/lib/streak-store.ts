/**
 * 进化四：游戏化激励 · 打卡连胜 & 勋章
 * ------------------------------------------------------------
 * 三大机制：
 *   1. 打卡连胜（Streak）
 *      - 每天最多打卡 1 次（同一 phone 当天重复打卡不计连胜）
 *      - 隔天打卡 → 连胜 +1
 *      - 中断 1 天 → 连胜清零
 *      - 通过"上次打卡日期"和"今日是否已打卡"判断
 *
 *   2. 今日打卡次数（Today Punches）
 *      - 一天内可多次打卡不同任务（如浏览/注册/下载）
 *      - 每次打卡触发 CelebrationModal 高光动画
 *
 *   3. 勋章解锁（Medals）
 *      - 7 天连胜 → "OPC 持久战勋章" → 解锁 50 元优惠券
 *      - 30 天连胜 → "OPC 传奇勋章"
 *      - 100 天连胜 → "OPC 永恒勋章"
 *
 * 存储：localStorage（opc_streak_v1），演示版持久化
 * ------------------------------------------------------------
 */

export type MedalKey = 'streak-7' | 'streak-30' | 'streak-100'

export interface Medal {
  key: MedalKey
  emoji: string
  name: string
  description: string
  /** 解锁所需的连胜天数 */
  requiredDays: number
  /** 解锁后的奖励描述 */
  reward: string
  /** 解锁后的优惠券金额（元） */
  couponAmount?: number
}

export const MEDALS: Record<MedalKey, Medal> = {
  'streak-7': {
    key: 'streak-7',
    emoji: '🥉',
    name: 'OPC 持久战勋章',
    description: '连续 7 天完成 OPC 打卡',
    requiredDays: 7,
    reward: '解锁 1980 陪跑服务 50 元优惠券',
    couponAmount: 50,
  },
  'streak-30': {
    key: 'streak-30',
    emoji: '🥈',
    name: 'OPC 铁人勋章',
    description: '连续 30 天完成 OPC 打卡',
    requiredDays: 30,
    reward: '解锁 1 次专家 1V1 咨询',
  },
  'streak-100': {
    key: 'streak-100',
    emoji: '🥇',
    name: 'OPC 传奇勋章',
    description: '连续 100 天完成 OPC 打卡',
    requiredDays: 100,
    reward: '解锁城市主理人直通名额',
  },
}

export interface StreakSnapshot {
  phone: string
  /** 当前连胜天数 */
  currentStreak: number
  /** 历史最长连胜 */
  longestStreak: number
  /** 今日打卡次数 */
  todayPunches: number
  /** 今日是否已打过卡（用于控制连胜递增） */
  hasPunchedToday: boolean
  /** 上次打卡的 ISO 日期 */
  lastPunchDate: string | null
  /** 已解锁的勋章列表 */
  unlockedMedals: MedalKey[]
  /** 首次打卡的 ISO 日期 */
  createdAt: string
  /** 最近一次状态更新时间 */
  updatedAt: string
}

const STORAGE_KEY = 'opc_streak_v1'

function emptySnapshot(phone: string): StreakSnapshot {
  const now = new Date().toISOString()
  return {
    phone,
    currentStreak: 0,
    longestStreak: 0,
    todayPunches: 0,
    hasPunchedToday: false,
    lastPunchDate: null,
    unlockedMedals: [],
    createdAt: now,
    updatedAt: now,
  }
}

function readSnapshot(phone: string): StreakSnapshot {
  if (typeof window === 'undefined') return emptySnapshot(phone)
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptySnapshot(phone)
    const all = JSON.parse(raw) as Record<string, StreakSnapshot>
    const found = all[phone]
    if (!found) return emptySnapshot(phone)
    // 检查今日是否已重置
    const today = new Date().toISOString().slice(0, 10)
    if (found.lastPunchDate && !found.lastPunchDate.startsWith(today)) {
      // 隔天了 → 检查连胜是否需要重置
      const lastDate = new Date(found.lastPunchDate)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (24 * 3600 * 1000))
      if (diffDays > 1) {
        // 中断了超过 1 天 → 重置连胜
        found.currentStreak = 0
      }
      found.hasPunchedToday = false
      found.todayPunches = 0
    }
    return found
  } catch {
    return emptySnapshot(phone)
  }
}

function writeSnapshot(snap: StreakSnapshot): void {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const all: Record<string, StreakSnapshot> = raw ? JSON.parse(raw) : {}
    all[snap.phone] = snap
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // 忽略
  }
}

/**
 * 打卡一次
 * @returns 打卡结果 + 新解锁的勋章（若有）
 */
export function punch(phone: string, taskLabel?: string): {
  snapshot: StreakSnapshot
  newMedal: Medal | null
  streakIncreased: boolean
  isFirstPunchToday: boolean
} {
  const snap = readSnapshot(phone)
  const today = new Date().toISOString().slice(0, 10)
  const wasFirstPunchToday = !snap.hasPunchedToday
  let streakIncreased = false

  if (wasFirstPunchToday) {
    // 今日首次打卡
    snap.hasPunchedToday = true
    snap.todayPunches = 1
    // 判断连胜
    if (snap.lastPunchDate) {
      const lastDate = new Date(snap.lastPunchDate.slice(0, 10))
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (24 * 3600 * 1000))
      if (diffDays === 1) {
        // 连续 → 连胜 +1
        snap.currentStreak += 1
        streakIncreased = true
      } else if (diffDays > 1) {
        // 中断 → 重置为 1
        snap.currentStreak = 1
        streakIncreased = true
      }
    } else {
      // 首次打卡
      snap.currentStreak = 1
      streakIncreased = true
    }
    snap.lastPunchDate = new Date().toISOString()
  } else {
    // 今日已打过卡 → 只增加今日打卡次数
    snap.todayPunches += 1
  }
  // 更新最长连胜
  if (snap.currentStreak > snap.longestStreak) {
    snap.longestStreak = snap.currentStreak
  }
  // 检查勋章解锁
  let newMedal: Medal | null = null
  for (const key of ['streak-7', 'streak-30', 'streak-100'] as MedalKey[]) {
    if (snap.currentStreak >= MEDALS[key].requiredDays && !snap.unlockedMedals.includes(key)) {
      snap.unlockedMedals.push(key)
      newMedal = MEDALS[key]
      break // 一次只解锁 1 个
    }
  }
  snap.updatedAt = new Date().toISOString()
  writeSnapshot(snap)
  return {
    snapshot: snap,
    newMedal,
    streakIncreased,
    isFirstPunchToday: wasFirstPunchToday,
  }
}

/**
 * 读取当前快照（不打卡）
 */
export function getStreakSnapshot(phone: string): StreakSnapshot {
  return readSnapshot(phone)
}

/**
 * 生成激励文案
 */
export function buildIncentiveText(snap: StreakSnapshot): string {
  if (snap.todayPunches === 0 && !snap.hasPunchedToday) {
    return '今日还未打卡，戳一下开启连胜 🚀'
  }
  const remain = nextMilestone(snap.currentStreak)
  if (remain > 0) {
    return `今日已打卡 ${snap.todayPunches} 项，距离下一阶段解锁还差 ${remain} 天`
  }
  return `今日已打卡 ${snap.todayPunches} 项，连胜 ${snap.currentStreak} 天！`
}

/**
 * 距下一勋章还差几天
 */
export function nextMilestone(currentStreak: number): number {
  if (currentStreak < 7) return 7 - currentStreak
  if (currentStreak < 30) return 30 - currentStreak
  if (currentStreak < 100) return 100 - currentStreak
  return 0
}
