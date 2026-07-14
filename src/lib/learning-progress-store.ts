/**
 * 新手启航学习进度（In-Memory Store）
 * ------------------------------------------------------------
 * 替代 Prisma / MySQL 的轻量实现（与 ai-daily-store / user-stage 模式一致）
 *
 * 设计要点：
 *   - 按手机号（phone）作为唯一 key
 *   - 任务1（browse）+20 / 任务2（register）+40 / 任务3（download）+40
 *   - 当 learning_score >= 80 时自动设置 can_unlock_practice = true
 *   - 模块级 Map 全局持久（dev 模式热更新可能重置，符合当前 store 约定）
 * ------------------------------------------------------------
 */

export type OPCLevel = 'TRADER' | 'FLOW' | 'SYSTEM' | 'ASSET'

export interface ScoreSnapshot {
  /** 当时的 learning_score */
  score: number
  /** 当时的 step_practice_done */
  practiceDone: boolean
  /** ISO 字符串 */
  at: string
}

export interface LearningProgress {
  phone: string
  opcLevel?: OPCLevel
  task_browse: boolean
  task_register: boolean
  task_download: boolean
  learning_score: number
  can_unlock_practice: boolean
  step_diagnosis_done: boolean
  step_learning_done: boolean
  step_practice_done: boolean
  step_scaleup_done: boolean
  /** 进化二：分数历史快照（最多保留 30 条，用于卡点检测） */
  scoreHistory: ScoreSnapshot[]
  updatedAt: string
  createdAt: string
}

const STORE = new Map<string, LearningProgress>()

/** 任务得分常量（与 UI 文案一致：browse=+20, register=+40, download=+40） */
export const TASK_SCORE: Record<'browse' | 'register' | 'download', number> = {
  browse: 20,
  register: 40,
  download: 40,
}

/** 解锁运营实操的得分阈值（>= 80 即可解锁） */
export const UNLOCK_PRACTICE_THRESHOLD = 80

/** 进化二：卡点检测阈值（天） */
export const STUCK_DAYS_THRESHOLD = 3
export const SOP_STUCK_DAYS_THRESHOLD = 2

/** 进化二：分数历史最大保留条数 */
export const SCORE_HISTORY_MAX = 30

function makeDefault(phone: string): LearningProgress {
  const now = new Date().toISOString()
  return {
    phone,
    opcLevel: undefined,
    task_browse: false,
    task_register: false,
    task_download: false,
    learning_score: 0,
    can_unlock_practice: false,
    step_diagnosis_done: false,
    step_learning_done: false,
    step_practice_done: false,
    step_scaleup_done: false,
    scoreHistory: [{ score: 0, practiceDone: false, at: now }],
    updatedAt: now,
    createdAt: now,
  }
}

/** 获取或创建（upsert）指定 phone 的学习进度 */
export function getLearningProgress(phone: string): LearningProgress {
  let record = STORE.get(phone)
  if (!record) {
    record = makeDefault(phone)
    STORE.set(phone, record)
  }
  // 兼容老数据：自动补 scoreHistory
  if (!record.scoreHistory || !Array.isArray(record.scoreHistory)) {
    record.scoreHistory = [{ score: record.learning_score ?? 0, practiceDone: !!record.step_practice_done, at: record.createdAt || new Date().toISOString() }]
  }
  return record
}

/**
 * 推入一条历史快照（仅在分数或练习状态变化时调用）
 */
function pushHistory(record: LearningProgress) {
  const last = record.scoreHistory[record.scoreHistory.length - 1]
  // 去重：如果分数和实践状态都没变，不推
  if (last && last.score === record.learning_score && last.practiceDone === record.step_practice_done) {
    return
  }
  record.scoreHistory.push({
    score: record.learning_score,
    practiceDone: record.step_practice_done,
    at: new Date().toISOString(),
  })
  if (record.scoreHistory.length > SCORE_HISTORY_MAX) {
    record.scoreHistory = record.scoreHistory.slice(-SCORE_HISTORY_MAX)
  }
}

/**
 * 标记任务完成
 * - 已完成的任务不再加分（幂等）
 * - 未完成的任务加分后翻转为 true
 * - 累加 learning_score 并自动更新 can_unlock_practice
 */
export function markTask(
  phone: string,
  task: 'browse' | 'register' | 'download',
): LearningProgress {
  const record = getLearningProgress(phone)
  const key = `task_${task}` as 'task_browse' | 'task_register' | 'task_download'
  if (!record[key]) {
    record[key] = true
    record.learning_score = Math.min(100, record.learning_score + TASK_SCORE[task])
  }
  // 自动判断解锁条件
  record.can_unlock_practice = record.learning_score >= UNLOCK_PRACTICE_THRESHOLD
  // 达到 80 分自动标记学习阶段完成
  if (record.can_unlock_practice) {
    record.step_learning_done = true
  }
  record.updatedAt = new Date().toISOString()
  pushHistory(record)
  return record
}

/** 设置 OPC 类型（由前端诊断完成后调用） */
export function setOPCLevel(phone: string, opcLevel: OPCLevel): LearningProgress {
  const record = getLearningProgress(phone)
  record.opcLevel = opcLevel
  record.step_diagnosis_done = true
  record.updatedAt = new Date().toISOString()
  pushHistory(record)
  return record
}

/** 标记 STEP 03（运营实操）完成 */
export function markPracticeDone(phone: string): LearningProgress {
  const record = getLearningProgress(phone)
  record.step_practice_done = true
  record.updatedAt = new Date().toISOString()
  pushHistory(record)
  return record
}

/** 标记 STEP 04（矩阵放大）完成 */
export function markScaleupDone(phone: string): LearningProgress {
  const record = getLearningProgress(phone)
  record.step_scaleup_done = true
  record.updatedAt = new Date().toISOString()
  return record
}

/** 重置（仅测试用） */
export function resetLearningProgress(phone: string): LearningProgress {
  const fresh = makeDefault(phone)
  STORE.set(phone, fresh)
  return fresh
}

/** 列出所有记录（仅调试用） */
export function listAllLearningProgress(): LearningProgress[] {
  return Array.from(STORE.values())
}
