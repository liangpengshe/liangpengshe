'use client'

import { FileText, BookOpen, Rocket, TrendingUp, Calendar, CheckCircle2, ShoppingCart, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MemberMetrics } from '@/lib/member-dashboard'

/**
 * 商业数据看板 · 2x2 Bento 网格
 *
 *  📝 诊断数        📖 学习进度
 *  🚀 实操业绩      📈 放大进度
 */
export interface MetricsBentoProps {
  metrics: MemberMetrics
  className?: string
}

export function MetricsBento({ metrics, className }: MetricsBentoProps) {
  const learningPct =
    metrics.learning.totalCount > 0
      ? Math.round((metrics.learning.unlockedCount / metrics.learning.totalCount) * 100)
      : 0

  const taskPct =
    metrics.operation.tasksTotal > 0
      ? Math.round((metrics.operation.tasksDone / metrics.operation.tasksTotal) * 100)
      : 0

  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-1.5">
          <TrendingUp size={14} className="text-blue-600" />
          商业数据看板
        </h2>
        <span className="text-[10px] text-slate-400">实时更新</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {/* 卡片 1：📝 诊断数 */}
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl p-4 md:p-5',
            'bg-gradient-to-br from-blue-50 to-indigo-50',
            'border border-blue-100',
            'shadow-sm hover:shadow-md transition-shadow'
          )}
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-200/40 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
                <FileText size={12} className="text-white" />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-blue-700">诊断数</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-extrabold text-blue-900">
                {metrics.diagnosis.total}
              </span>
              <span className="text-[10px] text-blue-600 font-medium">次</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-blue-600/80">
              <Calendar size={10} />
              <span>
                最近：{metrics.diagnosis.latestDate || '暂无'}
              </span>
            </div>
            <div className="mt-2 text-[10px] text-blue-700/70">
              完成 AI 综合诊断，生成《OPC 智富蓝皮书》
            </div>
          </div>
        </div>

        {/* 卡片 2：📖 学习进度 */}
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl p-4 md:p-5',
            'bg-gradient-to-br from-emerald-50 to-green-50',
            'border border-emerald-100',
            'shadow-sm hover:shadow-md transition-shadow'
          )}
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-200/40 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center">
                <BookOpen size={12} className="text-white" />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-emerald-700">
                学习进度
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-extrabold text-emerald-900">
                {metrics.learning.unlockedCount}
                <span className="text-base text-emerald-700/60">
                  /{metrics.learning.totalCount}
                </span>
              </span>
              <span className="text-[10px] text-emerald-600 font-medium ml-1">
                ({learningPct}%)
              </span>
            </div>
            {/* 进度条 */}
            <div className="mt-2 h-1.5 rounded-full bg-emerald-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
                style={{ width: `${learningPct}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-600/80">
              <CheckCircle2 size={10} />
              <span>已完成 {metrics.learning.checkins} 次学习打卡</span>
            </div>
          </div>
        </div>

        {/* 卡片 3：🚀 实操业绩 */}
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl p-4 md:p-5',
            'bg-gradient-to-br from-rose-50 to-pink-50',
            'border border-rose-100',
            'shadow-sm hover:shadow-md transition-shadow'
          )}
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-rose-200/40 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-rose-500 flex items-center justify-center">
                <Rocket size={12} className="text-white" />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-rose-700">实操业绩</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-extrabold text-rose-900">
                {metrics.operation.orders}
              </span>
              <span className="text-[10px] text-rose-600 font-medium">单</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-rose-600/80">
              <ShoppingCart size={10} />
              <span>
                今日任务 {metrics.operation.tasksDone} / {metrics.operation.tasksTotal}
                <span className="ml-1 font-bold text-rose-700">({taskPct}%)</span>
              </span>
            </div>
            {/* 任务进度条 */}
            <div className="mt-2 h-1.5 rounded-full bg-rose-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500"
                style={{ width: `${taskPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 卡片 4：📈 放大进度 */}
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl p-4 md:p-5',
            'bg-gradient-to-br from-amber-50 to-orange-50',
            'border border-amber-100',
            'shadow-sm hover:shadow-md transition-shadow'
          )}
        >
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-200/40 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
                <TrendingUp size={12} className="text-white" />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-amber-700">放大进度</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-extrabold text-amber-900">
                {metrics.scaling.matrixTasks}
              </span>
              <span className="text-[10px] text-amber-600 font-medium">个矩阵任务</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-600/80">
              <Store size={10} />
              <span>
                已复制 {metrics.scaling.stores} 个店铺 / 账号
              </span>
            </div>
            <div className="mt-2 text-[10px] text-amber-700/70">
              完成矩阵复制任务，解锁城市主理人资格
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MetricsBento
