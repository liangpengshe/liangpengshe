'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Sparkles,
  Check,
  Loader2,
  Wrench,
  Globe,
  Tag,
  DollarSign,
  Link2,
  User,
  Phone,
  Rocket,
  Shield,
  Users,
  TrendingUp,
} from 'lucide-react'

const CATEGORIES = [
  { value: 'writing', label: '写作', desc: '文案 / 公众号 / AI 写作', icon: '✍️' },
  { value: 'image', label: '绘画', desc: 'AI 绘画 / 设计 / 配图', icon: '🎨' },
  { value: 'video', label: '视频', desc: 'AI 视频 / 数字人 / 剪辑', icon: '🎬' },
  { value: 'digital-human', label: '数字人', desc: '数字人 / 直播 / 配音', icon: '🤖' },
  { value: 'code', label: '开发', desc: 'AI 编程 / 低代码', icon: '💻' },
  { value: 'productivity', label: '效率', desc: '办公 / 协作 / 自动化', icon: '⚡' },
  { value: 'audio', label: '音频', desc: '配音 / 音乐 / 声音克隆', icon: '🎵' },
  { value: 'data', label: '数据', desc: 'BI / 爬虫 / 分析', icon: '📊' },
]

const PRICING = [
  { value: 'free', label: '免费', desc: '完全免费使用' },
  { value: 'freemium', label: '免费增值', desc: '基础免费，高级功能付费' },
  { value: 'subscription', label: '订阅制', desc: '月付 / 年付订阅' },
  { value: 'one-time', label: '买断制', desc: '一次性付费永久使用' },
  { value: 'enterprise', label: '企业定制', desc: '按团队 / 企业报价' },
]

export default function ToolSubmitPage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    officialUrl: '',
    pricingModel: '',
    affiliateLink: '',
    contactName: '',
    contactInfo: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name || !form.description || !form.category || !form.officialUrl || !form.pricingModel) {
      setError('请完整填写带 * 的必填项')
      return
    }
    try {
      new URL(form.officialUrl)
    } catch {
      setError('官网链接格式不正确（需以 http/https 开头）')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/tools/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || '提交失败，请重试')
      }
    } catch (err: any) {
      setError(err.message || '网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-5 py-8">
      <div className="max-w-3xl mx-auto">
        {/* 返回 */}
        <Link
          href="/tools"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          返回工具库
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
            <Wrench size={14} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-600">工具开发者招募</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            把你的{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              AI 工具
            </span>{' '}
            放进良朋社
          </h1>
          <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto">
            对接 70+ 企业和 500+ 创业者 · 共享品牌曝光与精准用户
          </p>
        </motion.div>

        {/* 💰 分润说明横幅 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-2xl p-5 mb-6 shadow-xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="relative text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-yellow-200" />
              <span className="text-xs font-bold text-yellow-200">💎 分润机制</span>
            </div>
            <h2 className="text-base md:text-lg font-bold mb-1.5">
              您的项目或工具通过 OPC 平台成交后，可获得{' '}
              <span className="text-yellow-200 text-2xl mx-1">85%</span>
              的订单收益
            </h2>
            <p className="text-xs md:text-sm text-white/90">
              剩余 15% 作为平台与主理人的推广佣金
            </p>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
              <div className="bg-white/15 backdrop-blur rounded-lg p-2">
                <div className="text-yellow-200 font-bold text-base">85%</div>
                <div className="text-white/80 mt-0.5">工具方所得</div>
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

        {/* 数据条 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { num: '70+', label: '企业客户' },
            { num: '500+', label: '创业者用户' },
            { num: '5000+', label: '月活社群' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {s.num}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-10 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
              <Check size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">提交成功！</h2>
            <p className="text-sm text-gray-600 mb-6">
              我们的工具审核团队将在 3 个工作日内完成审核，
              <br />
              审核结果将通过您填写的联系方式通知您。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/tools"
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50"
              >
                返回工具库
              </Link>
              <button
                onClick={() => {
                  setSuccess(false)
                  setForm({
                    name: '',
                    description: '',
                    category: '',
                    officialUrl: '',
                    pricingModel: '',
                    affiliateLink: '',
                    contactName: '',
                    contactInfo: '',
                  })
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-xl"
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
              工具提交信息
            </h2>

            <div className="space-y-5">
              {/* 工具名称 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <Tag size={12} /> 工具名称 <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="例：智谱 AI 助手"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              {/* 官网链接 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <Globe size={12} /> 官网链接 <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.officialUrl}
                  onChange={(e) => setForm({ ...form, officialUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              {/* 核心分类 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <Tag size={12} /> 核心分类 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm({ ...form, category: c.value })}
                      className={`p-3 text-left rounded-xl border-2 transition-all ${
                        form.category === c.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-xl mb-1">{c.icon}</div>
                      <div className="text-xs font-bold text-gray-900">{c.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 一句话亮点 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <Sparkles size={12} /> 一句话亮点 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="用一句话说清楚你的工具能帮用户解决什么问题。&#10;例：输入产品关键词，10 秒生成 100 条爆款短视频脚本，支持数字人口播一键出片。"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                />
              </div>

              {/* 收费模式 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <DollarSign size={12} /> 收费模式 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PRICING.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm({ ...form, pricingModel: p.value })}
                      className={`p-3 text-left rounded-xl border-2 transition-all ${
                        form.pricingModel === p.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-gray-900">{p.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 推广链接（可选） */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <Link2 size={12} /> 推广链接 <span className="text-gray-400">（可选）</span>
                </label>
                <input
                  value={form.affiliateLink}
                  onChange={(e) => setForm({ ...form, affiliateLink: e.target.value })}
                  placeholder="如带推广追踪码，提交后可获取 OPC 用户的转化分润"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              {/* 联系人 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <User size={12} /> 联系人姓名
                  </label>
                  <input
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    placeholder="您的姓名"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <Phone size={12} /> 联系方式
                  </label>
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
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Rocket size={16} />
                    提交工具入驻申请
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                提交后即表示您同意 OPC 平台的{' '}
                <a className="text-blue-600 underline" href="#">工具入驻协议</a>
              </p>
            </div>
          </form>
        )}

        {/* 底部权益 */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Users, title: '精准用户', desc: '500+ 创业者和企业客户' },
            { icon: TrendingUp, title: '免费曝光', desc: '首页推荐位 + 社群分发' },
            { icon: Shield, title: '品牌背书', desc: 'OPC 认证标识，信任加成' },
          ].map((b, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
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
