'use client'

/**
 * DiagnosisHero · 顶部 Hero 区
 * ------------------------------------------------------------
 * 任务：拆 diagnosis/page.tsx（演进项 3.5）
 * 职责：仅渲染 Hero 标题区（gradient + badge + title + subtitle）。
 *       不持有任何状态，pure presentation。
 * ------------------------------------------------------------
 */
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function DiagnosisHero() {
  return (
    <section className="relative overflow-hidden pt-10 pb-6 px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/15 rounded-full blur-3xl" />
      <div className="absolute top-10 right-1/4 w-[300px] h-[300px] bg-purple-500/15 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-4 text-xs text-white/70"
        >
          <Sparkles size={12} className="text-amber-400" />
          <span>AI 智富对话引擎 · 四层阶梯实时定位</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold leading-tight mb-3"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            📊 你的 OPC 创业 · AI 综合诊断
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm md:text-base text-white/60 max-w-xl mx-auto"
        >
          30 秒，AI 帮你定位在四层创业阶梯中的最佳位置 + 推荐武器组合。
        </motion.p>
      </div>
    </section>
  )
}
