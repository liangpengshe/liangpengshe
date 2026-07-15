'use client'

/**
 * AI 智富私教 · 学习入门浮动教练
 * ------------------------------------------------------------
 * 功能：
 *   1. 默认折叠为右下角圆形浮窗按钮
 *   2. 点击展开为聊天框（移动端 / PC 适配）
 *   3. 首次打开自动注入用户 opc_level + 当前 page
 *   4. 调用 POST /api/guide/ai-coach 获取回复
 *
 * 引用方：src/app/guide/[level]/page.tsx
 * ------------------------------------------------------------
 */

import { useEffect, useRef, useState } from 'react'
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Brain,
  Loader2,
  Minimize2,
  RotateCcw,
  ChevronRight,
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: number
  source?: 'dify' | 'mock'
}

interface GuideAICoachProps {
  /** 当前学习页 OPC 类型 */
  level: 'trader' | 'flow' | 'system' | 'asset'
  /** 当前页面 URL（可选，默认根据 level 推断） */
  page?: string
  /** 用户城市（兜底 '深圳'） */
  city?: string
  /** 用户当前 opc_level（如 'TRADER'），可选 */
  opcLevel?: string | null
}

const LEVEL_LABEL: Record<string, string> = {
  trader: '交易型 OPC',
  flow: '流量型 OPC',
  system: '系统型 OPC',
  asset: '资产型 OPC',
}

const LEVEL_EMOJI: Record<string, string> = {
  trader: '💰',
  flow: '🔥',
  system: '⚙️',
  asset: '💎',
}

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  trader: [
    '我还是不明白怎么精准选品？',
    '开店保证金要交多少？',
    '淘宝违禁词有哪些？',
    '发货延迟了怎么处理？',
  ],
  flow: [
    '播放量卡在 200 怎么办？',
    '账号人设怎么定位？',
    '脚本开头前 3 秒怎么写？',
    '想矩阵但分身乏术？',
  ],
  system: [
    '客户说"想要 AI"但需求模糊？',
    'POC 很好但交付被打回？',
    '报价应该怎么算？',
    'POC 完成后如何收尾款？',
  ],
  asset: [
    '数字资产值多少钱？',
    'SaaS 化产品怎么定价？',
    '想出海但不懂海外市场？',
    'BP 应该怎么写？',
  ],
}

export function GuideAICoach({
  level,
  page,
  city = '深圳',
  opcLevel = null,
}: GuideAICoachProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const levelLabel = LEVEL_LABEL[level] || 'OPC'
  const levelEmoji = LEVEL_EMOJI[level] || '🎯'
  const suggestions = SUGGESTED_QUESTIONS[level] || []

  // 滚动到底部
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, messages])

  // 打开时自动聚焦
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [open])

  // 首次展开 → 注入问候语（携带 opc_level + page 上下文）
  useEffect(() => {
    if (open && !hasGreeted) {
      setHasGreeted(true)
      const greeting: ChatMessage = {
        id: `ai-greet-${Date.now()}`,
        role: 'ai',
        content: `Hi 我是你的 AI 智富私教 👋\n\n我看到你正在学习【${levelLabel}】，有任何卡点直接问我，我会给你"操作级"的具体方案。\n\n💡 ${opcLevel ? `已识别你的智富身份为【${opcLevel}】 · ` : ''}当前城市：${city}`,
        timestamp: Date.now(),
        source: 'mock',
      }
      setMessages([greeting])
    }
  }, [open, hasGreeted, levelLabel, opcLevel, city])

  /**
   * 发送问题到 /api/guide/ai-coach
   */
  const sendQuestion = async (text: string) => {
    const question = text.trim()
    if (!question || loading) return

    // 1. 插入用户消息
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // 2. 注入上下文（opc_level + page + city）
      const res = await fetch('/api/guide/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: {
            level,
            page: page || (typeof window !== 'undefined' ? window.location.pathname : `/guide/${level}`),
            city,
          },
        }),
      })

      const data = await res.json()

      if (data.success && data.reply) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'ai',
          content: data.reply,
          timestamp: Date.now(),
          source: data.source || 'mock',
        }
        setMessages((prev) => [...prev, aiMsg])
      } else {
        // 失败兜底
        const aiMsg: ChatMessage = {
          id: `ai-err-${Date.now()}`,
          role: 'ai',
          content: data.reply || '教练打盹了 😅，请稍后再试～',
          timestamp: Date.now(),
          source: 'mock',
        }
        setMessages((prev) => [...prev, aiMsg])
      }
    } catch (err) {
      const aiMsg: ChatMessage = {
        id: `ai-neterr-${Date.now()}`,
        role: 'ai',
        content: '网络异常，请检查连接后重试～',
        timestamp: Date.now(),
        source: 'mock',
      }
      setMessages((prev) => [...prev, aiMsg])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  /**
   * 点击推荐问题
   */
  const handleSuggestion = (q: string) => {
    sendQuestion(q)
  }

  /**
   * 清空对话
   */
  const handleReset = () => {
    setMessages([])
    setHasGreeted(false)
    // 重新触发问候
    setTimeout(() => setHasGreeted(true), 50)
  }

  return (
    <>
      {/* ════════ 浮动按钮（折叠态）══════ */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="打开 AI 智富私教"
          className="group fixed bottom-6 right-6 z-50 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full p-4 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 active:scale-95 transition-all"
        >
          <span className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping" />
          <span className="relative flex items-center gap-1.5">
            <MessageCircle size={22} className="drop-shadow" />
            <span className="hidden md:inline text-xs font-extrabold pr-1">私教</span>
          </span>
          {/* 角标 · 等级 */}
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md ring-2 ring-white">
            AI
          </span>
        </button>
      )}

      {/* ════════ 聊天框（展开态）══════ */}
      {open && (
        <div
          className="fixed z-50 inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[400px] md:h-[600px] md:max-h-[80vh] flex flex-col bg-white md:rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
          role="dialog"
          aria-label="AI 智富私教"
        >
          {/* 顶部 Hero */}
          <div className="relative flex-shrink-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white px-4 py-3 md:py-4">
            <div aria-hidden className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div aria-hidden className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex items-start gap-2.5">
              <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Brain size={20} className="md:w-5 md:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[10px] font-extrabold tracking-widest uppercase text-white/85 mb-0.5">
                  <Sparkles size={10} />
                  AI · 智富私教
                </div>
                <h3 className="text-sm md:text-base font-extrabold leading-tight truncate">
                  {levelEmoji} {levelLabel} · 实战教练
                </h3>
                <p className="text-[10px] md:text-[11px] text-white/80 mt-0.5">
                  上下文已注入 · 城市：{city}
                </p>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="重新开始"
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="最小化"
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* 消息流 */}
          <div className="flex-1 overflow-y-auto px-3 py-3 md:px-4 md:py-4 space-y-2.5 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}

            {loading && (
              <div className="flex items-end gap-2">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">
                  <Brain size={14} />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-3 py-2.5 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin text-blue-500" />
                    <span className="text-[11px] text-slate-500">教练正在思考…</span>
                    <div className="flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '120ms' }} />
                      <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '240ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 推荐问题（仅在只有问候语时显示） */}
            {messages.length <= 1 && !loading && (
              <div className="pt-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1 px-1">
                  💡 你可以这样问
                </div>
                <div className="space-y-1.5">
                  {suggestions.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSuggestion(q)}
                      className="group w-full text-left bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl px-3 py-2 text-[12px] text-slate-700 hover:text-blue-700 transition-all flex items-center justify-between gap-2 shadow-sm hover:shadow"
                    >
                      <span className="truncate flex-1">{q}</span>
                      <ChevronRight size={12} className="flex-shrink-0 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入区 */}
          <div className="flex-shrink-0 border-t border-slate-200 bg-white px-3 py-2.5 md:px-3 md:py-3 safe-area-pb">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendQuestion(input)
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendQuestion(input)
                  }
                }}
                placeholder={`问【${levelLabel}】相关问题…`}
                rows={1}
                disabled={loading}
                className="flex-1 resize-none bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-2xl px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-all max-h-24 disabled:opacity-50"
                style={{ minHeight: '38px' }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md hover:shadow-lg active:scale-95 transition-all"
                aria-label="发送"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-400 px-1">
              <span>📍 当前：{page || `/guide/${level}`}</span>
              <span>⏎ 发送 · Shift+⏎ 换行</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ════════════════════════════════════════════════════════════════
// 消息气泡
// ════════════════════════════════════════════════════════════════

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 头像 */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white ${
          isUser
            ? 'bg-gradient-to-br from-slate-500 to-slate-600'
            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
        }`}
      >
        {isUser ? (
          <span className="text-xs font-extrabold">你</span>
        ) : (
          <Brain size={14} />
        )}
      </div>

      {/* 气泡 */}
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-3 py-2 text-[12px] leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-md'
              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
          }`}
        >
          {message.content}
        </div>
        <div className={`mt-0.5 text-[9px] text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {isUser ? (
            <span>{formatTime(message.timestamp)}</span>
          ) : (
            <span className="inline-flex items-center gap-1">
              {formatTime(message.timestamp)}
              {message.source === 'mock' && (
                <span className="text-amber-500" title="本地兜底">· 兜底</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
