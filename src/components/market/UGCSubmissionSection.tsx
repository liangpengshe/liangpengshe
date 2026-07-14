'use client'

/**
 * 资源库 · OPC 共创 UGC 投稿列表 Section（任务 3）
 * ------------------------------------------------------------
 * 位置：资源库 tab 6 大板块下方
 *
 * 功能：
 *   1. 拉取 /api/resources/submissions 获取已通过投稿
 *   2. 按 4 大可投稿分类展示（与原 4 张卡片一一对应）
 *   3. 投稿卡片显示"👍 实用指数"（平均评分，1 位小数）
 *   4. 点击投稿卡片 → /market/resources/[id] 详情页
 *
 * 设计目标：
 *   - 与原 6 张卡片视觉风格统一（圆角/阴影/色条/标签）
 *   - 4 大分类各自独立 subsection，可分别定位
 *   - loading / empty / error 三态完善
 * ------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  ThumbsUp,
  Loader2,
  ChevronRight,
  Star,
  User as UserIcon,
  ArrowRight,
} from 'lucide-react'
import {
  CATEGORY_LABELS,
  CATEGORY_EMOJI,
  type ResourceCategory,
} from '@/lib/resource-categories'

interface UGCSubmission {
  id: string
  title: string
  description: string
  category: ResourceCategory
  authorName: string | null
  authorLevel: string | null
  fileUrl: string | null
  createdAt: string
  rating: { average: number; count: number }
}

interface UGCSectionProps {
  /** 可选：只显示特定分类的投稿（默认显示全部 4 大分类） */
  onlyCategory?: ResourceCategory
  /** 可选：投稿数量上限 */
  limit?: number
}

const CATEGORY_STYLES: Record<
  ResourceCategory,
  { borderTop: string; iconBg: string; accent: string; chip: string }
> = {
  'physical-prod': {
    borderTop: 'border-t-emerald-500',
    iconBg: 'bg-emerald-50',
    accent: 'text-emerald-600',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  'ai-software': {
    borderTop: 'border-t-purple-500',
    iconBg: 'bg-purple-50',
    accent: 'text-purple-600',
    chip: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  'ai-hardware': {
    borderTop: 'border-t-amber-500',
    iconBg: 'bg-amber-50',
    accent: 'text-amber-600',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  'ai-courses': {
    borderTop: 'border-t-rose-500',
    iconBg: 'bg-rose-50',
    accent: 'text-rose-600',
    chip: 'bg-rose-50 text-rose-700 border-rose-200',
  },
}

export function UGCSubmissionSection({ onlyCategory, limit = 4 }: UGCSectionProps) {
  const [items, setItems] = useState<UGCSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/resources/submissions?limit=${limit * 4}`)
      .then((r) => r.json())
      .then((resp) => {
        if (cancelled) return
        if (resp.success) {
          setItems(resp.data || [])
        } else {
          setError(resp.error || '加载失败')
        }
      })
      .catch((e) => {
        if (cancelled) return
        setError((e as Error).message || '网络异常')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [limit])

  /** 按 category 分组 */
  const grouped = useMemo(() => {
    const out: Record<ResourceCategory, UGCSubmission[]> = {
      'physical-prod': [],
      'ai-software': [],
      'ai-hardware': [],
      'ai-courses': [],
    }
    for (const item of items) {
      if (out[item.category]) out[item.category].push(item)
    }
    return out
  }, [items])

  /** 决定要展示的分类列表 */
  const categoriesToShow: ResourceCategory[] = onlyCategory
    ? [onlyCategory]
    : (['physical-prod', 'ai-software', 'ai-hardware', 'ai-courses'] as const)

  return (
    <div className="mt-10 space-y-8">
      {/* Section 头部 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 border border-blue-100 p-4 md:p-5">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">
            <Sparkles size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-extrabold tracking-widest uppercase text-blue-700 mb-0.5">
              OPC 共创 · 社区精选
            </div>
            <h3 className="text-base md:text-lg font-extrabold text-slate-900 leading-tight">
              🌱 OPC 生态成员投稿的实战资源
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              主理人 / 资深运营真实操盘过的工具与教程 · 含评分、评论、实操笔记
            </p>
          </div>
        </div>
      </div>

      {/* 加载 / 错误 / 空态 */}
      {loading && (
        <div className="py-10 flex flex-col items-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" size={28} />
          <p className="text-sm">正在加载 OPC 共创资源...</p>
        </div>
      )}
      {!loading && error && (
        <div className="py-8 text-center">
          <p className="text-sm text-rose-600 mb-3">⚠️ {error}</p>
        </div>
      )}

      {/* 4 大分类 subsection */}
      {!loading && !error && (
        <>
          {categoriesToShow.map((cat) => {
            const list = grouped[cat] || []
            if (list.length === 0) {
              // 没有投稿数据时显示空态
              return (
                <div key={cat}>
                  <CategoryHeader
                    category={cat}
                    style={CATEGORY_STYLES[cat]}
                    count={0}
                  />
                  <div className="mt-3 p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                    <div className="text-3xl mb-2 opacity-50">{CATEGORY_EMOJI[cat]}</div>
                    <p className="text-xs text-slate-500">
                      暂无 {CATEGORY_LABELS[cat]} 投稿
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      点击底部"立即上架"分享您的资源
                    </p>
                  </div>
                </div>
              )
            }
            return (
              <div key={cat}>
                <CategoryHeader
                  category={cat}
                  style={CATEGORY_STYLES[cat]}
                  count={list.length}
                />
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                  {list.slice(0, limit).map((s) => (
                    <UGCSubmissionCard
                      key={s.id}
                      item={s}
                      style={CATEGORY_STYLES[cat]}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {items.length === 0 && (
            <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-dashed border-blue-200 rounded-2xl text-center">
              <div className="text-4xl mb-2">🌱</div>
              <p className="text-sm font-bold text-slate-700 mb-1">还没有投稿，成为第一个吧！</p>
              <p className="text-[11px] text-slate-500">
                点击底部"立即上架"按钮，分享您的资源
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CategoryHeader({
  category,
  style,
  count,
}: {
  category: ResourceCategory
  style: (typeof CATEGORY_STYLES)[ResourceCategory]
  count: number
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg ${style.iconBg} flex items-center justify-center text-base`}
      >
        {CATEGORY_EMOJI[category]}
      </div>
      <h4 className="text-sm font-extrabold text-slate-900">
        {CATEGORY_LABELS[category]}
      </h4>
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${style.chip}`}
      >
        {count} 个
      </span>
      <div className="ml-auto text-[10px] text-slate-400 flex items-center gap-0.5">
        社区精选
        <ChevronRight size={10} />
      </div>
    </div>
  )
}

function UGCSubmissionCard({
  item,
  style,
}: {
  item: UGCSubmission
  style: (typeof CATEGORY_STYLES)[ResourceCategory]
}) {
  const rating = item.rating?.average || 0
  const ratingCount = item.rating?.count || 0
  const isRated = ratingCount > 0

  return (
    <Link
      href={`/market/resources/${item.id}`}
      className={`group relative block bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-3.5 border border-t-4 ${style.borderTop} border-slate-100`}
    >
      {/* 顶部：标题 + 评分 */}
      <div className="flex items-start gap-2 mb-2">
        <h5 className="flex-1 min-w-0 text-sm font-bold text-slate-900 leading-snug line-clamp-2">
          {item.title}
        </h5>
        {isRated && (
          <div className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
            <Star size={9} className="text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-extrabold text-amber-700">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* 描述 */}
      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 min-h-[2.6em]">
        {item.description}
      </p>

      {/* 底部：作者 + 实用指数 */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1 min-w-0 text-[10px] text-slate-500">
          <UserIcon size={10} className="flex-shrink-0" />
          <span className="truncate font-bold">
            {item.authorName || 'OPC 成员'}
          </span>
          {item.authorLevel && (
            <span className="flex-shrink-0 text-[9px] font-extrabold px-1 py-0.5 rounded bg-slate-100 text-slate-600">
              {item.authorLevel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold">
          <ThumbsUp size={10} className={style.accent} />
          <span className={style.accent}>
            {isRated ? `${rating} 分 · ${ratingCount}评` : '待评分'}
          </span>
        </div>
      </div>

      {/* 鼠标悬停箭头 */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight size={12} className="text-slate-400" />
      </div>
    </Link>
  )
}
