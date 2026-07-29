'use client'

/**
 * 资源库 · 通用投稿模态框（任务 2）
 * ------------------------------------------------------------
 * 触发场景：用户点击资源库底部"立即上架 →"按钮
 *
 * 拦截逻辑：
 *   - 未登录 / 未注册 OPC → 弹"请先注册/登录 OPC"提示
 *   - 已注册 OPC（含未诊断用户）→ 打开投稿表单
 *
 * 提交限制：
 *   - 资源类别只能从 4 大可投稿分类中选（数字产品库 + 主理人招募禁止投稿）
 *   - 资源名称 100 字以内
 *   - 资源简介 2000 字以内
 *   - 下载/跳转链接：可选
 *
 * 引用方：
 *   - src/app/market/resources/page.tsx （底部"立即上架"按钮）
 * ------------------------------------------------------------
 */

import { useState } from 'react'
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Upload,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  Link2,
  FileText,
  Tag,
  User as UserIcon,
} from 'lucide-react'
import {
  SUBMITTABLE_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_EMOJI,
  type ResourceCategory,
} from '@/lib/resource-categories'

interface AuthorInfo {
  deviceId: string
  name: string
  opcLevel: string | null
  isRegistered: boolean
}

interface Props {
  author: AuthorInfo
  onClose: () => void
  onSuccess?: (submissionId: string) => void
}

export function ResourceSubmissionModal({ author, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ResourceCategory>('ai-self-tools')
  const [description, setDescription] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * 提交流程
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSuccess(null)

    if (!title.trim()) return setError('请填写资源名称')
    if (!description.trim()) return setError('请填写资源简介')
    if (description.trim().length < 20)
      return setError('资源简介至少 20 字，让审核员能快速理解资源价值')

    setSubmitting(true)
    try {
      const res = await fetch('/api/resources/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: author.deviceId,
          authorName: author.name,
          authorLevel: author.opcLevel,
          title: title.trim(),
          description: description.trim(),
          category,
          fileUrl: fileUrl.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(data.data?.id || 'submitted')
        onSuccess?.(data.data?.id || '')
        // 1.5s 后自动关闭
        setTimeout(() => onClose(), 1500)
      } else {
        setError(data.error || '投稿失败，请稍后再试')
      }
    } catch (err) {
      setError((err as Error).message || '网络异常')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部 Hero */}
        <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg"
          >
            ×
          </button>
          <div className="relative flex items-start gap-3">
            <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Upload size={22} className="md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-extrabold tracking-widest uppercase text-white/85 mb-0.5 flex items-center gap-1">
                <Sparkles size={10} />
                SUBMIT · 分享你的资源
              </div>
              <h3 className="text-base md:text-lg font-extrabold leading-tight">
                OPC 生态资源投稿
              </h3>
              <p className="text-[11px] text-white/85 mt-1 flex items-center gap-1">
                <UserIcon size={10} />
                来自：
                <span className="font-bold">{author.name}</span>
                {author.opcLevel && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[9px] font-extrabold">
                    {author.opcLevel} OPC
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 成功提示 */}
        {success && (
          <div className="p-5">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-base font-extrabold text-emerald-900 mb-1">
                投稿成功！🎉
              </h4>
              <p className="text-xs text-emerald-700 leading-relaxed">
                您的资源已进入审核队列，预计 1-3 个工作日内完成审核。
                <br />
                审核通过后将自动在资源库展示。
              </p>
            </div>
          </div>
        )}

        {/* 表单 */}
        {!success && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* 说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-[11px] text-blue-800 leading-relaxed">
                <strong>投稿须知：</strong>
                仅允许投稿 4 大分类（实物产品库 / AI自研工具库 / AI智能硬件库 / OPC生态资源库）。
                数字产品库、主理人招募为系统专营，禁止投稿。
              </div>
            </div>

            {/* 资源名称 */}
            <div>
              <label className="text-[11px] font-extrabold text-slate-700 mb-1.5 flex items-center gap-1">
                <FileText size={11} />
                资源名称
                <span className="text-rose-500">*</span>
                <span className="ml-auto text-slate-400 font-normal">{title.length}/100</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                placeholder="例如：AI 数字人直播话术包 v3.2"
                maxLength={100}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            {/* 资源类别 */}
            <div>
              <label className="text-[11px] font-extrabold text-slate-700 mb-1.5 flex items-center gap-1">
                <Tag size={11} />
                资源类别
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SUBMITTABLE_CATEGORIES.map((c) => {
                  const active = category === c
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                        active
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{CATEGORY_EMOJI[c]}</span>
                        <span
                          className={`text-[11px] font-bold ${
                            active ? 'text-blue-700' : 'text-slate-700'
                          }`}
                        >
                          {CATEGORY_LABELS[c]}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 资源简介 */}
            <div>
              <label className="text-[11px] font-extrabold text-slate-700 mb-1.5 flex items-center gap-1">
                <FileText size={11} />
                资源简介
                <span className="text-rose-500">*</span>
                <span className="ml-auto text-slate-400 font-normal">{description.length}/2000</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                placeholder="详细说明资源价值、适用场景、使用方法、效果数据等（至少 20 字）"
                rows={5}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
              />
            </div>

            {/* 下载链接 */}
            <div>
              <label className="text-[11px] font-extrabold text-slate-700 mb-1.5 flex items-center gap-1">
                <Link2 size={11} />
                下载 / 跳转链接
                <span className="text-slate-400 font-normal ml-1">（可选）</span>
              </label>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://pan.quark.cn/... 或 https://example.com/..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle size={14} className="text-rose-600 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-rose-700">{error}</p>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-3 text-xs text-slate-500 hover:text-slate-700 font-bold"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim() || !description.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 hover:from-blue-600 hover:via-indigo-600 hover:to-violet-700 text-white text-sm font-extrabold rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {submitting ? '投稿中...' : '立即投稿 · 等待审核'}
                <ChevronRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/**
 * 未登录拦截弹窗
 */
export function NeedLoginToSubmitModal({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-6 pb-5 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mb-1">
            请先注册/登录 OPC
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            投稿是 OPC 生态成员的专属权益。
            <br />
            注册后可分享您的资源，与生态成员共创。
          </p>
        </div>
        <div className="px-5 pb-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onLogin}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            立即注册 / 登录
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs text-slate-500 hover:text-slate-700"
          >
            暂不投稿
          </button>
        </div>
      </div>
    </div>
  )
}
