/**
 * AI 智富项目库
 *
 * 功能：
 *   1. 顶部导航（搜索/横幅/4 库导航）由 /market/layout.tsx 提供
 *   2. 读取 URL ?recommend=trader|flow|system|asset 触发精准推荐模式
 *        - 顶部插入一条醒目的引导横幅
 *        - 通过 `recommendLevel` props 传递给 MarketContent，卡片自动 ring-2 高亮
 *   3. STEP 03 解锁后到达此页面：渲染"已解锁"金色欢迎条 + 自动标记 step_practice_done
 */
'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MarketContent } from '@/components/market/MarketContent'
import { Sparkles, ArrowRight, Rocket, Target, X } from 'lucide-react'
import Link from 'next/link'

interface LearningProgress {
  phone: string
  opcLevel?: string
  task_browse: boolean
  task_register: boolean
  task_download: boolean
  learning_score: number
  can_unlock_practice: boolean
  step_diagnosis_done: boolean
  step_learning_done: boolean
  step_practice_done: boolean
  step_scaleup_done: boolean
}

const LEVEL_HINT: Record<string, string> = {
  TRADER: '交易型',
  FLOW: '流量型',
  SYSTEM: '系统型',
  ASSET: '资产型',
}

const LEVEL_DISPLAY: Record<string, { label: string; emoji: string; color: string; gradient: string; ring: string }> = {
  trader: {
    label: '交易型 OPC',
    emoji: '💰',
    color: 'text-amber-700',
    gradient: 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500',
    ring: 'ring-amber-300',
  },
  flow: {
    label: '流量型 OPC',
    emoji: '🔥',
    color: 'text-rose-700',
    gradient: 'bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500',
    ring: 'ring-rose-300',
  },
  system: {
    label: '系统型 OPC',
    emoji: '⚙️',
    color: 'text-blue-700',
    gradient: 'bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500',
    ring: 'ring-blue-300',
  },
  asset: {
    label: '资产型 OPC',
    emoji: '💎',
    color: 'text-violet-700',
    gradient: 'bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500',
    ring: 'ring-violet-300',
  },
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

function ProjectsPageInner() {
  const searchParams = useSearchParams()
  const recommend = (searchParams?.get('recommend') || '').toLowerCase() as
    | 'trader'
    | 'flow'
    | 'system'
    | 'asset'
    | ''

  const [progress, setProgress] = useState<LearningProgress | null>(null)
  const [marking, setMarking] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  // 拉取进度
  useEffect(() => {
    const phone = getDeviceId()
    fetch(`/api/user/learning-progress?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((resp) => {
        if (resp.success) setProgress(resp.data)
      })
      .catch(() => {
        // 静默
      })
  }, [])

  // 自动标记 STEP 03 完成（仅当未标记 + 满足解锁条件时执行）
  useEffect(() => {
    if (!progress || progress.step_practice_done || !progress.can_unlock_practice || marking) return
    setMarking(true)
    const phone = getDeviceId()
    fetch('/api/user/learning-progress', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, action: 'practice-done' }),
    })
      .then((r) => r.json())
      .then((resp) => {
        if (resp.success) setProgress(resp.data)
      })
      .catch(() => {
        // 静默
      })
      .finally(() => setMarking(false))
  }, [progress, marking])

  const showUnlockedBar = progress?.can_unlock_practice
  const levelHint = progress?.opcLevel ? LEVEL_HINT[progress.opcLevel] : null

  const recommendMeta = recommend && LEVEL_DISPLAY[recommend]

  /**
   * 交易型推荐语料（按需求文档）
   */
  const bannerCopy = useMemo(() => {
    if (!recommendMeta) return null
    if (recommend === 'trader') {
      return {
        title: `${recommendMeta.emoji} ${recommendMeta.label} · 精准推荐`,
        body: '根据您【交易型 OPC】的诊断与学习阶段，系统优先为您推荐 AI 数字网店项目 或 AI 无货源实物网店项目 开始实操。请选择您的起点。',
        suggestedNames: ['AI数字网店项目', 'AI无货源实物网店项目'],
      }
    }
    if (recommend === 'flow') {
      return {
        title: `${recommendMeta.emoji} ${recommendMeta.label} · 精准推荐`,
        body: '根据您【流量型 OPC】的诊断与学习阶段，系统优先为您推荐 AI 自媒体运营 或 AI 跨境电商项目 开始实操。请选择您的起点。',
        suggestedNames: ['AI自媒体运营项目', 'AI跨境电商项目'],
      }
    }
    if (recommend === 'system') {
      return {
        title: `${recommendMeta.emoji} ${recommendMeta.label} · 精准推荐`,
        body: '根据您【系统型 OPC】的诊断与学习阶段，系统优先为您推荐 AI 编程系统开发 或 AI 企业 GEO 项目 开始实操。请选择您的起点。',
        suggestedNames: ['AI编程系统开发项目', 'AI企业GEO项目'],
      }
    }
    if (recommend === 'asset') {
      return {
        title: `${recommendMeta.emoji} ${recommendMeta.label} · 精准推荐`,
        body: '根据您【资产型 OPC】的诊断与学习阶段，系统优先为您推荐 AI 数字资产 或 AI 工具代理分销项目 开始实操。请选择您的起点。',
        suggestedNames: ['AI数字网店项目', 'AI工具销售推广项目'],
      }
    }
    return null
  }, [recommendMeta, recommend])

  return (
    <div>
      {/* ════════ 精准推荐引导横幅（recommend 模式）══════ */}
      {bannerCopy && recommendMeta && !bannerDismissed && (
        <div className="mb-4">
          <div
            className={`relative overflow-hidden rounded-2xl ${recommendMeta.gradient} text-white p-4 md:p-5 shadow-lg`}
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Target size={20} className="md:w-6 md:h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase text-white/85 mb-0.5">
                    根据您的诊断与学习阶段 · 精准推荐
                  </div>
                  <div className="text-sm md:text-base font-extrabold leading-tight">
                    {bannerCopy.title}
                  </div>
                  <div className="text-[11px] md:text-xs text-white/90 mt-1.5 leading-relaxed">
                    {bannerCopy.body}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {bannerCopy.suggestedNames.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold bg-white/25 backdrop-blur px-2.5 py-1 rounded-full"
                      >
                        <Sparkles size={10} />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                aria-label="关闭推荐横幅"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ STEP 03 解锁金色欢迎条（保持原行为）══════ */}
      {showUnlockedBar && (
        <div className="mb-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white p-4 md:p-5 shadow-lg">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Sparkles size={20} className="md:w-6 md:h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase text-white/85 mb-0.5">
                    STEP 03 · 运营实操 · 已解锁
                  </div>
                  <div className="text-sm md:text-base font-extrabold leading-tight">
                    🎉 恭喜完成新手启航{levelHint ? `（${levelHint} OPC）` : ''}！
                  </div>
                  <div className="text-[10px] md:text-xs text-white/85 mt-0.5">
                    从下方项目库精准选品，跟随 SOP 执行第一套完整商业闭环节奏
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/scale-up"
                  className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-2 rounded-lg transition-colors"
                  onClick={async (e) => {
                    // 矩阵放大 hook：标记 STEP 04 进入（占位）
                    if (progress?.step_practice_done && !progress?.step_scaleup_done) {
                      e.preventDefault()
                      try {
                        const phone = getDeviceId()
                        await fetch('/api/user/learning-progress', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ phone, action: 'scaleup-done' }),
                        })
                      } catch {
                        // 静默
                      }
                      window.location.href = '/scale-up'
                    }
                  }}
                >
                  <Rocket size={12} />
                  进入矩阵放大 (STEP 04)
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ 项目库内容（recommendLevel 触发卡片高亮）══════ */}
      <MarketContent
        defaultTab="projects"
        standalone={false}
        recommendLevel={recommend || undefined}
      />
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ProjectsPageInner />
    </Suspense>
  )
}
