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
  Target,
  Briefcase,
  Megaphone,
  Printer,
  MessageCircle,
} from 'lucide-react'

interface DiagnosisFormProps {
  compact?: boolean
}

const ROLES = [
  { value: '个人创业者', desc: '1 人公司 / 自由职业者 / 个体户', icon: '🚀' },
  { value: '企业主', desc: '中小企业老板 / 团队 5-50 人', icon: '🏢' },
  { value: '运营负责人', desc: '公司中层 / 业务负责人 / 项目经理', icon: '📊' },
]

const GOALS_OPTIONS = [
  { value: '降本', label: '降本', desc: '降低运营成本', icon: '💰' },
  { value: '获客', label: '获客', desc: '扩大客户来源', icon: '🎯' },
  { value: '提效', label: '提效', desc: '提升业务效率', icon: '⚡' },
  { value: '建团队', label: '建团队', desc: '搭建精锐团队', icon: '👥' },
  { value: '转型', label: 'AI 转型', desc: '业务 AI 化升级', icon: '🤖' },
]

export default function AIDiagnosisForm({ compact = false }: DiagnosisFormProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<string | null>(null)
  const [recordId, setRecordId] = useState<string | null>(null)

  // 表单数据
  const [role, setRole] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const reset = () => {
    setStep(1)
    setRole('')
    setGoals([])
    setDescription('')
    setName('')
    setPhone('')
    setReport(null)
    setRecordId(null)
    setError(null)
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(reset, 300)
  }

  const toggleGoal = (g: string) => {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }

  const canNext = () => {
    if (step === 1) return !!role
    if (step === 2) return goals.length > 0
    if (step === 3) return description.trim().length >= 5
    if (step === 4) return name.trim() && phone.trim()
    return false
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, role, goals, description }),
      })
      const data = await res.json()
      if (data.success) {
        setReport(data.report)
        setRecordId(data.id)
        setStep(5)
      } else {
        setError(data.error || '诊断失败，请重试')
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

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setOpen(true)}
        className={`group inline-flex items-center gap-2 bg-white text-blue-600 font-bold ${compact ? 'px-5 py-2 text-sm' : 'px-8 py-3.5 text-base'} rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all`}
      >
        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
        开始诊断
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
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Target size={16} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600">
                      AI 商业落地诊断
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {step === 1 && '您当前的职业身份？'}
                    {step === 2 && '您希望 AI 帮您解决哪些问题？'}
                    {step === 3 && '请描述您目前的业务困境'}
                    {step === 4 && '最后，留下您的联系方式'}
                  </h3>
                  <div className="flex items-center gap-1 mt-3">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          s <= step ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">第 {step} 步 / 共 4 步</div>
                </div>
              )}

              {/* Body */}
              <div className="px-6 py-6">
                {/* 步骤 1：角色 */}
                {step === 1 && (
                  <div className="space-y-3">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                          role === r.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{r.icon}</div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900">{r.value}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                          </div>
                          {role === r.value && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 步骤 2：目标 */}
                {step === 2 && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 mb-2">（可多选，建议 1-3 项）</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {GOALS_OPTIONS.map((g) => {
                        const selected = goals.includes(g.value)
                        return (
                          <button
                            key={g.value}
                            onClick={() => toggleGoal(g.value)}
                            className={`text-left p-4 rounded-2xl border-2 transition-all ${
                              selected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{g.icon}</span>
                              <div className="flex-1">
                                <div className="font-bold text-gray-900 text-sm">{g.label}</div>
                                <div className="text-xs text-gray-500">{g.desc}</div>
                              </div>
                              {selected && (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Check size={12} className="text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 步骤 3：描述 */}
                {step === 3 && (
                  <div>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="请详细描述您目前的业务困境，例如：&#10;- 我们是一家做美妆的电商公司，目前主要靠抖音直播，团队有 5 人&#10;- 痛点：每天只能播 4 小时，内容产出跟不上，转化率下降&#10;- 希望用 AI 提升内容产能和直播效率"
                      rows={10}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none leading-relaxed"
                    />
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>建议至少 20 字，越详细 AI 诊断越精准</span>
                      <span>{description.length} 字</span>
                    </div>
                  </div>
                )}

                {/* 步骤 4：联系方式 */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        您的姓名
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="请输入您的姓名"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        手机号 / 微信号
                      </label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="请输入手机号或微信号"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        我们将为您加密保存，仅用于发送诊断报告
                      </p>
                    </div>
                  </div>
                )}

                {/* 步骤 5：报告 */}
                {step === 5 && report && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={18} className="text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        您的 AI 商业落地诊断报告
                      </h3>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 max-h-[50vh] overflow-y-auto print-report-content">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                        {report}
                      </pre>
                    </div>
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
                      <div className="flex items-start gap-2">
                        <MessageCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-700 leading-relaxed">
                          📌 <span className="font-semibold">您的专属 AI 顾问将在 24 小时内通过微信联系您，为您进行报告解读。</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                      <button
                        onClick={handlePrint}
                        className="flex-1 py-3 bg-white border-2 border-blue-500 text-blue-600 font-semibold rounded-2xl text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Printer size={16} />
                        打印 / 保存为 PDF
                      </button>
                      <button
                        onClick={handleClose}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl text-sm shadow-lg hover:shadow-xl transition-all"
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

              {/* Footer：操作按钮 */}
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
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      下一步
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!canNext() || loading}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          AI 正在生成报告...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          生成诊断报告
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
