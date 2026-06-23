'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Sparkles,
  Check,
  Loader2,
  Rocket,
  Shield,
  Users,
  TrendingUp,
  Lightbulb,
  Tag,
  DollarSign,
  FileText,
  Briefcase,
  Building2,
} from 'lucide-react'

const CATEGORIES = [
  { value: 'content', label: '内容创作', icon: '✍️' },
  { value: 'service', label: '本地服务', icon: '🏪' },
  { value: 'agency', label: '代运营/代办', icon: '📈' },
  { value: 'education', label: '知识付费', icon: '🎓' },
  { value: 'ecom', label: '私域/电商', icon: '🛒' },
  { value: 'tools', label: '工具/SaaS', icon: '⚙️' },
  { value: 'consulting', label: '咨询/陪跑', icon: '💼' },
  { value: 'other', label: '其他', icon: '🌟' },
]

export default function ProjectSubmitPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    contactName: '',
    contactInfo: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.title || !form.description || !form.category) {
      setError('请完整填写项目信息')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/console/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          content: form.content,
          category: form.category,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || '提交失败')
      }
    } catch (e: any) {
      setError(e.message || '网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-5 py-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6"
        >
          <ArrowLeft size={14} />
          返回项目库
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
            <Lightbulb size={14} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-600">项目方招募</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            把你的{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              创业项目
            </span>{' '}
            放入 OPC
          </h1>
          <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto">
            对接 70+ 企业客户与 500+ 创业者社群
          </p>
        </motion.div>

        {/* 💰 分润说明横幅（重点） */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-2xl p-5 mb-6 shadow-xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="relative text-white">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-yellow-200" />
              <span className="text-xs font-bold text-yellow-200">💎 分润机制</span>
            </div>
            <h2 className="text-lg font-bold mb-2">
              您的项目或工具通过 OPC 平台成交后，可获得{' '}
              <span className="text-yellow-200 text-2xl mx-1">85%</span>
              的订单收益
            </h2>
            <p className="text-sm text-white/90">
              剩余 15% 作为平台与主理人的推广佣金
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
              <div className="bg-white/15 backdrop-blur rounded-lg p-2">
                <div className="text-yellow-200 font-bold text-base">85%</div>
                <div className="text-white/80 mt-0.5">项目方所得</div>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-lg p-2">
                <div className="text-yellow-200 font-bold text-base">10%</div>
                <div className="text-white/80 mt-0.5">平台运营</div>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-lg p-2">
                <div className="text-yellow-200 font-bold text-base">5%</div>
                <div className="text-white/80 mt-0.5">推荐主理人</div>
              </div>
            </div>
          </div>
        </motion.div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-10 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
              <Check size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">项目已提交审核！</h2>
            <p className="text-sm text-gray-600 mb-6">
              我们将在 3 个工作日内完成审核，审核通过后将立即上架项目库。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/projects"
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50"
              >
                返回项目库
              </Link>
              <button
                onClick={() => {
                  setSuccess(false)
                  setForm({ title: '', description: '', content: '', category: '', contactName: '', contactInfo: '' })
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-xl"
              >
                继续提交
              </button>
            </div>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600" />
              项目信息
            </h2>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <FileText size={12} /> 项目名称 <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="例：本地餐饮店 AI 探店代运营"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                  <Tag size={12} /> 项目分类 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm({ ...form, category: c.value })}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        form.category === c.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{c.icon}</div>
                      <div className="text-xs font-bold text-gray-900">{c.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <Sparkles size={12} /> 项目亮点 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="一句话说清楚你的项目解决什么问题、目标客户是谁、收益模式..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <Briefcase size={12} /> 项目详情（SOP/服务流程/案例）
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="详细描述您的项目 SOP、可量化的案例数据、工具栈..."
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">联系人</label>
                  <input
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    placeholder="您的姓名"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">联系方式</label>
                  <input
                    value={form.contactInfo}
                    onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                    placeholder="手机号或微信号"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Rocket size={16} />
                    提交项目入驻申请
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Users, title: '精准客户', desc: '70+ 企业 + 500+ 创业者' },
            { icon: Shield, title: '平台担保', desc: '订单 85% 归项目方' },
            { icon: TrendingUp, title: '持续曝光', desc: '首页推荐 + 社群分发' },
          ].map((b, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <b.icon size={16} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">{b.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
