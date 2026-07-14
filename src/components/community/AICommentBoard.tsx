'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Send,
  X,
  ThumbsUp,
  Loader2,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Hash,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  slug: string
  userName: string
  content: string
  stage?: string
  stuckKeywords: string[]
  clusterId: string
  createdAt: string
  helpfulCount: number
}

interface Cluster {
  clusterId: string
  count: number
  keywords: string[]
  sample: { userName: string; content: string }
}

/**
 * AI 轻互动留言板
 * ------------------------------------------------------------
 * 核心交互：
 *   1. 用户写下"我正在做这个项目，遇到一个选品卡点..."
 *   2. 系统自动归类到该 [slug] 的卡点池
 *   3. 同 slug 的其他 OPC 可看到推送提醒
 *   4. AI 每周汇总成《OPC 实战避坑合集》
 */
export function AICommentBoard({
  slug,
  title = 'AI 轻互动留言板',
  variant = 'full',
}: {
  slug: string
  title?: string
  variant?: 'full' | 'inline'
}) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [text, setText] = useState('')
  const [stage, setStage] = useState('')
  const [filterCluster, setFilterCluster] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = async (cluster = '') => {
    setLoading(true)
    try {
      const url = `/api/community/comments?slug=${encodeURIComponent(slug)}${
        cluster ? `&cluster=${encodeURIComponent(cluster)}` : ''
      }`
      const res = await fetch(url)
      const json = await res.json()
      if (json.success) {
        setComments(json.data.list)
        setClusters(json.data.clusters)
        setTotal(json.data.total)
      }
    } catch {
      // 静默
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) load(filterCluster)
  }, [open, filterCluster])

  const handleSubmit = async () => {
    setError(null)
    if (text.trim().length < 5) {
      setError('留言至少 5 个字')
      return
    }
    setSubmitting(true)
    try {
      // 读取用户信息
      let userId = 'anon'
      let userName = '匿名 OPC'
      try {
        const raw = localStorage.getItem('opc_user_profile')
        if (raw) {
          const p = JSON.parse(raw)
          userId = p?.id || p?.phone || 'anon'
          userName = p?.nickname || p?.name || userName
        }
      } catch {
        // 静默
      }

      const res = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          content: text,
          stage: stage || undefined,
          userId,
          userName,
        }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || '提交失败')
        return
      }
      setText('')
      setStage('')
      // 刷新列表
      load(filterCluster)
    } catch (e: any) {
      setError(e?.message || '网络异常')
    } finally {
      setSubmitting(false)
    }
  }

  // inline 模式：仅显示触发按钮 + 点击展开
  if (variant === 'inline') {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
        >
          <MessageCircle size={12} />
          写下卡点
          {total > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-extrabold rounded-full">
              {total}
            </span>
          )}
        </button>
        <CommentModal
          open={open}
          onClose={() => setOpen(false)}
          slug={slug}
          title={title}
        />
      </>
    )
  }

  // full 模式：直接渲染面板
  return (
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-5">
      <CommentBody
        slug={slug}
        title={title}
        text={text}
        setText={setText}
        stage={stage}
        setStage={setStage}
        error={error}
        submitting={submitting}
        handleSubmit={handleSubmit}
        loading={loading}
        comments={comments}
        clusters={clusters}
        total={total}
        filterCluster={filterCluster}
        setFilterCluster={setFilterCluster}
      />
    </section>
  )
}

// 模态框版本（自包含 state：复用父组件的留言数据）
function CommentModal({
  open,
  onClose,
  slug,
  title,
}: {
  open: boolean
  onClose: () => void
  slug: string
  title: string
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [text, setText] = useState('')
  const [stage, setStage] = useState('')
  const [filterCluster, setFilterCluster] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = async (cluster = '') => {
    setLoading(true)
    try {
      const url = `/api/community/comments?slug=${encodeURIComponent(slug)}${
        cluster ? `&cluster=${encodeURIComponent(cluster)}` : ''
      }`
      const res = await fetch(url)
      const json = await res.json()
      if (json.success) {
        setComments(json.data.list)
        setClusters(json.data.clusters)
        setTotal(json.data.total)
      }
    } catch {
      // 静默
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) load(filterCluster)
  }, [open, filterCluster, slug])

  const handleSubmit = async () => {
    setError(null)
    if (text.trim().length < 5) {
      setError('留言至少 5 个字')
      return
    }
    setSubmitting(true)
    try {
      let userId = 'anon'
      let userName = '匿名 OPC'
      if (typeof window !== 'undefined') {
        userId = window.localStorage.getItem('opc_device_id') || userId
        userName =
          window.localStorage.getItem('opc_user_name') ||
          window.localStorage.getItem('opc_user_phone') ||
          userName
      }
      const res = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, userId, userName, content: text.trim(), stage }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || '提交失败')
        return
      }
      setText('')
      setStage('')
      load(filterCluster)
    } catch (e: any) {
      setError(e?.message || '网络异常')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cmt-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="w-full md:max-w-2xl md:max-h-[85vh] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <MessageCircle size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
                  <p className="text-[10px] text-slate-500">写下你的卡点，AI 自动归类</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center"
                aria-label="关闭"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-5">
              <CommentBody
                slug={slug}
                title={title}
                text={text}
                setText={setText}
                stage={stage}
                setStage={setStage}
                error={error}
                submitting={submitting}
                handleSubmit={handleSubmit}
                loading={loading}
                comments={comments}
                clusters={clusters}
                total={total}
                filterCluster={filterCluster}
                setFilterCluster={setFilterCluster}
                embedded
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 公共内容组件
function CommentBody({
  slug,
  title,
  text,
  setText,
  stage,
  setStage,
  error,
  submitting,
  handleSubmit,
  loading,
  comments,
  clusters,
  total,
  filterCluster,
  setFilterCluster,
  embedded = false,
}: {
  slug: string
  title: string
  text: string
  setText: (v: string) => void
  stage: string
  setStage: (v: string) => void
  error: string | null
  submitting: boolean
  handleSubmit: () => void
  loading: boolean
  comments: Comment[]
  clusters: Cluster[]
  total: number
  filterCluster: string
  setFilterCluster: (v: string) => void
  embedded?: boolean
}) {
  void title
  return (
    <div>
      {/* 顶部统计 + 卡点聚类 */}
      <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Users size={12} className="text-indigo-500" />
          <span>
            <strong className="text-slate-900">{total}</strong> 位 OPC 留下过卡点
          </span>
        </div>
        {clusters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterCluster('')}
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors',
                filterCluster === ''
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              全部
            </button>
            {clusters.map((c) => (
              <button
                key={c.clusterId}
                type="button"
                onClick={() => setFilterCluster(c.clusterId)}
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors inline-flex items-center gap-0.5',
                  filterCluster === c.clusterId
                    ? 'bg-indigo-500 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                )}
              >
                <Hash size={9} />
                {c.keywords[0] || '通用'} × {c.count}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 留言输入区 */}
      <div className="mb-4 p-3 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100 rounded-xl">
        <div className="flex items-start gap-2 mb-2">
          <Sparkles size={14} className="text-indigo-500 mt-1 flex-shrink-0" />
          <p className="text-[11px] text-indigo-700 leading-relaxed">
            写下你做这个项目时遇到的卡点，AI 会自动归类、聚合相似问题，每周末汇总成《OPC 实战避坑合集》。
          </p>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="例：我正在做这个项目，遇到一个选品卡点..."
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5"
          >
            <option value="">选择卡点阶段（可选）</option>
            <option value="开店申请">开店申请</option>
            <option value="基础设置">基础设置</option>
            <option value="精准选品">精准选品</option>
            <option value="货品上架">货品上架</option>
            <option value="网店运营">网店运营</option>
            <option value="客服发货">客服发货</option>
            <option value="数据分析">数据分析</option>
            <option value="多店复制">多店复制</option>
            <option value="账号申请">账号申请</option>
            <option value="内容生成">内容生成</option>
            <option value="内容发布">内容发布</option>
            <option value="媒体运营">媒体运营</option>
          </select>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">{text.length} / 500</span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || text.trim().length < 5}
              className={cn(
                'inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors',
                submitting || text.trim().length < 5
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm'
              )}
            >
              {submitting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
              发送
            </button>
          </div>
        </div>
        {error && <p className="mt-1.5 text-[10px] text-rose-600 font-bold">{error}</p>}
      </div>

      {/* 留言列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          还没有 OPC 留言，来做第一个留下卡点的人吧 🚀
        </div>
      ) : (
        <div className="space-y-2.5">
          {comments.map((c) => (
            <div
              key={c.id}
              className="flex items-start gap-2.5 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs font-extrabold flex items-center justify-center">
                {c.userName.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">{c.userName}</span>
                  {c.stage && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      卡在：{c.stage}
                    </span>
                  )}
                  {c.stuckKeywords.slice(0, 2).map((k) => (
                    <span
                      key={k}
                      className="text-[9px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"
                    >
                      <Hash size={8} />
                      {k}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{c.content}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                  <span>{new Date(c.createdAt).toLocaleString('zh-CN')}</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-0.5 hover:text-indigo-600 transition-colors"
                  >
                    <ThumbsUp size={10} />
                    {c.helpfulCount}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// "其他 OPC 的热议"提醒组件（用在 SOP 页面顶部）
export function HotTopicsReminder({ slug, projectTitle }: { slug: string; projectTitle: string }) {
  const [open, setOpen] = useState(false)
  const [total, setTotal] = useState(0)
  const [topKeywords, setTopKeywords] = useState<string[]>([])

  useEffect(() => {
    if (!slug) return
    fetch(`/api/community/comments?slug=${encodeURIComponent(slug)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setTotal(json.data.total)
          setTopKeywords(json.data.clusters?.slice(0, 3).map((c: Cluster) => c.keywords[0]).filter(Boolean) || [])
        }
      })
      .catch(() => {})
  }, [slug])

  if (total === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full mt-3 flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-xl hover:shadow-md transition-all text-left"
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-sm">
          <MessageCircle size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-extrabold text-slate-900 leading-tight">
            🔥 其他 OPC 的热议
            <span className="ml-1.5 text-[10px] font-bold text-rose-600">({total} 条卡点)</span>
          </div>
          {topKeywords.length > 0 && (
            <div className="mt-0.5 flex flex-wrap items-center gap-1">
              <span className="text-[10px] text-slate-500">大家在聊：</span>
              {topKeywords.map((k) => (
                <span
                  key={k}
                  className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
      </button>
      <CommentModal
        open={open}
        onClose={() => setOpen(false)}
        slug={slug}
        title={`${projectTitle} · OPC 热议`}
      />
    </>
  )
}

// 占位导出：避免 tree-shake 报警
export const __components = { ChevronDown }

export default AICommentBoard
