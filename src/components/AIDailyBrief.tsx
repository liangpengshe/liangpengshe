'use client'

/**
 * AI 智富日报组件
 * - Toggle 开关：开启/关闭每日 7:00 推送（写入 UserPreference）
 * - 状态展示：未生成时显示"生成"按钮，生成后展示 Markdown 简报
 * - 数据源：/api/ai/daily-brief + /api/user/preference
 */

import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw, Loader2, Calendar, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { MarkdownLite } from './MarkdownLite'

type Brief = {
  id: string
  content: string
  isRead: boolean
  generatedAt: string
}

type Pref = {
  userId: string
  dailyBrief: boolean
  updatedAt: string
}

type Props = {
  userId?: string
}

export function AIDailyBrief({ userId }: Props) {
  const [pref, setPref] = useState<Pref | null>(null)
  const [brief, setBrief] = useState<Brief | null>(null)
  const [hasToday, setHasToday] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tip, setTip] = useState<string | null>(null)

  // 拉取偏好
  useEffect(() => {
    if (!userId) return
    fetch(`/api/user/preference?userId=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j?.success) setPref(j.data)
      })
      .catch(() => null)
  }, [userId])

  // 拉取最新日报
  const fetchBrief = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/ai/daily-brief?userId=${encodeURIComponent(userId)}`)
      const j = await res.json()
      if (j?.success) {
        setBrief(j.data)
        setHasToday(!!j.hasToday)
      }
    } catch (e) {
      console.error('[AIDailyBrief] fetchBrief', e)
    }
  }

  useEffect(() => {
    fetchBrief()
  }, [userId])

  // 切换订阅
  const onToggle = async (val: boolean) => {
    if (!userId || toggling) return
    setToggling(true)
    setError(null)
    try {
      const res = await fetch('/api/user/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, dailyBrief: val }),
      })
      const j = await res.json()
      if (j?.success) {
        setPref(j.data)
        setTip(val ? '✅ 已开启每日 7:00 智富日报推送' : '⏸️ 已关闭日报推送')
      } else {
        setError(j?.error || '更新失败')
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setToggling(false)
      setTimeout(() => setTip(null), 2500)
    }
  }

  // 生成日报
  const onGenerate = async (force = false) => {
    if (!userId || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/daily-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, force }),
      })
      const j = await res.json()
      if (j?.success) {
        setBrief(j.data)
        setHasToday(true)
        setExpanded(true)
        setTip(force ? '🔄 已重新生成今日简报' : '✨ 今日智富简报已生成')
      } else {
        setError(j?.error || '生成失败')
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
      setTimeout(() => setTip(null), 2500)
    }
  }

  // 标记已读
  useEffect(() => {
    if (brief && !brief.isRead && userId) {
      fetch('/api/ai/daily-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, markRead: brief.id }),
      }).catch(() => null)
    }
  }, [brief?.id, userId])

  const subscribed = !!pref?.dailyBrief
  const generatedAt = brief?.generatedAt ? new Date(brief.generatedAt) : null
  const isToday = generatedAt ? generatedAt.toDateString() === new Date().toDateString() : false

  return (
    <section className="bg-white rounded-2xl shadow-sm p-5 md:p-6 mb-6 relative overflow-hidden">
      {/* 装饰光斑 */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-200/30 to-orange-200/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />

      <div className="relative">
        {/* 顶部：标签 + 标题 */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm">
              <Calendar size={10} />
              昨日智富动态 · 每日 7:00 更新
            </span>
          </div>
          {/* Toggle 开关 */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <span className="text-[11px] text-slate-500 font-medium">
              {subscribed ? '已开启' : '未订阅'}
            </span>
            <span
              onClick={() => onToggle(!subscribed)}
              className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${
                subscribed ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-slate-300'
              } ${toggling ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                  subscribed ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </span>
          </label>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={20} className="text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900">AI 智富日报</h2>
          {brief && isToday && (
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded">
              今日
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-4">
          昨日动作复盘 + 今日智富推荐 + AI 鼓励 · 每天 7:00 推送
        </p>

        {/* Tip 提示 */}
        {tip && (
          <div className="mb-3 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 animate-fade-in">
            {tip}
          </div>
        )}
        {error && (
          <div className="mb-3 px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200">
            ⚠️ {error}
          </div>
        )}

        {/* 内容区 */}
        {loading ? (
          <BriefSkeleton />
        ) : brief && brief.content ? (
          <div>
            <div
              className={`relative bg-gradient-to-br from-amber-50/50 via-white to-purple-50/40 border border-amber-200/60 rounded-xl p-4 ${
                expanded ? '' : 'max-h-32 overflow-hidden'
              }`}
            >
              <MarkdownLite source={brief.content} />
              {!expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                {generatedAt
                  ? `生成于 ${generatedAt.toLocaleString('zh-CN')}`
                  : ''}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-semibold"
                >
                  {expanded ? (
                    <>
                      <ChevronUp size={12} /> 收起
                    </>
                  ) : (
                    <>
                      <ChevronDown size={12} /> 展开全文
                    </>
                  )}
                </button>
                <button
                  onClick={() => onGenerate(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 font-semibold"
                >
                  <RefreshCw size={12} /> 重新生成
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onGenerate(false)}
            disabled={loading}
            className="w-full group relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  正在生成你的智富日报...
                </>
              ) : (
                <>
                  <Send size={18} />
                  📅 生成我的今日智富简报
                </>
              )}
            </span>
          </button>
        )}

        {!brief && !loading && (
          <p className="mt-2 text-[10px] text-slate-400 text-center">
            基于你昨日的活动轨迹生成 · 开启订阅可每天 7:00 自动推送
          </p>
        )}
      </div>
    </section>
  )
}

// ──────────── 骨架屏 ────────────
function BriefSkeleton() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-amber-50/30 border border-slate-200 rounded-xl p-4 space-y-3 animate-pulse">
      <div className="h-3 bg-slate-200 rounded w-1/3" />
      <div className="space-y-1.5">
        <div className="h-2.5 bg-slate-200 rounded w-full" />
        <div className="h-2.5 bg-slate-200 rounded w-11/12" />
        <div className="h-2.5 bg-slate-200 rounded w-4/5" />
      </div>
      <div className="h-3 bg-slate-200 rounded w-1/2 mt-3" />
      <div className="space-y-1.5">
        <div className="h-2.5 bg-slate-200 rounded w-full" />
        <div className="h-2.5 bg-slate-200 rounded w-3/4" />
      </div>
      <div className="h-2 bg-slate-200 rounded w-2/3 mt-3" />
    </div>
  )
}

export default AIDailyBrief
