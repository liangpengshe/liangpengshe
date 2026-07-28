'use client'

/**
 * 专家咨询预约弹窗（任务 2-3-5）
 * ------------------------------------------------------------
 * 入口：AIAssistant 中的"📞 找专家"胶囊按钮
 * 行为：
 *   - 自动读取当前 pathname / projectSlug / currentStep 作为预填上下文
 *   - 提交时 POST /api/consultations，落 ConsultationRecord 线索池
 *   - 移动端 w-[90%] 适配 + 所有按钮 min-h-[44px]
 * ------------------------------------------------------------
 */

import { useEffect, useState } from 'react'
import { X, Phone, Loader2, CheckCircle2, AlertCircle, User, MessageSquare } from 'lucide-react'

export interface ExpertConsultationModalProps {
  open: boolean
  onClose: () => void
  /** 当前项目 slug（来自 pathname） */
  projectSlug?: string | null
  /** 当前项目标题（来自 AIAssistant 的 projectContext） */
  projectTitle?: string | null
  /** 当前步骤序号（0-indexed） */
  currentStep?: number | null
  /** 当前步骤标题（来自 lps:open-ai-assistant 事件） */
  stepTitle?: string | null
}

const PROJECT_TITLE_OVERRIDES: Record<string, string> = {
  'ai-digital-shop-group': 'AI 数字店群项目',
  'ai-no-stock-shop-group': 'AI 无货源店群项目',
  'ai-stock-shop-group': 'AI 有货源店群项目',
  'ai-cross-border': 'AI 跨境电商项目',
  'ai-self-media': 'AI 自媒体运营项目',
  'ai-digital-shop': 'AI 数字店项目',
  'ai-no-stock-physical-shop': 'AI 无货源实物店项目',
  'ai-branded-physical-shop': 'AI 品牌实物店项目',
}

function resolveProjectTitle(slug?: string | null, fallback?: string | null): string | null {
  if (fallback && fallback.trim() && fallback !== slug) return fallback
  if (slug && PROJECT_TITLE_OVERRIDES[slug]) return PROJECT_TITLE_OVERRIDES[slug]
  return slug || null
}

export default function ExpertConsultationModal({
  open,
  onClose,
  projectSlug,
  projectTitle,
  currentStep,
  stepTitle,
}: ExpertConsultationModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [issue, setIssue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const resolvedTitle = resolveProjectTitle(projectSlug, projectTitle)
  const contextHint = resolvedTitle
    ? `您当前正在处理的项目：${resolvedTitle}${typeof currentStep === 'number' ? `（第 ${currentStep + 1} 步${stepTitle ? `：${stepTitle}` : ''}）` : ''}`
    : ''

  // 打开时：表单字段重置 + 预填 issue
  useEffect(() => {
    if (!open) return
    setName('')
    setPhone('')
    setResult(null)
    // 默认 issue 提示（可被用户覆盖）
    if (contextHint) {
      setIssue(`[${contextHint}]\n我目前遇到的具体卡点：\n`)
    } else {
      setIssue('')
    }
    setSubmitting(false)
  }, [open, contextHint])

  // ESC 关闭
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, submitting, onClose])

  // 锁滚
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!name.trim()) {
      setResult({ ok: false, message: '请填写您的姓名' })
      return
    }
    if (!phone.trim() || !/^1[3-9]\d{9}$/.test(phone.trim())) {
      setResult({ ok: false, message: '请填写正确的 11 位手机号' })
      return
    }
    setSubmitting(true)
    setResult(null)
    try {
      const r = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          projectSlug: projectSlug || '',
          step: typeof currentStep === 'number' ? currentStep + 1 : 0,
          issue: issue.trim(),
        }),
      })
      const j = await r.json().catch(() => null)
      if (r.ok && j?.success) {
        setResult({
          ok: true,
          message: j.message || '预约成功，专家将在 1 小时内通过微信联系您。',
        })
        // 成功后 2s 自动关闭
        setTimeout(() => {
          if (typeof window !== 'undefined') onClose()
        }, 2000)
      } else {
        setResult({
          ok: false,
          message: j?.error || j?.message || '预约失败，请稍后重试',
        })
      }
    } catch {
      setResult({ ok: false, message: '网络异常，请稍后重试' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-6 animate-fade-in"
      onClick={() => !submitting && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="expert-modal-title"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-md max-h-[90vh] overflow-y-auto p-6 animate-slide-up"
      >
        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={() => !submitting && onClose()}
          disabled={submitting}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors disabled:opacity-50 min-h-[36px] min-w-[36px]"
          aria-label="关闭"
        >
          <X size={16} />
        </button>

        {/* 标题区 */}
        <div className="flex items-start gap-3 pr-8">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <Phone size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="expert-modal-title" className="text-base md:text-lg font-extrabold text-slate-900 leading-tight">
              📞 预约 15 分钟专家诊断
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              留下联系方式，专家 1 小时内主动加您微信
            </p>
          </div>
        </div>

        {/* 上下文提示行（任务 3：自动感知） */}
        {contextHint && (
          <div className="mt-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
            💡 {contextHint}
          </div>
        )}

        {/* 表单字段 */}
        <div className="mt-5 space-y-4">
          {/* 姓名 */}
          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5">
              <User size={12} />
              姓名 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="您的称呼"
              maxLength={20}
              required
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all min-h-[44px]"
            />
          </div>

          {/* 手机号 */}
          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5">
              <Phone size={12} />
              手机号 <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 11))}
              placeholder="方便专家微信联系您"
              maxLength={11}
              required
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all min-h-[44px] tabular-nums"
            />
          </div>

          {/* 当前卡点（任务 3：预填） */}
          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5">
              <MessageSquare size={12} />
              当前卡点
              <span className="text-slate-400 font-normal">（选填）</span>
            </label>
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="比如：开店申请提交不通过、灵犀 AI 选品不会用、流量起不来…"
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all resize-none"
            />
            <div className="mt-1 text-right text-[10px] text-slate-400">
              {issue.length}/500
            </div>
          </div>
        </div>

        {/* 提交反馈 */}
        {result && (
          <div
            className={`mt-4 px-3 py-2.5 rounded-xl text-xs font-bold flex items-start gap-2 ${
              result.ok
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {result.ok ? (
              <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            )}
            <span className="flex-1 leading-relaxed">{result.message}</span>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={submitting || result?.ok}
          className="mt-5 w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-extrabold px-5 py-3 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
        >
          {submitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              提交中…
            </>
          ) : result?.ok ? (
            <>
              <CheckCircle2 size={14} />
              已提交 · 自动关闭中
            </>
          ) : (
            <>
              <Phone size={14} />
              预约 15 分钟专家诊断 →
            </>
          )}
        </button>

        {/* 底部免责 */}
        <p className="mt-3 text-center text-[10px] text-slate-400 leading-relaxed">
          提交即代表您同意我们通过微信与您联系 · 信息将严格保密
        </p>
      </form>
    </div>
  )
}
