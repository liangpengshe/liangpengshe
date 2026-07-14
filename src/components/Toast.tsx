'use client'

/**
 * 轻量级 Toast 通知（进化项 4.2）
 * ------------------------------------------------------------
 * - 单例 API：`toast.success(msg)` / `toast.error(msg)` / `toast.warn(msg)`
 * - 不依赖第三方包（避免 bundle 体积膨胀）
 * - 替代浏览器原生 alert()，交互质感对齐 Linear / Stripe
 * - 自动 3 秒关闭，支持点击关闭
 * ------------------------------------------------------------
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'warn' | 'info'

interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

interface ToastApi {
  show: (msg: string, kind?: ToastKind) => void
  success: (msg: string) => void
  error: (msg: string) => void
  warn: (msg: string) => void
  info: (msg: string) => void
}

let _pushFn: ((msg: string, kind: ToastKind) => void) | null = null

export const toast: ToastApi = {
  show: (msg, kind = 'info') => _pushFn?.(msg, kind),
  success: (msg) => _pushFn?.(msg, 'success'),
  error: (msg) => _pushFn?.(msg, 'error'),
  warn: (msg) => _pushFn?.(msg, 'warn'),
  info: (msg) => _pushFn?.(msg, 'info'),
}

const STYLE_MAP: Record<ToastKind, { bg: string; border: string; text: string; Icon: any }> = {
  success: {
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    border: 'border-emerald-200/70',
    text: 'text-emerald-900',
    Icon: CheckCircle2,
  },
  error: {
    bg: 'bg-gradient-to-br from-rose-50 to-pink-50',
    border: 'border-rose-200/70',
    text: 'text-rose-900',
    Icon: AlertCircle,
  },
  warn: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    border: 'border-amber-200/70',
    text: 'text-amber-900',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200/70',
    text: 'text-blue-900',
    Icon: Info,
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((message: string, kind: ToastKind) => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, kind, message }])
    setTimeout(() => {
      setItems((prev) => prev.filter((it) => it.id !== id))
    }, 3000)
  }, [])

  useEffect(() => {
    _pushFn = push
    return () => {
      _pushFn = null
    }
  }, [push])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {items.map((it) => {
            const s = STYLE_MAP[it.kind]
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
                className={`pointer-events-auto flex items-center gap-2.5 max-w-[90vw] sm:max-w-md px-4 py-2.5 ${s.bg} ${s.border} ${s.text} border shadow-lg rounded-2xl text-xs md:text-sm font-medium backdrop-blur-sm`}
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                role="alert"
              >
                <s.Icon size={16} className="flex-shrink-0" />
                <span className="flex-1 leading-snug">{it.message}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setItems((prev) => prev.filter((x) => x.id !== it.id))
                  }}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

const ToastContext = createContext<{ push: (m: string, k: ToastKind) => void } | null>(null)
export function useToast() {
  return useContext(ToastContext)
}
