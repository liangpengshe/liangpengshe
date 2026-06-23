// Dify API 客户端工具
// 用于与 Dify 智能体平台通信，调用工作流和对话型应用

const DIFY_API_KEY = process.env.DIFY_API_KEY || ''
const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1'

interface DifyResponse {
  answer?: string
  message?: string
  conversation_id?: string
  metadata?: {
    retriever_resources?: any[]
    [key: string]: any
  }
  [key: string]: any
}

/**
 * 调用 Dify 对话型应用
 * @param query 用户输入的问题
 * @param user 用户标识
 * @param conversationId 对话 ID（可选，用于多轮对话）
 * @param inputs 额外的输入参数
 */
export async function callDifyChat(
  query: string,
  user: string = 'liangpengshe-user',
  conversationId?: string,
  inputs: Record<string, any> = {}
): Promise<DifyResponse> {
  if (!DIFY_API_KEY) {
    throw new Error('DIFY_API_KEY is not configured')
  }

  const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs,
      query,
      user,
      response_mode: 'blocking',
      conversation_id: conversationId || '',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Dify API error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

/**
 * 调用 Dify 工作流（适用于复杂的任务流）
 * @param inputs 工作流输入参数
 * @param user 用户标识
 */
export async function callDifyWorkflow(
  inputs: Record<string, any>,
  user: string = 'liangpengshe-user'
): Promise<DifyResponse> {
  if (!DIFY_API_KEY) {
    throw new Error('DIFY_API_KEY is not configured')
  }

  const response = await fetch(`${DIFY_API_URL}/workflows/run`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs,
      user,
      response_mode: 'blocking',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Dify workflow error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

/**
 * 调用 Dify 完成型应用（适用于文本生成、分类等任务）
 * @param query 用户输入
 * @param user 用户标识
 */
export async function callDifyCompletion(
  query: string,
  user: string = 'liangpengshe-user'
): Promise<DifyResponse> {
  if (!DIFY_API_KEY) {
    throw new Error('DIFY_API_KEY is not configured')
  }

  const response = await fetch(`${DIFY_API_URL}/completion-messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: { query },
      user,
      response_mode: 'blocking',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Dify completion error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

/**
 * 从 Dify 返回的文本中提取 JSON
 * Dify 经常在 answer 字段中包含 markdown 代码块或纯文本 JSON
 */
export function extractJsonFromText(text: string): any {
  if (!text) return null

  // 尝试直接解析
  try {
    return JSON.parse(text)
  } catch {
    // 尝试从 markdown 代码块中提取
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
                      text.match(/(\{[\s\S]*\})/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1])
      } catch {
        return null
      }
    }
    return null
  }
}
