/**
 * AI 主动型 Copilot · 用户反馈存储（点赞/点踩）
 * ------------------------------------------------------------
 * 用于训练 AI 的交互优先级：
 *   - 同一 kind 被点踩 ≥ 2 次 → 当日不再弹出（"我不喜欢这种提示"）
 *   - 同一 kind 被点赞 → 提升该 kind 的优先级（保留为后续个性化用）
 *   - 同一 kind 被点踩 ≥ 5 次 → 永久降级（基本不再弹该类提示）
 *
 * 存储：localStorage（key: opc_ai_feedback_v1）
 * 演示版持久化 7 天滚动窗口 + 累计 count
 * ------------------------------------------------------------
 */

import type { CopilotKind } from './ai-copilot-context'

const STORAGE_KEY = 'opc_ai_feedback_v1'

export type FeedbackType = 'up' | 'down'

export interface FeedbackRecord {
  kind: CopilotKind
  type: FeedbackType
  /** ISO 字符串 */
  at: string
}

interface FeedbackStore {
  /** 最近 7 天的反馈明细（用于降噪） */
  recent: FeedbackRecord[]
  /** 累计 up / down 计数（永不删除，仅用作排序） */
  upCount: Record<string, number>
  downCount: Record<string, number>
}

function emptyStore(): FeedbackStore {
  return { recent: [], upCount: {}, downCount: {} }
}

function readStore(): FeedbackStore {
  if (typeof window === 'undefined') return emptyStore()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStore()
    const parsed = JSON.parse(raw) as FeedbackStore
    // 基础防护
    return {
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      upCount: parsed.upCount || {},
      downCount: parsed.downCount || {},
    }
  } catch {
    return emptyStore()
  }
}

function writeStore(s: FeedbackStore) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // 忽略 quota / private mode
  }
}

/**
 * 修剪 7 天之外的旧反馈
 */
function trimRecent(records: FeedbackRecord[]): FeedbackRecord[] {
  const cutoff = Date.now() - 7 * 24 * 3600 * 1000
  return records.filter((r) => +new Date(r.at) >= cutoff)
}

/**
 * 记录一次反馈（点赞 / 点踩）
 */
export function recordFeedback(kind: CopilotKind, type: FeedbackType): void {
  const s = readStore()
  s.recent.push({ kind, type, at: new Date().toISOString() })
  s.recent = trimRecent(s.recent)
  const key = String(kind)
  if (type === 'up') {
    s.upCount[key] = (s.upCount[key] || 0) + 1
  } else {
    s.downCount[key] = (s.downCount[key] || 0) + 1
  }
  writeStore(s)
}

/**
 * 是否应该抑制该 kind 的弹窗
 *  - 当日 ≥ 2 次点踩：今日不再弹
 *  - 累计 ≥ 5 次点踩：永久抑制
 */
export function shouldSuppressBubble(kind: CopilotKind): boolean {
  const s = readStore()
  const key = String(kind)

  // 永久抑制
  if ((s.downCount[key] || 0) >= 5) return true

  // 当日抑制（最近 24h 内 down ≥ 2）
  const dayAgo = Date.now() - 24 * 3600 * 1000
  const recentDowns = s.recent.filter(
    (r) => r.kind === kind && r.type === 'down' && +new Date(r.at) >= dayAgo
  )
  if (recentDowns.length >= 2) return true

  return false
}

/**
 * 读取某个 kind 的"用户偏好度"（-1 ~ 1）
 * 用于排序：当多个 kind 同时满足触发条件时，偏好度高的优先
 */
export function getKindPreference(kind: CopilotKind): number {
  const s = readStore()
  const key = String(kind)
  const up = s.upCount[key] || 0
  const down = s.downCount[key] || 0
  if (up + down === 0) return 0
  return (up - down) / (up + down)
}
