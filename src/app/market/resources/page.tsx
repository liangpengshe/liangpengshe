/**
 * AI四库全胜系统 · 资源库
 *
 * 结构:
 *   1. 顶部导航（搜索 / 横幅 / 4 库导航）由 /market/layout.tsx 提供
 *   2. MarketContent 渲染原有的 6 大资源板块（含紫色 OPC 生态成员横幅）
 *   3. 内部供需广场入口（绿色 section）
 *
 * [精简] 已删除原"极简文字入口：成员实战投稿 / 本周 OPC 风向标"两个独立 div，
 *       避免与 MarketContent 内部已有入口重复 + 减少上下两块横幅之间的白色留白
 */
import { MarketContent } from '@/components/market/MarketContent'

export default function ResourcesPage() {
  return (
    <div>
      {/* 原资源库内容（6 大资源板块 + 紫色 OPC 生态成员横幅） */}
      <MarketContent defaultTab="resources" standalone={false} />

      {/* 内部供需广场（绿色 section）· 用 -mt-24 抵销 MarketContent <main py-6 pb-6> 24px + 紫色横幅 pb-8 32px + 隐式间距 ≈ 96px，紧贴紫色横幅 */}
      <section className="-mt-24 p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
