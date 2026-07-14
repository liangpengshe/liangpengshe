'use client'

import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Wrench,
  Briefcase,
  HeadphonesIcon,
  BookOpen,
  ArrowRight,
  Sparkles,
  Rocket,
  CheckCircle2,
  Circle,
  Lock,
  Star,
  ExternalLink,
  Wand2,
  Loader2,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { UNLOCK_PRACTICE_THRESHOLD } from '@/lib/learning-progress-store'
import type { LibraryItem, LibrariesSnapshot } from '@/lib/recommend-fallback'

/**
 * OPC 四库精选学习方案聚合页（独立 app 级路由 + 新手启航任务系统）
 * ------------------------------------------------------------
 * 动态路由 /guide/[level]
 *   level 取值: trader | flow | system | asset
 *
 * 三段式结构：
 *   1. 顶部 Hero（独立导航行 + 渐变标题）
 *   2. 四库精选卡片（2x2 Bento）
 *   3. 新手启航任务清单（3 任务卡 + 进度条 + 解锁按钮）— 任务 2
 *   4. 底部 CTA → /market/projects（达标后变为亮金渐变）
 *
 * 数据层：当前使用 Mock + /api/user/learning-progress（内存存储）
 * ------------------------------------------------------------
 */

type Level = 'trader' | 'flow' | 'system' | 'asset'

const LEVEL_META: Record<Level, {
  label: string
  emoji: string
  tagline: string
  badge: string
  bg: string
  ring: string
  // 任务2/3 平台跳转链接
  registerUrl: string
  registerLabel: string
  downloadUrl: string
  downloadLabel: string
}> = {
  trader: {
    label: '交易型 OPC',
    emoji: '💰',
    tagline: 'AI 网店群 · 智富严选 · 跑通首单赚第一笔钱',
    badge: '第一层 · 跑通',
    bg: 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500',
    ring: 'ring-amber-300/60',
    registerUrl: 'https://ishop.taobao.com/openshop/tb_open_shop_landing.htm',
    registerLabel: '前往淘宝商家开店',
    downloadUrl: 'https://www.lingxixai.com',
    downloadLabel: '前往灵犀 AI',
  },
  flow: {
    label: '流量型 OPC',
    emoji: '🔥',
    tagline: '内容获客 · 自媒体矩阵 · 流量变现',
    badge: '第二层 · 放大',
    bg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    ring: 'ring-rose-300/60',
    registerUrl: 'https://www.douyin.com/',
    registerLabel: '前往抖音创作者中心',
    downloadUrl: 'https://jimeng.jianying.com',
    downloadLabel: '前往即梦 Dreamina',
  },
  system: {
    label: '系统型 OPC',
    emoji: '⚙️',
    tagline: '企业流程改造 · 高客单 · AI 转型',
    badge: '第三层 · 转型',
    bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    ring: 'ring-blue-300/60',
    registerUrl: 'https://www.coze.cn/overview',
    registerLabel: '前往扣子 Coze',
    downloadUrl: 'https://www.dify.ai',
    downloadLabel: '前往 Dify',
  },
  asset: {
    label: '资产型 OPC',
    emoji: '💎',
    tagline: '数字资产 · 全球外包 · 可复用交付',
    badge: '第四层 · 资产化',
    bg: 'bg-gradient-to-br from-violet-500 to-fuchsia-600',
    ring: 'ring-violet-300/60',
    registerUrl: 'https://www.coze.cn/store',
    registerLabel: '前往 Coze 商店',
    downloadUrl: 'https://www.lingxixai.com',
    downloadLabel: '前往灵犀 AI',
  },
}

interface LevelLibrary {
  tools: LibraryItem[]
  projects: LibraryItem[]
  services: LibraryItem[]
  resources: LibraryItem[]
}

/**
 * 兑底数据（API 失败 / 加载中均使用此套）
 * 与 src/lib/recommend-fallback.ts 的 FALLBACK_RECOMMENDATIONS 保持同步：
 *   API 不可用 → 客户端也直接使用这份本地兑底，不让页面空白
 */
const STATIC_FALLBACK: Record<Level, LevelLibrary> = {
  trader: {
    tools: [
      { name: '智富严选', desc: 'AI 选品分析 + 一键上架，匹配当下爆款', icon: '🛒', href: '/market/tools?from=guide&level=trader', badge: '热门', highlight: true },
      { name: '灵犀 AI', desc: '自动生成商品详情页和营销文案', icon: '✨', href: '/market/tools?from=guide&level=trader' },
      { name: '豹纹工坊', desc: '一键生成爆款商品素材图', icon: '🛠️', href: '/market/tools?from=guide&level=trader' },
    ],
    projects: [
      { name: '无货源网店群', desc: '0 库存起步，AI 自动选品上架', icon: '🌏', href: '/market/projects?from=guide&level=trader', badge: '跑通首单', highlight: true },
      { name: 'AI TikTok Shop', desc: '海外短视频带货，AI 翻译 + 配音', icon: '📱', href: '/market/projects?from=guide&level=trader' },
    ],
    services: [
      { name: '基础店铺陪跑', desc: '30 天从开店到出单一对一辅导', icon: '🤝', href: '/market/services?from=guide&level=trader', badge: '爆款', highlight: true },
      { name: '新手合规体检', desc: '店铺合规、违禁词预检', icon: '🛡️', href: '/market/services?from=guide&level=trader' },
    ],
    resources: [
      { name: '电商违禁词库', desc: '各平台违禁词实时更新', icon: '🚫', href: '/market/resources?from=guide&level=trader' },
      { name: '选品指南', desc: '智富严选内部选品 SOP', icon: '📚', href: '/market/resources?from=guide&level=trader', highlight: true },
      { name: '首单模板', desc: '已验证的开店话术 + 素材包', icon: '📦', href: '/market/resources?from=guide&level=trader' },
    ],
  },
  flow: {
    tools: [
      { name: '先锋派数字人', desc: 'AI 数字人视频，批量产出内容', icon: '🎬', href: '/market/tools?from=guide&level=flow', badge: '爆款', highlight: true },
      { name: '灵犀 AI', desc: '批量生成短视频脚本', icon: '✨', href: '/market/tools?from=guide&level=flow' },
    ],
    projects: [
      { name: 'AI 短视频矩阵', desc: 'AI 数字人 + 多账号矩阵系统', icon: '🎥', href: '/market/projects?from=guide&level=flow', badge: '热门', highlight: true },
      { name: 'AI 私域引流', desc: '自动化获客 SOP', icon: '📈', href: '/market/projects?from=guide&level=flow' },
    ],
    services: [
      { name: '流量型陪跑', desc: '90 天打造一个百万流量账号', icon: '🚀', href: '/market/services?from=guide&level=flow', highlight: true },
      { name: '数字人定制', desc: '专属 AI 数字人形象打造', icon: '🎭', href: '/market/services?from=guide&level=flow' },
    ],
    resources: [
      { name: '短视频脚本库', desc: '1000+ 爆款脚本模板', icon: '📜', href: '/market/resources?from=guide&level=flow', highlight: true },
      { name: '矩阵工具评测', desc: '主流矩阵工具对比', icon: '⚖️', href: '/market/resources?from=guide&level=flow' },
    ],
  },
  system: {
    tools: [
      { name: 'Dify', desc: '工作流编排 + 智能体发布', icon: '🧠', href: '/market/tools?from=guide&level=system', badge: '推荐', highlight: true },
      { name: 'Coze 扣子', desc: '零代码搭建企业级智能助手', icon: '⚡', href: '/market/tools?from=guide&level=system' },
    ],
    projects: [
      { name: 'AI 客服系统', desc: '为传统企业接入 AI 客服', icon: '🤖', href: '/market/projects?from=guide&level=system', badge: '高客单', highlight: true },
      { name: '企业知识库智能体', desc: '私域知识库 + 智能问答', icon: '📚', href: '/market/projects?from=guide&level=system' },
    ],
    services: [
      { name: 'AI 内训', desc: '企业 AI 转型全员培训', icon: '🎓', href: '/market/services?from=guide&level=system' },
      { name: 'GEO 增长', desc: '生成式引擎优化服务', icon: '🎯', href: '/market/services?from=guide&level=system', badge: '高客单', highlight: true },
    ],
    resources: [
      { name: '企业 AI 转型白皮书', desc: '100+ 行业落地案例', icon: '📘', href: '/market/resources?from=guide&level=system', highlight: true },
      { name: '智能体搭建教程', desc: '从 0 到 1 搭建 SOP', icon: '🛠️', href: '/market/resources?from=guide&level=system' },
    ],
  },
  asset: {
    tools: [
      { name: 'Dify', desc: '工作流 + 智能体商业化', icon: '🧠', href: '/market/tools?from=guide&level=asset' },
      { name: 'Coze 扣子', desc: '智能体产品化与变现', icon: '⚡', href: '/market/tools?from=guide&level=asset', badge: '推荐', highlight: true },
    ],
    projects: [
      { name: 'AI 数字员工 SaaS', desc: '可订阅的 AI 数字员工', icon: '💎', href: '/market/projects?from=guide&level=asset', badge: '资产化', highlight: true },
      { name: '全球外包交付中心', desc: 'AI 工具 + 全球外包交付', icon: '🌐', href: '/market/projects?from=guide&level=asset' },
    ],
    services: [
      { name: '数字资产陪跑', desc: '把工具沉淀为可售卖的资产', icon: '💼', href: '/market/services?from=guide&level=asset', highlight: true },
      { name: '投资人对接', desc: '项目 → 资本加速器', icon: '🤝', href: '/market/services?from=guide&level=asset' },
    ],
    resources: [
      { name: '数字资产估值指南', desc: '可复用资产估值模型', icon: '📊', href: '/market/resources?from=guide&level=asset', highlight: true },
      { name: 'AI 产品化模板', desc: '工具 → 产品 → 资产', icon: '🏗️', href: '/market/resources?from=guide&level=asset' },
    ],
  },
}

const LIBRARY_CARD_CONFIG = {
  tools: {
    title: '🧰 为你精挑细选的 AI 工具',
    sub: 'Tools',
    bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50',
    border: 'border-orange-200',
    accent: 'text-orange-700',
    pill: 'bg-orange-500/15 text-orange-700',
    icon: Wrench,
    href: '/market/tools?from=guide',
  },
  projects: {
    title: '🎯 最适合你的落地项目',
    sub: 'Projects',
    bg: 'bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50',
    border: 'border-blue-200',
    accent: 'text-blue-700',
    pill: 'bg-blue-500/15 text-blue-700',
    icon: Briefcase,
    href: '/market/projects?from=guide',
  },
  services: {
    title: '🤝 为你匹配的服务与陪跑',
    sub: 'Services',
    bg: 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50',
    border: 'border-violet-200',
    accent: 'text-violet-700',
    pill: 'bg-violet-500/15 text-violet-700',
    icon: HeadphonesIcon,
    href: '/market/services?from=guide',
  },
  resources: {
    title: '📚 帮你快速上手的资源库',
    sub: 'Resources',
    bg: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
    border: 'border-emerald-200',
    accent: 'text-emerald-700',
    pill: 'bg-emerald-500/15 text-emerald-700',
    icon: BookOpen,
    href: '/market/resources?from=guide',
  },
} as const

type LibraryKey = keyof typeof LIBRARY_CARD_CONFIG

// ════════════════════════════════════════════════════════════════
// 学习进度类型（与 lib/learning-progress-store 保持一致）
// ════════════════════════════════════════════════════════════════

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
  updatedAt: string
  createdAt: string
}

/**
 * 获取或创建匿名用户手机号（localStorage 持久化）
 * 真实场景中可由登录态注入；这里用 deviceId 模拟
 */
function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr-device'
  let id = window.localStorage.getItem('opc_device_id')
  if (!id) {
    id = `dev-${Date.now()}-${Math.floor(Math.random() * 100000)}`
    window.localStorage.setItem('opc_device_id', id)
  }
  return id
}

// ════════════════════════════════════════════════════════════════
// 主页组件
// ════════════════════════════════════════════════════════════════

export default function LevelGuidePage() {
  const params = useParams<{ level: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawLevel = (params?.level || 'trader') as string
  const validLevels: Level[] = ['trader', 'flow', 'system', 'asset']
  const level: Level = (validLevels.includes(rawLevel as Level) ? rawLevel : 'trader') as Level

  const meta = LEVEL_META[level]
  const fromSource = searchParams?.get('from') || ''

  // ──── AI 动态推荐状态 ────
  //   - data: 真实渲染数据（AI 返回 / 兑底）
  //   - loading: 是否正在请求 AI（用于显示 Skeleton）
  //   - source: 数据来源（fallback / dify）
  //   - 首次渲染：使用 STATIC_FALLBACK（立即可见，不留白）
  //   - AI 返回后：替换为推荐数据
  const [data, setData] = useState<LevelLibrary>(STATIC_FALLBACK[level])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSource, setAiSource] = useState<'fallback' | 'dify'>('fallback')
  const [aiMeta, setAiMeta] = useState<{ latencyMs?: number; model?: string } | null>(null)

  // 调用 /api/ai/recommend-tools（带超时 5s；失败 / 超时使用本地兑底）
  useEffect(() => {
    const phone = getOrCreateDeviceId()
    // 同步 URL 中的 opcLevel 参数（如果携带），否则从 LearningProgress 取，再否则用 level
    let opcLevel: string
    if (level === 'trader') opcLevel = 'TRADER'
    else if (level === 'flow') opcLevel = 'FLOW'
    else if (level === 'system') opcLevel = 'SYSTEM'
    else opcLevel = 'ASSET'

    setAiLoading(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    fetch('/api/ai/recommend-tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: phone, opcLevel }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((resp) => {
        if (resp.success && resp.data) {
          setData({
            tools: resp.data.tools ?? [],
            projects: resp.data.projects ?? [],
            services: resp.data.services ?? [],
            resources: resp.data.resources ?? [],
          })
          setAiSource(resp.source === 'dify' ? 'dify' : 'fallback')
          setAiMeta(resp.meta ?? null)
        }
      })
      .catch(() => {
        // 网络失败 / 超时：保留初始 STATIC_FALLBACK，不动 data
      })
      .finally(() => {
        clearTimeout(timeoutId)
        setAiLoading(false)
      })
  }, [level])

  // ──── 学习进度状态 ────
  const [progress, setProgress] = useState<LearningProgress | null>(null)
  const [submittingTask, setSubmittingTask] = useState<string | null>(null)

  // 首次加载拉取进度
  useEffect(() => {
    const phone = getOrCreateDeviceId()
    fetch(`/api/user/learning-progress?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((resp) => {
        if (resp.success) setProgress(resp.data)
      })
      .catch(() => {
        // 静默失败，使用默认空进度
      })
  }, [])

  // 完成任务打卡
  const completeTask = useCallback(
    async (task: 'browse' | 'register' | 'download') => {
      if (submittingTask) return
      setSubmittingTask(task)
      try {
        const phone = getOrCreateDeviceId()
        const res = await fetch('/api/user/learning-progress', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, action: task }),
        })
        const resp = await res.json()
        if (resp.success) {
          setProgress(resp.data)
        }
      } catch {
        // 静默失败
      } finally {
        setSubmittingTask(null)
      }
    },
    [submittingTask]
  )

  // 浏览任务：进入页面 1.5s 后自动标记
  useEffect(() => {
    if (progress?.task_browse) return
    const t = setTimeout(() => {
      completeTask('browse')
    }, 1500)
    return () => clearTimeout(t)
  }, [progress?.task_browse, completeTask])

  const score = progress?.learning_score ?? 0
  const unlocked = progress?.can_unlock_practice ?? false

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* ════════ 顶部 Hero ════════ */}
      <section
        className={`${meta.bg} text-white px-5 pt-6 pb-8 md:pt-10 md:pb-12 relative overflow-hidden`}
      >
        <div aria-hidden className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5 blur-3xl" />

        <div className="max-w-lg md:max-w-6xl md:mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-xs md:text-sm bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full transition-colors"
            >
              <ArrowLeft size={14} />
              返回
            </button>
            <Link href="/" className="text-white/80 hover:text-white text-xs md:text-sm transition-colors">
              良朋社 OPC
            </Link>
          </div>

          <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-widest text-white/80 uppercase mb-2">
            <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
            {meta.badge}
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight drop-shadow-sm">
            <span className="mr-2">{meta.emoji}</span>
            [{meta.label}] 专属学习方案
          </h1>
          <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed max-w-2xl">
            {meta.tagline}
          </p>

          {fromSource === 'guide' && (
            <div className="mt-3 inline-flex items-center gap-1 text-[10px] bg-white/20 backdrop-blur px-2 py-1 rounded-full">
              ✨ 来自指南页的推荐
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-1.5">
            {(['tools', 'projects', 'services', 'resources'] as LibraryKey[]).map((k) => (
              <span
                key={k}
                className="text-[10px] md:text-xs font-bold bg-white/20 backdrop-blur text-white px-2 py-1 rounded-full"
              >
                {LIBRARY_CARD_CONFIG[k].sub} · {data[k].length}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 2x2 Bento：四库推荐（AI 动态 + Skeleton）══════ */}
      <section className="px-5 py-6 md:py-8">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <div className="mb-4 md:mb-6 flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-2xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span className="text-xl md:text-2xl">🧭</span>
                为你定制的四库精选
                {aiLoading && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                    <Loader2 size={10} className="animate-spin" />
                    AI 重新匹配中...
                  </span>
                )}
                {!aiLoading && aiSource === 'dify' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 px-2 py-1 rounded-full border border-violet-200">
                    <Wand2 size={10} />
                    AI 个性化推荐
                    {aiMeta?.latencyMs !== undefined && (
                      <span className="text-violet-400 ml-0.5">{aiMeta.latencyMs}ms</span>
                    )}
                  </span>
                )}
                {!aiLoading && aiSource === 'fallback' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full border border-slate-200">
                    默认推荐
                  </span>
                )}
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                基于 {meta.label} 的能力模型，从四库中智能匹配 2-3 个最相关资源
              </p>
            </div>
          </div>

          {aiLoading && data.tools.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {(['tools', 'projects', 'services', 'resources'] as LibraryKey[]).map((k) => (
                <LibraryCardSkeleton key={k} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {(['tools', 'projects', 'services', 'resources'] as LibraryKey[]).map((k) => (
                <LibraryCard key={k} kind={k} items={data[k]} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════ 新手启航任务清单（任务 2 核心）══════ */}
      <section className="px-5 py-2">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <div className="relative rounded-3xl bg-white border border-slate-200 shadow-sm p-5 md:p-7 overflow-hidden">
            {/* 装饰光晕 */}
            <div aria-hidden className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-blue-100 blur-3xl opacity-60" />
            <div aria-hidden className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-emerald-100 blur-3xl opacity-60" />

            <div className="relative">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-blue-600 mb-1">
                    🎯 STEP 02 · 新手启航
                  </div>
                  <h2 className="text-lg md:text-2xl font-extrabold text-slate-900 leading-tight">
                    新手启航任务清单
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">
                    完成 3 个任务，累计 {UNLOCK_PRACTICE_THRESHOLD} 分即可解锁「运营实操」阶段
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
                    {score}
                    <span className="text-sm text-slate-400 font-bold">/100</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">SCORE</div>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mb-5">
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      unlocked
                        ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600'
                        : 'bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, score)}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>0</span>
                  <span className={score >= 20 ? 'text-blue-600' : ''}>+20 浏览</span>
                  <span className={score >= 60 ? 'text-blue-600' : ''}>+40 注册</span>
                  <span className={score >= 100 ? 'text-emerald-600' : ''}>+40 下载</span>
                  <span className={unlocked ? 'text-emerald-600' : 'text-slate-400'}>
                    {unlocked ? '✓ 已解锁' : `${UNLOCK_PRACTICE_THRESHOLD} 解锁`}
                  </span>
                </div>
              </div>

              {/* 3 个任务卡 */}
              <div className="space-y-3">
                <TaskCard
                  icon="📖"
                  title="任务 1：浏览学习"
                  desc="完成当前学习页面的内容了解（已自动标记）"
                  score={20}
                  done={!!progress?.task_browse}
                  loading={submittingTask === 'browse'}
                  onComplete={() => completeTask('browse')}
                  ctaText="我已浏览，立即打卡"
                  color="emerald"
                />
                <TaskCard
                  icon="🏪"
                  title="任务 2：注册账号"
                  desc={`前往注册你的第一个${level === 'flow' ? '自媒体' : '网店'}账号`}
                  score={40}
                  done={!!progress?.task_register}
                  loading={submittingTask === 'register'}
                  onComplete={() => completeTask('register')}
                  externalUrl={meta.registerUrl}
                  externalLabel={meta.registerLabel}
                  ctaText="我已注册，完成打卡"
                  color="blue"
                />
                <TaskCard
                  icon="⚙️"
                  title="任务 3：下载工具"
                  desc="配置并下载首款 AI 工具（灵犀 AI / 即梦 / Dify 等）"
                  score={40}
                  done={!!progress?.task_download}
                  loading={submittingTask === 'download'}
                  onComplete={() => completeTask('download')}
                  externalUrl={meta.downloadUrl}
                  externalLabel={meta.downloadLabel}
                  ctaText="我已下载/配置完成"
                  color="purple"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 底部阶段解锁 CTA ════════ */}
      <section className="px-5 mt-6 mb-8">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <div
            className={`relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-2xl text-center md:text-left ${
              unlocked
                ? `${meta.bg} text-white`
                : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-500'
            }`}
          >
            {unlocked ? (
              <>
                <div aria-hidden className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
                <div aria-hidden className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
                <div className="relative flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold tracking-wider text-white/80 uppercase mb-2">
                      <Sparkles size={14} />
                      STEP 03 · 已解锁
                    </div>
                    <h3 className="text-xl md:text-2xl font-extrabold leading-snug">
                      恭喜达标！前往运营实操 → 开启你的第一个项目
                    </h3>
                    <p className="mt-1.5 text-xs md:text-sm text-white/85">
                      从【项目库】精准选品，跟随 SOP 执行第一套完整商业闭环节奏
                    </p>
                  </div>
                  <Link
                    href="/market/projects"
                    className="group flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl font-extrabold text-sm md:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    <Rocket size={18} className="md:w-5 md:h-5" />
                    前往运营实操
                    <ArrowRight size={18} className="md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="w-14 h-14 rounded-full bg-slate-400/30 flex items-center justify-center">
                  <Lock size={24} className="text-slate-500" />
                </div>
                <h3 className="text-base md:text-lg font-extrabold">
                  🔒 需完成新手任务（需达到 {UNLOCK_PRACTICE_THRESHOLD} 分）解锁运营实操
                </h3>
                <p className="text-xs md:text-sm text-slate-500 max-w-md">
                  当前 {score} / {UNLOCK_PRACTICE_THRESHOLD} 分，还差 {UNLOCK_PRACTICE_THRESHOLD - score} 分。继续完成下方任务即可解锁。
                </p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                  <Star size={12} />
                  <span>STEP 03 · 待解锁</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 任务卡片
// ════════════════════════════════════════════════════════════════

const COLOR_MAP = {
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'bg-emerald-100 text-emerald-600',
    pill: 'bg-emerald-500 text-white',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'bg-blue-100 text-blue-600',
    pill: 'bg-blue-500 text-white',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: 'bg-purple-100 text-purple-600',
    pill: 'bg-purple-500 text-white',
  },
} as const

function TaskCard({
  icon,
  title,
  desc,
  score,
  done,
  loading,
  onComplete,
  externalUrl,
  externalLabel,
  ctaText,
  color,
}: {
  icon: string
  title: string
  desc: string
  score: number
  done: boolean
  loading: boolean
  onComplete: () => void
  externalUrl?: string
  externalLabel?: string
  ctaText: string
  color: keyof typeof COLOR_MAP
}) {
  const c = COLOR_MAP[color]
  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        done
          ? `${c.bg} ${c.border} opacity-90`
          : `bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm`
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl ${done ? 'bg-emerald-100' : c.icon}`}>
          {done ? <CheckCircle2 size={20} className="text-emerald-600" /> : <span>{icon}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-bold ${done ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
              {title}
            </h4>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${done ? 'bg-emerald-500 text-white' : c.pill}`}>
              +{score} 分
            </span>
            {done && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 size={10} /> 已完成
              </span>
            )}
          </div>
          <p className={`mt-1 text-[11px] leading-snug ${done ? 'text-slate-400' : 'text-slate-500'}`}>
            {desc}
          </p>

          {!done && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {externalUrl && (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-[11px] font-bold ${c.text} hover:underline`}
                >
                  {externalLabel} <ExternalLink size={10} />
                </a>
              )}
              <button
                type="button"
                onClick={onComplete}
                disabled={loading}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all active:scale-95 disabled:opacity-50 ${
                  color === 'emerald'
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : color === 'blue'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    打卡中...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={12} />
                    {ctaText}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 self-center">
          {done ? (
            <CheckCircle2 size={20} className="text-emerald-500" />
          ) : (
            <Circle size={20} className="text-slate-300" />
          )}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 库卡片子组件（Bento 单元）
// ════════════════════════════════════════════════════════════════

/** Skeleton 骨架屏（AI 加载中显示） */
function LibraryCardSkeleton() {
  return (
    <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-slate-200 animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-2/3 bg-slate-200 rounded animate-pulse" />
          <div className="h-2 w-1/3 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-white rounded-xl p-3 border border-slate-100"
          >
            <div className="w-7 h-7 rounded-md bg-slate-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-1/2 bg-slate-200 rounded animate-pulse" />
              <div className="h-2 w-full bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
        <Loader2 size={10} className="animate-spin" />
        AI 正在为你匹配...
      </div>
    </div>
  )
}

function LibraryCard({ kind, items }: { kind: LibraryKey; items: LibraryItem[] }) {
  const cfg = LIBRARY_CARD_CONFIG[kind]
  const Icon = cfg.icon

  return (
    <div
      className={`relative ${cfg.bg} border ${cfg.border} rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center ${cfg.accent}`}>
            <Icon size={18} strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <div className={`text-sm md:text-base font-extrabold ${cfg.accent} leading-tight`}>
              {cfg.title}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {cfg.sub} · {items.length} 个推荐
            </div>
          </div>
        </div>
        <Link href={cfg.href} className={`text-[10px] font-bold ${cfg.accent} hover:underline whitespace-nowrap`}>
          查看全部 →
        </Link>
      </div>

      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i}>
            <Link
              href={it.href}
              className={`group flex items-start gap-3 bg-white/85 hover:bg-white rounded-xl p-3 border border-white transition-all ${
                it.highlight ? 'ring-1 ring-amber-300/60 shadow-sm' : ''
              }`}
            >
              <div className="text-2xl flex-shrink-0 leading-none">{it.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs md:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {it.name}
                  </span>
                  {it.badge && (
                    <span className={`text-[9px] font-bold ${cfg.pill} px-1.5 py-0.5 rounded`}>
                      {it.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500 leading-snug line-clamp-2">
                  {it.desc}
                </p>
              </div>
              <ArrowRight
                size={14}
                className="flex-shrink-0 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all mt-0.5"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
