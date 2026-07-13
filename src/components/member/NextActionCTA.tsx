'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type UserStage,
  type OPCLevel,
} from '@/lib/user-stage'
import { type NextAction, getNextAction } from '@/lib/member-dashboard'

/**
 * 智能推荐栏 · 底部 CTA
 *
 *  - 基于 current_stage + opc_level 动态生成文案
 *  - 大按钮：跳转至对应路由
 */
export interface NextActionCTAProps {
  userStage: UserStage | null
  opcLevel: OPCLevel | null | undefined
  className?: string
}

const TONE_STYLES: Record<
  NextAction['tone'],
  { bg: string; ring: string; emoji: string; btn: string }
> = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50',
    ring: 'ring-blue-200/50',
    emoji: '🧭',
    btn: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50',
    ring: 'ring-emerald-200/50',
    emoji: '🛠️',
    btn: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50',
    ring: 'ring-rose-200/50',
    emoji: '🚀',
    btn: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
    ring: 'ring-amber-200/50',
    emoji: '👑',
    btn: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
  },
  violet: {
    bg: 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50',
    ring: 'ring-violet-200/50',
    emoji: '✨',
    btn: 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700',
  },
}

export function NextActionCTA({ userStage, opcLevel, className }: NextActionCTAProps) {
  const action = getNextAction(userStage, opcLevel)
  const style = TONE_STYLES[action.tone]

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl p-4 md:p-5 ring-1',
        style.bg,
        style.ring,
        'shadow-sm',
        className
      )}
    >
      {/* 装饰光斑 */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/30 rounded-full blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center gap-4">
        {/* 左侧：emoji + 文案 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-2xl">{style.emoji}</span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} className="text-amber-500" />
              AI 智能推荐
            </span>
          </div>
          <h3 className="text-base md:text-lg font-extrabold text-slate-900 leading-tight">
            {action.title}
          </h3>
          <p className="mt-1 text-[11px] md:text-xs text-slate-600 leading-relaxed">
            {action.description}
          </p>
        </div>

        {/* 右侧：大按钮 */}
        <div className="flex-shrink-0">
          <Link
            href={action.buttonHref}
            className={cn(
              'inline-flex items-center justify-center gap-2',
              'px-5 py-3 md:px-6 md:py-3.5 rounded-xl',
              'text-white text-sm md:text-base font-extrabold',
              'shadow-lg shadow-slate-300/40',
              'transition-all hover:scale-[1.02] active:scale-[0.99]',
              style.btn
            )}
          >
            <Compass size={16} className="hidden md:inline" />
            <span>{action.buttonLabel}</span>
            <ArrowRight size={16} className="ml-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NextActionCTA
