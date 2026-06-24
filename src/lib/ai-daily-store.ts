// AI 智富日报 + 用户偏好 · 共享内存 store
// 解决 Next dev 模式 HMR 路由隔离 + Supabase 未配置时降级
// 全局挂载到 globalThis 确保所有 route 共享同一份数据

export type UserPref = {
  userId: string
  dailyBrief: boolean
  updatedAt: string
}

export type DailyBriefItem = {
  id: string
  userId: string
  content: string
  isRead: boolean
  generatedAt: string
}

type Store = {
  preferences: Map<string, UserPref>
  briefs: DailyBriefItem[]
}

const g = globalThis as unknown as {
  __lpAIDailyStore?: Store
}

if (!g.__lpAIDailyStore) {
  g.__lpAIDailyStore = {
    preferences: new Map<string, UserPref>(),
    briefs: [],
  }
}

export const aiDailyStore = g.__lpAIDailyStore

// ────────────── 偏好 ──────────────
export function getPreference(userId: string): UserPref {
  const existing = aiDailyStore.preferences.get(userId)
  if (existing) return existing
  const init: UserPref = {
    userId,
    dailyBrief: false,
    updatedAt: new Date().toISOString(),
  }
  aiDailyStore.preferences.set(userId, init)
  return init
}

export function setPreference(userId: string, dailyBrief: boolean): UserPref {
  const cur: UserPref = {
    userId,
    dailyBrief,
    updatedAt: new Date().toISOString(),
  }
  aiDailyStore.preferences.set(userId, cur)
  return cur
}

// ────────────── 日报 ──────────────
export function getLatestBrief(userId: string): DailyBriefItem | null {
  // 取该用户最新一条日报
  const items = aiDailyStore.briefs.filter((b) => b.userId === userId)
  if (items.length === 0) return null
  items.sort((a, b) => +new Date(b.generatedAt) - +new Date(a.generatedAt))
  return items[0]
}

export function listBriefs(userId: string, limit = 7): DailyBriefItem[] {
  const items = aiDailyStore.briefs.filter((b) => b.userId === userId)
  items.sort((a, b) => +new Date(b.generatedAt) - +new Date(a.generatedAt))
  return items.slice(0, limit)
}

export function addBrief(userId: string, content: string): DailyBriefItem {
  const item: DailyBriefItem = {
    id: `brief-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    content,
    isRead: false,
    generatedAt: new Date().toISOString(),
  }
  aiDailyStore.briefs.unshift(item)
  // 限制最大 100 条
  if (aiDailyStore.briefs.length > 100) aiDailyStore.briefs.length = 100
  return item
}

export function markBriefRead(id: string, userId: string): boolean {
  const item = aiDailyStore.briefs.find((b) => b.id === id && b.userId === userId)
  if (!item) return false
  item.isRead = true
  return true
}
