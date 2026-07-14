/**
 * 用户 OPC 全流程阶段状态管理（Mock 实现）
 *
 * 用于在四库系统与个人中心之间共享用户的"诊断 / 学习 / 实操 / 放大"阶段。
 * 当用户在四库完成"工具配置"或"项目选择"时，应调用 updateUserStage 推进阶段，
 * 任务栏（FlowControlBar）和成员进度条（OPCProgressBar）会响应变化。
 *
 * 该模块是纯前端 Mock，方便后续替换为真实 API。
 */

export type UserStageKey = 'diagnosis' | 'learning' | 'operation' | 'scaling'

/** OPC 创业路径（在诊断阶段由用户选定） */
export type OPCLevel = 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET'

/** 会员等级 */
export type VIPTier = 'trial' | 'basic' | 'pro'

export interface UserStage {
  userId: string
  current: UserStageKey
  completed: UserStageKey[]
  /** 数据流打标：用户在诊断阶段选择的路径 */
  selectedPath?: OPCLevel | null
  /** OPC 创业等级（与 selectedPath 同步，但用于个人中心徽章） */
  opcLevel?: OPCLevel | null
  /** 会员等级 */
  vipTier?: VIPTier
  /** 最近一次状态更新时间 */
  updatedAt: string
}

export type StageListener = (stage: UserStage) => void

const STAGE_ORDER: UserStageKey[] = ['diagnosis', 'learning', 'operation', 'scaling']

const STAGE_LABELS: Record<UserStageKey, string> = {
  diagnosis: '诊断',
  learning: '学习',
  operation: '实操',
  scaling: '放大',
}

const OPC_LEVEL_META: Record<OPCLevel, { label: string; emoji: string; color: string }> = {
  TRADER: { label: '交易型 OPC', emoji: '💰', color: 'amber' },
  FLOW: { label: '流量型 OPC', emoji: '🔥', color: 'rose' },
  SYSTEM: { label: '系统型 OPC', emoji: '⚙️', color: 'blue' },
  ASSET: { label: '资产型 OPC', emoji: '💎', color: 'violet' },
}

/**
 * 角色徽章（个人中心头像上方展示）
 *
 * 与 OPC_LEVEL_META 的区别：
 *   - OPC_LEVEL_META 是"路径"语义（交易型/流量型 OPC）
 *   - OPC_ROLE_BADGE 是"游戏化身份"语义（交易先锋/流量猎手）
 */
const OPC_ROLE_BADGE: Record<
  OPCLevel | 'none',
  { emoji: string; label: string; bg: string; text: string; border: string; shadow: string }
> = {
  TRADER: {
    emoji: '🏅',
    label: '交易先锋',
    bg: 'bg-gradient-to-r from-amber-100 to-orange-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
    shadow: 'shadow-amber-200/50',
  },
  FLOW: {
    emoji: '🎯',
    label: '流量猎手',
    bg: 'bg-gradient-to-r from-rose-100 to-pink-100',
    text: 'text-rose-700',
    border: 'border-rose-300',
    shadow: 'shadow-rose-200/50',
  },
  SYSTEM: {
    emoji: '⚙️',
    label: '系统建造师',
    bg: 'bg-gradient-to-r from-blue-100 to-cyan-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
    shadow: 'shadow-blue-200/50',
  },
  ASSET: {
    emoji: '💎',
    label: '资产掌舵人',
    bg: 'bg-gradient-to-r from-violet-100 to-purple-100',
    text: 'text-violet-700',
    border: 'border-violet-300',
    shadow: 'shadow-violet-200/50',
  },
  none: {
    emoji: '🧭',
    label: '新手启航',
    bg: 'bg-gradient-to-r from-slate-100 to-gray-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    shadow: 'shadow-slate-200/50',
  },
}

const VIP_TIER_META: Record<VIPTier, { label: string; color: string; bg: string; ring: string }> = {
  trial: {
    label: '体验卡',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    ring: 'ring-slate-200',
  },
  basic: {
    label: '基础会员',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    ring: 'ring-blue-200',
  },
  pro: {
    label: '进阶会员',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    ring: 'ring-amber-300',
  },
}

// ════════════════════════════════════════════════════════════════
// 内存存储（Mock 阶段用，后续可替换为 Supabase / API）
// ════════════════════════════════════════════════════════════════

const stageStore: Map<string, UserStage> = new Map()
const listeners: Set<StageListener> = new Set()

function notify(stage: UserStage) {
  listeners.forEach((cb) => {
    try {
      cb(stage)
    } catch (err) {
      console.error('[user-stage] listener error:', err)
    }
  })
}

function defaultStage(userId: string): UserStage {
  return {
    userId,
    current: 'diagnosis',
    completed: [],
    selectedPath: null,
    opcLevel: null,
    vipTier: 'trial',
    updatedAt: new Date().toISOString(),
  }
}

// ════════════════════════════════════════════════════════════════
// 公共 API
// ════════════════════════════════════════════════════════════════

/**
 * 获取用户的 OPC 全流程阶段
 */
export async function getUserStage(userId: string): Promise<UserStage> {
  // 模拟 200ms 网络延迟，便于演示
  await new Promise((r) => setTimeout(r, 200))
  const existing = stageStore.get(userId)
  if (existing) return existing
  const fresh = defaultStage(userId)
  stageStore.set(userId, fresh)
  return fresh
}

/**
 * 更新用户的 OPC 全流程阶段
 *
 * @param userId   用户 ID
 * @param stage    目标阶段。如果该阶段已经晚于当前 current，会自动推进 current
 *                 并把中间阶段标记为 completed
 * @param extras   可选：附加数据（如 selectedPath）
 */
export async function updateUserStage(
  userId: string,
  stage: UserStageKey,
  extras?: {
    selectedPath?: OPCLevel | null
    opcLevel?: OPCLevel | null
    vipTier?: VIPTier
  }
): Promise<UserStage> {
  await new Promise((r) => setTimeout(r, 150))
  const prev = stageStore.get(userId) || defaultStage(userId)
  const targetIdx = STAGE_ORDER.indexOf(stage)
  const currentIdx = STAGE_ORDER.indexOf(prev.current)

  // 推进 current：取更深的一档
  const nextCurrent = targetIdx > currentIdx ? stage : prev.current
  // 把 current 之前的所有阶段都标记为已完成
  const nextCompleted = STAGE_ORDER.filter((_, i) => i < STAGE_ORDER.indexOf(nextCurrent))

  const next: UserStage = {
    userId,
    current: nextCurrent,
    completed: nextCompleted,
    selectedPath: extras?.selectedPath ?? prev.selectedPath ?? null,
    opcLevel: extras?.opcLevel ?? prev.opcLevel ?? null,
    vipTier: extras?.vipTier ?? prev.vipTier ?? 'trial',
    updatedAt: new Date().toISOString(),
  }
  stageStore.set(userId, next)
  notify(next)
  return next
}

/**
 * 订阅阶段变化（用于 FlowControlBar / 进度条实时刷新）
 */
export function subscribeUserStage(cb: StageListener): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/**
 * 工具函数：判断某阶段是否完成
 */
export function isStageCompleted(stage: UserStage, key: UserStageKey): boolean {
  return stage.completed.includes(key)
}

/**
 * 工具函数：判断某阶段是否正在进行
 */
export function isStageActive(stage: UserStage, key: UserStageKey): boolean {
  return stage.current === key
}

/**
 * 工具函数：获取阶段的中文标签
 */
export function getStageLabel(key: UserStageKey): string {
  return STAGE_LABELS[key] || key
}

/**
 * 工具函数：阶段顺序
 */
export function getStageOrder(): UserStageKey[] {
  return [...STAGE_ORDER]
}

/**
 * 模拟：触发"工具配置完成"事件（用于四库挂件主动调用）
 */
export async function markToolConfigured(userId: string): Promise<UserStage> {
  return updateUserStage(userId, 'learning')
}

/**
 * 模拟：触发"项目选择完成"事件
 */
export async function markProjectSelected(userId: string): Promise<UserStage> {
  return updateUserStage(userId, 'operation')
}

// ════════════════════════════════════════════════════════════════
// 便捷函数（个人中心 / FlowControlBar 使用）
// ════════════════════════════════════════════════════════════════

/** 单独设置 OPC 等级（与 selectedPath 同步） */
export async function setOPCRoute(
  userId: string,
  level: OPCLevel | null
): Promise<UserStage> {
  const prev = stageStore.get(userId) || defaultStage(userId)
  return updateUserStage(userId, prev.current, {
    selectedPath: level,
    opcLevel: level,
  })
}

/** 单独设置会员等级 */
export async function setVIPTier(
  userId: string,
  tier: VIPTier
): Promise<UserStage> {
  const prev = stageStore.get(userId) || defaultStage(userId)
  return updateUserStage(userId, prev.current, { vipTier: tier })
}

/** 获取 OPC 等级的中文标签 + emoji */
export function getOPCLevelMeta(level: OPCLevel | null | undefined): {
  label: string
  emoji: string
  color: string
} {
  if (!level) {
    return { label: '未选择路径', emoji: '🎯', color: 'slate' }
  }
  return OPC_LEVEL_META[level]
}

/**
 * 获取用户角色徽章（个人中心头像上方用）
 *
 * - level 为 TRADER / FLOW / SYSTEM / ASSET → 返回对应英雄称号
 * - level 为 null / undefined / 其他 → 返回"新手启航"
 */
export function getOPCRoleBadge(level: OPCLevel | null | undefined): {
  emoji: string
  label: string
  bg: string
  text: string
  border: string
  shadow: string
} {
  if (!level) return OPC_ROLE_BADGE.none
  return OPC_ROLE_BADGE[level] ?? OPC_ROLE_BADGE.none
}

/** 获取会员等级元数据 */
export function getVIPTierMeta(tier: VIPTier | undefined): {
  label: string
  color: string
  bg: string
  ring: string
} {
  return VIP_TIER_META[tier || 'trial']
}

/** 获取下一阶段（用于 CTA 跳转） */
export function getNextStageKey(current: UserStageKey): UserStageKey | null {
  const idx = STAGE_ORDER.indexOf(current)
  if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null
  return STAGE_ORDER[idx + 1]
}

/** 阶段对应的默认跳转路由（用于 CTA 大按钮） */
export function getStageRoute(stage: UserStageKey): string {
  switch (stage) {
    case 'diagnosis':
      return '/diagnosis'
    case 'learning':
      return '/market'
    case 'operation':
      return '/market'
    case 'scaling':
      return '/partner'
    default:
      return '/'
  }
}

// ════════════════════════════════════════════════════════════════
// 智能分流：STEP 02 / 03 学习入口跳转（基于用户 opc_level）
// ════════════════════════════════════════════════════════════════

/** localStorage 中 opc_level 的键名（与诊断页写入保持一致） */
export const OPC_LEVEL_STORAGE_KEY = 'opc_level'

/** OPCLevel → /guide/{level} URL 映射（已从 /market/guide 升级为 app 级独立路由） */
const LEVEL_TO_GUIDE: Record<OPCLevel, string> = {
  TRADER: '/guide/trader',
  FLOW: '/guide/flow',
  SYSTEM: '/guide/system',
  ASSET: '/guide/asset',
}

/**
 * 把诊断结果同步写入 localStorage，供客户端其他组件读取
 * （写入失败时静默降级，不影响主流程）
 */
export function saveOPCRouteToStorage(level: OPCLevel | null): void {
  if (typeof window === 'undefined') return
  try {
    if (level) {
      window.localStorage.setItem(OPC_LEVEL_STORAGE_KEY, level)
    } else {
      window.localStorage.removeItem(OPC_LEVEL_STORAGE_KEY)
    }
  } catch {
    // 忽略 localStorage 不可用（如隐私模式、SSR）
  }
}

/**
 * 同步读取 localStorage 中的 opc_level
 */
export function readOPCRouteFromStorage(): OPCLevel | null {
  if (typeof window === 'undefined') return null
  try {
    const v = window.localStorage.getItem(OPC_LEVEL_STORAGE_KEY)
    if (v === 'TRADER' || v === 'FLOW' || v === 'SYSTEM' || v === 'ASSET') {
      return v
    }
    return null
  } catch {
    return null
  }
}

/**
 * 智能分流：STEP 02/03 学习入门 / 运营实操跳转
 *
 * 优先级：
 *   1. URL query 参数 ?opc_level=flow（支持分享/埋点）
 *   2. localStorage['opc_level']（诊断完成时写入）
 *   3. 降级到 fallback（默认 /market 四库总览页）
 */
export function resolveSmartLearningHref(
  fallback: string = '/market'
): string {
  if (typeof window === 'undefined') return fallback

  // 1. URL query 优先
  try {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('opc_level')?.toUpperCase()
    if (q === 'TRADER' || q === 'FLOW' || q === 'SYSTEM' || q === 'ASSET') {
      return LEVEL_TO_GUIDE[q]
    }
  } catch {
    // 忽略
  }

  // 2. localStorage
  const stored = readOPCRouteFromStorage()
  if (stored) {
    return LEVEL_TO_GUIDE[stored]
  }

  // 3. 降级
  return fallback
}
