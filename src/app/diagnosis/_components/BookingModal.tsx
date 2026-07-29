'use client'

/**
 * BookingModal · 15 分钟 1V1 专家预约弹窗
 * ------------------------------------------------------------
 * 任务：拆 diagnosis/page.tsx（演进项 3.5）
 * 职责：完全独立的弹窗组件，自管表单 + 提交反馈。
 *       父组件仅需 onClose（取消/外点关闭）和 onSubmit 回调。
 * ------------------------------------------------------------
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, CheckCircle2, X } from 'lucide-react'

interface BookingModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { name: string; contact: string }) => Promise<void> | void
}

export function BookingModal({ open, onClose, onSubmit }: BookingModalProps) {
  const [bookingSent, setBookingSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    try {
      await onSubmit({
        name: String(fd.get('name') || ''),
        contact: String(fd.get('contact') || ''),
      })
      setBookingSent(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    // 延迟重置，避免关闭动画期间闪烁
    setTimeout(() => {
      setBookingSent(false)
      setSubmitting(false)
    }, 300)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="booking-modal"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => !bookingSent && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-white/15 rounded-2xl p-6"
          >
            {!bookingSent ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CalendarDays size={18} className="text-amber-400" />
                    预约专家咨询
                  </h3>
                  <button
                    onClick={handleClose}
                    className="text-white/50 hover:text-white"
                    aria-label="关闭"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="text-xs text-white/60 mb-4">
                  填写您的姓名与微信号，专家将在 1 小时内主动联系您。
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-white/50 mb-1 block">
                      姓名
                    </label>
                    <input
                      name="name"
                      required
                      className="w-full h-12 bg-white/5 border border-white/15 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-blue-400/60"
                      placeholder="请输入您的姓名"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-white/50 mb-1 block">
                      微信号
                    </label>
                    <input
                      name="contact"
                      required
                      className="w-full h-12 bg-white/5 border border-white/15 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-blue-400/60"
                      placeholder="请输入您的微信号"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-70"
                  >
                    {submitting ? '提交中…' : '提交预约'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mb-3">
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">预约成功！</h3>
                <p className="text-sm text-white/70 mb-5">
                  专家将在 1 小时内通过微信联系您，请留意好友申请。
                </p>
                <button
                  onClick={handleClose}
                  className="h-12 px-6 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl"
                >
                  知道了
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
