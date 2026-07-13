'use client'

import { Wrench, FolderKanban, Briefcase, BookOpen, Sparkles, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * AI智富全流程 · 智能引导区
 *
 * 升级点（v2 顶流化）：
 *   - 视觉降级：从"命令中心"变"辅助助手"
 *     · 外层：bg-white/80 backdrop-blur-sm（保留）
 *     · 胶囊按钮：bg-white/50 border border-slate-200（半透明，去掉彩色）
 *   - 增加第 4 个按钮：前往资源库（amber tone）
 *   - 顶部标签：保留"根据您的AI诊断自动推荐" + 新增"AI智富全流程"标签
 *   - 删除冗余的"点击按钮自动定位"小字
 *   - 改用 router.push(/market/{tab})，跳转更符合操作直觉
 */

export type LibraryTabValue = 'tools' | 'projects' | 'services' | 'resources'

export interface FlowControlBarProps {
  /** 来自后端模拟的 nextAction 提示文本（最多展示 3 条） */
  nextActions?: string[]
  /** 点击快捷按钮时触发，跳转到 /market/{tab} */
  onJumpToTab: (
    tab: LibraryTabValue,
    options?: { highlightItemName?: string }
  ) => void
  /** 当前激活的 Tab（用于给按钮加 active 态） */
  activeTab?: LibraryTabValue
  className?: string
}

const DEFAULT_TIPS: string[] = [
  '欢迎进入四库。根据您的AI诊断，请先前往【工具库】完成首件工具配置。',
  '完成工具后，【项目库】会基于您的选品推荐对标项目 SOP。',
  '【服务库】提供 1v1 AI 陪跑，【资源库】整合了行业研报与渠道对接。',
]

const QUICK_BUTTONS: Array<{
  tab: LibraryTabValue
  label: string
  icon: LucideIcon
  defaultItemName: string
}> = [
  { tab: 'tools', label: 'AI智富工具库', icon: Wrench, defaultItemName: '豹纹工坊' },
  { tab: 'projects', label: 'AI智富项目库', icon: FolderKanban, defaultItemName: 'AI 网店群' },
  { tab: 'services', label: 'AI智富服务库', icon: Briefcase, defaultItemName: 'GEO 增长陪跑' },
  { tab: 'resources', label: 'AI智富资源库', icon: BookOpen, defaultItemName: '行业研报' },
]

export function FlowControlBar({
  nextActions,
  onJumpToTab,
  activeTab,
  className,
}: FlowControlBarProps) {
  const tips = (nextActions && nextActions.length > 0 ? nextActions : DEFAULT_TIPS).slice(0, 3)

  return (
    <div
      className={cn(
        'bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-3',
        className
      )}
    >
      <div className="flex flex-col gap-2.5">
        {/* 标题行：图标 + 主标题 + 右侧两个标签 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Sparkles size={14} className="text-blue-600" />
          <span className="text-xs font-bold text-slate-800">智能引导 · 四库全流程</span>
          {/* AI智富全流程 标签（新增） */}
          <span className="inline-flex items-center gap-1 px-2 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
            ✨ AI智富全流程
          </span>
          <span className="ml-auto text-[10px] text-slate-400 hidden md:inline">
            根据您的AI诊断自动推荐
          </span>
        </div>

        {/* 3 条 nextAction 提示 */}
        <ul className="space-y-1">
          {tips.map((tip, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 text-[11px] text-slate-600 leading-relaxed"
            >
              <span className="text-blue-500 font-bold flex-shrink-0">{i + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>

        {/* 4 个快捷跳转按钮（统一轻量风格 · 无底部提示） */}
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 flex-wrap">
          {QUICK_BUTTONS.map((b) => {
            const Icon = b.icon
            const isActive = activeTab === b.tab
            return (
              <button
                key={b.tab}
                type="button"
                onClick={() =>
                  onJumpToTab(b.tab, { highlightItemName: b.defaultItemName })
                }
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 h-8 rounded-full border text-xs font-bold transition-all',
                  // 视觉降级：半透明白色 + 灰色边框
                  isActive
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white/50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 hover:text-slate-800'
                )}
              >
                <Icon size={12} />
                <span>前往{b.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default FlowControlBar
