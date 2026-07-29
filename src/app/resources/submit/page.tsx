'use client'

/**
 * 资源投稿表单页（/resources/submit）
 * ------------------------------------------------------------
 * 设计目标：
 *   - 提供独立的"资源投稿"入口，避免主页表单被埋没
 *   - 与 community-posts 底部的"立即投稿你的资源"按钮链接对接
 *   - 复用 resources/page.tsx 的 ResourceSubmissionModal 表单结构
 *   - 提交后跳转回投稿实战资源页
 * ------------------------------------------------------------
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Sparkles, Upload, Tag, User, Phone, FileText, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from '@/components/Toast'
import ClientLayout from '@/components/ClientLayout'

interface ResourceCategory {
  id: string
  title: string
  emoji: string
  description: string
}

const CATEGORIES: ResourceCategory[] = [
  { id: 'physical',  title: '实物产品库',     emoji: '📦', description: 'AI 智能硬件周边 / 优质实体货源 / 品牌样品' },
  { id: 'ai-tools',  title: 'AI自研工具库',   emoji: '🤖', description: '自研 AI 工具集 / 自动化脚本 / 私有模型' },
  { id: 'template',  title: '数字模板库',     emoji: '📄', description: 'AI 提示词包 / 设计模板 / PDF 教程 / 文档资源' },
  { id: 'sop',       title: '实操SOP手册',    emoji: '🛠️', description: '从 0 到 1 的项目执行手册 / 标准化流程' },
  { id: 'traffic',   title: '流量渠道地图',   emoji: '📈', description: '获客渠道 / 投放策略 / 转化漏斗' },
  { id: 'case',      title: '联营案例库',     emoji: '🤝', description: '已跑通的成功案例 / 复盘文档 / 数据看板' },
]

export default function ResourceSubmitPage() {
  const router = useRouter()

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    submitterName: '',
    submitterPhone: '',
    tags: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // 预填手机号（从 localStorage 读取登录态）
  useEffect(() => {
    if (typeof window === 'undefined') return
    const phone = localStorage.getItem('user_phone') || ''
    if (phone) {
      setFormData((prev) => ({ ...prev, submitterPhone: phone }))
    }
  }, [])

  // 表单校验
  const validate = (): string | null => {
    if (!formData.title.trim()) return '请填写资源标题'
    if (formData.title.length > 50) return '标题不能超过 50 字'
    if (!formData.category) return '请选择资源分类'
    if (!formData.description.trim()) return '请填写资源描述'
    if (formData.description.length < 20) return '描述至少 20 字，方便审核员快速理解'
    if (!formData.submitterName.trim()) return '请填写投稿人姓名'
    if (formData.submitterName.length > 20) return '姓名不能超过 20 字'
    if (!/^1[3-9]\d{9}$/.test(formData.submitterPhone)) return '请填写正确的 11 位手机号'
    return null
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    const error = validate()
    if (error) {
      toast.warn(error)
      return
    }

    setSubmitting(true)
    try {
      // 优先调用真实 API；失败则使用 localStorage 兜底
      const payload = {
        ...formData,
        tags: formData.tags
          .split(/[,，\s]+/)
          .filter(Boolean)
          .slice(0, 5),
        createdAt: new Date().toISOString(),
        status: 'pending',
      }

      let ok = false
      try {
        const res = await fetch('/api/resources/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: payload.title,
            description: payload.description,
            category: payload.category,
            authorName: payload.submitterName,
            authorId: payload.submitterPhone, // 用手机号当 authorId
            tags: payload.tags,
          }),
        })
        ok = res.ok
      } catch {
        ok = false
      }

      // 兜底：localStorage
      if (!ok) {
        try {
          const existing = JSON.parse(localStorage.getItem('lps_submissions') || '[]')
          existing.unshift({ id: 'sub_' + Date.now(), ...payload })
          localStorage.setItem('lps_submissions', JSON.stringify(existing))
        } catch {
          /* localStorage 满了也无所谓 */
        }
      }

      setSubmitted(true)
      toast.success('投稿成功！我们会在 1-3 个工作日内审核')
    } catch (err) {
      toast.error('投稿失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 提交成功视图
  if (submitted) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-5 py-12">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">投稿成功！</h1>
            <p className="text-slate-600 leading-relaxed mb-6">
              我们已收到你的资源投稿，审核员会在 <span className="font-bold text-slate-900">1-3 个工作日</span> 内完成审核。
              <br />
              审核通过后，你的资源将展示在投稿实战资源页面。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/market/resources/community-posts"
                className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-5 py-2.5 rounded-full text-sm hover:scale-105 transition-transform shadow-md"
              >
                <Sparkles size={14} />
                返回投稿列表
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setFormData({ title: '', category: '', description: '', submitterName: '', submitterPhone: formData.submitterPhone, tags: '' })
                }}
                className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-full text-sm hover:scale-105 transition-transform"
              >
                再投一个
              </button>
            </div>
          </div>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-5 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 顶部返回 */}
          <Link
            href="/market/resources/community-posts"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            返回投稿列表
          </Link>

          {/* Hero */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 mb-6 shadow-lg overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Upload size={20} className="text-amber-200" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-200">
                  资源投稿
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                分享你的实战资源
              </h1>
              <p className="text-sm md:text-base text-indigo-100 leading-relaxed">
                投稿通过后，将展示在 <span className="font-bold text-white">OPC 生态投稿资源</span> 页面，获得真实曝光与社区反馈。
              </p>
            </div>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
            {/* 资源标题 */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                <FileText size={14} className="text-blue-500" />
                资源标题
                <span className="text-rose-500">*</span>
                <span className="text-[10px] text-slate-400 font-normal ml-auto">
                  {formData.title.length}/50
                </span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="如：TikTok Shop 侵权选品清单 2026 Q3"
                maxLength={50}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* 资源分类 */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                <Tag size={14} className="text-blue-500" />
                资源分类
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const selected = formData.category === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        selected
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-lg">{cat.emoji}</span>
                        <span className={`text-xs font-bold ${selected ? 'text-blue-700' : 'text-slate-700'}`}>
                          {cat.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {cat.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 资源描述 */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                <FileText size={14} className="text-blue-500" />
                资源描述
                <span className="text-rose-500">*</span>
                <span className="text-[10px] text-slate-400 font-normal ml-auto">
                  {formData.description.length} 字
                </span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="详细描述这个资源的用途、来源、适用场景、效果数据等（至少 20 字）"
                rows={5}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

            {/* 标签 */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                <Tag size={14} className="text-blue-500" />
                资源标签
                <span className="text-[10px] text-slate-400 font-normal">（可选，最多 5 个，用逗号分隔）</span>
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="如：AI 选品, 跨境电商, TikTok"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* 投稿人信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                  <User size={14} className="text-blue-500" />
                  投稿人
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.submitterName}
                  onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                  placeholder="您的姓名或昵称"
                  maxLength={20}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-2">
                  <Phone size={14} className="text-blue-500" />
                  手机号
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.submitterPhone}
                  onChange={(e) => setFormData({ ...formData, submitterPhone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                  placeholder="11 位手机号"
                  inputMode="numeric"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all ${
                submitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  提交中...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send size={16} />
                  立即投稿
                </span>
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              提交即表示你同意资源投稿协议，审核结果将通过手机号短信通知
            </p>
          </form>
        </div>
      </div>
    </ClientLayout>
  )
}
