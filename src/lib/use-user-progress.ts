'use client'

/**
 * useUserProgress · 用户学习进度 hook（资源库门锁判定专用）
 * ------------------------------------------------------------
 * 用于"资源库门锁"判断：是否已解锁运营实操（can_unlock_practice）
 *
 * 数据源：/api/user/learning-progress
 * 降级策略：fetch 失败时静默返回 null（不抛错）
 *
 * 引用方：
 *   - src/components/market/MarketContent.tsx （资源库 ResourceCard）
 * ------------------------------------------------------------
 */

import { useEffect, useState } from 'react'

export interface UserProgressSnapshot {
  /** OPC 等级（TRADER / FLOW / SYSTEM / ASSET / null） */
  opcLevel: string | null
  /** 学习积分 0-100 */
  learningScore: number
  /** 是否已解锁运营实操（true = 已通过 STEP 02 80 分门槛） */
  canUnlockPractice: boolean
  /** STEP 03 运营实操是否已完成 */
  stepPracticeDone: boolean
}

interface LearningProgressApiData {
  opcLevel?: string
  learning_score: number
  can_unlock_practice: boolean
  step_practice_done: boolean
}

interface LearningProgressApiResp {
  success: boolean
  data?: LearningProgressApiData
}

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr-device'
  let id = window.localStorage.getItem('opc_device_id')
  if (!id) {
    id = `dev-${Date.now()}-${Math.floor(Math.random() * 100000)}`
    window.localStorage.setItem('opc_device_id', id)
  }
  return id
}

/**
 * 读取用户学习进度（首次 + 跨 tab storage 事件自动刷新）
 *
 * 卸载 / 路由变化时自动清理监听
 */
export function useUserProgress(): UserProgressSnapshot | null {
  const [snapshot, setSnapshot] = useState<UserProgressSnapshot | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchProgress = () => {
      const phone = getDeviceId()
      fetch(`/api/user/learning-progress?phone=${encodeURIComponent(phone)}`)
        .then((r) => r.json())
        .then((resp: LearningProgressApiResp) => {
          if (cancelled) return
          if (resp?.success && resp.data) {
            const d = resp.data
            setSnapshot({
              opcLevel: d.opcLevel || null,
              learningScore: d.learning_score ?? 0,
              canUnlockPractice: d.can_unlock_practice === true,
              stepPracticeDone: d.step_practice_done === true,
            })
          }
        })
        .catch(() => {
          // 静默降级：保持上一次的 snapshot
        })
    }
    fetchProgress()

    // 跨 tab 监听：用户在新 tab 操作 PATCH /api/user/learning-progress 时同步刷新
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'opc_device_id' || e.key?.startsWith('opc_')) {
        fetchProgress()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      cancelled = true
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return snapshot
}
