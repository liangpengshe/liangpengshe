'use client'

import { Suspense } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Gift, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const TYPE_META: Record<
  string,
  { title: string; color: string; gradient: string; bg: string; border: string; text: string }
> = {
  diagnose: {
    title: 'AI 商业诊断报告',
    color: 'blue',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    bg: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
  },
  plan: {
    title: 'AI 个人商业规划',
    color: 'purple',
    gradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
    bg: 'from-purple-50 to-pink-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
  },
  tools: {
    title: 'AI 工具栈推荐',
    color: 'emerald',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    bg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
  },
}

function PosterContent() {
  const params = useParams()
  const search = useSearchParams()
  const [copied, setCopied] = useState(false)

  const type = (params?.type as string) || 'diagnose'
  const meta = TYPE_META[type] || TYPE_META.diagnose
  const user = search?.get('user') || '朋友'
  const title = search?.get('title') || '我的专属 AI 报告'
  const summary = search?.get('summary') || '良朋社 AI 一键生成 · 深度分析 · 实战建议'
  const id = search?.get('id') || 'preview'

  const shareUrl =
    typeof window !== 'undefined' ? window.location.href : `https://liangpengshe.com/share/${type}?id=${id}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {/* ignore */}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* 顶部 */}
      <header className="px-4 py-6 flex items-center justify-between max-w-md mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          返回首页
        </Link>
        <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-xs">
          <Sparkles size={12} className="text-amber-300" />
          良朋社 AI
        </div>
      </header>

      <main className="px-4 pb-12 max-w-md mx-auto">
        {/* 海报主体 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* 顶部装饰 */}
          <div className={`bg-gradient-to-r ${meta.gradient} p-6 text-white relative overflow-hidden`}>
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-amber-300/20 rounded-full blur-xl" />
            <div className="relative">
              <div className="text-xs font-semibold opacity-90 mb-1">{meta.title}</div>
              <div className="text-2xl font-bold leading-tight">
                {user}，<br />
                这是你的 AI 报告
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs">
                <Sparkles size={12} />
                良朋社 AI 一键生成
              </div>
            </div>
          </div>

          {/* 报告标题 + 摘要 */}
          <div className="p-6">
            <div className={`inline-flex items-center gap-1 text-xs font-semibold ${meta.text} bg-gradient-to-r ${meta.bg} border ${meta.border} rounded-full px-3 py-1 mb-3`}>
              <Sparkles size={12} />
              报告核心
            </div>
            <h2 className="text-lg font-bold leading-snug mb-3">{title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { v: '98%', l: '推荐准确度' },
                { v: '3000+', l: '咨询价值' },
                { v: '5min', l: '生成时间' },
              ].map((m) => (
                <div
                  key={m.l}
                  className={`rounded-xl py-2.5 px-2 bg-gradient-to-br ${meta.bg} border ${meta.border}`}
                >
                  <div className={`text-lg font-bold ${meta.text}`}>{m.v}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">{m.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 行动召唤 + 二维码 */}
          <div className="px-6 pb-6">
            <div className={`rounded-2xl p-5 bg-gradient-to-r ${meta.bg} border ${meta.border}`}>
              <div className="text-center mb-3">
                <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-bold">
                  <Gift size={12} />
                  限前 500 名
                </div>
              </div>
              <h3 className="text-center text-base font-bold text-slate-900 mb-1">
                也想要这样一份报告？
              </h3>
              <p className="text-center text-xs text-slate-600 mb-4">
                扫码添加「良朋社小助手（朋朋）」
                <br />
                立即免费生成你的专属 AI 报告
              </p>

              <Link
                href="/"
                className={`block w-full py-3 bg-gradient-to-r ${meta.gradient} text-white text-sm font-bold rounded-2xl text-center shadow-lg hover:scale-[1.02] active:scale-95 transition-all`}
              >
                🚀 立即生成我的 AI 报告
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 分享链接 */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-2">🔗 分享链接</div>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-xs text-slate-300 truncate"
            />
            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                copied ? 'bg-green-500 text-white' : 'bg-white text-slate-900'
              }`}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        </div>

        {/* 引导文案 */}
        <div className="mt-6 text-center">
          <div className="text-amber-300 text-sm font-semibold">📢 把这个超准的 AI 诊断报告分享给老板朋友</div>
          <div className="text-xs text-slate-400 mt-1">帮他省 3000 块咨询费，你也有福利 🎁</div>
        </div>
      </main>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          加载中...
        </div>
      }
    >
      <PosterContent />
    </Suspense>
  )
}
