/**
 * 进化二：自适应路径 · 卡点检测
 * ------------------------------------------------------------
 * 基于 learning-progress 的 scoreHistory 检测两种卡点模式：
 *
 *   1. 学习入门卡点
 *      - 3 天内 learning_score 没有任何增长
 *      - 且已完成的 score < 80（还没解锁实操）
 *      → 推送"重新评估 OPC 类型"建议
 *
 *   2. 运营实操卡点
 *      - 连续 2 天 step_practice_done 仍为 false
 *      - 但 learning_score >= 80（已解锁实操）
 *      → 推送"简化任务清单"建议
 *
 * 输出类型：AdaptiveAlert | null（null 表示无卡点，不推送任何东西）
 * ------------------------------------------------------------
 */

import {
  getLearningProgress,
  STUCK_DAYS_THRESHOLD,
  SOP_STUCK_DAYS_THRESHOLD,
  type LearningProgress,
} from './learning-progress-store'

export type AlertKind = 'learning-stuck' | 'practice-stuck'

export type AlertSeverity = 'info' | 'warn' | 'urgent'

export interface AdaptiveAlert {
  kind: AlertKind
  severity: AlertSeverity
  title: string
  description: string
  /** 跳转链接（点击后跳转） */
  actionHref: string
  actionLabel: string
  /** 卡点持续天数（用于文案显示） */
  stuckDays: number
}

/**
 * 计算两个 ISO 时间字符串之间的"自然日"差（向上取整）
 */
function daysBetween(a: string, b: string): number {
  const da = new Date(a)
  const db = new Date(b)
  const diffMs = Math.abs(db.getTime() - da.getTime())
  return Math.ceil(diffMs / (24 * 3600 * 1000))
}

/**
 * 找到 scoreHistory 中"分数最近一次变化"的时间点
 */
function lastScoreChangeAt(history: { score: number; at: string }[]): string {
  if (history.length === 0) return new Date().toISOString()
  for (let i = history.length - 1; i > 0; i--) {
    if (history[i].score !== history[i - 1].score) {
      return history[i].at
    }
  }
  return history[0].at
}

/**
 * 找到 scoreHistory 中"实践完成状态最近一次变化"的时间点
 */
function lastPracticeChangeAt(
  history: { practiceDone: boolean; at: string }[]
): string {
  if (history.length === 0) return new Date().toISOString()
  for (let i = history.length - 1; i > 0; i--) {
    if (history[i].practiceDone !== history[i - 1].practiceDone) {
      return history[i].at
    }
  }
  return history[0].at
}

/**
 * 检测卡点
 *
 * 优先级：实操卡点（更严重） > 学习卡点
 *
 * @param phone 用户标识（演示版用 opc_device_id）
 */
export function detectAdaptiveAlert(phone: string): AdaptiveAlert | null {
  const record = getLearningProgress(phone)
  const now = new Date().toISOString()
  const history = record.scoreHistory || []

  // 模式 2：实操卡点（高优先级）
  // 条件：learning_score >= 80 但 step_practice_done 仍为 false
  //       且"实践状态未变化"已超过 SOP_STUCK_DAYS_THRESHOLD 天
  if (record.learning_score >= 80 && !record.step_practice_done && history.length > 0) {
    const lastPracticeChange = lastPracticeChangeAt(history)
    const stuckDays = daysBetween(lastPracticeChange, now)
    if (stuckDays >= SOP_STUCK_DAYS_THRESHOLD) {
      return {
        kind: 'practice-stuck',
        severity: stuckDays >= 5 ? 'urgent' : 'warn',
        title: '你的实操进度较慢',
        description: `已解锁运营实操 ${stuckDays} 天，但首单 SOP 还没推进。需要我帮你简化第一周的任务清单吗？`,
        actionHref: '/workspace?bypass=simplify',
        actionLabel: '简化任务清单',
        stuckDays,
      }
    }
  }

  // 模式 1：学习入门卡点
  // 条件：learning_score < 80（未解锁）且分数连续 STUCK_DAYS_THRESHOLD 天无变化
  if (record.learning_score < 80 && history.length > 0) {
    const lastScoreChange = lastScoreChangeAt(history)
    const stuckDays = daysBetween(lastScoreChange, now)
    if (stuckDays >= STUCK_DAYS_THRESHOLD) {
      return {
        kind: 'learning-stuck',
        severity: stuckDays >= 7 ? 'urgent' : 'warn',
        title: '发现卡点？',
        description: `你的学习分数已 ${stuckDays} 天没有变化。建议回访 /diagnosis 重新评估你的 OPC 类型，或联系专家人工辅导。`,
        actionHref: '/diagnosis?reason=stuck',
        actionLabel: '重新评估 OPC 类型',
        stuckDays,
      }
    }
  }

  return null
}

/**
 * 异步版本：用于 API 路由（避免阻塞）
 */
export async function detectAdaptiveAlertAsync(
  phone: string
): Promise<AdaptiveAlert | null> {
  return Promise.resolve(detectAdaptiveAlert(phone))
}

/**
 * 简单包装：检测 + 标记"今日已显示"防重复
 * （演示版：不存储，纯函数，供前端组件直接调用）
 */
export function getTodayAlert(phone: string): AdaptiveAlert | null {
  return detectAdaptiveAlert(phone)
}

/**
 * 用于 `/api/user/adaptive-alert` 接口的响应
 */
export interface AdaptiveAlertApiResp {
  success: boolean
  alert: AdaptiveAlert | null
  score: number
  practiceDone: boolean
}

export function buildAlertApiResp(phone: string): AdaptiveAlertApiResp {
  const record = getLearningProgress(phone)
  return {
    success: true,
    alert: detectAdaptiveAlert(phone),
    score: record.learning_score,
    practiceDone: record.step_practice_done,
  }
}

export type { LearningProgress }
