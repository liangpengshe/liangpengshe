'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Sparkles, Wrench, Briefcase, FolderKanban, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  MARKET_SEARCH_STORAGE_KEY,
  MARKET_SEARCH_EVENT,
} from '@/lib/market-search'

/**
 * AI四库全胜系统 - 共享布局
 *
 * 提供所有 /market/* 子页面的公共"外壳"：
 *   - 顶部导航（Logo + 良朋社 OPC + 标题）
 *   - 全局搜索框（写入 sessionStorage，由 MarketContent 同步读取）
 *   - AI 智富导航 · 紫色横幅
 *   - 4 库 Link 导航（基于 usePathname 高亮）
 *
 * 子页面（/market/tools 等）只渲染各自的具体内容，chrome 全由本布局提供。
 */

interface NavTab {
  href: string
  label: string
  short: string
  icon: typeof Wrench
  /** 品牌色（未激活态背景 / 激活态渐变） */
  brand: {
    /** 未激活态：100 底色 + 700 字色 + 200 边框 */
    idleBg: string
    idleText: string
    idleBorder: string
    /** hover 加深 */
    hoverBg: string
    /** 激活态：渐变 + 阴影 + 顶部指示条 */
    activeFrom: string
    activeTo: string
    activeShadow: string
    indicator: string
    /** 移动端：圆点小色块（短标签前） */
    dot: string
  }
}

// [Task:Tab 默认排序] 优先级：项目库 → 工具库 → 服务库 → 资源库
// 激活态高亮完全由 usePathname() 动态匹配 href，与数组顺序无关，重排零风险
const NAV_TABS: NavTab[] = [
  {
    href: '/market/projects',
    label: 'AI智富项目库',
    short: '项目',
    icon: FolderKanban,
    brand: {
      idleBg: 'bg-amber-50',
      idleText: 'text-amber-700',
      idleBorder: 'border-amber-200',
      hoverBg: 'hover:bg-amber-100',
      activeFrom: 'from-amber-500',
      activeTo: 'to-orange-500',
      activeShadow: 'shadow-amber-500/40',
      indicator: 'bg-amber-500',
      dot: 'bg-amber-500',
    },
  },
  {
    href: '/market/tools',
    label: 'AI智富工具库',
    short: '工具',
    icon: Wrench,
    brand: {
      idleBg: 'bg-blue-50',
      idleText: 'text-blue-700',
      idleBorder: 'border-blue-200',
      hoverBg: 'hover:bg-blue-100',
      activeFrom: 'from-blue-500',
      activeTo: 'to-indigo-600',
      activeShadow: 'shadow-blue-500/40',
      indicator: 'bg-blue-500',
      dot: 'bg-blue-500',
    },
  },
  {
    href: '/market/services',
    label: 'AI智富服务库',
    short: '服务',
    icon: Briefcase,
    brand: {
      idleBg: 'bg-emerald-50',
      idleText: 'text-emerald-700',
      idleBorder: 'border-emerald-200',
      hoverBg: 'hover:bg-emerald-100',
      activeFrom: 'from-emerald-500',
      activeTo: 'to-teal-600',
      activeShadow: 'shadow-emerald-500/40',
      indicator: 'bg-emerald-500',
      dot: 'bg-emerald-500',
    },
  },
  {
    href: '/market/resources',
    label: 'AI智富资源库',
    short: '资源',
    icon: BookOpen,
    brand: {
      idleBg: 'bg-rose-50',
      idleText: 'text-rose-700',
      idleBorder: 'border-rose-200',
      hoverBg: 'hover:bg-rose-100',
      activeFrom: 'from-rose-500',
      activeTo: 'to-pink-600',
      activeShadow: 'shadow-rose-500/40',
      indicator: 'bg-rose-500',
      dot: 'bg-rose-500',
    },
  },
]

export default function MarketLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const skipFirstWriteRef = useRef(true)

  // 初始化：从 sessionStorage 读取之前保存的搜索词
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = sessionStorage.getItem(MARKET_SEARCH_STORAGE_KEY) || ''
    setSearchQuery(saved)
  }, [])

  // 同步：搜索词变化时写入 sessionStorage + 派发自定义事件
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (skipFirstWriteRef.current) {
      skipFirstWriteRef.current = false
      return
    }
    sessionStorage.setItem(MARKET_SEARCH_STORAGE_KEY, searchQuery)
    window.dispatchEvent(new CustomEvent('market:search-changed'))
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ════════ 顶部导航 ════════ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <span className="text-xl">🏢</span>
            <span>良朋社OPC</span>
          </Link>
          <span className="font-bold text-gray-900">AI四库全胜系统</span>
          <div className="w-24" />
        </div>
        {/* 全局搜索框 */}
        <div className="px-5 pb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索工具 / 服务 / 项目 / 资源..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </header>

      <main className="px-5 py-6">
        {/* ════════ AI 智富导航 · 紫色横幅 ════════ */}
        <div className="mb-5 flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
            <Sparkles size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-blue-600 tracking-wider uppercase">
              AI 智富导航
            </div>
            <div className="text-sm font-bold text-slate-800 leading-tight">
              四库联动 · 一站直达全网 AI 工具与平台
            </div>
          </div>
        </div>

        {/* ════════ 4 库 Link 导航（移动端横滚 / PC 端 4 列网格）══
            4 库品牌色差异化：
              · 工具库 → 科技蓝
              · 服务库 → 专业青
              · 项目库 → 创富金
              · 资源库 → 玫瑰粉
            激活态：品牌渐变 + 白字 + 阴影 + 顶部 2px 指示条
            未激活态：品牌淡色 50 底 + 品牌 700 字 + 200 边框
         ═══════════════════════════════════════════════════════════════════════ */}
        <nav
          className={cn(
            'mb-5 -mx-5 px-5 overflow-x-auto whitespace-nowrap flex gap-2 py-2 bg-slate-100',
            'md:mx-0 md:px-1 md:overflow-visible md:whitespace-normal md:grid md:grid-cols-4 md:gap-1.5 md:bg-slate-100 md:p-1.5 md:rounded-xl'
          )}
        >
          {NAV_TABS.map((tab) => {
            const isActive =
              pathname === tab.href || pathname?.startsWith(tab.href + '/')
            const Icon = tab.icon
            const b = tab.brand
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  // 容器：相对定位（顶部指示条）+ 过渡
                  'relative flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border',
                  'md:text-sm',
                  isActive
                    ? // 激活态：品牌渐变 + 白字 + 阴影 + 顶部指示条
                      cn(
                        `bg-gradient-to-r ${b.activeFrom} ${b.activeTo} text-white border-transparent shadow-md ${b.activeShadow}`,
                        // 顶部 2px 指示条（"箭头指示"）
                        'before:absolute before:left-1/2 before:-translate-x-1/2 before:-top-1.5 before:w-8 before:h-1 before:rounded-full',
                        `before:${b.indicator}`
                      )
                    : // 未激活态：品牌淡色
                      cn(
                        `${b.idleBg} ${b.idleText} ${b.idleBorder} ${b.hoverBg}`
                      )
                )}
              >
                <Icon size={14} />
                <span className="md:hidden inline-flex items-center gap-1">
                  {/* 移动端：在短标签前补一个色点，强化色彩识别 */}
                  <span className={cn('inline-block w-1.5 h-1.5 rounded-full', b.dot)} />
                  {tab.short}
                </span>
                <span className="hidden md:inline">{tab.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* 子页面内容（MarketContent 等） */}
        {children}
      </main>
    </div>
  )
}
