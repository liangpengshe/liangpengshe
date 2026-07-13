'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Rocket,
  Briefcase,
  Compass,
  BookOpen,
  Wrench,
  TrendingUp,
  CheckCircle2,
  Clock,
  Lock,
  ShoppingCart,
  Megaphone,
  Settings2,
  Gem,
  Zap,
} from 'lucide-react'
import ClientLayout from '@/components/ClientLayout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FlowControlBar, type LibraryTabValue } from '@/components/learning/FlowControlBar'
import { LibraryCard } from '@/components/learning/LibraryCard'
import { resolveSmartLearningHref } from '@/lib/user-stage'
import { cn } from '@/lib/utils'

// ════════════════════════════════════════════════════════════════
// 静态数据
// ════════════════════════════════════════════════════════════════

const stats = [
  { label: '已赋能企业', value: 300, suffix: '+', unit: '家' },
  { label: '举办沙龙', value: 50, suffix: '+', unit: '期' },
  { label: '服务客户', value: 500, suffix: '+', unit: '位' },
  { label: 'AI案例', value: 100, suffix: '+', unit: '个' },
]

// 4 步学习实操路径
// requiresLevel: true  → 点击时按用户 opc_level 智能跳转到 /market/guide/{level}
// 降级：未诊断 → /market（四库总览页）
type LearningPathItem = {
  step: string
  title: string
  desc: string
  status: 'done' | 'active' | 'locked'
  href: string
  requiresLevel: boolean
  icon: typeof Compass
}
const learningPath: LearningPathItem[] = [
  {
    step: '01',
    title: '咨询诊断',
    desc: 'AI 商业 IP 诊断 + 行业对标',
    status: 'done' as const,
    href: '/diagnosis',
    requiresLevel: false,
    icon: Compass,
  },
  {
    step: '02',
    title: '学习入门',
    desc: '通哥 SOP + AI 智能体矩阵',
    status: 'active' as const,
    href: '/market', // 降级目标：未诊断时进入四库总览页
    requiresLevel: true,    // 智能分流：按 opc_level 跳 /market/guide/{level}
    icon: BookOpen,
  },
  {
    step: '03',
    title: '运营实操',
    desc: '工具落地 + 项目跑通首单',
    status: 'locked' as const,
    href: '/market',
    requiresLevel: true,
    icon: Wrench,
  },
  {
    step: '04',
    title: '矩阵放大',
    desc: '城市分站加盟 + 资产复制',
    status: 'locked' as const,
    href: '/partner',
    requiresLevel: false,
    icon: TrendingUp,
  },
]

// 四层智富阶梯（标准 2x2 网格 · 4 色渐变）
const entrepreneurLadder = [
  {
    layer: '第一层',
    title: '� 交易型 OPC',
    desc: 'AI 网店群、智富严选、跑通首单赚第一笔钱',
    href: '/market/guide/trader',
    cta: '快速了解',
    color: 'bg-gradient-to-r from-orange-400 to-amber-500',
    icon: ShoppingCart,
  },
  {
    layer: '第二层',
    title: '� 流量型 OPC',
    desc: '内容获客、自媒体矩阵',
    href: '/market/guide/flow',
    cta: '了解详情',
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
    icon: Megaphone,
  },
  {
    layer: '第三层',
    title: '⚙️ 系统型 OPC',
    desc: '企业流程改造、高客单',
    href: '/market/guide/system',
    cta: '了解详情',
    color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    icon: Settings2,
  },
  {
    layer: '第四层',
    title: '� 资产型 OPC',
    desc: '数字资产、全球外包',
    href: '/market/guide/asset',
    cta: '了解详情',
    color: 'bg-gradient-to-r from-purple-500 to-indigo-700',
    icon: Gem,
  },
]

/* === 商业全景沙盘卡片已从首页阶梯区块移除 ===
 * 之前的位置与样式：
 *   layer: '商业全景',
 *   title: '📊 进入商业全景看利润',
 *   desc: '投资人 / 主理人专属入口',
 *   href: '/pitch',
 *   color: 'from-slate-700 to-slate-900',
 *   span: 'col-span-1',
 *   large: false,
 *   icon: Briefcase,
 */

// 四库 Tabs 预览内容（保持原 libraryPreview 数据结构，便于 fetchProjects 复用）
// 标题已对齐"AI智富"全局命名规范
const libraryPreview = {
  tools: {
    title: 'AI智富工具库',
    desc: 'OPC 独家自研 + 严选 AI 生态工具导航',
    items: [
      { name: '豹纹工坊', desc: '一键生成爆款素材', icon: '🛠️' },
      { name: '灵犀 AI', desc: '智能内容创作', icon: '✨' },
      { name: '先锋派数字人', desc: 'AI 数字人视频', icon: '🎬' },
    ],
    href: '/market',
  },
  projects: {
    title: 'AI智富项目库',
    desc: '精选 AI 落地项目案例，可复制到各城市',
    items: [
      { name: 'AI TikTok Shop', desc: '海外短视频带货', icon: '🌏' },
      { name: 'AI Shopify 选品', desc: '智能选品上架', icon: '🛒' },
      { name: 'AI 私域引流', desc: '自动化获客系统', icon: '📈' },
    ],
    href: '/market/projects',
  },
  services: {
    title: 'AI智富服务库',
    desc: 'AI 内训、GEO 增长、陪跑服务',
    items: [
      { name: 'AI 内训', desc: '企业 AI 转型培训', icon: '🎓' },
      { name: 'GEO 增长', desc: '生成式引擎优化', icon: '🎯' },
      { name: '陪跑服务', desc: '90 天落地辅导', icon: '🤝' },
    ],
    href: '/market/services',
  },
  resources: {
    title: 'AI智富资源库',
    desc: '学习资料、行业报告、城市运营干货',
    items: [
      { name: '行业报告', desc: 'AI 趋势研报', icon: '📊' },
      { name: '运营干货', desc: '实操 SOP 文档', icon: '📚' },
      { name: '城市活动', desc: '沙龙 / 聚会预告', icon: '🎤' },
    ],
    href: '/market/resources',
  },
}

// ════════════════════════════════════════════════════════════════
// 类型定义
// ════════════════════════════════════════════════════════════════

interface BentoItem {
  title: string
  icon: string
  description: string
  href: string
  large: boolean
  bgColor: string
  textColor: string
  badge?: { text: string; icon: typeof Rocket; color: string }
}

interface Activity {
  id: string
  city: string
  user: string
  action: string
  createdAt: string
}

const fallbackBentoItems: BentoItem[] = [
  {
    title: 'OPC 城市主理人生态圈',
    icon: '🚀',
    description: '全国 7 座城市已联动，招募更多城市主理人共拓 AI 市场',
    href: '/partner',
    large: true,
    bgColor: 'bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800',
    textColor: 'text-white',
    badge: { text: '招募中', icon: Rocket, color: 'bg-orange-500' },
  },
  {
    title: 'AI智富工具库 · 智富引擎',
    icon: '🔧',
    description: '实用AI工具推荐与教程，赋能个人创业者',
    href: '/market',
    large: false,
    bgColor: '',
    textColor: '',
  },
  {
    title: 'AI智富项目库 · 创富引擎',
    icon: '📁',
    description: '精选AI落地项目案例，可复制到各城市运营',
    href: '/market/projects',
    large: false,
    bgColor: '',
    textColor: '',
  },
  {
    title: 'AI智富服务库 · 护航引擎',
    icon: '💼',
    description: 'AI内训、GEO增长、陪跑服务，解决落地最后一环',
    href: '/market/services',
    large: false,
    bgColor: '',
    textColor: '',
  },
  {
    title: 'AI智富资源库 · 链接引擎',
    icon: '📚',
    description: '学习资料、行业报告、城市运营干货分享',
    href: '/market/resources',
    large: false,
    bgColor: '',
    textColor: '',
  },
]

// ════════════════════════════════════════════════════════════════
// 子组件
// ════════════════════════════════════════════════════════════════

function CommunityHeartbeat() {
  const [activeCount, setActiveCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHeartbeat = async () => {
      try {
        const res = await fetch('/api/community/heartbeat')
        const data = await res.json()
        if (data.success) {
          setActiveCount(data.data.activeCount)
        } else {
          setActiveCount(238)
        }
      } catch {
        setActiveCount(238)
      } finally {
        setLoading(false)
      }
    }
    fetchHeartbeat()
    const interval = setInterval(fetchHeartbeat, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex-shrink-0 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-2 ml-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
      </span>
      <div className="text-xs leading-tight">
        <div className="text-white/70">社区今日活跃</div>
        <div className="text-white font-semibold">
          {loading ? '...' : activeCount} 人
        </div>
      </div>
    </div>
  )
}

function ActivityTicker({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) return null

  return (
    <div className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-2.5 mb-6">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...activities, ...activities].map((activity, idx) => (
          <div
            key={`${activity.id}-${idx}`}
            className="flex items-center gap-2 px-5 text-sm text-white/90 flex-shrink-0"
          >
            <span className="text-yellow-300">📍</span>
            <span className="font-semibold text-white">{activity.city}</span>
            <span className="text-white/80">
              {activity.user} {activity.action}
            </span>
            <span className="text-white/40 mx-3">|</span>
          </div>
        ))}
      </div>
      <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-slate-900/80 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-slate-900/80 to-transparent pointer-events-none" />
    </div>
  )
}

/** ① OPC 学习实操路径（水平进度条 + 4 节点 + 状态色 + 点击平滑滚动） */
function LearningPath() {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const handleClick = (item: LearningPathItem) => {
    // 智能分流：STEP 02/03 按用户 opc_level 优先跳专属引导页，降级到 item.href
    const target = item.requiresLevel
      ? resolveSmartLearningHref(item.href)
      : item.href

    // 站内锚点滚动到对应板块
    if (target.startsWith('#')) {
      const el = document.querySelector(target)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.location.href = target
    }
  }

  const statusConfig = {
    done: {
      bg: 'bg-gradient-to-br from-emerald-400 to-green-600',
      ring: 'ring-emerald-300',
      text: 'text-emerald-600',
      label: '已完成',
      icon: CheckCircle2,
      pulse: false,
    },
    active: {
      bg: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600',
      ring: 'ring-blue-300',
      text: 'text-blue-600',
      label: '进行中',
      icon: Clock,
      pulse: true,
    },
    locked: {
      bg: 'bg-slate-200',
      ring: 'ring-slate-200',
      text: 'text-slate-400',
      label: '待解锁',
      icon: Lock,
      pulse: false,
    },
  } as const

  return (
    <section className="px-5 pt-2 pb-3">
      <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
        <div className="mb-4">
          <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="text-xl">🏆</span>
            你的 OPC 学习智富路径
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            点击任一步骤，可跳转至对应的板块
          </p>
        </div>

        {/* 移动端：纵向 / PC 端：横向 */}
        <div className="relative">
          {/* PC 端连接虚线（仅在 md 及以上显示） */}
          <div className="hidden md:block absolute top-7 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-emerald-300 via-blue-300 to-slate-200" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative">
            {learningPath.map((item, idx) => {
              const cfg = statusConfig[item.status]
              const Icon = item.icon
              const StatusIcon = cfg.icon
              return (
                <button
                  key={item.step}
                  onClick={() => handleClick(item)}
                  className="group relative bg-white border border-slate-200 rounded-2xl p-3 md:p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left"
                >
                  {/* 步骤圆点 */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="relative flex-shrink-0">
                      {cfg.pulse && (
                        <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-50" />
                      )}
                      <div
                        className={`relative w-9 h-9 md:w-11 md:h-11 rounded-full ${cfg.bg} ring-4 ${cfg.ring} flex items-center justify-center text-white shadow-md`}
                      >
                        <Icon size={16} className="md:w-[18px] md:h-[18px]" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 tracking-wider">
                        STEP {item.step}
                      </div>
                      <div className="text-sm md:text-base font-bold text-slate-800 leading-tight">
                        {item.title}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold ${cfg.text}`}
                    >
                      <StatusIcon size={10} />
                      {cfg.label}
                    </span>
                    <ArrowRight
                      size={12}
                      className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all"
                    />
                  </div>

                  {/* 移动端连接箭头（除最后一个外） */}
                  {idx < learningPath.length - 1 && idx % 2 === 0 && (
                    <ArrowRight
                      size={14}
                      className="md:hidden absolute -right-2 top-1/2 -translate-y-1/2 text-slate-300"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/** ② OPC 四层智富阶梯（标准 2x2 网格 · 4 色渐变） */
function EntrepreneurLadder() {
  return (
    <section className="px-5 pt-6 pb-6">
      <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
        <div className="mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            OPC四层智富阶梯
          </h2>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed mt-1">
            从跑通首单到资产复制，四层路径让一人公司逐步做大
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entrepreneurLadder.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`group relative ${item.color} rounded-2xl p-4 md:p-6 text-white overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[150px] md:min-h-[170px]`}
              >
                {/* 装饰光晕 */}
                <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/15 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full blur-xl" />

                <div className="relative flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                    <Icon size={20} className="md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-white/80 tracking-widest mb-0.5">
                      {item.layer}
                    </div>
                    <h3 className="text-base md:text-lg font-extrabold leading-tight">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="relative mt-2 md:mt-3">
                  <p className="text-[11px] md:text-xs text-white/90 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="mt-2 md:mt-3 inline-flex items-center gap-1 text-[11px] md:text-xs font-bold text-white opacity-90 group-hover:opacity-100 group-hover:gap-2 transition-all">
                    <span>{item.cta || '了解详情'}</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/** ③ 四库全胜系统（2x2 Bento 网格） */
const BENTO_CARDS: Array<{
  tab: LibraryTabValue
  title: string
  subtitle: string
  href: string
  /** 背景渐变类名（顶流 Stripe / Linear 风格） */
  bg: string
  /** 装饰光晕色 */
  glow: string
  /** 右上角小图标 emoji */
  emoji: string
}> = [
  {
    tab: 'tools',
    title: 'AI智富工具库',
    subtitle: 'AI 自研工具、电商工作台、运营插件...',
    href: '/market/tools',
    bg: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700',
    glow: 'bg-white/10',
    emoji: '🔧',
  },
  {
    tab: 'projects',
    title: 'AI智富项目库',
    subtitle: '数字网店、跨境电商、AI 编程系统...',
    href: '/market/projects',
    bg: 'bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600',
    glow: 'bg-white/10',
    emoji: '🚀',
  },
  {
    tab: 'services',
    title: 'AI智富服务库',
    subtitle: 'OPC 内训、陪跑、代运营、企业 GEO...',
    href: '/market/services',
    bg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500',
    glow: 'bg-white/10',
    emoji: '💼',
  },
  {
    tab: 'resources',
    title: 'AI智富资源库',
    subtitle: 'AI 硬件、精品教程、城市招商加盟...',
    href: '/market/resources',
    bg: 'bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800',
    glow: 'bg-white/10',
    emoji: '📚',
  },
]

/** 2x2 Bento 网格中的单张卡片（整张 Link 包裹） */
function BentoLibraryCard({
  card,
  isActive,
  onClick,
}: {
  card: (typeof BENTO_CARDS)[number]
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={card.href}
      onClick={onClick}
      className={cn(
        'group relative block rounded-3xl p-5 md:p-6 overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all min-h-[160px] md:min-h-[180px]',
        card.bg,
        isActive && 'ring-2 ring-white/60 ring-offset-2 ring-offset-slate-50'
      )}
    >
      {/* 装饰光晕 */}
      <div className={cn('absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl', card.glow)} />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />

      <div className="relative flex flex-col h-full text-white">
        {/* 顶部：图标 + 角标 */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl md:text-4xl drop-shadow-md">{card.emoji}</span>
          {isActive && (
            <span className="inline-flex items-center gap-1 px-2 h-5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold border border-white/30">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              当前
            </span>
          )}
        </div>

        {/* 标题 + 副标题 */}
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-bold text-white drop-shadow-sm">
            {card.title}
          </h3>
          <p className="mt-1 text-[11px] md:text-xs text-white/85 leading-relaxed line-clamp-2">
            {card.subtitle}
          </p>
        </div>

        {/* 底部：前往进入 → */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] md:text-[11px] font-semibold text-white/70 uppercase tracking-wider">
            {card.tab === 'tools' && 'Tools'}
            {card.tab === 'projects' && 'Projects'}
            {card.tab === 'services' && 'Services'}
            {card.tab === 'resources' && 'Resources'}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] md:text-xs font-bold text-white group-hover:gap-2 transition-all">
            <span>前往进入</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/** ③ 四库全胜系统（2x2 Bento 网格） */
function LibraryTabs() {
  const [activeTab, setActiveTab] = useState<LibraryTabValue>('tools')
  const [highlightName, setHighlightName] = useState<string | null>(null)
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 点击快捷按钮：切换 Tab + 3 秒高亮目标卡片
  const handleJumpToTab = (
    tab: LibraryTabValue,
    options?: { highlightItemName?: string }
  ) => {
    setActiveTab(tab)
    if (options?.highlightItemName) {
      setHighlightName(options.highlightItemName)
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
      highlightTimerRef.current = setTimeout(() => {
        setHighlightName(null)
      }, 3000)
    }
  }

  // 卸载时清理 timer
  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
    }
  }, [])

  return (
    <section className="px-5 pt-6 pb-6">
      <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              AI四库全胜系统
            </h2>
            <Link href="/more" className="text-sm text-blue-600 hover:text-blue-700">
              查看全部 →
            </Link>
          </div>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
            工具智选、项目创富、服务护航、资源链接。
            <span className="font-semibold text-blue-600">四大引擎协同驱动</span>
            ，助你赢在 AI 时代。
          </p>
        </div>

        {/* 全流程管控挂件（智能引导区，已顶流化升级） */}
        <div className="mb-4">
          <FlowControlBar activeTab={activeTab} onJumpToTab={handleJumpToTab} />
        </div>

        {/* ════════ 2x2 Bento 网格（取代原 Tabs 卡片） ════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BENTO_CARDS.map((card) => (
            <BentoLibraryCard
              key={card.tab}
              card={card}
              isActive={activeTab === card.tab}
              onClick={() => handleJumpToTab(card.tab)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════
// 主页面
// ════════════════════════════════════════════════════════════════

export default function HomePage() {
  // 关键修复：使用 mounted 模式避免 React Hydration 不匹配
  // framer-motion 的 motion.div + 部分动态属性会导致 SSR 与 client 渲染不一致
  const [mounted, setMounted] = useState(false)
  const [bentoItems, setBentoItems] = useState<BentoItem[]>(fallbackBentoItems)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects?city=shenzhen')
        const data = await response.json()
        const hasAny = data.success && data.data && Object.keys(data.data).length > 0
        if (hasAny) {
          const categories = ['服务库', '工具库', '项目库', '资源库']
          const icons: Record<string, string> = {
            '服务库': '💼',
            '工具库': '🔧',
            '项目库': '📁',
            '资源库': '📚',
          }
          const subTags: Record<string, string> = {
            '服务库': 'AI智富服务库 · 护航引擎',
            '工具库': 'AI智富工具库 · 智富引擎',
            '项目库': 'AI智富项目库 · 创富引擎',
            '资源库': 'AI智富资源库 · 链接引擎',
          }
          const hrefMap: Record<string, string> = {
            '服务库': '/market/services',
            '工具库': '/market',
            '项目库': '/market/projects',
            '资源库': '/market/resources',
          }
          const fallbackByTitle = new Map(
            fallbackBentoItems.map((f) => [f.title.split(' · ')[0], f])
          )
          const newItems = categories.map((category, index) => {
            const projects = data.data[category] || []
            const project = projects[0]
            const fb = fallbackByTitle.get(category)
            return {
              title:
                index === 0
                  ? 'OPC 城市主理人生态圈'
                  : `${category}${subTags[category]}`,
              icon: index === 0 ? '🚀' : icons[category],
              description:
                index === 0
                  ? '全国 7 座城市已联动，招募更多城市主理人共拓 AI 市场'
                  : project
                  ? project.description
                  : fb?.description || '',
              href: index === 0 ? '/partner' : hrefMap[category],
              large: index === 0,
              bgColor:
                index === 0
                  ? 'bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800'
                  : 'bg-white/10',
              textColor: 'text-white',
              badge:
                index === 0
                  ? { text: '招募中', icon: Rocket, color: 'bg-orange-500' }
                  : undefined,
            }
          })
          setBentoItems(newItems)
        }
      } catch (error) {
        console.log('使用备用数据')
      } finally {
        setLoading(false)
      }
    }

    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/activities')
        const data = await res.json()
        if (data.success && data.data) {
          setActivities(data.data)
        }
      } catch {
        setActivities([])
      }
    }

    fetchProjects()
    fetchActivities()
  }, [])

  if (!mounted) {
    // 客户端水合前显示占位，避免 framer-motion / 动态属性触发 hydration 报错
    return (
      <ClientLayout>
        <div className="min-h-screen bg-slate-50" suppressHydrationWarning />
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="min-h-screen bg-slate-50">
        {/* ═══ 1. HERO 区：深色渐变 + 玻璃拟态 + 3D 数字人占位 ═══ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-16 pb-24 px-5">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-32 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent" />

          <div className="relative max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/15 via-yellow-400/15 to-amber-500/15 backdrop-blur-md border border-amber-400/40 rounded-full px-4 py-1.5 mb-6 shadow-lg shadow-amber-500/10"
                >
                  <span className="text-base">🏆</span>
                  <span className="text-sm text-amber-100 font-semibold tracking-wide">
                    良朋社<span className="text-amber-300">OPC</span> 智富生态系统
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4"
                >
                  <span className="text-white">一人公司 ×</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    AI 商业重构操作系统
                  </span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.18 }}
                  className="mb-4 flex items-center justify-center md:justify-start gap-1.5 sm:gap-2 whitespace-nowrap max-w-full origin-center md:origin-left scale-90 max-[389px]:scale-[0.82] max-[359px]:scale-[0.74] max-[340px]:scale-[0.68]"
                >
                  <span className="text-lg sm:text-xl md:text-lg font-extrabold tracking-wide shrink-0">
                    <span className="bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(99,102,241,0.45)]">
                      智
                    </span>
                    <span className="mx-0.5 text-slate-200">·</span>
                    <span className="bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]">
                      富
                    </span>
                  </span>
                  <span className="text-[11px] sm:text-sm md:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-wider shrink min-w-0 truncate">
                    以智生财，富在当下
                  </span>
                  <span className="text-slate-500 text-xs shrink-0">·</span>
                  <span className="text-[11px] sm:text-sm md:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-300 tracking-wider shrink min-w-0 truncate">
                    用 AI 武装你的生意
                  </span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="text-slate-300 mb-8 max-w-md md:max-w-lg mx-auto md:mx-0 text-sm md:text-base"
                >
                  汇聚全国 AI 从业者与企业家，共同探索人工智能在企业中的实际应用与商业价值
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                >
                  <Link
                    href="/salon"
                    className="group relative inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3.5 px-8 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/40"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 flex items-center gap-2">
                      <Sparkles size={18} />
                      智富沙龙 · 立即报名
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  <Link
                    href="/partner"
                    className="group relative inline-flex items-center justify-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold py-3.5 px-8 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 flex items-center gap-2">
                      <Rocket size={18} />
                      智富主理人 · 城市招募
                    </span>
                  </Link>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative hidden md:flex items-center justify-center"
              >
                <div className="relative w-full aspect-square max-w-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/25 to-pink-500/20 rounded-3xl blur-2xl" />
                  <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    <div
                      className="absolute left-0 right-0 h-24 -translate-y-2 animate-pulse"
                      style={{
                        top: '58%',
                        background:
                          'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0) 5%, rgba(168,85,247,0.55) 30%, rgba(236,72,153,0.7) 50%, rgba(99,102,241,0.55) 70%, rgba(168,85,247,0) 95%, transparent 100%)',
                        filter: 'blur(8px)',
                        mixBlendMode: 'screen',
                      }}
                    />
                    <div
                      className="absolute left-0 right-0 h-3 -translate-y-2 animate-pulse"
                      style={{
                        top: '58%',
                        background:
                          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 10%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 90%, transparent 100%)',
                        filter: 'blur(3px)',
                        animationDelay: '0.6s',
                        mixBlendMode: 'screen',
                      }}
                    />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/40 rounded-full blur-3xl animate-pulse" />
                    <div
                      className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl animate-pulse"
                      style={{
                        background: 'radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)',
                        animationDelay: '1.2s',
                      }}
                    />
                  </div>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src="/images/liangliang.png"
                      alt="良良 - 良朋社AI数字助手"
                      width={400}
                      height={400}
                      priority
                      quality={95}
                      className="relative w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(168,85,247,0.35)]"
                    />
                  </motion.div>
                  <div className="absolute -inset-4 border-2 border-blue-400/30 rounded-3xl animate-spin-slow pointer-events-none" />
                  <div className="absolute -inset-8 border border-purple-400/20 rounded-3xl animate-spin-reverse pointer-events-none" />
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="absolute top-8 -right-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-xs text-white shadow-lg"
                  >
                    ✨ AI 智富助理
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                    className="absolute bottom-12 -left-2 bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-md rounded-full px-3 py-1.5 text-xs text-white shadow-lg"
                  >
                    🎯 一人公司 × 智富引擎
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 2. 实时动态滚动条（Hero 正下方）═══ */}
        <section className="relative -mt-10 px-5 z-10">
          <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <ActivityTicker activities={activities} />
          </div>
        </section>

        {/* ═══ 3. 数据条：玻璃拟态 + framer-motion 数字滚动 + 社区心跳 ═══ */}
        <section className="px-5 pt-6 pb-6">
          <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-white/20 rounded-3xl px-6 py-6">
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {stats.map((stat, index) => (
                  <div key={index} className="flex-shrink-0 w-28 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">
                      <span>{stat.value}</span>
                      {stat.suffix}
                    </div>
                    <div className="text-xs text-white/70 mt-1">
                      {stat.label} {stat.unit}
                    </div>
                  </div>
                ))}
                <CommunityHeartbeat />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 4. AI 智能体商业 IP 诊断（免费入口）═══ */}
        <section className="px-5 pt-3 pb-2 relative z-10">
          <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-5 md:p-6 shadow-2xl shadow-orange-500/30 overflow-hidden"
            >
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/15 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300/30 rounded-full blur-2xl" />
              <div className="relative flex flex-col md:flex-row items-center gap-4 text-white">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
                  <span className="text-2xl">🎁</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="text-[11px] font-bold text-amber-100 tracking-wider mb-1">
                    🔥 限时免费 · 每天仅 10 个名额
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-1.5">
                    免费领取：AI 智能体商业 IP 诊断
                  </h3>
                  <p className="text-xs md:text-sm text-amber-50/95 leading-relaxed">
                    良朋社用 <span className="font-bold">4 步法 + AI 智能体团队</span>
                    ，帮你系统重构 IP。
                  </p>
                </div>
                <Link
                  href="/diagnosis"
                  className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-orange-600 text-sm font-bold rounded-xl hover:scale-105 transition-transform shadow-lg"
                >
                  <Sparkles size={16} />
                  立即领取
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ 5. OPC 学习实操路径（水平进度条）═══ */}
        <LearningPath />

        {/* ═══ 6. OPC 四层创业阶梯（非对称 Bento）═══ */}
        <EntrepreneurLadder />

        {/* ═══ 7. 四库全胜系统（Tabs 动态面板）═══ */}
        <LibraryTabs />

        {/* ═══ 8. OPC 城市主理人生态圈：顶部蓝色大横幅 ═══ */}
        <section className="px-5 pt-2 pb-3">
          <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <Link
              href="/partner"
              className="group relative block bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 md:p-8 text-white overflow-hidden hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-300/20 rounded-full blur-3xl" />
              <div className="relative flex items-center gap-5">
                <div className="text-5xl md:text-6xl flex-shrink-0">🚀</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                      <Rocket size={12} />
                      🔥 招募中
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1.5">
                    OPC 城市主理人生态圈
                  </h2>
                  <p className="text-sm md:text-base text-white/90 leading-relaxed">
                    全国 7 座城市已联动，招募更多城市主理人共拓 AI 市场
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-sm text-white font-semibold group-hover:gap-2 transition-all">
                    <span>立即加入</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ═══ 9. CTA 区：玻璃拟态 ═══ */}
        <section className="px-5 pt-6 pb-10">
          <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <div className="relative bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-purple-700/90 backdrop-blur-md border border-white/20 rounded-3xl p-8 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl" />
              <div className="relative text-center">
                <h3 className="text-xl font-bold text-white mb-3">加入良朋社OPC</h3>
                <p className="text-white/80 mb-6 text-sm">
                  与全国顶尖 AI 从业者一起，开启企业智能化转型之旅
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center bg-white text-slate-900 font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-transform shadow-lg"
                  >
                    免费注册
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    联系我们
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ClientLayout>
  )
}
