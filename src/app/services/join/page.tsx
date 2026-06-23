'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Sparkles,
  Check,
  Loader2,
  Users,
  Shield,
  TrendingUp,
  Award,
  Building2,
  User,
  Phone,
  Tag,
  Briefcase,
  Rocket,
  CheckCircle2,
  Circle,
} from 'lucide-react'

const SPECIALTIES = [
  { value: 'training', label: '企业内训', desc: 'AI 落地培训 / OPC 工作坊', icon: '🎓' },
  { value: 'geo', label: 'GEO', desc: '生成式引擎优化 / AI 搜索营销', icon: '🌐' },
  { value: 'agent', label: '智能体定制', desc: 'Coze / Dify 智能体定制开发', icon: '🤖' },
  { value: 'system', label: '系统定制', desc: '业务系统 / SaaS 定制开发', icon: '⚙️' },
  { value: 'data', label: '数据中台', desc: '数据治理 / BI / 爬虫', icon: '📊' },
  { value: 'content', label: '内容生产', desc: 'AI 短视频 / 文案 / 矩阵', icon: '🎬' },
]

const PRICE_RANGES = [
  { value: 'under-10k', label: '1 万以下' },
  { value: '10k-50k', label: '1-5 万' },
  { value: '50k-200k', label: '5-20 万' },
  { value: '200k-500k', label: '20-50 万' },
  { value: 'over-500k', label: '50 万以上' },
  { value: 'custom', label: '按需定制' },
]

export default function ServiceJoinPage() {
  const [form, setForm] = useState({
    name: '',
    company: '',
    contact: '',
    specialty: [] as string[],
    experience: '',
    priceRange: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleSpecialty = (value: string) => {
    setForm((f) => ({
      ...f,
      specialty: f.specialty.includes(value)
        ? f.specialty.filter((s) => s !== value)
        : [...f.specialty, value],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name || form.specialty.length === 0 || !form.experience) {
      setError('请填写姓名、至少 1 个擅长领域和过往案例')
      return
    }
    if (form.experience.trim().length < 30) {
      setError('过往案例介绍至少 30 个字')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/services/join', {
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
        <Link
          href="/services"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          返回服务库
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-4">
            <Award size={14} className="text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-600">OPC 认证服务商招募</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            成为良朋社{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              OPC 认证服务商
            </span>
          </h1>
          <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto">
            共享品牌、信任与线索通道 · 对接 70+ 付费企业客户
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
                <div className="text-white/80 mt-0.5">服务商所得</div>
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

        {/* 权益条 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { num: '70+', label: '企业客户' },
            { num: '500+', label: '社群创业者' },
            { num: '15%', label: '平台佣金' },
            { num: '7 天', label: '极速结算' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">入驻申请已提交！</h2>
            <p className="text-sm text-gray-600 mb-6">
              我们的专家评审团将在 5 个工作日内对您的资质和案例进行审核。
              <br />
              审核通过后将获得 OPC 认证标识 + 优先派单机会。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/services"
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50"
              >
                返回服务库
              </Link>
              <button
                onClick={() => {
                  setSuccess(false)
                  setForm({ name: '', company: '', contact: '', specialty: [], experience: '', priceRange: '' })
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-xl"
              >
                继续申请
              </button>
            </div>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-600" />
              服务商入驻信息
            </h2>

            <div className="space-y-5">
              {/* 联系人 + 公司 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <User size={12} /> 服务商 / 联系人姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="您的姓名"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <Building2 size={12} /> 公司 / 团队名称
                  </label>
                  <input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="所在公司或工作室"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 联系方式 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <Phone size={12} /> 联系方式 <span className="text-gray-400">（手机号/微信号/邮箱）</span>
                </label>
                <input
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="便于审核团队与您对接"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>

              {/* 擅长领域（多选） */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                  <Tag size={12} /> 擅长领域 <span className="text-red-500">*</span>
                  <span className="text-gray-400 ml-1">（可多选）</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SPECIALTIES.map((s) => {
                    const active = form.specialty.includes(s.value)
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => toggleSpecialty(s.value)}
                        className={`p-3 text-left rounded-xl border-2 transition-all ${
                          active
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl">{s.icon}</span>
                          {active ? (
                            <CheckCircle2 size={16} className="text-indigo-600" />
                          ) : (
                            <Circle size={16} className="text-gray-300" />
                          )}
                        </div>
                        <div className="text-xs font-bold text-gray-900">{s.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
                      </button>
                    )
                  })}
                </div>
                {form.specialty.length > 0 && (
                  <p className="text-xs text-indigo-600 mt-2">
                    ✓ 已选 {form.specialty.length} 个领域
                  </p>
                )}
              </div>

              {/* 过往案例 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <Briefcase size={12} /> 过往案例介绍 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  placeholder="请详细描述您的实战经验，例如：&#10;1. 服务过的客户行业与规模&#10;2. 标杆项目案例与可量化的结果&#10;3. 团队规模与核心成员背景&#10;4. 使用的核心方法论 / 工具栈"
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-400">建议 100-500 字，详细介绍可加快审核</p>
                  <p className="text-xs text-gray-400">{form.experience.length} 字</p>
                </div>
              </div>

              {/* 报价区间 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <Tag size={12} /> 报价区间
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRICE_RANGES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm({ ...form, priceRange: p.value })}
                      className={`px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                        form.priceRange === p.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
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
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl text-sm shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Rocket size={16} />
                    提交服务商入驻申请
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                提交后即表示您同意 OPC 平台的{' '}
                <a className="text-indigo-600 underline" href="#">服务商入驻协议</a>
              </p>
            </div>
          </form>
        )}

        {/* 底部权益 */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Users, title: '企业派单', desc: '70+ 付费企业客户优先派单' },
            { icon: TrendingUp, title: '平台背书', desc: 'OPC 认证标识 + 品牌曝光' },
            { icon: Shield, title: '极速结算', desc: 'T+7 结算，平台担保交易' },
          ].map((b, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
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
