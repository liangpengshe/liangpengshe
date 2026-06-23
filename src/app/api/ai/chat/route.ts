import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface DifyMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface DifyRequest {
  query: string
  inputs?: {
    city?: string
    role?: string
  }
  response_mode: 'blocking' | 'streaming'
  conversation_id?: string
  user: string
}

export async function POST(request: Request) {
  try {
    const { message, city, role, conversationId, currentRoute, contextKind, systemHint } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: '请输入消息内容' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 上下文注入：把 currentRoute + systemHint 一并传给 Dify
    // Dify 端可在 system prompt 或变量中引用 current_route / context_hint
    const finalQuery =
      systemHint && contextKind && contextKind !== 'default'
        ? `[用户当前浏览路径: ${currentRoute || '未知'}]\n[上下文类型: ${contextKind}]\n[运营策略: ${systemHint}]\n\n用户问题: ${message}`
        : message

    const difyRequest: DifyRequest = {
      query: finalQuery,
      inputs: {
        city: city || '深圳',
        role: role || 'MEMBER',
        // 把上下文透传给 Dify 的 input 变量（如 Dify 端工作流引用了 current_route）
        current_route: currentRoute || '',
        context_kind: contextKind || 'default',
        context_hint: systemHint || '',
      },
      response_mode: 'blocking',
      conversation_id: conversationId,
      user: user?.id || 'anonymous',
    }

    const response = await fetch(`${process.env.DIFY_APP_BASE_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(difyRequest),
    })

    if (!response.ok) {
      throw new Error('Dify API 请求失败')
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: {
        answer: data.answer,
        conversationId: data.conversation_id,
        messageId: data.message_id,
      },
    })
  } catch (error) {
    console.error('AI Chat API 错误:', error)
    return NextResponse.json(
      { error: 'AI 助手暂时无法响应，请稍后重试' },
      { status: 500 }
    )
  }
}