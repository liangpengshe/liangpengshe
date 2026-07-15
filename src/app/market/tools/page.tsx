'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MarketContent } from '@/components/market/MarketContent'

/**
 * AI 智富工具库 - 独立路由
 *
 * 顶部 chrome（搜索 / 横幅 / 4 库导航）由 /market/layout.tsx 提供
 *
 * 本页特有：
 *   - 6 颗场景胶囊筛选（自研工具 / 写文案 / 做图片 / 搞视频 / 编代码 / 开网店）
 *   - 新手快捷分流（网店 / 自媒体）
 *   - 数据统计胶囊
 *   - URL 参数响应：
 *       ?type=trader|flow → 自动滚动 + 高亮首张卡
 *       ?tab=self_tools   → 自动滚动到自研工具 + 3s 闪烁高亮
 */

type TypeParam = 'trader' | 'flow' | null
type SceneSlug =
  | 'self-tools'
  | 'shop-workspace'
  | 'media-login'
  | 'scene-writing'
  | 'scene-image'
  | 'scene-video'

const TYPE_TO_ANCHOR: Record<Exclude<TypeParam, null>, string> = {
  trader: 'tools-category-shop-workspace',
  flow: 'tools-category-media-login',
}

const TYPE_TO_HIGHLIGHT: Record<
  Exclude<TypeParam, null>,
  'shop-workspace' | 'media-login'
> = {
  trader: 'shop-workspace',
  flow: 'media-login',
}

/**
 * 6 大核心分类（精简后的工具库导航）
 * 移动端横向滚动，桌面端单行展示
 */
const SCENE_FILTERS: { slug: SceneSlug; label: string }[] = [
  { slug: 'self-tools',     label: '自研工具' },
  { slug: 'shop-workspace', label: '网店工作台' },
  { slug: 'media-login',    label: '自媒体登录' },
  { slug: 'scene-writing',  label: 'AI文案写作' },
  { slug: 'scene-image',    label: 'AI图片创作' },
  { slug: 'scene-video',    label: 'AI音频视频' },
]

const HEADER_OFFSET = 140

export default function MarketToolsPage() {
  const searchParams = useSearchParams()
  const typeParam = (searchParams?.get('type') as TypeParam) ?? null
  const tabParam = searchParams?.get('tab') ?? null
  const anchor = typeParam ? TYPE_TO_ANCHOR[typeParam] : null
  const highlightCategory = (typeParam ? TYPE_TO_HIGHLIGHT[typeParam] : undefined) ?? undefined
  // 来自指南页 ?from=guide{level} 的智能推荐
  const fromParam = searchParams?.get('from') ?? null
  const fromGuide = (() => {
    if (!fromParam) return null
    if (fromParam === 'guide') return 'trader'
    if (fromParam.startsWith('guide')) return fromParam.slice('guide'.length)
    return null
  })()
  const fromGuideHint =
    fromGuide === 'trader' ? '交易型 OPC' :
    fromGuide === 'flow' ? '流量型 OPC' :
    fromGuide === 'system' ? '系统型 OPC' :
    fromGuide === 'asset' ? '资产型 OPC' : '专属'
  const [briefHighlight, setBriefHighlight] = useState<SceneSlug | null>(null)

  // 自研工具 ref（用于 ?tab=self_tools 滚动 + 闪烁高亮）
  const selfToolsRef = useRef<HTMLDivElement>(null)

  /**
   * 通用：滚动到指定 slug 对应的分类
   */
  const scrollToCategory = useCallback((slug: string) => {
    const el = document.getElementById(`tools-category-${slug}`)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
    window.scrollTo({ top: y, behavior: 'smooth' })
  }, [])

  /**
   * 场景胶囊点击：滚动 + 1.5s 闪烁高亮（首张卡片 ring-2）
   */
  const handleSceneClick = useCallback(
    (slug: SceneSlug) => {
      scrollToCategory(slug)
      setBriefHighlight(slug)
      window.setTimeout(() => setBriefHighlight(null), 1500)
    },
    [scrollToCategory]
  )

  /**
   * 页面加载时，若 URL 带有 ?type= 参数，自动滚动到对应子分类
   * 延迟 350ms 等待 MarketContent 内部状态/锚点渲染完毕
   */
  useEffect(() => {
    if (!anchor) return
    const timer = setTimeout(() => {
      scrollToCategory(anchor.replace('tools-category-', ''))
    }, 350)
    return () => clearTimeout(timer)
  }, [anchor, scrollToCategory])

  /**
   * ?tab=self_tools → 自动滚动到自研工具 + 3s 闪烁高亮
   */
  useEffect(() => {
    if (tabParam !== 'self_tools') return
    const el = selfToolsRef.current
    if (!el) return

    // 1. 滚动到自研工具区块
    const t1 = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 200)

    // 2. 添加 3s 闪烁高亮
    el.classList.add('ring-4', 'ring-amber-400', 'animate-pulse', 'rounded-xl')
    const t2 = setTimeout(() => {
      el.classList.remove('ring-4', 'ring-amber-400', 'animate-pulse', 'rounded-xl')
    }, 3000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      el.classList.remove('ring-4', 'ring-amber-400', 'animate-pulse', 'rounded-xl')
    }
  }, [tabParam])

  return (
    <>
      {/* ════════ 来自指南页的提示横幅 ═══════ */}
      {fromGuide && (
        <section className="mb-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50 via-amber-50 to-orange-50 border border-emerald-200 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl flex-shrink-0">🎁</span>
                <div className="min-w-0">
                  <div className="text-xs md:text-sm font-extrabold text-emerald-700">
                    已为你筛选「{fromGuideHint}」专属工具
                  </div>
                  <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">
                    来自学习方案的智能推荐
                  </div>
                </div>
              </div>
              <Link
                href={`/guide/${fromGuide}`}
                className="text-[10px] font-bold text-emerald-700 hover:underline flex-shrink-0"
              >
                返回学习方案 →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════ 6 大核心分类（横向滚动 · 移动端友好）══════ */}
      <section className="mb-4 -mx-4">
        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide gap-3 px-4 pb-2">
          {SCENE_FILTERS.map((s) => {
            const isActive =
              briefHighlight === s.slug ||
              (s.slug === 'self-tools' && tabParam === 'self_tools')
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => handleSceneClick(s.slug)}
                className={`flex-shrink-0 bg-white/50 border rounded-full px-4 py-2 text-sm font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/30'
                    : 'border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* ════════ 数据统计胶囊（保留）══════ */}
      <section className="mb-5 flex justify-center">
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-slate-200 text-xs flex items-center gap-2 text-slate-700">
          <span>📚</span>
          <span className="font-medium">已收录 50+ 平台与工具</span>
          <span className="text-slate-300">|</span>
          <span>覆盖 4 大 OPC 赛道</span>
        </div>
      </section>

      {/* 工具库具体内容（9 个子分类 + 平台卡片） */}
      <MarketContent
        defaultTab="tools"
        standalone={false}
        highlightCategory={highlightCategory}
        briefHighlight={briefHighlight}
        selfToolsRef={selfToolsRef}
      />
    </>
  )
}
