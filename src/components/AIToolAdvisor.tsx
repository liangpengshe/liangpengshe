'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, Target, Clock, TrendingUp, Zap } from 'lucide-react'
import ShareReportCTA from '@/components/ShareReportCTA'

interface ToolRecommendation {
  toolName: string
  category: string
  reason: string
  learningTime: string
  efficiency: string
  isOpcTool: boolean
}

interface RecommendResponse {
  success: boolean
  data?: {
    recommendations: ToolRecommendation[]
    total: number
    source: string
  }
  error?: string
}

// 骨架屏卡片
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-100 rounded w-14" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
      </div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-1/4" />
      </div>
    </div>
  )
}

export default function AIToolAdvisor() {
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([])
  const [source, setSource] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const handleRecommend = async () => {
    if (!userInput.trim()) {
      setError('请先描述你的业务想法')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/tools-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      })

      const data: RecommendResponse = await res.json()

      if (data.success && data.data) {
        setRecommendations(data.data.recommendations)
        setSource(data.data.source)
      } else {
        setError(data.error || '推荐失败，请重试')
      }
    } catch (err: any) {
      setError(err.message || '网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-12 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-lg mx-auto md:max-w-6xl">
        {/* 标题区 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
            <Target size={14} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-600">AI 工具栈诊断</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              AI 工具栈即时诊断
            </span>
            <span className="text-gray-900">与推荐</span>
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            描述你的业务想法，AI 帮你一键生成最佳技术栈组合
          </p>
        </div>

        {/* 输入卡片 */}
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border border-blue-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="描述你的业务想法，例如：我想做一个 AI 数字人直播带货系统"
            rows={4}
            disabled={loading}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none disabled:opacity-50"
          />

          <button
            onClick={handleRecommend}
            disabled={loading || !userInput.trim()}
            className="mt-4 w-full md:w-auto md:min-w-[280px] py-3.5 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold rounded-2xl text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                AI 正在分析中...
              </>
            ) : (
              <>
                <span className="text-lg">🎯</span>
                智能推荐技术栈
                <Sparkles size={16} />
              </>
            )}
          </button>

          {/* 推荐示例 */}
          {!loading && recommendations.length === 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 py-1">试试：</span>
              {[
                '我想做一个 AI 数字人直播带货系统',
                '我想开一个跨境电商店铺',
                '我是一名自由职业者，想用 AI 提高内容产出',
                '我想搭建一个 AI 智能客服系统',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setUserInput(example)}
                  className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* 结果展示区 */}
        <div className="mt-8">
          {/* 加载骨架屏 */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* 推荐结果 */}
          {!loading && recommendations.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-600" />
                  <h3 className="text-base font-bold text-gray-900">
                    为你推荐 {recommendations.length} 个工具
                  </h3>
                </div>
                {source && (
                  <span className="text-xs text-gray-400">
                    数据源：{source === 'dify' ? 'Dify AI' : '本地推荐'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {recommendations.map((tool, idx) => (
                    <motion.div
                      key={`${tool.toolName}-${idx}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="relative bg-white rounded-2xl shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {/* OPC 独家闪烁标签 */}
                      {tool.isOpcTool && (
                        <div className="absolute top-3 right-3">
                          <div className="relative inline-flex items-center gap-1 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            <Sparkles size={10} className="animate-pulse" />
                            独家
                          </div>
                        </div>
                      )}

                      {/* 顶部：工具名 + 分类 */}
                      <div className="mb-3 pr-16">
                        <h4 className="text-base font-bold text-gray-900 mb-1">
                          {tool.toolName}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {tool.category}
                        </span>
                      </div>

                      {/* 中部：推荐理由 */}
                      <p className="text-sm text-gray-600 leading-relaxed mb-4 min-h-[60px]">
                        {tool.reason}
                      </p>

                      {/* 底部：学习周期 + 效率提升 */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={12} />
                          <span>{tool.learningTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                          <TrendingUp size={12} />
                          <span>效率 +{tool.efficiency.replace(/[^0-9]/g, '') || '200'}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* 任务 4 留白：AI 深度追问 */}
              <div className="mt-8 bg-gradient-to-r from-slate-50 to-blue-50/50 border border-dashed border-blue-200 rounded-2xl p-5 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Zap size={14} className="text-blue-500" />
                  <span>想深入了解某个工具？后续将开放 AI 深度追问，给你一份两周学习大纲</span>
                </div>
              </div>

              {/* 分享 + 微信引流 CTA */}
              <ShareReportCTA
                reportType="tools"
                title="AI 工具栈推荐清单"
                summary={`为你推荐 ${recommendations.length} 个工具：${recommendations.slice(0, 3).map((r) => r.toolName).join('、')}`}
                themeColor="emerald"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
