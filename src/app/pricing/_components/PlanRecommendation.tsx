'use client'

/**
 * 定价页 · 推荐组合说明（智富先锋卡 + 月度会员 = 黄金组合）
 * 跳转到「破冰与连接」区块
 */

import { Award, ArrowRight } from 'lucide-react'
import type { SectionKey } from '../_data/plan-types'

interface PlanRecommendationProps {
  onSectionClick: (key: SectionKey) => void
}

export default function PlanRecommendation({ onSectionClick }: PlanRecommendationProps) {
  return (
    <section className="px-4 py-10">
      <div className="max-w-lg md:max-w-6xl mx-auto">
        <div className="mt-2 relative bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 md:p-6 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Award size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base md:text-lg font-bold mb-1">
                🎁 智富先锋卡 + 月度会员 = 黄金组合
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                先花 19.9 元体验 1 次 AI 诊断 + 1 次沙龙，确认方向后再订月度会员（首月 9.9 元）。
                一年最高省 ¥840。
              </p>
            </div>
            <button
              onClick={() => onSectionClick('ice')}
              className="flex-shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2.5 rounded-full text-sm transition-colors"
            >
              <span>查看订阅方案</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
