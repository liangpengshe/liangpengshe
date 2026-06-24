import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * AI 智能助手（适配 Dify Chatflow）
 * - Chatflow 用 /chat-messages 端点（需要 query 字段 + inputs 变量）
 * - 通过 /info 端点探测 App 模式；Chat/Chatflow → /chat-messages；Workflow → /workflows/run
 * - 输入变量：user_message、current_page
 */

interface DifyRequest {
  query?: string
  inputs?: Record<string, any>
  response_mode: 'blocking' | 'streaming'
  conversation_id?: string
  user: string
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

export async function POST(request: Request) {
  try {
    const {
      message, city, role, conversationId,
      currentRoute, contextKind, systemHint,
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

    // 上下文注入：把上下文拼接到 query 中（Chatflow 的 query 字段就是主输入）
    const finalQuery =
      systemHint && contextKind && contextKind !== 'default'
        ? `[用户当前浏览路径: ${currentRoute || '未知'}]\n[上下文类型: ${contextKind}]\n[运营策略: ${systemHint}]\n\n用户问题: ${message}`
        : message

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
