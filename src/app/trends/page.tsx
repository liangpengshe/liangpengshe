/**
 * 本周 OPC 创业者热议风向标
 *
 * 路由：/trends
 *
 * 原本嵌在 /market/resources 页面底部的"AI 社区脉冲"模块，已剥离为独立深色科技风页面
 */
import Link from 'next/link'
import { ChevronLeft, Radio } from 'lucide-react'
import { AICommunityDashboard } from '@/components/community/AICommunityDashboard'

export default function TrendsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white">
      {/* 顶部：返回 + 标题 */}
      <header className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/market/resources"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <ChevronLeft size={14} />
            返回资源库
          </Link>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-cyan-400/30">
              <Radio size={20} className="text-white animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  AI 社区脉冲 · 实时
                </span>
              </div>
              <h1 className="text-xl md:text-3xl font-extrabold leading-tight">
                本周 OPC 创业者
                <span className="ml-1 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                  热议风向标
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">
                基于本周真实社区行为 AI 自动聚合，告诉你 OPC 同行在关注什么、卡在哪里、有哪些机会
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 主体：原 AI 社区脉冲模块 */}
      <main className="px-4 py-4 md:px-6 md:py-6">
        <div className="max-w-4xl mx-auto">
          <AICommunityDashboard />
        </div>
      </main>

      {/* 底部辅助入口 */}
      <footer className="px-4 py-6 md:px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>风向标每 6 小时由 Dify AI 重新聚合一次</span>
          <div className="flex items-center gap-4">
            <Link
              href="/market/resources/community-posts"
              className="hover:text-cyan-300 transition-colors"
            >
              📦 投稿实战资源
            </Link>
            <Link
              href="/market/resources?tab=community"
              className="hover:text-cyan-300 transition-colors"
            >
              💬 内部供需广场
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
