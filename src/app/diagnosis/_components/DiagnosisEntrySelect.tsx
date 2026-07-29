'use client'

/**
 * DiagnosisEntrySelect · 入口选择器（select 阶段）
 * ------------------------------------------------------------
 * 任务：拆 diagnosis/page.tsx（演进项 3.5）
 * 职责：渲染"AI 帮我定位 / 快速定位模式"二选一 + "路径选择卡"四选。
 *       通过 props 接收 startChat / startForm / startChatWithPath 三个回调。
 * ------------------------------------------------------------
 */
import { motion } from 'framer-motion'
import { ArrowRight, ListChecks, Zap } from 'lucide-react'
import type { SelectedPath, PathComparison } from '../_data/pathComparisons'

interface DiagnosisEntrySelectProps {
  pathComparisons: readonly PathComparison[]
  onStartChat: () => void
  onStartForm: () => void
  onStartChatWithPath: (path: SelectedPath) => void
}

export function DiagnosisEntrySelect({
  pathComparisons,
  onStartChat,
  onStartForm,
  onStartChatWithPath,
}: DiagnosisEntrySelectProps) {
  return (
    <motion.section
      key="select"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="px-4"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 上排：AI / 手动 二选一 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onStartChat}
            data-testid="entry-ai"
            className="group relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 hover:scale-[1.02] active:scale-[0.99] transition-all rounded-2xl p-6 md:p-8 text-left text-white border border-white/20 shadow-2xl shadow-purple-500/30 min-h-[180px] flex flex-col justify-between"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">AI 帮我定位</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                对话式诊断，路径最短。
                <br />
                <span className="text-white/60">仅需回答 4 个关键问题</span>
              </p>
            </div>
            <div className="relative mt-4 inline-flex items-center gap-1 text-sm font-bold">
              <span>开始对话</span>
              <Zap size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={onStartForm}
            data-testid="entry-quick"
            className="group relative bg-transparent hover:bg-white/5 transition-all rounded-2xl p-6 md:p-8 text-left text-white/90 border-2 border-white/15 hover:border-white/30 min-h-[180px] flex flex-col justify-between"
          >
            <div className="relative">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">快速定位模式</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                已有明确方向？
                <br />
                <span className="text-white/40">
                  直接用「系统型」案例体验报告
                </span>
              </p>
            </div>
            <div className="relative mt-4 inline-flex items-center gap-1 text-sm font-bold text-white/60 group-hover:text-white">
              <span>示例报告</span>
              <ListChecks size={14} />
            </div>
          </button>
        </div>

        {/* 下排：路径选择卡 */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-lg">🤔</span>
            <h3 className="text-base md:text-lg font-bold text-white">
              你想从哪条路开始？
            </h3>
            <span className="ml-auto text-[10px] text-white/40 hidden md:inline">
              点击直接进入对话，自动填入初始背景
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pathComparisons.map((p) => (
              <button
                key={p.key}
                onClick={() => onStartChatWithPath(p.key)}
                data-testid={`entry-path-${p.key}`}
                className={`group relative text-left rounded-2xl p-5 bg-gradient-to-br ${p.gradient} bg-opacity-15 border border-white/20 hover:scale-[1.02] active:scale-[0.99] transition-all overflow-hidden`}
              >
                <div
                  className={`absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br ${p.gradient} opacity-25 rounded-full blur-2xl`}
                />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{p.emoji}</span>
                    <h4 className="text-base md:text-lg font-extrabold text-white">
                      {p.label}
                    </h4>
                    <span className="ml-auto text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-xs text-white/85 mb-3 leading-relaxed">
                    {p.tagline}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="text-white/60 mb-0.5">⏱ 最快出单</div>
                      <div className="text-white font-bold">{p.fastestTime}</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="text-white/60 mb-0.5">🛠 需要技能</div>
                      <div className="text-white font-bold leading-snug">
                        {p.skills.slice(0, 2).join('、')}
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="text-white/60 mb-0.5">⚠️ 初期风险</div>
                      <div className="text-white font-bold leading-snug">
                        {p.risks[0]}
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="text-white/60 mb-0.5">🎯 适合谁</div>
                      <div className="text-white font-bold leading-snug">
                        {p.fitFor[0]}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white opacity-90 group-hover:opacity-100 group-hover:gap-2 transition-all">
                    <span>选这条路开始</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
