'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  Stethoscope,
  BookOpen,
  Wrench,
  Rocket,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type UserStage,
  type UserStageKey,
  isStageActive,
  isStageCompleted,
  getStageLabel,
} from '@/lib/user-stage'
import type { StageDetail } from '@/lib/member-dashboard'

/**
 * OPC 全流程进度条（4 节点 · 水平实线）
 *
 * 三态样式：
 *   - 已完成：text-green-600 + 实心对勾
 *   - 进行中：text-blue-500 + 脉冲发光动效
 *   - 未解锁：text-slate-400 + 虚线圆点
 *
 * 点击节点：触发 onStageClick 回调，父组件可展开对应详情。
 * 展开状态由父组件 controlled（expandedStage + stageDetail）。
 */

export interface OPCProgressBarProps {
  stage: UserStage | null
  className?: string
  /** 点击节点时回调（用于父组件切换展开） */
  onStageClick?: (stage: UserStageKey) => void
  /** 当前展开的阶段（controlled） */
  expandedStage?: UserStageKey | null
  /** 当前展开阶段对应的详情（controlled） */
  stageDetail?: StageDetail | null
  /** 加载详情中（显示 loading） */
  loadingDetail?: boolean
}

const STAGE_META: Record<UserStageKey, { icon: LucideIcon; href: string }> = {
  diagnosis: { icon: Stethoscope, href: '/diagnosis' },
  learning: { icon: BookOpen, href: '/market' },
  operation: { icon: Wrench, href: '/market' },
  scaling: { icon: Rocket, href: '/partner' },
}

const STAGE_DESC: Record<UserStageKey, string> = {
  diagnosis: '完成 4 问 AI 对话，定位四层阶梯',
  learning: '通哥 SOP + AI 智能体矩阵',
  operation: '工具落地 · 跑通首单',
  scaling: '城市分站 · 资产复制',
}

export function OPCProgressBar({
  stage,
  className,
  onStageClick,
  expandedStage,
  stageDetail,
  loadingDetail,
}: OPCProgressBarProps) {
  const STAGE_ORDER: UserStageKey[] = ['diagnosis', 'learning', 'operation', 'scaling']
  const completedCount = stage?.completed.length ?? 0
  const progressPct = stage ? Math.round((completedCount / STAGE_ORDER.length) * 100) : 0

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm p-4 md:p-5 border border-slate-100',
        className
      )}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-1.5">
            <Loader2
              size={14}
              className={cn('text-blue-600', stage ? 'animate-spin-slow' : '')}
            />
            OPC 全流程进度
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            诊断 → 学习 → 实操 → 放大 · 点击节点查看历史详情
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500">已完成</div>
          <div className="text-base md:text-lg font-extrabold text-blue-600">
            {completedCount} / 4
            <span className="text-xs text-slate-400 ml-1 font-medium">({progressPct}%)</span>
          </div>
        </div>
      </div>

      {/* 4 节点进度条（水平实线连接） */}
      <div className="relative">
        {/* 水平实线（节点之间） */}
        <div aria-hidden className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200 z-0" />
        {/* 已完成段高亮 */}
        <div
          aria-hidden
          className="absolute top-5 left-5 h-0.5 bg-green-500 z-0 transition-all duration-500"
          style={{
            width: `calc((100% - 2.5rem) * ${progressPct / 100})`,
          }}
        />

        <ol className="relative z-10 grid grid-cols-4 gap-1">
          {STAGE_ORDER.map((key) => {
            const done = stage ? isStageCompleted(stage, key) : false
            const active = stage ? isStageActive(stage, key) : false
            const locked = !done && !active
            const meta = STAGE_META[key]
            const Icon = meta.icon
            const label = getStageLabel(key)
            const isExpanded = expandedStage === key

            return (
              <li key={key} className="flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => onStageClick?.(key)}
                  aria-label={label}
                  aria-expanded={isExpanded}
                  className={cn(
                    'group relative w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-all',
                    'hover:scale-110 active:scale-95 cursor-pointer',
                    done &&
                      'text-green-600 border-green-500 bg-green-50 shadow-sm shadow-green-200',
                    active &&
                      'text-blue-500 border-blue-500 shadow-lg shadow-blue-300/60 animate-pulse',
                    locked && 'text-slate-400 border-slate-200'
                  )}
                >
                  {done ? (
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                  ) : locked ? (
                    <CircleDashed size={16} strokeWidth={2} />
                  ) : (
                    <Icon size={16} strokeWidth={2.25} />
                  )}
                </button>
                <div
                  className={cn(
                    'mt-2 text-[11px] md:text-xs font-bold leading-tight',
                    done && 'text-green-700',
                    active && 'text-blue-700',
                    locked && 'text-slate-500'
                  )}
                >
                  {label}
                </div>
                <div
                  className={cn(
                    'mt-0.5 text-[9px] md:text-[10px] leading-snug line-clamp-2 px-0.5',
                    done && 'text-green-600/80',
                    active && 'text-blue-600/80',
                    locked && 'text-slate-400'
                  )}
                >
                  {STAGE_DESC[key]}
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* 进度提示 */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
        <ChevronDown size={12} />
        <span>
          {stage
            ? `当前阶段：${getStageLabel(stage.current)}，继续推进解锁下一步。`
            : '加载中…'}
        </span>
      </div>

      {/* 展开的历史详情卡片（controlled） */}
      {expandedStage && (
        <StageDetailPanel
          stageDetail={stageDetail}
          loading={loadingDetail}
          onClose={() => onStageClick?.(expandedStage)}
        />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 展开的详情面板（内部组件）
// ════════════════════════════════════════════════════════════════

function StageDetailPanel({
  stageDetail,
  loading,
  onClose,
}: {
  stageDetail: StageDetail | null | undefined
  loading?: boolean
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(true)
  if (!stageDetail && !loading) return null

  return (
    <div
      className={cn(
        'mt-4 pt-4 border-t border-slate-100',
        'animate-in fade-in slide-in-from-top-2 duration-300'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          📜 {stageDetail?.label || '加载中'} 阶段详情
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[10px] text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded"
        >
          收起 ✕
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
          <Loader2 size={12} className="animate-spin" />
          加载详情中…
        </div>
      ) : stageDetail ? (
        <>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            {stageDetail.summary}
          </p>
          <ul className="space-y-1.5">
            {stageDetail.items.map((it, i) => (
              <li
                key={i}
                className="flex items-start gap-2 p-2 rounded-lg bg-slate-50/80 border border-slate-100"
              >
                <span
                  className={cn(
                    'mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0',
                    stageDetail.status === 'completed' && 'bg-green-500',
                    stageDetail.status === 'active' && 'bg-blue-500',
                    stageDetail.status === 'locked' && 'bg-slate-300'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800">{it.title}</div>
                  <div className="text-[11px] text-slate-500 leading-snug">
                    {it.desc}
                  </div>
                  {it.meta && (
                    <div className="mt-0.5 inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {it.meta}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}

export default OPCProgressBar
