'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 四库统一卡片组件（首页 / 未来 market 页面均可复用）
 *
 * 与原 LibraryTabs 内联 Link 保持视觉一致：
 *   - p-2.5 md:p-3 + bg-slate-50 + border-slate-100
 *   - emoji 图标 + 名称 + 描述 + ArrowRight
 *
 * 在此基础上扩展：
 *   - hasTask 右上角 animate-pulse 角标
 *   - hasTask CTA 按钮蓝光发光
 *   - highlight 触发 3 秒呼吸动画（由 FlowControlBar 控制）
 */
export interface LibraryCardProps {
  href: string
  icon: string
  name: string
  desc: string
  /** 该卡片是否对当前用户有未完成任务（控制右上角角标 + CTA 发光） */
  hasTask?: boolean
  /** 高亮状态（3 秒边框呼吸动画） */
  highlight?: boolean
  className?: string
}

export function LibraryCard({
  href,
  icon,
  name,
  desc,
  hasTask = false,
  highlight = false,
  className,
}: LibraryCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl transition-all',
        highlight && 'ring-2 ring-blue-400/70 animate-[pulse_1s_ease-in-out_3]',
        className
      )}
    >
      <Link
        href={href}
        className={cn(
          'group flex items-center gap-3 p-2.5 md:p-3 bg-slate-50 hover:bg-blue-50',
          'border border-slate-100 hover:border-blue-200 rounded-xl transition-all',
          hasTask &&
            'shadow-[0_0_10px_rgba(59,130,246,0.4)] hover:shadow-[0_0_14px_rgba(59,130,246,0.55)]'
        )}
      >
        <div className="text-2xl md:text-3xl flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs md:text-sm font-bold text-slate-800 leading-tight">
            {name}
          </div>
          <div className="text-[10px] md:text-xs text-slate-500 line-clamp-1">
            {desc}
          </div>
        </div>
        <ArrowRight
          size={12}
          className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0"
        />
      </Link>

      {/* 任务角标：hasTask 时在卡片右上角显示脉冲圆点 */}
      {hasTask && (
        <span
          aria-label="有未完成任务"
          className="absolute -top-1 -right-1 z-10 w-2 h-2 rounded-full bg-blue-500 animate-pulse ring-2 ring-white"
        />
      )}
    </div>
  )
}

export default LibraryCard
