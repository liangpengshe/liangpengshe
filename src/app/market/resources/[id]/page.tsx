/**
 * 资源库 · 投稿详情页（任务 3）
 * ------------------------------------------------------------
 * 路由：/market/resources/[id]
 * 功能：
 *   1. 资源详情（Markdown 渲染）
 *   2. 评分区（5 星打分 + 平均分 + 总评数）
 *   3. 评论区（跟帖评论）
 *   4. 实操笔记区（独立于评论之外）
 *   5. 底部固定双 CTA：返回资源库 + 我也要投稿
 *
 * 数据源：/api/resources/detail
 * 互动 API：/api/resources/interact
 * ------------------------------------------------------------
 */

'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Sparkles,
  Star,
  MessageCircle,
  NotebookPen,
  Send,
  Loader2,
  ChevronRight,
  User as UserIcon,
  Calendar,
  ExternalLink,
  CheckCircle2,
  ThumbsUp,
  Award,
  BookOpen,
  Lightbulb,
  FileText,
  Package,
  Cpu,
} from 'lucide-react'
import { renderMarkdown } from '@/lib/markdown'
import { CATEGORY_LABELS, type ResourceCategory } from '@/lib/resource-categories'
import { toast } from '@/components/Toast'

interface ResourceSubmissionRecord {
  id: string
  authorId: string
  authorName: string | null
  authorLevel: string | null
  title: string
  description: string
  category: ResourceCategory
  fileUrl: string | null
  status: string
  createdAt: string
}

interface InteractionRecord {
  id: string
  resourceId: string
  userId: string
  userName: string | null
  type: 'COMMENT' | 'REVIEW' | 'NOTE'
  content: string
  rating: number | null
  createdAt: string
}

interface DetailData {
  submission: ResourceSubmissionRecord
  rating: { average: number; count: number }
  stats: { COMMENT: number; REVIEW: number; NOTE: number }
  comments: InteractionRecord[]
  reviews: InteractionRecord[]
  notes: InteractionRecord[]
}

const CATEGORY_ICONS: Record<ResourceCategory, typeof Package> = {
  'physical-prod': Package,
  'ai-software': BookOpen,
  'ai-hardware': Cpu,
  'ai-courses': NotebookPen,
}

const CATEGORY_COLORS: Record<ResourceCategory, { gradient: string; chip: string; bg: string }> = {
  'physical-prod': { gradient: 'from-emerald-500 to-teal-600', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', bg: 'bg-emerald-50' },
  'ai-software': { gradient: 'from-purple-500 to-violet-600', chip: 'bg-purple-50 text-purple-700 border-purple-200', bg: 'bg-purple-50' },
  'ai-hardware': { gradient: 'from-amber-500 to-orange-600', chip: 'bg-amber-50 text-amber-700 border-amber-200', bg: 'bg-amber-50' },
  'ai-courses': { gradient: 'from-rose-500 to-pink-600', chip: 'bg-rose-50 text-rose-700 border-rose-200', bg: 'bg-rose-50' },
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

function getUserName(): string {
  if (typeof window === 'undefined') return 'OPC 成员'
  return window.localStorage.getItem('opc_user_name') || 'OPC 成员'
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return iso
  }
}

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id || ''
  const router = useRouter()

  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 互动输入
  const [newComment, setNewComment] = useState('')
  const [newNote, setNewNote] = useState('')
  const [hoverRating, setHoverRating] = useState(0)
  const [myRating, setMyRating] = useState(0)
  const [actingType, setActingType] = useState<'COMMENT' | 'NOTE' | 'REVIEW' | null>(null)

  /** 加载详情 */
  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/resources/detail?id=${encodeURIComponent(id)}`)
      const resp = await res.json()
      if (resp.success) {
        setData(resp.data)
      } else {
        setError(resp.error || '加载失败')
      }
    } catch (e) {
      setError((e as Error).message || '网络异常')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // 任务 3：动态注入 SEO 描述（Dify 自动生成 150 字摘要 + 关键词）
  const submission = data?.submission
  useEffect(() => {
    if (!submission) return
    if (typeof document === 'undefined') return
    const descId = 'opc-resource-seo-desc'
    let meta = document.getElementById(descId) as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.id = descId
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    const kwId = 'opc-resource-seo-kw'
    let metaKw = document.getElementById(kwId) as HTMLMetaElement | null
    if (!metaKw) {
      metaKw = document.createElement('meta')
      metaKw.id = kwId
      metaKw.setAttribute('name', 'keywords')
      document.head.appendChild(metaKw)
    }
    // 调用 Dify 描述生成 API（24h 缓存）
    const controller = new AbortController()
    const sub = submission
    fetch('/api/resources/seo-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        resourceId: sub.id,
        title: sub.title,
        category: sub.category,
        content: (sub.description || '').slice(0, 500),
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          meta?.setAttribute('content', json.data.description)
          if (Array.isArray(json.data.keywords)) {
            metaKw?.setAttribute('content', json.data.keywords.join(','))
          }
        }
      })
      .catch(() => {
        // 兜底：使用资源自带的 description
        if (sub.description) {
          meta?.setAttribute('content', sub.description.slice(0, 150))
        }
      })
    return () => controller.abort()
  }, [submission])

  /**
   * 提交评分
   */
  const submitRating = async (rating: number) => {
    if (!rating || actingType) return
    setMyRating(rating)
    setActingType('REVIEW')
    try {
      const res = await fetch('/api/resources/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: id,
          userId: getDeviceId(),
          userName: getUserName(),
          type: 'REVIEW',
          content: '用户评分',
          rating,
        }),
      })
      const resp = await res.json()
      if (resp.success) {
        await load() // 重新拉取以更新平均分
        toast.success('评分提交成功！')
      } else {
        toast.error(resp.error || '评分失败')
      }
    } catch (e) {
      toast.error((e as Error).message || '网络异常')
    } finally {
      setActingType(null)
    }
  }

  /**
   * 提交评论
   */
  const submitComment = async () => {
    if (!newComment.trim() || actingType) return
    setActingType('COMMENT')
    try {
      const res = await fetch('/api/resources/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: id,
          userId: getDeviceId(),
          userName: getUserName(),
          type: 'COMMENT',
          content: newComment.trim(),
        }),
      })
      const resp = await res.json()
      if (resp.success) {
        setNewComment('')
        await load()
        toast.success('评论发布成功！')
      } else {
        toast.error(resp.error || '评论失败')
      }
    } catch (e) {
      toast.error((e as Error).message || '网络异常')
    } finally {
      setActingType(null)
    }
  }

  /**
   * 提交实操笔记
   */
  const submitNote = async () => {
    if (!newNote.trim() || actingType) return
    setActingType('NOTE')
    try {
      const res = await fetch('/api/resources/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: id,
          userId: getDeviceId(),
          userName: getUserName(),
          type: 'NOTE',
          content: newNote.trim(),
        }),
      })
      const resp = await res.json()
      if (resp.success) {
        setNewNote('')
        await load()
        toast.success('实操笔记发布成功！')
      } else {
        toast.error(resp.error || '发布失败')
      }
    } catch (e) {
      toast.error((e as Error).message || '网络异常')
    } finally {
      setActingType(null)
    }
  }

  // Markdown 渲染（详情描述）
  const descriptionHtml = useMemo(
    () => renderMarkdown(data?.submission.description || ''),
    [data?.submission.description]
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-blue-500" size={32} />
          <p className="mt-3 text-sm text-slate-500">加载资源详情...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-rose-50 flex items-center justify-center">
            <FileText size={28} className="text-rose-500" />
          </div>
          <p className="text-sm font-bold text-slate-900 mb-1">资源不存在或已下架</p>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <Link
            href="/market/resources"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-xl"
          >
            <ArrowLeft size={14} />
            返回资源库
          </Link>
        </div>
      </div>
    )
  }

  const sub = data.submission
  const cat = sub.category
  const Icon = CATEGORY_ICONS[cat]
  const colors = CATEGORY_COLORS[cat]
  const { average, count } = data.rating

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* 顶部 Hero */}
      <div
        className={`relative bg-gradient-to-br ${colors.gradient} text-white overflow-hidden`}
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative max-w-3xl md:mx-auto px-4 md:px-6 pt-4 pb-6">
          {/* 顶部导航 */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/market/resources"
              className="inline-flex items-center gap-1 text-white/85 hover:text-white text-xs font-bold"
            >
              <ArrowLeft size={14} />
              返回资源库
            </Link>
            <Link
              href="/market/resources"
              className="text-[10px] text-white/70 hover:text-white font-bold"
            >
              资源库 →
            </Link>
          </div>

          {/* 分类 + 标题 */}
          <div className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl ${colors.bg} text-white flex items-center justify-center`}
            >
              <Icon size={24} className="md:w-7 md:h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/20 backdrop-blur">
                  {CATEGORY_LABELS[cat]}
                </span>
                {sub.status === 'APPROVED' && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/30 backdrop-blur inline-flex items-center gap-0.5">
                    <CheckCircle2 size={9} />
                    已通过审核
                  </span>
                )}
              </div>
              <h1 className="text-base md:text-lg font-extrabold leading-tight">
                {sub.title}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-white/85 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <UserIcon size={10} />
                  {sub.authorName || 'OPC 成员'}
                </span>
                {sub.authorLevel && (
                  <span className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-extrabold">
                    {sub.authorLevel} OPC
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar size={10} />
                  {formatTime(sub.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* 平均评分 */}
          {count > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i <= Math.round(average)
                        ? 'text-amber-300 fill-amber-300'
                        : 'text-white/40'
                    }
                  />
                ))}
              </div>
              <span className="text-xs font-extrabold">{average.toFixed(1)}</span>
              <span className="text-[10px] text-white/80">· {count} 评</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl md:mx-auto px-4 md:px-6 py-5 space-y-5">
        {/* 资源详情（Markdown 渲染） */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-1.5">
            <FileText size={14} className="text-blue-500" />
            资源详情
          </h2>
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
          {sub.fileUrl && (
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] font-extrabold tracking-widest uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                <ExternalLink size={10} />
                资源链接
              </div>
              <a
                href={sub.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all font-bold"
              >
                {sub.fileUrl}
              </a>
            </div>
          )}
        </section>

        {/* 评分区（任务 3） */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-1.5">
            <ThumbsUp size={14} className="text-amber-500" />
            实用指数
            <span className="text-[10px] font-normal text-slate-500 ml-auto">
              {count > 0 ? `共 ${count} 人评分` : '成为第一个评分的人'}
            </span>
          </h2>

          {/* 我的评分 */}
          <div className="flex items-center gap-3 mb-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="text-[11px] font-bold text-amber-900 flex-shrink-0">
              我的评分
            </div>
            <div className="flex items-center gap-1 flex-1">
              {[1, 2, 3, 4, 5].map((i) => {
                const filled = i <= (hoverRating || myRating)
                return (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => submitRating(i)}
                    disabled={actingType === 'REVIEW'}
                    className="p-0.5 hover:scale-110 transition-transform disabled:cursor-not-allowed"
                  >
                    <Star
                      size={22}
                      className={
                        filled
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }
                    />
                  </button>
                )
              })}
            </div>
            {actingType === 'REVIEW' && (
              <Loader2 size={14} className="animate-spin text-amber-500" />
            )}
          </div>

          {/* 历史评分列表 */}
          {data.reviews.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-extrabold tracking-widest uppercase text-slate-500 flex items-center gap-1">
                <Star size={10} />
                评分历史
              </div>
              {data.reviews.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                >
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={10}
                        className={
                          i <= (r.rating || 0)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">
                    {r.userName || 'OPC 成员'}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {formatTime(r.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 评论区（任务 3） */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-1.5">
            <MessageCircle size={14} className="text-blue-500" />
            评论区
            <span className="text-[10px] font-normal text-slate-500 ml-auto">
              {data.stats.COMMENT} 条
            </span>
          </h2>

          {/* 评论输入 */}
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="说点什么...（讨论使用心得、提问、补充信息）"
              rows={3}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={submitComment}
                disabled={!newComment.trim() || actingType === 'COMMENT'}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {actingType === 'COMMENT' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Send size={12} />
                )}
                发布评论
              </button>
            </div>
          </div>

          {/* 评论列表 */}
          {data.comments.length === 0 ? (
            <div className="py-6 text-center text-slate-400">
              <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs">暂无评论，来抢沙发吧</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.comments.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-extrabold">
                      {(c.userName || 'O').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {c.userName || 'OPC 成员'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {formatTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pl-8">
                    {c.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 实操笔记区（任务 3 · 独立于评论之外） */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-1.5">
            <NotebookPen size={14} className="text-rose-500" />
            实操笔记
            <span className="text-[10px] font-normal text-slate-500 ml-auto">
              {data.stats.NOTE} 篇
            </span>
            <span className="text-[10px] font-extrabold text-rose-600 ml-1">
              实战经验
            </span>
          </h2>

          {/* 笔记输入 */}
          <div className="mb-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="记录你的实操过程或上手避坑心得...（支持 Markdown）"
              rows={5}
              className="w-full px-3 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 resize-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Lightbulb size={10} />
                分享真实经历，让其他 OPC 少走弯路
              </p>
              <button
                type="button"
                onClick={submitNote}
                disabled={!newNote.trim() || actingType === 'NOTE'}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {actingType === 'NOTE' ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <NotebookPen size={12} />
                )}
                发布笔记
              </button>
            </div>
          </div>

          {/* 笔记列表 */}
          {data.notes.length === 0 ? (
            <div className="py-6 text-center text-slate-400">
              <NotebookPen size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs">还没有实操笔记</p>
              <p className="text-[10px] text-slate-400 mt-1">
                欢迎分享你的实战过程或避坑心得
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.notes.map((n) => (
                <article
                  key={n.id}
                  className="p-4 bg-gradient-to-br from-rose-50/50 to-pink-50/30 border border-rose-100 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center text-[10px] font-extrabold">
                      {(n.userName || 'O').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800">
                        {n.userName || 'OPC 成员'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatTime(n.createdAt)}
                      </div>
                    </div>
                    <Award size={12} className="text-rose-500" />
                  </div>
                  <div
                    className="text-sm text-slate-700 leading-relaxed pl-9"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(n.content) }}
                  />
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 底部固定双 CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 md:p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-3xl md:mx-auto flex items-center gap-2 md:gap-3">
          <Link
            href="/market/resources"
            className="flex-1 flex items-center justify-center gap-1.5 border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs md:text-sm font-extrabold px-3 py-3 rounded-xl transition-all min-h-[48px]"
          >
            <ArrowLeft size={14} />
            返回资源库
          </Link>
          <button
            type="button"
            onClick={() => router.push('/market/resources?action=submit')}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs md:text-sm font-extrabold px-3 py-3 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all min-h-[48px]"
          >
            <Sparkles size={14} />
            我也要投稿
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
