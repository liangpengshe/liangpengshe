'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Calendar,
  Target,
  Briefcase,
  Rocket,
  TrendingUp,
  Printer,
  MessageCircle,
  Wand2,
} from 'lucide-react'
import ShareReportCTA from '@/components/ShareReportCTA'

interface ProjectPlannerProps {
  compact?: boolean
}

const INCOME_OPTIONS = [
  { value: '10万', label: '10万', desc: '基础启动，适合试水', icon: '🌱' },
  { value: '30万', label: '30万', desc: '一年买车，两年买房', icon: '🚗' },
  { value: '50万', label: '50万', desc: '城市中产标配', icon: '🏠' },
  { value: '100万以上', label: '100万+', desc: 'OPC 创业标杆', icon: '🚀' },
]

export default function AIProjectPlanner({ compact = false }: ProjectPlannerProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<string | null>(null)
  const [userName, setUserName] = useState('')

  // 表单数据
  const [name, setName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [targetIncome, setTargetIncome] = useState('')
  const [background, setBackground] = useState('')
  const [phone, setPhone] = useState('')

  const reset = () => {
    setStep(1)
    setName('')
    setBirthday('')
    setTargetIncome('')
    setBackground('')
    setPhone('')
    setReport(null)
    setUserName('')
    setError(null)
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(reset, 300)
  }

  const canNext = () => {
    if (step === 1) return name.trim() && birthday
    if (step === 2) return !!targetIncome
    if (step === 3) return background.trim().length >= 10
    if (step === 4) return phone.trim()
    return false
  }

  const calculateAge = (bd: string): number => {
    if (!bd) return 0
    const b = new Date(bd)
    if (isNaN(b.getTime())) return 0
    const now = new Date()
    let age = now.getFullYear() - b.getFullYear()
    const m = now.getMonth() - b.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
    return age
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/project-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, birthday, targetIncome, background, phone }),
      })
      const data = await res.json()
      if (data.success) {
        setReport(data.plan)
        setUserName(name)
        setStep(5)
      } else {
        setError(data.error || '生成失败，请重试')
      }
    } catch (err: any) {
      setError(err.message || '网络错误')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print()
  }

  const age = calculateAge(birthday)

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setOpen(true)}
        className={`group inline-flex items-center gap-2 bg-white text-purple-600 font-bold ${compact ? 'px-5 py-2 text-sm' : 'px-8 py-3.5 text-base'} rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all`}
      >
        <Wand2 size={18} className="group-hover:rotate-12 transition-transform" />
        生成我的专属计划
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>

      {/* 弹窗 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* 关闭按钮 */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Header */}
              {step < 5 && (
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Rocket size={16} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold text-purple-600">
                      AI 个人商业项目规划师
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {step === 1 && '基本信息'}
                    {step === 2 && '你的目标年收入？'}
                    {step === 3 && '你的行业与技能背景'}
                    {step === 4 && '留下联系方式'}
                  </h3>
                  <div className="flex items-center gap-1 mt-3">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          s <= step
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">第 {step} 步 / 共 4 步</div>
                </div>
              )}

              {/* Body */}
              <div className="px-6 py-6">
                {/* 步骤 1：姓名 + 出生日期 */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                        <Sparkles size={12} /> 你的姓名
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="请输入你的姓名"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                        <Calendar size={12} /> 出生年月日
                      </label>
                      <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                      />
                      {age > 0 && (
                        <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                          <Sparkles size={10} />
                          你今年 {age} 岁，正处于人生黄金期
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 步骤 2：目标收入 */}
                {step === 2 && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 mb-2">选择你的目标年收入</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {INCOME_OPTIONS.map((opt) => {
                        const selected = targetIncome === opt.value
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setTargetIncome(opt.value)}
                            className={`text-left p-4 rounded-2xl border-2 transition-all ${
                              selected
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{opt.icon}</div>
                              <div className="flex-1">
                                <div className="font-bold text-gray-900">{opt.label}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                              </div>
                              {selected && (
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                  <Check size={14} className="text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 步骤 3：行业与背景 */}
                {step === 3 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <Briefcase size={12} /> 你的行业与技能背景
                    </label>
                    <textarea
                      value={background}
                      onChange={(e) => setBackground(e.target.value)}
                      placeholder="例：我是做电商运营的，懂得一些基础的数据分析，过去在一家美妆品牌做运营主管 3 年，熟悉抖音、小红书内容投放。现在想转型做个人 IP。&#10;&#10;提示：描述你过去的职业、掌握的技能、对哪些行业有了解，越详细 AI 推荐越精准。"
                      rows={9}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all resize-none leading-relaxed"
                    />
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>建议至少 30 字，AI 会根据你的背景匹配最合适的项目</span>
                      <span>{background.length} 字</span>
                    </div>
                  </div>
                )}

                {/* 步骤 4：联系方式 */}
                {step === 4 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <MessageCircle size={12} /> 联系方式
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="手机号或微信号"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      我们将为您加密保存，仅用于发送 AI 规划报告
                    </p>
                  </div>
                )}

                {/* 步骤 5：报告 */}
                {step === 5 && report && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={18} className="text-purple-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        {userName}，你的专属计划已生成！
                      </h3>
                    </div>

                    {/* 骨架屏过渡（无需） */}

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-5 max-h-[50vh] overflow-y-auto print-report-content">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                        {report}
                      </pre>
                    </div>

                    {/* 专属引导 */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl">
                      <div className="flex items-start gap-2">
                        <MessageCircle size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-700 leading-relaxed">
                          📌 <span className="font-semibold text-purple-700">
                            {userName}，你的专属计划已生成！
                          </span>
                          请将报告截图发给小助手，我们为你对接专属的项目陪跑服务。
                        </p>
                      </div>
                    </div>

                    {/* 分享 + 微信引流 CTA */}
                    <ShareReportCTA
                      userName={userName}
                      reportType="plan"
                      title="AI 个人商业规划"
                      summary={report.slice(0, 120)}
                      themeColor="purple"
                    />

                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                      <button
                        onClick={handlePrint}
                        className="flex-1 py-3 bg-white border-2 border-purple-500 text-purple-600 font-semibold rounded-2xl text-sm hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Printer size={16} />
                        打印 / 保存为 PDF
                      </button>
                      <button
                        onClick={handleClose}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl text-sm shadow-lg hover:shadow-xl transition-all"
                      >
                        完成
                      </button>
                    </div>
                  </div>
                )}

                {/* 错误提示 */}
                {error && (
                  <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              {step < 5 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                  {step > 1 ? (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft size={16} />
                      上一步
                    </button>
                  ) : (
                    <div />
                  )}
                  {step < 4 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      disabled={!canNext()}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      下一步
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!canNext() || loading}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          AI 正在规划你的未来...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          生成专属规划
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
