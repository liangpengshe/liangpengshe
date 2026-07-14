'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  Loader2,
  MapPin,
  Hash,
  ArrowRight,
  RefreshCw,
  Zap,
  Radio,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * AI 社区脉冲仪表板
 * ------------------------------------------------------------
 * 核心价值：
 *   1. 用户侧 - 一眼看到"本周 OPC 在关注什么 / 哪里有同伴"
 *   2. SEO 侧 - 自动产出的"长尾关键词"和"城市热词"是搜索引擎收录黄金
 *   3. 商业侧 - 通过"哪里缺什么"识别新的工具/服务/合伙人机会
 *
 * UI 风格：深色玻璃态（dark glassmorphism）+ 渐变边框 + 流动光斑
 */

interface Topic {
  rank: number
  summary: string
  opc_level: 'trader' | 'flow' | 'system' | 'asset' | 'unknown'
  city: string
  count: number
  keywords: string[]
}

interface CityPoint {
  city: string
  count: number
}

interface KeywordPoint {
  keyword: string
  count: number
}

interface PulseData {
  topics: Topic[]
  cityDistribution: CityPoint[]
  keywords: KeywordPoint[]
  totalActivities: number
  filteredActivities: number
  generatedAt: string
  rangeDays: number
}

const LEVEL_META: Record<Topic['opc_level'], { label: string; color: string; ring: string; emoji: string }> = {
  trader: { label: '交易型', color: 'text-amber-300', ring: 'ring-amber-400/40', emoji: '💰' },
  flow: { label: '流量型', color: 'text-rose-300', ring: 'ring-rose-400/40', emoji: '🔥' },
  system: { label: '系统型', color: 'text-blue-300', ring: 'ring-blue-400/40', emoji: '⚙️' },
  asset: { label: '资产型', color: 'text-violet-300', ring: 'ring-violet-400/40', emoji: '💎' },
  unknown: { label: 'OPC', color: 'text-slate-300', ring: 'ring-slate-400/30', emoji: '🌐' },
}

export function AICommunityDashboard() {
  const [data, setData] = useState<PulseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'dify' | 'fallback' | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (force = false) => {
    if (force) setRefreshing(true)
    else setLoading(true)
    try {
      const url = force ? '/api/community/pulse?t=' + Date.now() : '/api/community/pulse'
      const res = await fetch(url, { cache: 'no-store' })
      const json = await res.json()
      if (json.success) {
        setData(json.data)
        setSource(json.source)
      }
    } catch (e) {
      // 静默
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-5 md:p-7 text-white shadow-2xl">
      {/* 装饰光斑 */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        {/* 顶部标题区 */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-cyan-400/30">
              <Radio size={22} className="text-white animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  AI 社区脉冲 · 实时
                </span>
                {source === 'dify' && (
                  <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">
                    AI 生成
                  </span>
                )}
              </div>
              <h3 className="text-lg md:text-xl font-extrabold leading-tight">
                本周 OPC 创业者
                <span className="ml-1 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                  热议风向标
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {data ? (
                  <>
                    基于近 <strong className="text-cyan-300">{data.rangeDays}</strong> 天{' '}
                    <strong className="text-cyan-300">{data.filteredActivities}</strong> 条真实行为
                    {data.totalActivities > data.filteredActivities && (
                      <>（全网 {data.totalActivities} 条）</>
                    )}
                    ，AI 自动聚合
                  </>
                ) : (
                  '正在聚合本周社区行为...'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing || loading}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-colors disabled:opacity-50"
            aria-label="刷新"
          >
            <RefreshCw size={14} className={cn(refreshing && 'animate-spin')} />
          </button>
        </div>

        {/* 加载态 */}
        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 size={28} className="text-cyan-300 animate-spin" />
            <p className="text-xs text-slate-400">AI 正在扫描本周社区行为...</p>
          </div>
        )}

        {/* TOP 3 热议话题 */}
        {data && data.topics.length > 0 && (
          <div className="space-y-2.5 mb-5">
            {data.topics.slice(0, 3).map((t, i) => {
              const meta = LEVEL_META[t.opc_level] || LEVEL_META.unknown
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl p-3.5 md:p-4',
                    'bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10',
                    'transition-all cursor-default'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* 排名 */}
                    <div
                      className={cn(
                        'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm',
                        i === 0
                          ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-900'
                          : i === 1
                          ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900'
                          : 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-900'
                      )}
                    >
                      #{t.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base text-white leading-relaxed">
                        {t.summary}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full',
                            'bg-white/10 ring-1',
                            meta.color,
                            meta.ring
                          )}
                        >
                          {meta.emoji} {meta.label}
                        </span>
                        {t.city && t.city !== '全国' && (
                          <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-cyan-200 bg-cyan-500/20 px-2 py-0.5 rounded-full">
                            <MapPin size={10} />
                            {t.city}
                          </span>
                        )}
                        {t.count > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-emerald-200 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                            <TrendingUp size={10} />
                            {t.count} 人关注
                          </span>
                        )}
                      </div>
                      {t.keywords && t.keywords.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1">
                          {t.keywords.slice(0, 3).map((kw) => (
                            <span
                              key={kw}
                              className="text-[10px] text-slate-300 bg-white/5 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"
                            >
                              <Hash size={8} />
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* 城市分布 + 长尾词双栏 */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 城市分布 */}
            {data.cityDistribution.length > 0 && (
              <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-3.5">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <MapPin size={12} className="text-cyan-300" />
                  <h4 className="text-xs font-bold text-cyan-200">城市活跃榜</h4>
                </div>
                <div className="space-y-1.5">
                  {data.cityDistribution.slice(0, 5).map((c) => {
                    const max = data.cityDistribution[0]?.count || 1
                    const pct = Math.round((c.count / max) * 100)
                    return (
                      <div key={c.city} className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-300 w-12 truncate">
                          {c.city}
                        </span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-cyan-200 w-6 text-right">
                          {c.count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 长尾关键词（SEO 黄金） */}
            {data.keywords.length > 0 && (
              <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-3.5">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Hash size={12} className="text-purple-300" />
                  <h4 className="text-xs font-bold text-purple-200">SEO 长尾热词</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.keywords.slice(0, 8).map((k) => (
                    <span
                      key={k.keyword}
                      className="text-[10px] md:text-xs font-bold text-purple-200 bg-purple-500/20 hover:bg-purple-500/30 px-2 py-1 rounded-full inline-flex items-center gap-1 transition-colors cursor-default"
                    >
                      {k.keyword}
                      <span className="text-purple-300/80">×{k.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 底部 CTA */}
        {data && data.topics.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t border-white/10">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              <Zap size={10} className="inline mr-0.5 text-yellow-300" />
              数据源：诊断 / 项目规划 / 服务咨询 · 每小时滚动更新
            </p>
            <a
              href="/community"
              className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              查看完整社区动态
              <ArrowRight size={12} />
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

export default AICommunityDashboard
