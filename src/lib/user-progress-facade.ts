'use client'

/**
 * useUserProgressFacade · 用户进度统一 Facade Hook（W5.1 演进）
 * ------------------------------------------------------------
 * 目标：消除 member 页 N 个独立 store 的 import 散落，提供单一入口
 *
 * 聚合范围（5 个 store）：
 *   1. learning-progress-store  → 学习积分 + 任务完成度
 *   2. streak-store             → 打卡连胜 + 勋章
 *   3. user-stage               → 4 阶段进度（诊断/学习/实操/放大）
 *   4. diagnosis-store          → 诊断数据（痛点/资金/经验）
 *   5. /api/points              → 智富积分余额
 *
 * 设计要点：
 *   - 单一返回对象，所有字段可选，未就绪字段为 null
 *   - SSR 安全：所有 localStorage 访问都在 useEffect 中
 *   - 容错降级：单个子 store 失败不影响其他
 *   - 跨 tab 同步：监听 localStorage storage 事件
 *
 * 使用方：
 *   const progress = useUserProgressFacade()
 *   progress?.streak.currentStreak     // 7
 *   progress?.learning.learningScore   // 80
 *   progress?.stage.current            // 'operation'
 *   progress?.points.balance           // 150
 * ------------------------------------------------------------
 */

import { useEffect, useState, useCallback } from 'react'

import {
  getLearningProgress,
  type LearningProgress,
  type OPCLevel,
} from './learning-progress-store'
import {
  getStreakSnapshot,
  type StreakSnapshot,
} from './streak-store'
import {
  getUserStage,
  subscribeUserStage,
  type UserStage,
  readOPCRouteFromStorage,
} from './user-stage'
import {
  getUserDiagnosis,
  type UserDiagnosis,
} from './diagnosis-store'

// ════════════════════════════════════════════════════════════════
// 1. 类型定义
// ════════════════════════════════════════════════════════════════

export interface UserProgressFacade {
  /** 学习积分（0-100） */
  learning: {
    score: number
    canUnlockPractice: boolean
    taskBrowse: boolean
    taskRegister: boolean
    taskDownload: boolean
    practiceDone: boolean
    scaleUpDone: boolean
    opcLevel: OPCLevel | null
  } | null
  /** 打卡连胜 */
  streak: {
    currentStreak: number
    longestStreak: number
    todayPunches: number
    hasPunchedToday: boolean
    unlockedMedals: string[]
  } | null
  /** 4 阶段进度 */
  stage: UserStage | null
  /** 诊断数据 */
  diagnosis: UserDiagnosis | null
  /** 智富积分（来自 /api/points） */
  points: {
    balance: number
    loaded: boolean
  } | null
  /** 设备 ID（用于后端 API 调用） */
  deviceId: string
  /** 数据是否完成首次加载（用于骨架屏控制） */
  ready: boolean
}

// ════════════════════════════════════════════════════════════════
// 2. 工具函数
// ════════════════════════════════════════════════════════════════

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr-device'
  let id = window.localStorage.getItem('opc_device_id')
  if (!id) {
    id = `dev-${Date.now()}-${Math.floor(Math.random() * 100000)}`
    window.localStorage.setItem('opc_device_id', id)
  }
  return id
}

// ════════════════════════════════════════════════════════════════
// 3. 主 hook
// ════════════════════════════════════════════════════════════════

/**
 * 用户进度统一 Facade
 *
 * 行为契约：
 *   - 首次渲染返回 ready=false（避免 SSR mismatch + 等待客户端加载）
 *   - 子 store 失败不影响其他子项（容错降级）
 *   - 卸载时自动清理所有订阅与计时器
 */
export function useUserProgressFacade(): UserProgressFacade {
  const [snapshot, setSnapshot] = useState<UserProgressFacade>({
    learning: null,
    streak: null,
    stage: null,
    diagnosis: null,
    points: null,
    deviceId: 'ssr-device',
    ready: false,
  })

  const refresh = useCallback(async (phone: string) => {
    // 1) learning-progress (in-memory store)
    let learning: UserProgressFacade['learning'] = null
    try {
      const lp = getLearningProgress(phone)
      learning = {
        score: lp.learning_score,
        canUnlockPractice: lp.can_unlock_practice,
        taskBrowse: lp.task_browse,
        taskRegister: lp.task_register,
        taskDownload: lp.task_download,
        practiceDone: lp.step_practice_done,
        scaleUpDone: lp.step_scaleup_done,
        opcLevel: lp.opcLevel ?? readOPCRouteFromStorage() ?? null,
      }
    } catch {
      /* 容错：in-memory store 不会失败 */
    }

    // 2) streak (localStorage)
    let streak: UserProgressFacade['streak'] = null
    try {
      const s = getStreakSnapshot(phone)
      streak = {
        currentStreak: s.currentStreak,
        longestStreak: s.longestStreak,
        todayPunches: s.todayPunches,
        hasPunchedToday: s.hasPunchedToday,
        unlockedMedals: s.unlockedMedals,
      }
    } catch {
      /* 容错 */
    }

    // 3) user-stage (in-memory + 订阅)
    let stage: UserStage | null = null
    try {
      stage = await getUserStage(phone)
    } catch {
      /* 容错 */
    }

    // 4) diagnosis (in-memory)
    let diagnosis: UserDiagnosis | null = null
    try {
      const opcLevel = learning?.opcLevel ?? undefined
      diagnosis = getUserDiagnosis(phone, opcLevel)
    } catch {
      /* 容错 */
    }

    setSnapshot((prev) => ({
      ...prev,
      learning,
      streak,
      stage,
      diagnosis,
    }))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const phone = getDeviceId()

    // 立即刷新一次
    refresh(phone)

    // 5) 积分余额（异步 fetch）
    let cancelled = false
    fetch(`/api/points?userId=${encodeURIComponent(phone)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled) return
        const balance = j?.success && typeof j.data?.points === 'number' ? j.data.points : 0
        setSnapshot((prev) => ({
          ...prev,
          points: { balance, loaded: true },
        }))
      })
      .catch(() => {
        if (cancelled) return
        setSnapshot((prev) => ({
          ...prev,
          points: { balance: 0, loaded: true },
        }))
      })

    // 6) 订阅 user-stage 变化（其他组件更新阶段时自动刷新）
    const unsubscribeStage = subscribeUserStage(() => {
      refresh(phone)
    })

    // 7) 跨 tab 同步
    const onStorage = (e: StorageEvent) => {
      // 任意 opc_* 键变化都触发刷新（含 streak / learning / points 等）
      if (e.key?.startsWith('opc_')) {
        refresh(phone)
        // 积分也单独刷一次（fetch 不会被 storage 事件触发）
        fetch(`/api/points?userId=${encodeURIComponent(phone)}`, { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .then((j) => {
            if (cancelled) return
            const balance =
              j?.success && typeof j.data?.points === 'number' ? j.data.points : 0
            setSnapshot((prev) => ({ ...prev, points: { balance, loaded: true } }))
          })
          .catch(() => {})
      }
    }
    window.addEventListener('storage', onStorage)

    // 8) 标记 ready（在积分 load 后兜底）
    const readyTimer = setTimeout(() => {
      setSnapshot((prev) => {
        if (prev.ready) return prev
        return {
          ...prev,
          deviceId: phone,
          ready: true,
          points: prev.points || { balance: 0, loaded: false },
        }
      })
    }, 800) // 800ms 兜底（正常积分 < 200ms 就会 resolve）

    return () => {
      cancelled = true
      unsubscribeStage()
      window.removeEventListener('storage', onStorage)
      clearTimeout(readyTimer)
    }
  }, [refresh])

  return snapshot
}

// ════════════════════════════════════════════════════════════════
// 4. 派生 selectors（业务高频读取）
// ════════════════════════════════════════════════════════════════

/** 总进度百分比（学习 60% + 阶段 40%） */
export function selectOverallProgress(facade: UserProgressFacade): number {
  if (!facade.ready) return 0
  const lp = facade.learning?.score ?? 0
  const stageScore = facade.stage
    ? {
        diagnosis: 25,
        learning: 50,
        operation: 75,
        scaling: 100,
      }[facade.stage.current] ?? 0
    : 0
  return Math.round(lp * 0.6 + stageScore * 0.4)
}

/** 是否所有 3 任务都已完成 */
export function isAllTasksDone(facade: UserProgressFacade): boolean {
  return !!(
    facade.learning?.taskBrowse &&
    facade.learning?.taskRegister &&
    facade.learning?.taskDownload
  )
}

/** 是否可解锁运营实操（80 分门槛） */
export function canStartPractice(facade: UserProgressFacade): boolean {
  return facade.learning?.canUnlockPractice ?? false
}
