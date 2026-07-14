/**
 * AI四库全胜系统 · 资源库
 *
 * 结构:
 *   1. 顶部导航（搜索 / 横幅 / 4 库导航）由 /market/layout.tsx 提供
 *   2. MarketContent 渲染原有的 6 大资源板块
 *   3. 新增"AI 社区脉冲仪表板" - 替代传统论坛的社区风向标
 *   4. 新增"OPC 内部供需广场"社区入口
 */
import { MarketContent } from '@/components/market/MarketContent'
import { AICommunityDashboard } from '@/components/community/AICommunityDashboard'

export default function ResourcesPage() {
  return (
    <div>
      {/* 原资源库内容（6 大资源板块 + UGC 投稿） */}
      <MarketContent defaultTab="resources" standalone={false} />

      {/* AI 动态供需情报站（替代传统社区） */}
      <div className="mt-6">
        <AICommunityDashboard />
      </div>

      {/* 社区入口 */}
      <section className="mt-4 p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <span className="text-lg">💬</span>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">OPC 内部供需广场</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              留下你的项目卡点、找到同行者，AI 自动归类与匹配
            </p>
          </div>
        </div>
        <a
          href="/market/resources?tab=community"
          className="inline-flex items-center justify-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          进入供需广场
          <span>→</span>
        </a>
      </section>
    </div>
  )
}
