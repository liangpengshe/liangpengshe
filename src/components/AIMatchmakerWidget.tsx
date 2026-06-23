'use client'

import { useState } from 'react'
import { Sparkles, Loader2, MapPin, Tag, Target, Users } from 'lucide-react'

interface MatchedPartner {
  id: string
  name: string
  city: string
  description: string
  tags: string[]
  status: string
  matchScore: number
}

interface MatchResult {
  matches: MatchedPartner[]
  extracted: {
    tags: string[]
    intent: string
    city: string
  }
  source: string
  total: number
}

interface AIMatchmakerWidgetProps {
  defaultCity?: string
  compact?: boolean
}

export default function AIMatchmakerWidget({ defaultCity = '', compact = false }: AIMatchmakerWidgetProps) {
  const [userInput, setUserInput] = useState('')
  const [city, setCity] = useState(defaultCity)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMatch = async () => {
    if (!userInput.trim()) {
      setError('请输入你的需求描述')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, city }),
      })

      const data = await res.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || '匹配失败，请重试')
        if (data.data) setResult(data.data)
      }
    } catch (err: any) {
      setError(err.message || '网络错误')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  return (
    <div className={compact ? '' : 'py-12'}>
      <div className={`bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100 rounded-3xl ${compact ? 'p-5' : 'p-6 md:p-8'} shadow-sm`}>
        {/* 标题 */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-gray-900`}>
              AI 智能供需匹配
            </h3>
            <p className="text-xs text-gray-500">描述你的需求，AI 帮你找到最合适的合伙人</p>
          </div>
        </div>

        {/* 输入区 */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="📍 所在城市（如：杭州）"
              className="md:w-40 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMatch()}
              placeholder="💡 描述你的需求（如：我想在杭州找 AI 带货的合伙伙伴）"
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            <button
              onClick={handleMatch}
              disabled={loading}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  AI 匹配中...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  AI 找伙伴
                </>
              )}
            </button>
          </div>

          {/* 推荐示例 */}
          {!result && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 py-1">试试：</span>
              {[
                '杭州 AI 跨境电商合伙伙伴',
                '深圳 抖音数字人直播合作',
                '上海 AI 工具落地服务商',
                '广州 本地生活陪跑教练',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setUserInput(example)
                    if (example.startsWith('杭州')) setCity('杭州')
                    else if (example.startsWith('深圳')) setCity('深圳')
                    else if (example.startsWith('上海')) setCity('上海')
                    else if (example.startsWith('广州')) setCity('广州')
                  }}
                  className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* 提取结果 */}
        {result?.extracted && (result.extracted.tags.length > 0 || result.extracted.intent) && (
          <div className="mt-5 p-4 bg-white/70 backdrop-blur border border-indigo-100 rounded-2xl">
            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <Target size={12} />
              AI 已识别你的需求：
            </div>
            <div className="flex flex-wrap gap-2">
              {result.extracted.intent && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
                  意图：{result.extracted.intent}
                </span>
              )}
              {result.extracted.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 匹配列表 */}
        {result && result.matches.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Users size={16} className="text-indigo-600" />
                为你匹配到 {result.matches.length} 位合伙人
              </div>
              {result.source && (
                <span className="text-xs text-gray-400">
                  数据源：{result.source === 'dify+supabase' ? 'Dify + Supabase' : '本地示例'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.matches.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{partner.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <MapPin size={10} />
                        {partner.city}
                      </div>
                    </div>
                    <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getScoreColor(partner.matchScore)}`}>
                      匹配度 {partner.matchScore}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3">
                    {partner.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {partner.tags.slice(0, 4).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {result && result.matches.length === 0 && (
          <div className="mt-5 p-6 text-center text-sm text-gray-500 bg-white/50 border border-dashed border-gray-300 rounded-2xl">
            😔 暂未找到匹配的合伙人，请尝试调整需求描述或扩大城市范围
          </div>
        )}
      </div>
    </div>
  )
}
