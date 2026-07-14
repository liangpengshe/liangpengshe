'use client'

/**
 * 自适应路径 · 卡点提醒横幅
 * ------------------------------------------------------------
 * - 在 /member 顶部显示
 * - 支持两种卡点：learning-stuck（建议重新诊断） / practice-stuck（建议简化任务）
 * - 点击 CTA 跳转；提供"忽略"按钮
 * - 忽略后写入 localStorage 当日不再显示
 * ------------------------------------------------------------
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, Sparkles, ListTodo, Stethoscope, ArrowRight } from 'lucide-react'
import type { AdaptiveAlert } from '@/lib/adaptive-path'

const DISMISS_KEY = (kind: string, day: string) => `opc_alert_dismissed_${kind}_${day}`

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function AdaptiveAlertBanner({ alert }: { alert: AdaptiveAlert | null }) {
  const [visible, setVisible] = useState(false)
  const [activeAlert, setActiveAlert] = useState<AdaptiveAlert | null>(null)

  useEffect(() => {
    if (!alert) {
      setVisible(false)
      setActiveAlert(null)
      return
    }
    // 检查今日是否已忽略
    if (typeof window !== 'undefined') {
      const key = DISMISS_KEY(alert.kind, todayKey())
      if (window.localStorage.getItem(key) === '1') {
        setVisible(false)
        setActiveAlert(null)
        return
      }
    }
    setActiveAlert(alert)
    // 0.3s 延迟弹出（避免页面加载时突兀）
    const t = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(t)
  }, [alert])

  if (!activeAlert) return null

  const isPracticeStuck = activeAlert.kind === 'practice-stuck'
  const Icon = isPracticeStuck ? ListTodo : Stethoscope

  const styles = isPracticeStuck
    ? {
        wrap: 'bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border-amber-200/60',
        ring: 'ring-amber-300/40',
        iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
        title: 'text-amber-900',
        desc: 'text-amber-800/80',
        btn: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
      }
    : {
        wrap: 'bg-gradient-to-r from-rose-50 via-pink-50 to-fuchsia-50 border-rose-200/60',
        ring: 'ring-rose-300/40',
        iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
        title: 'text-rose-900',
        desc: 'text-rose-800/80',
        btn: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700',
      }

  const severityBadge = activeAlert.severity === 'urgent'
    ? { text: '紧急', cls: 'bg-rose-100 text-rose-700 border-rose-300' }
    : activeAlert.severity === 'warn'
      ? { text: '提醒', cls: 'bg-amber-100 text-amber-700 border-amber-300' }
      : { text: '提示', cls: 'bg-blue-100 text-blue-700 border-blue-300' }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className={`relative overflow-hidden rounded-2xl p-4 md:p-5 ring-1 border shadow-sm ${styles.wrap} ${styles.ring}`}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center gap-4">
            {/* 左侧：图标 + 文案 */}
            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
              <div className={`flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl ${styles.iconBg} text-white flex items-center justify-center shadow-lg`}>
                <Icon size={20} className="md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider border px-1.5 py-0.5 rounded-full ${severityBadge.cls}`}>
                    {severityBadge.text}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-500" />
                    自适应检测
                  </span>
                </div>
                <h3 className={`text-sm md:text-base font-extrabold ${styles.title} leading-tight`}>
                  {activeAlert.title}
                </h3>
                <p className={`mt-1 text-[11px] md:text-xs ${styles.desc} leading-relaxed`}>
                  {activeAlert.description}
                </p>
              </div>
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href={activeAlert.actionHref}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 ${styles.btn} text-white text-xs md:text-sm font-extrabold rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]`}
              >
                {activeAlert.actionLabel}
                <ArrowRight size={14} />
              </Link>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem(
                      DISMISS_KEY(activeAlert.kind, todayKey()),
                      '1'
                    )
                  }
                  setVisible(false)
                }}
                aria-label="关闭"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/60 hover:bg-white/80 text-slate-500 border border-white/60 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
