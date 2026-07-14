'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X, AlertCircle } from 'lucide-react'

interface ToastProps {
  open: boolean
  type?: 'success' | 'error'
  message: string
  duration?: number
  onClose: () => void
}

export function Toast({
  open,
  type = 'success',
  message,
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [open, duration, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[80] w-[92vw] max-w-sm"
        >
          <div
            className={`flex items-start gap-3 p-3.5 rounded-2xl shadow-2xl border backdrop-blur-md ${
              type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/95 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {type === 'success' ? (
                <CheckCircle2 size={20} className="text-emerald-600" />
              ) : (
                <AlertCircle size={20} className="text-rose-600" />
              )}
            </div>
            <div className="flex-1 min-w-0 text-sm font-semibold leading-relaxed">
              {message}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 -mr-1 -mt-1 w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
              aria-label="关闭"
            >
              <X size={14} className="opacity-60" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast
