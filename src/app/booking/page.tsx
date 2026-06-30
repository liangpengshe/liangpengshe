'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Phone, User, Briefcase, Sparkles, Loader2, ShieldCheck, MessageCircle } from 'lucide-react'

const productMap: Record<string, { name: string; price: string; tag: string; gradient: string }> = {
  'diagnose-1000': {
    name: 'AI 商业定位诊断报告',
    price: '¥1,000',
    tag: '高客单 · 立等可取',
    gradient: 'from-amber-500 to-orange-500',
  },
  'course-30000': {
    name: '企业 AI 变现内训 · 全套陪跑',
    price: '¥30,000',
    tag: 'C 端转化 · 高客单',
    gradient: 'from-slate-900 via-indigo-900 to-purple-900',
  },
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
}

export default function BookingPage() {
  const params = useSearchParams()
  const productKey = params.get('p') || 'diagnose-1000'
  const product = productMap[productKey] || productMap['diagnose-1000']

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [industry, setIndustry] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('请填写您的姓名')
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) return setError('请填写正确的 11 位手机号')
    setSubmitting(true)
    // 模拟提交延迟（正式环境会调用 /api/booking）
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            返回服务库
          </Link>
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            🔒 信息加密 · 仅助理可见
          </span>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 商品信息卡 */}
        <motion.div
          {...fadeUp}
          className={`relative bg-gradient-to-r ${product.gradient} rounded-2xl p-5 md:p-6 shadow-xl overflow-hidden text-white mb-6`}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
              <Sparkles size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-amber-200 mb-1 tracking-wider">
                {product.tag}
              </div>
              <div className="text-lg md:text-xl font-bold leading-tight mb-1">
                {product.name}
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-amber-300">
                {product.price}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 表单 / 成功态 */}
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white border-2 border-emerald-300 rounded-2xl p-8 text-center shadow-lg"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg mb-4">
              <Check size={32} className="text-white" strokeWidth={3} />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              预约提交成功！
            </h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-6">
              助理将在 <span className="font-bold text-emerald-600">1 小时内</span> 通过电话联系您，
              <br />
              为您安排 {product.name} 的具体交付。
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors"
              >
                返回服务库
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                回首页逛逛
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.form
            {...fadeUp}
            onSubmit={submit}
            className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm"
          >
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
              📋 填写预约信息
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              请准确填写以下信息，助理将主动联系您完成后续服务。
            </p>

            <div className="space-y-4">
              {/* 姓名 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 mb-1.5">
                  <User size={14} className="text-amber-500" />
                  您的姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入您的真实姓名"
                  maxLength={20}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
                />
              </div>

              {/* 手机号 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 mb-1.5">
                  <Phone size={14} className="text-amber-500" />
                  手机号码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="请输入 11 位手机号"
                  inputMode="numeric"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
                />
              </div>

              {/* 行业 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 mb-1.5">
                  <Briefcase size={14} className="text-amber-500" />
                  所属行业
                  <span className="text-xs text-slate-400 font-normal">（选填，助理会更有针对性）</span>
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="例如：教培、电商、本地服务、企业服务..."
                  maxLength={30}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
                />
              </div>

              {/* 备注 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 mb-1.5">
                  <MessageCircle size={14} className="text-amber-500" />
                  您的具体诉求
                  <span className="text-xs text-slate-400 font-normal">（选填）</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="简单描述您目前遇到的痛点，或希望解决的问题..."
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all resize-none"
                />
                <div className="text-[11px] text-slate-400 text-right mt-0.5">{note.length} / 200</div>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-xl">
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-base font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  立即提交预约
                </>
              )}
            </button>

            {/* 隐私承诺 */}
            <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
              <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>
                我们承诺：您的信息仅用于本次预约联系，绝不会用于其他用途或泄露给第三方。
              </span>
            </div>
          </motion.form>
        )}

        {/* 底部说明 */}
        <div className="mt-6 text-center">
          <div className="text-xs text-slate-500">
            遇到问题？请 <Link href="/contact" className="text-amber-600 font-semibold hover:underline">直接联系我们</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
