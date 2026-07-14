'use client'

/**
 * 良朋社 AI 助手 · 主动型 Copilot
 * ------------------------------------------------------------
 * 进化一：被动问答 → 主动感知
 *   1. 路由感知（usePathname + useSearchParams）
 *   2. 停留时长（useDwellTime，15s/30s/60s 三档深化）
 *   3. 点赞/点踩反馈（localStorage 训练优先级）
 *   4. OPC 类型个性化（读 localStorage['opc_level'] 注入文案）
 * ------------------------------------------------------------
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Wrench,
  FileText,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  FolderKanban,
  BookOpen,
  Briefcase,
  Compass,
  Target,
} from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import { useDwellTime } from '@/hooks/useDwellTime'
import {
  buildCopilotContext,
  pickBubbleByDwell,
  type CopilotContext,
} from '@/lib/ai-copilot-context'
import {
  recordFeedback,
  shouldSuppressBubble,
} from '@/lib/ai-copilot-feedback'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const ICON_MAP: Record<string, any> = {
  Wrench,
  FolderKanban,
  BookOpen,
  Briefcase,
  Compass,
  Sparkles,
  Target,
}

const STYLE_MAP: Record<
  string,
  { bg: string; border: string; text: string; iconBg: string }
> = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    border: 'border-blue-200/60',
    text: 'text-blue-900',
    iconBg: 'bg-blue-500',
  },
  purple: {
    bg: 'bg-gradient-to-br from-violet-50 to-purple-50',
    border: 'border-violet-200/60',
    text: 'text-violet-900',
    iconBg: 'bg-violet-500',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    border: 'border-amber-200/60',
    text: 'text-amber-900',
    iconBg: 'bg-amber-500',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-50 to-pink-50',
    border: 'border-rose-200/60',
    text: 'text-rose-900',
    iconBg: 'bg-rose-500',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    border: 'border-emerald-200/60',
    text: 'text-emerald-900',
    iconBg: 'bg-emerald-500',
  },
  slate: {
    bg: 'bg-white/95',
    border: 'border-slate-200',
    text: 'text-slate-700',
    iconBg: 'bg-slate-500',
  },
}

export default function AIAssistant() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const dwellSec = useDwellTime()
  const [isOpen, setIsOpen] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [dismissedHint, setDismissedHint] = useState<string>('')
  const [bubbleVersion, setBubbleVersion] = useState(0) // 切换提示档位时自增
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const { playTTS } = useAudio()
  const [conversationId, setConversationId] = useState<string>()
  const lastDwellTierRef = useRef<number>(0) // 0=未触发 1=15s 2=30s 3=60s
  // 任务 1：场景化提示（覆盖通用气泡）
  const [sceneHint, setSceneHint] = useState<{
    text: string
    sessionKey: string
  } | null>(null)

  // ════════ 任务 1：场景化感知 useEffect（监听 pathname + searchParams）══════
  // 触发条件：
  //   1. /market/projects?recommend=trader
  //   2. /projects/ai-digital-shop 且进度 = 0
  //   3. /scale-up 且停留 > 10s
  // sessionStorage 记录"用户已在本会话手动关闭"，避免反复打扰
  useEffect(() => {
    if (typeof window === 'undefined') return
    const p = pathname || ''
    const sp = searchParams?.toString() || ''

    // 条件 1：交易型推荐项目页
    if (p === '/market/projects' && /recommend=trader/.test(sp)) {
      const key = 'scene:market-projects-recommend-trader'
      const dismissed = window.sessionStorage.getItem(key)
      if (!dismissed) {
        setSceneHint({
          text: '你正在查看交易型推荐项目，需要我帮你列出【开店申请】的快速准备清单吗？',
          sessionKey: key,
        })
        return
      }
    }

    // 条件 2：AI 数字网店项目 SOP 详情页 + 进度为 0
    if (p === '/projects/ai-digital-shop') {
      try {
        const progress = window.localStorage.getItem('opc_sop_progress::ai-digital-shop')
        const step = progress ? parseInt(progress, 10) : 0
        if (!step || step === 0) {
          const key = 'scene:projects-ai-digital-shop-step0'
          const dismissed = window.sessionStorage.getItem(key)
          if (!dismissed) {
            setSceneHint({
              text: '第一步是开店申请。你可以点击卡片上的按钮直接跳转淘宝，回来后点"完成此步骤"即可。',
              sessionKey: key,
            })
            return
          }
        }
      } catch {
        // 静默
      }
    }

    // 条件 3：/scale-up 页面停留 > 10s（用 useDwellTime 单独计时）
    if (p === '/scale-up' && dwellSec > 10) {
      const key = 'scene:scale-up-dwell-10s'
      const dismissed = window.sessionStorage.getItem(key)
      if (!dismissed) {
        setSceneHint({
          text: '矩阵放大阶段，需要我帮你对比【系统型】和【资产型】路线的优劣势吗？',
          sessionKey: key,
        })
        return
      }
    }

    // 其它场景：清空 sceneHint，回退到通用气泡
    setSceneHint(null)
  }, [pathname, searchParams, dwellSec])

  // 路由变化时重置"已显示过的档位"标记
  useEffect(() => {
    lastDwellTierRef.current = 0
    setBubbleVersion((v) => v + 1)
  }, [pathname])

  const ctx: CopilotContext = useMemo(
    () => buildCopilotContext(pathname || ''),
    [pathname]
  )

  // 当前应该显示的提示语（场景化优先 → 按停留时长选档位）
  const activeBubble = useMemo(() => {
    if (sceneHint) return sceneHint.text
    if (dwellSec < 8) return ctx.bubble
    return pickBubbleByDwell(ctx, dwellSec)
  }, [ctx, dwellSec, sceneHint])

  // 是否被抑制（点踩次数过多）
  const suppressed = useMemo(
    () => (typeof window === 'undefined' ? false : shouldSuppressBubble(ctx.kind)),
    [ctx.kind]
  )

  // 首次进入（>0.5s）后弹气泡
  useEffect(() => {
    if (isOpen || suppressed) return
    if (!activeBubble) return
    // 场景化提示：跳过 dismissHint 检查（用 sessionKey 控制）
    if (sceneHint) {
      const t = setTimeout(() => setShowBubble(true), 800)
      return () => clearTimeout(t)
    }
    if (dismissedHint === ctx.kind) return
    const t = setTimeout(() => {
      setShowBubble(true)
    }, 1200)
    return () => clearTimeout(t)
  }, [ctx.kind, activeBubble, isOpen, dismissedHint, suppressed, sceneHint])

  // 停留时长档位跃迁：15s / 30s / 60s 重新弹气泡（强化提示）
  useEffect(() => {
    if (isOpen || suppressed) return
    if (sceneHint) return // 场景化提示期间不抢占
    if (dismissedHint === ctx.kind) return
    let tier = 0
    if (dwellSec >= 60) tier = 3
    else if (dwellSec >= 30) tier = 2
    else if (dwellSec >= 15) tier = 1
    if (tier > lastDwellTierRef.current && tier > 0) {
      lastDwellTierRef.current = tier
      setShowBubble(true)
      setBubbleVersion((v) => v + 1)
    }
  }, [dwellSec, ctx.kind, isOpen, dismissedHint, suppressed, sceneHint])

  // 首次打开 AI 面板：附上下文欢迎语
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        const welcome =
          ctx.kind === 'market-projects'
            ? '你正在看项目库，告诉我你的预算和擅长领域，我帮你筛出 3 个最匹配的 SOP 案例。'
            : ctx.kind === 'market-tools'
              ? '你正在看工具库，告诉我你现在的痛点（降本/引流/客户运营），我帮你匹配最合适的 3 个工具。'
              : ctx.kind === 'market-resources'
                ? '你正在看资源库，要我帮你找出"👍 实用指数"最高的 3 个资源吗？'
                : ctx.kind === 'market-services'
                  ? '你正在看服务库，告诉我你需要什么类型的服务（智能体定制 / GEO / 企业内训），我帮你精准匹配。'
                  : ctx.kind === 'project-detail'
                    ? '你正在看这个项目的 SOP，我可以告诉你它底层依赖的工具栈、投入产出比、7 天拆解。需要哪个？'
                    : ctx.kind.startsWith('guide-')
                      ? '你正在学习 OPC 路径，告诉我你卡在哪一步，我帮你突破。'
                      : ctx.kind === 'member'
                        ? '你正在个人中心，要不要我帮你梳理今天最该做的 3 件事？'
                        : ctx.kind === 'workspace'
                          ? '你正在工作台，告诉我你卡在哪项任务，我帮你拆解。'
                          : '你好，老板！我是良朋社AI助手，你想了解降本工具、还是线下沙龙？'
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          content: welcome,
          isUser: false,
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
      }, 300)
    }
  }, [isOpen, messages.length, ctx.kind])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setLoading(true)
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          city: '深圳',
          role: 'MEMBER',
          conversationId,
          currentRoute: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
          contextKind: ctx.kind,
          systemHint: ctx.systemHint,
        }),
      })
      const data = await response.json()
      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.data.answer,
          isUser: false,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
        setConversationId(data.data.conversationId)
      } else {
        throw new Error(data.error || 'AI 响应失败')
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，AI 助手暂时无法响应，请稍后重试。',
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 反馈按钮处理
  const handleFeedback = (type: 'up' | 'down') => {
    if (!sceneHint) {
      recordFeedback(ctx.kind, type)
    }
    setShowBubble(false)
    if (type === 'down' || sceneHint) {
      // 场景化提示：关闭即写 sessionStorage
      if (sceneHint && typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem(sceneHint.sessionKey, '1')
        } catch {
          // 静默
        }
      }
      if (type === 'down') {
        setDismissedHint(ctx.kind)
      }
    }
  }

  const style = STYLE_MAP[ctx.style] || STYLE_MAP.slate
  const Icon = ICON_MAP[ctx.icon] || Sparkles

  return (
    <>
      {/* ════════ 主动气泡（路由感知 + 停留时长深化 + 反馈按钮）══════ */}
      {!isOpen && showBubble && activeBubble && (
        <div
          key={`${ctx.kind}-${bubbleVersion}`}
          className="fixed bottom-40 right-6 z-40 max-w-[280px] animate-fade-in"
        >
          <div
            className={`relative backdrop-blur-md border shadow-xl rounded-2xl px-3.5 py-3 text-xs leading-relaxed ${style.bg} ${style.border} ${style.text}`}
          >
            <button
              onClick={() => {
                setShowBubble(false)
                // 场景化提示：写入 sessionStorage，本会话不再弹
                if (sceneHint && typeof window !== 'undefined') {
                  try {
                    window.sessionStorage.setItem(sceneHint.sessionKey, '1')
                  } catch {
                    // 静默
                  }
                } else {
                  setDismissedHint(ctx.kind)
                }
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-500"
            >
              <X size={10} />
            </button>
            <div className="flex items-start gap-1.5">
              <Icon size={12} className="mt-0.5 flex-shrink-0" />
              <span className="flex-1">{activeBubble}</span>
            </div>
            {ctx.cta && (
              <Link
                href={ctx.cta.href}
                onClick={() => setShowBubble(false)}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold opacity-90 hover:opacity-100"
              >
                {ctx.cta.label}
                <ArrowRight size={10} />
              </Link>
            )}
            {/* 反馈按钮区 */}
            <div className="mt-2 pt-2 border-t border-current/10 flex items-center justify-between">
              <span className="text-[9px] opacity-60">这个提示有用吗？</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleFeedback('up')}
                  className="w-5 h-5 rounded-md hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors"
                  aria-label="有帮助"
                >
                  <ThumbsUp size={10} />
                </button>
                <button
                  onClick={() => handleFeedback('down')}
                  className="w-5 h-5 rounded-md hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors"
                  aria-label="没帮助"
                >
                  <ThumbsDown size={10} />
                </button>
              </div>
            </div>
            <div className="absolute -bottom-2 right-6 w-3 h-3 bg-inherit border-r border-b border-inherit rotate-45" />
          </div>
        </div>
      )}

      {/* ════════ 呼吸光晕 3D 悬浮球 ═══════ */}
      <div className="fixed bottom-24 right-4 z-50">
        <div className="absolute inset-0 -m-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60 blur-xl animate-pulse" />
        <div className="absolute inset-0 -m-1 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-40 animate-ping" />
        <button
          onClick={() => {
            const next = !isOpen
            setIsOpen(next)
            setShowBubble(false)
            if (next && !hasGreeted) {
              setHasGreeted(true)
              const greetText =
                ctx.kind === 'market-tools'
                  ? '你正在浏览工具库，告诉我你的痛点，我帮你匹配最合适的项目案例。'
                  : ctx.kind === 'market-projects'
                    ? '老板你好，这里是项目库，要不要我推荐一个最适合你当前阶段的 SOP 案例？'
                    : ctx.kind === 'market-resources'
                      ? '你正在看资源库，要我帮你找出"👍 实用指数"最高的 3 个资源吗？'
                      : ctx.kind === 'market-services'
                        ? '你正在看服务库，告诉我你需要什么类型的服务，我帮你精准匹配。'
                        : '你好，我是良朋社的良良，欢迎来到智富生态系统，需要我帮你诊断一下工具需求吗？'
              setTimeout(() => {
                playTTS(greetText).catch(() => null)
              }, 350)
            }
          }}
          className="relative w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full shadow-2xl shadow-purple-500/40 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-300 border border-white/30"
        >
          {isOpen ? (
            <X size={24} className="transition-transform duration-200 drop-shadow" />
          ) : (
            <Sparkles size={24} className="drop-shadow animate-pulse" />
          )}
        </button>
      </div>

      {/* ════════ 聊天面板 ═══════ */}
      {isOpen && (
        <div className="fixed bottom-40 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          <div className="bg-gradient-to-r from-liangpeng-primary to-liangpeng-accent px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">良朋社AI助手</h3>
                <p className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  {ctx.kind === 'default' ? '在线' : `当前场景：${ctx.kind.replace(/-/g, ' · ')}`}
                </p>
              </div>
            </div>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.isUser
                      ? 'bg-liangpeng-primary text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.isUser ? 'text-white/70' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span className="text-xs">正在思考…</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-liangpeng-primary/50 transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || loading}
                className="w-10 h-10 bg-liangpeng-primary rounded-full flex items-center justify-center text-white hover:bg-liangpeng-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400">
                由 <span className="text-blue-600">Dify</span> + <span className="text-purple-600">硅基流动</span> 提供支持
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
