'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  MapPin,
  Sparkles,
  FileText,
  CheckCircle2,
  Loader2,
  Briefcase,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * OPC 专家申请模态框
 * 用于服务库底部"申请成为专家"按钮触发
 *
 * 字段:
 *   - 姓名 (Input)
 *   - 所属城市 (Input)
 *   - 擅长领域 (多选 Chip)
 *   - 个人简介与案例 (Textarea)
 */
const SPECIALTY_OPTIONS = [
  'OPC内训',
  'OPC陪跑',
  'AI网店代运营',
  'AI自媒体代运营',
  '企业GEO',
  '企业AI转型',
  '企业系统定制',
] as const

interface ExpertApplicationModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ExpertApplicationModal({
  open,
  onClose,
  onSuccess,
}: ExpertApplicationModalProps) {
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [specialty, setSpecialty] = useState<string[]>([])
  const [experience, setExperience] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstFieldRef = useRef<HTMLInputElement | null>(null)

  // 打开时聚焦到姓名输入框 + 重置状态
  useEffect(() => {
    if (open) {
      setError(null)
      // 保留上次输入（便于多次提交测试）
      setTimeout(() => firstFieldRef.current?.focus(), 200)
    }
  }, [open])

  // ESC 关闭
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, submitting, onClose])

  const toggleSpecialty = (item: string) => {
    setSpecialty((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) return setError('请填写姓名')
    if (!city.trim()) return setError('请填写所属城市')
    if (specialty.length === 0) return setError('请至少选择一个擅长领域')
    if (experience.trim().length < 10)
      return setError('个人简介与案例不少于 10 字')

    setSubmitting(true)
    try {
      // 读取 userId（如果已登录）
      let userId: string | undefined
      try {
        const raw = window.localStorage.getItem('opc_user_profile')
        if (raw) {
          const profile = JSON.parse(raw)
          userId = profile?.id || profile?.phone || undefined
        }
      } catch {
        // 静默
      }

      const res = await fetch('/api/services/expert-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          city: city.trim(),
          specialty,
          experience: experience.trim(),
          userId,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || '提交失败，请稍后重试')
        return
      }
      // 成功
      onSuccess?.()
      onClose()
      // 重置表单
      setName('')
      setCity('')
      setSpecialty([])
      setExperience('')
    } catch (e: any) {
      setError(e?.message || '网络异常，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="expert-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:justify-end p-0 md:p-6 bg-black/50 backdrop-blur-sm"
          onClick={() => !submitting && onClose()}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={cn(
              'w-full md:max-w-md md:h-auto md:max-h-[90vh]',
              'bg-white rounded-t-3xl md:rounded-3xl shadow-2xl',
              'flex flex-col overflow-hidden'
            )}
          >
            {/* 顶部标题区 */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-5 md:p-6 flex-shrink-0">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/15 rounded-full blur-2xl" />
              <div className="relative flex items-start gap-3">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                  <Briefcase size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold tracking-wider uppercase text-white/85 mb-0.5">
                    OPC 服务专家 · 申请入驻
                  </div>
                  <h3 className="text-lg font-extrabold leading-tight">
                    申请成为服务专家
                  </h3>
                  <p className="text-xs text-white/85 mt-1 leading-relaxed">
                    你的专业将为系统内的 OPC 成员赋能，赚取服务佣金与项目分成。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => !submitting && onClose()}
                  disabled={submitting}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors disabled:opacity-50"
                  aria-label="关闭"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* 表单主体（可滚动） */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4"
            >
              {/* 姓名 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  <User size={12} className="inline mr-1 -mt-0.5" />
                  姓名 <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={firstFieldRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入你的真实姓名"
                  maxLength={20}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  disabled={submitting}
                />
              </div>

              {/* 所属城市 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  <MapPin size={12} className="inline mr-1 -mt-0.5" />
                  所属城市 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="例如：柳州 / 东莞 / 乌海"
                  maxLength={20}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  disabled={submitting}
                />
              </div>

              {/* 擅长领域（多选） */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  <Sparkles size={12} className="inline mr-1 -mt-0.5" />
                  擅长领域 <span className="text-rose-500">*</span>
                  <span className="ml-1 text-[10px] text-slate-400 font-normal">
                    （可多选，至少 1 项）
                  </span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SPECIALTY_OPTIONS.map((item) => {
                    const active = specialty.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleSpecialty(item)}
                        disabled={submitting}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          active
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                        )}
                      >
                        {active && <CheckCircle2 size={10} className="inline mr-1 -mt-0.5" />}
                        {item}
                      </button>
                    )
                  })}
                </div>
                {specialty.length > 0 && (
                  <div className="mt-1.5 text-[10px] text-indigo-600 font-semibold">
                    已选 {specialty.length} 项
                  </div>
                )}
              </div>

              {/* 个人简介与案例 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  <FileText size={12} className="inline mr-1 -mt-0.5" />
                  个人简介与过往案例 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="请填写你的从业经验、过往服务案例、可量化的成果等（不少于 10 字）"
                  rows={5}
                  maxLength={500}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  disabled={submitting}
                />
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>至少 10 字</span>
                  <span>{experience.length} / 500</span>
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <AlertCircle size={14} className="flex-shrink-0 text-rose-500 mt-0.5" />
                  <span className="text-xs text-rose-700 font-semibold leading-relaxed">
                    {error}
                  </span>
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  'w-full py-3 rounded-xl text-sm font-extrabold transition-all',
                  'flex items-center justify-center gap-2',
                  submitting
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
                )}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    正在提交...
                  </>
                ) : (
                  <>
                    提交申请
                    <Sparkles size={14} />
                  </>
                )}
              </button>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                提交后 1-3 个工作日内审核完成，审核通过后系统将自动开通专家权限。
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ExpertApplicationModal
