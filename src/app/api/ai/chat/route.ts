import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * AI 智能助手（适配 Dify Chatflow）
 * - Chatflow 用 /chat-messages 端点（需要 query 字段 + inputs 变量）
 * - 通过 /info 端点探测 App 模式；Chat/Chatflow → /chat-messages；Workflow → /workflows/run
 * - 输入变量：user_message、current_page
 * - 任务 1-2：SOP 上下文注入（context.projectSlug + context.currentStep）
 */

interface DifyRequest {
  query?: string
  inputs?: Record<string, any>
  response_mode: 'blocking' | 'streaming'
  conversation_id?: string
  user: string
}

/** 前端传入的 SOP 上下文（任务 1） */
interface SopContext {
  projectSlug: string
  projectTitle?: string
  currentStep: number
}

const appModeCache = new Map<string, string>()

async function detectAppMode(apiKey: string, baseUrl: string): Promise<string> {
  // 不缓存：每次请求都探测，避免 Dify 端切换 App 类型后还走旧路由
  try {
    const r = await fetch(`${baseUrl}/info`, { headers: { Authorization: `Bearer ${apiKey}` } })
    const data = await r.json().catch(() => ({}))
    const mode = (data.mode || 'unknown').toString()
    appModeCache.set(apiKey, mode)
    return mode
  } catch {
    return 'unknown'
  }
}

function pickFirstString(obj: any, keys: string[]): string {
  if (!obj) return ''
  for (const k of keys) {
    if (typeof obj[k] === 'string' && obj[k].length > 0) return obj[k]
  }
  let best = ''
  for (const v of Object.values(obj)) {
    if (typeof v === 'string' && v.length > best.length) best = v
  }
  return best
}

/**
 * 任务 2：把 SOP 上下文注入到 AI 提示词
 * - 优先按 Dify 模板拼装（用户指定的私教角色定位）
 * - 降级兜底：没有 currentStep 但有 slug → 通用商业顾问 + 项目前缀
 * - 完全无 SOP 信息 → 通用良朋社顾问
 */
function buildSOPSystemPrompt(
  ctx: SopContext | null,
  fallbackSlug: string | null,
  baseHint: string
): string {
  // 路径 1：完整 SOP 上下文（项目 + 当前步骤）
  if (ctx && ctx.projectSlug) {
    const stepLabel = Number.isFinite(ctx.currentStep)
      ? `第 ${ctx.currentStep + 1} 步`
      : '当前阶段'
    const titleLabel = ctx.projectTitle ? `「${ctx.projectTitle}」` : `【${ctx.projectSlug}】`
    return (
      `你是一名良朋社 OPC 的 AI 智富私教。目前用户在跟随项目${titleLabel}进行实操，正处于${stepLabel}。\n` +
      `请根据用户的当前步骤，结合基础电商/自媒体常识，直接回答用户的问题。\n` +
      `回答必须具体、落地、可操作，不要泛泛而谈。如果是操作类问题，直接给出步骤指引或推荐对应的工具。`
    )
  }
  // 路径 2：有 slug 但没有 currentStep（任务 4 兜底）
  if (fallbackSlug) {
    return (
      `你是一名良朋社 OPC 的通用商业顾问。用户当前在浏览项目【${fallbackSlug}】的相关页面。\n` +
      `请以项目前缀信息展开回答，例如："你在操作 ${fallbackSlug} 项目，有什么需要我帮忙的吗？"\n` +
      `并结合基础电商/自媒体常识给出可执行建议。`
    )
  }
  // 路径 3：完全没有 SOP 信息
  return baseHint || '你是一名良朋社的 AI 智富顾问，帮助用户解答 OPC 项目相关问题。'
}

export async function POST(request: Request) {
  try {
    const {
      message, city, role, conversationId,
      currentRoute, contextKind, systemHint,
      context,             // 任务 1：{ projectSlug, projectTitle, currentStep }
      projectSlugFallback, // 任务 4 兜底
    } = await request.json()

    if (!message) {
      return NextResponse.json({ error: '请输入消息内容' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const apiKey = process.env.DIFY_API_KEY_CHAT || process.env.DIFY_API_KEY
    const baseUrl = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1'
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI 助手 Key 未配置（DIFY_API_KEY_CHAT）' },
        { status: 503 }
      )
    }

    // 任务 2：构造 SOP 私教系统提示词
    const sopContext: SopContext | null =
      context && typeof context === 'object' && typeof context.projectSlug === 'string'
        ? {
            projectSlug: String(context.projectSlug),
            projectTitle: context.projectTitle ? String(context.projectTitle) : undefined,
            currentStep: Number.isFinite(context.currentStep) ? Number(context.currentStep) : 0,
          }
        : null
    const fallbackSlug =
      typeof projectSlugFallback === 'string' && projectSlugFallback.trim()
        ? projectSlugFallback.trim()
        : null
    const sopSystemPrompt = buildSOPSystemPrompt(sopContext, fallbackSlug, systemHint || '')

    // 上下文注入：把上下文拼接到 query 中（Chatflow 的 query 字段就是主输入）
    const finalQuery = (() => {
      // SOP 私教提示优先（任务 2）
      if (sopContext || fallbackSlug) {
        const metaLines: string[] = []
        metaLines.push(`[SOP私教提示: ${sopSystemPrompt.replace(/\n/g, ' ')}]`)
        if (currentRoute) metaLines.push(`[用户当前浏览路径: ${currentRoute}]`)
        if (contextKind && contextKind !== 'default') metaLines.push(`[上下文类型: ${contextKind}]`)
        if (systemHint && !(sopContext || fallbackSlug)) metaLines.push(`[运营策略: ${systemHint}]`)
        metaLines.push(`\n用户问题: ${message}`)
        return metaLines.join('\n')
      }
      // 通用路径
      if (systemHint && contextKind && contextKind !== 'default') {
        return `[用户当前浏览路径: ${currentRoute || '未知'}]\n[上下文类型: ${contextKind}]\n[运营策略: ${systemHint}]\n\n用户问题: ${message}`
      }
      return message
    })()

    // Chatflow / Chat 都用 /chat-messages；只有纯 workflow 才用 /workflows/run
    const mode = await detectAppMode(apiKey, baseUrl)
    const isPureWorkflow = mode === 'workflow'
    const endpoint = isPureWorkflow ? `${baseUrl}/workflows/run` : `${baseUrl}/chat-messages`

    let body: any
    if (isPureWorkflow) {
      // 纯 workflow：inputs 传所有变量，query 字段可选
      body = JSON.stringify({
        inputs: {
          user_message: finalQuery,
          current_page: currentRoute || '',
          city: city || '深圳',
          role: role || 'MEMBER',
          // 任务 2：SOP 变量透传
          sop_system_prompt: sopSystemPrompt,
          project_slug: sopContext?.projectSlug || fallbackSlug || '',
          project_title: sopContext?.projectTitle || '',
          current_step: sopContext ? sopContext.currentStep + 1 : 0,
        },
        response_mode: 'blocking',
        user: user?.id || 'anonymous',
        conversation_id: conversationId,
      })
    } else {
      // Chatflow / Chat：必传 query 字段，inputs 传业务变量
      const req: DifyRequest = {
        query: finalQuery,
        inputs: {
          // 业务上下文变量（与 Dify 端 Begin 节点定义的变量名一致）
          user_message: finalQuery,
          current_page: currentRoute || '',
          city: city || '深圳',
          role: role || 'MEMBER',
          context_kind: contextKind || 'default',
          context_hint: systemHint || '',
          // 任务 2：SOP 私教提示与变量
          sop_system_prompt: sopSystemPrompt,
          project_slug: sopContext?.projectSlug || fallbackSlug || '',
          project_title: sopContext?.projectTitle || '',
          current_step: sopContext ? sopContext.currentStep + 1 : 0,
        },
        response_mode: 'blocking',
        conversation_id: conversationId,
        user: user?.id || 'anonymous',
      }
      body = JSON.stringify(req)
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body,
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw new Error(`Dify API ${response.status}: ${errText.slice(0, 300)}`)
    }

    const data = await response.json()

    let answer = ''
    let newConversationId = conversationId
    let messageId: string | undefined
    if (isPureWorkflow) {
      const outputs = (data.data && data.data.outputs) || {}
      answer = pickFirstString(outputs, ['answer', 'output', 'text', 'result', 'response', 'message', 'reply', 'content'])
      messageId = data.workflow_run_id
    } else {
      answer = data.answer || ''
      newConversationId = data.conversation_id || conversationId
      messageId = data.message_id
    }

    return NextResponse.json({
      success: true,
      data: {
        answer,
        conversationId: newConversationId,
        messageId,
        mode, // 调试用：探测到的 App 模式
        endpoint, // 调试用：实际调用的端点
        // 任务 2 调试：返回 SOP 上下文（前端可显示回显）
        sop: {
          slug: sopContext?.projectSlug || fallbackSlug || null,
          title: sopContext?.projectTitle || null,
          step: sopContext ? sopContext.currentStep + 1 : null,
        },
      },
    })
  } catch (error: any) {
    console.error('AI Chat API 错误:', error?.message || error)
    return NextResponse.json(
      { error: 'AI 助手暂时无法响应，请稍后重试', detail: error?.message || String(error) },
      { status: 500 }
    )
  }
}
