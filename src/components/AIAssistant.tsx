'use client'

import { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, X, Send, Sparkles, ArrowRight, Lightbulb, Wrench, FileText } from 'lucide-react'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

// 路由 → 上下文规则
function buildContext(pathname: string) {
  // /tools → 询问是否匹配项目库案例
  if (pathname === '/tools' || pathname?.startsWith('/tools?')) {
    return {
      kind: 'tools' as const,
      bubble: '您正在寻找工具，需要我为您匹配最适合这个工具的【项目库案例】吗？',
      sideHint: null,
      cta: { label: '查看项目库', href: '/projects' },
      systemHint:
        '用户当前停留在 /tools 页面（工具库）。请主动询问用户是否需要根据所浏览的工具，推荐 OPC 项目库中的实战案例（SOP/案例文章）。',
    }
  }

  // /projects/[id] 详情页 → 显示底层依赖的工具
  if (pathname?.startsWith('/projects/') && pathname !== '/projects') {
    const projectId = pathname.split('/projects/')[1]?.split('/')[0]
    return {
      kind: 'project-detail' as const,
      bubble: null,
      sideHint: {
        title: '底层依赖工具识别',
        desc: '这个项目底层依赖的是 [AI 数字人口播 + 自动剪辑工具]，点击跳转工具库查看。',
        toolName: 'AI 数字人口播 + 自动剪辑工具',
        projectId,
      },
      cta: { label: '跳转工具库', href: '/tools' },
      systemHint: `用户当前正在浏览 /projects/${projectId || '?'} 这篇项目 SOP 详情。请在回答时主动告知：该项目底层的"工具依赖栈"是 AI 数字人口播 + 自动剪辑工具，并引导用户跳转 /tools 查看完整工具链。`,
    }
  }

  // /projects → 介绍项目库价值
  if (pathname === '/projects' || pathname?.startsWith('/projects?')) {
    return {
      kind: 'projects' as const,
      bubble: '您正在浏览项目库，需要我帮您找出 3 个最匹配您生意的 SOP 案例吗？',
      sideHint: null,
      cta: null,
      systemHint:
        '用户当前停留在 /projects 页面（项目库/SOP 案例）。请主动询问用户想做哪类业务（内容创作 / 本地服务 / 私域 / 教育等），并基于此推荐 3 个最匹配的 SOP 案例。',
    }
  }

  // 默认
  return {
    kind: 'default' as const,
    bubble: null,
    sideHint: null,
    cta: null,
    systemHint: `用户当前路径：${pathname}。无特殊上下文。`,
  }
}

export default function AIAssistant() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [dismissedHint, setDismissedHint] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>()

  const ctx = useMemo(() => buildContext(pathname || ''), [pathname])

  useEffect(() => {
    // 2.5 秒后自动弹出气泡（仅默认欢迎气泡）
    const bubbleTimer = setTimeout(() => {
      if (!isOpen) setShowBubble(true)
    }, 2500)
    return () => clearTimeout(bubbleTimer)
  }, [isOpen])

  useEffect(() => {
    // 路由变化时：自动弹出对应上下文气泡（仅在未关闭过的情况下）
    if (dismissedHint === ctx.kind) return
    if (!ctx.bubble) return
    const t = setTimeout(() => {
      setShowBubble(true)
    }, 1500)
    return () => clearTimeout(t)
  }, [ctx.kind, ctx.bubble, dismissedHint])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        // 首次欢迎语附带上下文
        const welcome =
          ctx.kind === 'tools'
            ? '您正在浏览工具库，我可以根据您想解决的问题（如降本 / 引流 / 客户运营），推荐 3 个最匹配的 OPC 实战项目案例。需要我展示吗？'
            : ctx.kind === 'projects'
              ? '您正在浏览项目库，告诉我您做的生意类型（餐饮 / 美业 / 知识付费 / 私域 等），我帮您找出 3 个最匹配的 SOP 案例。'
              : ctx.kind === 'project-detail'
                ? '您正在查看这篇 SOP 案例，我可以告诉您它底层依赖的"工具链"，并推荐同类替代工具。需要吗？'
                : '你好，老板！我是良朋社AI助手，你想了解降本工具，还是线下沙龙？'
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

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          city: '深圳',
          role: 'MEMBER',
          conversationId,
          // 上下文感知：把当前路由 + 系统提示注入 Dify
          currentRoute: pathname,
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
        setMessages(prev => [...prev, aiMessage])
        setConversationId(data.data.conversationId)
      } else {
        throw new Error(data.error || 'AI 响应失败')
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，AI 助手暂时无法响应，请稍后重试。',
        isUser: false,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
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

  return (
    <>
      {/* 📌 侧边上下文提示（/projects/[id] 时显示） */}
      {!isOpen && ctx.sideHint && dismissedHint !== ctx.kind && (
        <div className="fixed bottom-40 right-24 z-40 max-w-[260px] hidden md:block animate-fade-in">
          <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/60 rounded-2xl p-3.5 shadow-xl">
            <button
              onClick={() => setDismissedHint(ctx.kind)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-gray-200 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shadow"
            >
              <X size={10} />
            </button>
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Wrench size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-blue-600 mb-0.5">{ctx.sideHint.title}</div>
                <div className="text-xs text-gray-700 leading-relaxed">
                  这个项目底层依赖的是{' '}
                  <span className="font-semibold text-purple-700">【{ctx.sideHint.toolName}】</span>
                  ，点击跳转工具库。
                </div>
                <Link
                  href="/tools"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                >
                  跳转工具库
                  <ArrowRight size={10} />
                </Link>
              </div>
            </div>
            <div className="absolute -bottom-2 right-8 w-3 h-3 bg-gradient-to-br from-blue-50 to-purple-50 border-r border-b border-blue-200/60 rotate-45" />
          </div>
        </div>
      )}

      {/* 提示气泡（默认 / 路由上下文） */}
      {!isOpen && showBubble && (
        <div className="fixed bottom-40 right-6 z-40 max-w-[220px] animate-fade-in">
          <div
            className={`relative backdrop-blur-md border shadow-xl rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${
              ctx.kind === 'tools'
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60 text-blue-900'
                : ctx.kind === 'projects'
                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/60 text-purple-900'
                  : 'bg-white/90 border-white/40 text-gray-700'
            }`}
          >
            <button
              onClick={() => {
                setShowBubble(false)
                if (ctx.kind !== 'default') setDismissedHint(ctx.kind)
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-500"
            >
              <X size={10} />
            </button>
            <div className="flex items-start gap-1.5">
              {ctx.kind === 'tools' && <Wrench size={12} className="mt-0.5 text-blue-600 flex-shrink-0" />}
              {ctx.kind === 'projects' && <FileText size={12} className="mt-0.5 text-purple-600 flex-shrink-0" />}
              {ctx.kind === 'default' && <Sparkles size={12} className="mt-0.5 text-purple-500 flex-shrink-0" />}
              <span>{ctx.bubble || '✨ 我正在学习深圳本地的 AI 案例，需要我帮你找找吗？'}</span>
            </div>
            {ctx.cta && (
              <Link
                href={ctx.cta.href}
                onClick={() => setShowBubble(false)}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
              >
                {ctx.cta.label}
                <ArrowRight size={10} />
              </Link>
            )}
            <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white/90 border-r border-b border-white/40 rotate-45" />
          </div>
        </div>
      )}

      {/* 呼吸光晕 3D 悬浮球 */}
      <div className="fixed bottom-24 right-4 z-50">
        <div className="absolute inset-0 -m-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60 blur-xl animate-pulse" />
        <div className="absolute inset-0 -m-1 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-40 animate-ping" />
        <button
          onClick={() => {
            setIsOpen(!isOpen)
            setShowBubble(false)
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

      {isOpen && (
        <div className="fixed bottom-40 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          <div className="bg-gradient-to-r from-liangpeng-primary to-liangpeng-accent px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">良朋社AI助手</h3>
                <p className="text-white/80 text-xs">在线</p>
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