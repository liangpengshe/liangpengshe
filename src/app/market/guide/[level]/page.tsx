'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Wrench,
  Briefcase,
  HeadphonesIcon,
  BookOpen,
  ArrowRight,
  Sparkles,
  Rocket,
} from 'lucide-react'

/**
 * OPC 四库精选学习方案聚合页
 * ------------------------------------------------------------
 * 动态路由 /market/guide/[level]
 *   level 取值: trader | flow | system | asset
 *   顶部标题 + 2x2 Bento 网格 + 底部 CTA → /workspace
 *
 * 数据层：当前使用 Mock（按 level 智能匹配）。
 * 后续可替换为 /api/library?opc_level=... 真实接口拉取。
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
}> = {
  trader: {
    label: '交易型 OPC',
    emoji: '💰',
    tagline: 'AI 网店群 · 智富严选 · 跑通首单赚第一笔钱',
    badge: '第一层 · 跑通',
    bg: 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500',
    ring: 'ring-amber-300/60',
  },
  flow: {
    label: '流量型 OPC',
    emoji: '🔥',
    tagline: '内容获客 · 自媒体矩阵 · 流量变现',
    badge: '第二层 · 放大',
    bg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    ring: 'ring-rose-300/60',
  },
  system: {
    label: '系统型 OPC',
    emoji: '⚙️',
    tagline: '企业流程改造 · 高客单 · AI 转型',
    badge: '第三层 · 转型',
    bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    ring: 'ring-blue-300/60',
  },
  asset: {
    label: '资产型 OPC',
    emoji: '�',
    tagline: '数字资产 · 全球外包 · 可复用交付',
    badge: '第四层 · 资产化',
    bg: 'bg-gradient-to-br from-violet-500 to-fuchsia-600',
    ring: 'ring-violet-300/60',
  },
}

interface LibraryItem {
  name: string
  desc: string
  icon: string
  href: string
  badge?: string
  highlight?: boolean
}

interface LevelLibrary {
  tools: LibraryItem[]
  projects: LibraryItem[]
  services: LibraryItem[]
  resources: LibraryItem[]
}

const LIBRARY_DATA: Record<Level, LevelLibrary> = {
  trader: {
    tools: [
      { name: '智富严选', desc: 'AI 选品分析 + 一键上架，匹配当下爆款', icon: '🛒', href: '/tools', badge: '热门', highlight: true },
      { name: '灵犀 AI', desc: '自动生成商品详情页和营销文案', icon: '✨', href: '/tools' },
      { name: '豹纹工坊', desc: '一键生成爆款商品素材图', icon: '🛠️', href: '/tools' },
    ],
    projects: [
      { name: '无货源网店群', desc: '0 库存起步，AI 自动选品上架', icon: '🌏', href: '/projects', badge: '跑通首单', highlight: true },
      { name: 'AI TikTok Shop', desc: '海外短视频带货，AI 翻译 + 配音', icon: '📱', href: '/projects' },
    ],
    services: [
      { name: '基础店铺陪跑', desc: '30 天从开店到出单一对一辅导', icon: '🤝', href: '/services', badge: '爆款', highlight: true },
      { name: '新手合规体检', desc: '店铺合规、违禁词预检', icon: '🛡️', href: '/services' },
    ],
    resources: [
      { name: '电商违禁词库', desc: '各平台违禁词实时更新', icon: '🚫', href: '/resources' },
      { name: '选品指南', desc: '智富严选内部选品 SOP', icon: '📚', href: '/resources', highlight: true },
      { name: '首单模板', desc: '已验证的开店话术 + 素材包', icon: '📦', href: '/resources' },
    ],
  },
  flow: {
    tools: [
      { name: '先锋派数字人', desc: 'AI 数字人视频，批量产出内容', icon: '🎬', href: '/tools', badge: '爆款', highlight: true },
      { name: '灵犀 AI', desc: '批量生成短视频脚本', icon: '✨', href: '/tools' },
    ],
    projects: [
      { name: 'AI 短视频矩阵', desc: 'AI 数字人 + 多账号矩阵系统', icon: '🎥', href: '/projects', badge: '热门', highlight: true },
      { name: 'AI 私域引流', desc: '自动化获客 SOP', icon: '📈', href: '/projects' },
    ],
    services: [
      { name: '流量型陪跑', desc: '90 天打造一个百万流量账号', icon: '🚀', href: '/services', highlight: true },
      { name: '数字人定制', desc: '专属 AI 数字人形象打造', icon: '🎭', href: '/services' },
    ],
    resources: [
      { name: '短视频脚本库', desc: '1000+ 爆款脚本模板', icon: '📜', href: '/resources', highlight: true },
      { name: '矩阵工具评测', desc: '主流矩阵工具对比', icon: '⚖️', href: '/resources' },
    ],
  },
  system: {
    tools: [
      { name: 'Dify', desc: '工作流编排 + 智能体发布', icon: '🧠', href: '/tools', badge: '推荐', highlight: true },
      { name: 'Coze 扣子', desc: '零代码搭建企业级智能助手', icon: '⚡', href: '/tools' },
    ],
    projects: [
      { name: 'AI 客服系统', desc: '为传统企业接入 AI 客服', icon: '🤖', href: '/projects', badge: '高客单', highlight: true },
      { name: '企业知识库智能体', desc: '私域知识库 + 智能问答', icon: '📚', href: '/projects' },
    ],
    services: [
      { name: 'AI 内训', desc: '企业 AI 转型全员培训', icon: '🎓', href: '/services' },
      { name: 'GEO 增长', desc: '生成式引擎优化服务', icon: '🎯', href: '/services', badge: '高客单', highlight: true },
    ],
    resources: [
      { name: '企业 AI 转型白皮书', desc: '100+ 行业落地案例', icon: '📘', href: '/resources', highlight: true },
      { name: '智能体搭建教程', desc: '从 0 到 1 搭建 SOP', icon: '🛠️', href: '/resources' },
    ],
  },
  asset: {
    tools: [
      { name: 'Dify', desc: '工作流 + 智能体商业化', icon: '🧠', href: '/tools' },
      { name: 'Coze 扣子', desc: '智能体产品化与变现', icon: '⚡', href: '/tools', badge: '推荐', highlight: true },
    ],
    projects: [
      { name: 'AI 数字员工 SaaS', desc: '可订阅的 AI 数字员工', icon: '💎', href: '/projects', badge: '资产化', highlight: true },
      { name: '全球外包交付中心', desc: 'AI 工具 + 全球外包交付', icon: '🌐', href: '/projects' },
    ],
    services: [
      { name: '数字资产陪跑', desc: '把工具沉淀为可售卖的资产', icon: '💼', href: '/services', highlight: true },
      { name: '投资人对接', desc: '项目 → 资本加速器', icon: '🤝', href: '/services' },
    ],
    resources: [
      { name: '数字资产估值指南', desc: '可复用资产估值模型', icon: '📊', href: '/resources', highlight: true },
      { name: 'AI 产品化模板', desc: '工具 → 产品 → 资产', icon: '🏗️', href: '/resources' },
    ],
  },
}

// ════════════════════════════════════════════════════════════════
// 4 个库卡片的样式配置（4 色 Bento）
// ════════════════════════════════════════════════════════════════

const LIBRARY_CARD_CONFIG = {
  tools: {
    title: '🧰 为你精挑细选的 AI 工具',
    sub: 'Tools',
    bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50',
    border: 'border-orange-200',
    accent: 'text-orange-700',
    pill: 'bg-orange-500/15 text-orange-700',
    icon: Wrench,
    href: '/tools',
  },
  projects: {
    title: '🎯 最适合你的落地项目',
    sub: 'Projects',
    bg: 'bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50',
    border: 'border-blue-200',
    accent: 'text-blue-700',
    pill: 'bg-blue-500/15 text-blue-700',
    icon: Briefcase,
    href: '/projects',
  },
  services: {
    title: '🤝 为你匹配的服务与陪跑',
    sub: 'Services',
    bg: 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50',
    border: 'border-violet-200',
    accent: 'text-violet-700',
    pill: 'bg-violet-500/15 text-violet-700',
    icon: HeadphonesIcon,
    href: '/services',
  },
  resources: {
    title: '📚 帮你快速上手的资源库',
    sub: 'Resources',
    bg: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
    border: 'border-emerald-200',
    accent: 'text-emerald-700',
    pill: 'bg-emerald-500/15 text-emerald-700',
    icon: BookOpen,
    href: '/resources',
  },
} as const

type LibraryKey = keyof typeof LIBRARY_CARD_CONFIG

export default function LevelGuidePage() {
  const params = useParams<{ level: string }>()
  const router = useRouter()
  const rawLevel = (params?.level || 'trader') as string
  const validLevels: Level[] = ['trader', 'flow', 'system', 'asset']
  const level: Level = (validLevels.includes(rawLevel as Level) ? rawLevel : 'trader') as Level

  const meta = LEVEL_META[level]
  const data = LIBRARY_DATA[level]

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* ════════ 顶部 Hero ════════ */}
      <section
        className={`${meta.bg} text-white px-5 pt-6 pb-8 md:pt-10 md:pb-12 relative overflow-hidden`}
      >
        {/* 装饰光斑 */}
        <div aria-hidden className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5 blur-3xl" />

        <div className="max-w-lg md:max-w-6xl md:mx-auto relative">
          {/* 顶部导航行 */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-xs md:text-sm bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full transition-colors"
            >
              <ArrowLeft size={14} />
              返回
            </button>
            <Link
              href="/"
              className="text-white/80 hover:text-white text-xs md:text-sm transition-colors"
            >
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

          {/* 4 库概览小标签 */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {(['tools', 'projects', 'services', 'resources'] as LibraryKey[]).map((k) => {
              const cfg = LIBRARY_CARD_CONFIG[k]
              return (
                <span
                  key={k}
                  className="text-[10px] md:text-xs font-bold bg-white/20 backdrop-blur text-white px-2 py-1 rounded-full"
                >
                  {cfg.sub} · {data[k].length}
                </span>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════ 2x2 Bento 网格：四库推荐 ════════ */}
      <section className="px-5 py-6 md:py-8">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <div className="mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-xl md:text-2xl">🧭</span>
              为你定制的四库精选
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              基于 {meta.label} 的能力模型，从四库中智能匹配 2-3 个最相关资源
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {(['tools', 'projects', 'services', 'resources'] as LibraryKey[]).map((k) => (
              <LibraryCard key={k} kind={k} items={data[k]} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 底部巨型 CTA ════════ */}
      <section className="px-5 mt-2 mb-8">
        <div className="max-w-lg md:max-w-6xl md:mx-auto">
          <div
            className={`relative overflow-hidden rounded-3xl ${meta.bg} text-white p-6 md:p-8 shadow-2xl`}
          >
            <div aria-hidden className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
            <div aria-hidden className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6">
              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold tracking-wider text-white/80 uppercase mb-2">
                  <Rocket size={14} />
                  STEP 04 · 矩阵放大
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold leading-snug">
                  方案已就位，立即进入工作台开始实操
                </h3>
                <p className="mt-1.5 text-xs md:text-sm text-white/85">
                  把今天选定的方案，落到每一天的 TODO 与执行清单
                </p>
              </div>

              <Link
                href="/workspace"
                className="group flex-shrink-0 inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-yellow-50 px-6 py-3 md:px-8 md:py-4 rounded-2xl font-extrabold text-sm md:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <Rocket size={18} className="md:w-5 md:h-5 text-amber-500" />
                前往我的工作台，开始实操
                <ArrowRight
                  size={18}
                  className="md:w-5 md:h-5 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 库卡片子组件（Bento 单元）
// ════════════════════════════════════════════════════════════════

function LibraryCard({ kind, items }: { kind: LibraryKey; items: LibraryItem[] }) {
  const cfg = LIBRARY_CARD_CONFIG[kind]
  const Icon = cfg.icon

  return (
    <div
      className={`relative ${cfg.bg} border ${cfg.border} rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow`}
    >
      {/* 顶部标题行 */}
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
        <Link
          href={cfg.href}
          className={`text-[10px] font-bold ${cfg.accent} hover:underline whitespace-nowrap`}
        >
          查看全部 →
        </Link>
      </div>

      {/* 推荐列表 */}
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
