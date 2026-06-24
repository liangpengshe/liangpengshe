// Dify Workflow API 统一调用工具
// 所有 5 个业务路由都通过本文件调用 Dify 工作流应用
// - 端点：/workflows/run（blocking 模式）
// - 环境变量：DIFY_BASE_URL + 各应用专属 DIFY_API_KEY_*
// - 返回值：data.outputs（Dify 工作流标准输出）

const DEFAULT_BASE_URL = 'https://api.dify.ai/v1'
const DEFAULT_USER = 'opc_user'

export interface DifyWorkflowOptions {
  /** 用户标识（默认 opc_user） */
  user?: string
  /** 覆盖 baseUrl（默认从 DIFY_BASE_URL 读取） */
  baseUrl?: string
  /** 请求超时（毫秒），默认 60000 */
  timeoutMs?: number
}

export interface DifyWorkflowResult {
  /** 业务侧真正使用的输出（来自 data.outputs） */
  outputs: Record<string, any>
  /** 原始响应 */
  raw: any
  /** workflow_run_id */
  workflowRunId?: string
  /** 任务状态 */
  status?: string
  /** 总耗时（秒） */
  elapsedTime?: number
  /** 总 tokens */
  totalTokens?: number
}

/**
 * 调用 Dify 工作流应用（workflows/run）
 * @param apiKey Dify 应用专属 Key（必填）
 * @param inputs 工作流输入参数（与 Dify 工作流定义的 inputs 对齐）
 * @param options 可选配置
 * @returns outputs
 */
export async function callDifyWorkflow(
  apiKey: string,
  inputs: Record<string, any>,
  options: DifyWorkflowOptions = {}
): Promise<DifyWorkflowResult> {
  if (!apiKey) {
    throw new Error('Dify API Key 缺失，请在 .env 配置 DIFY_API_KEY_XXX')
  }
  const baseUrl = options.baseUrl || process.env.DIFY_BASE_URL || DEFAULT_BASE_URL
  const user = options.user || DEFAULT_USER
  const timeoutMs = options.timeoutMs ?? 60_000

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(`${baseUrl}/workflows/run`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs,
        response_mode: 'blocking',
        user,
      }),
      signal: ctrl.signal,
    })
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(
      `Dify workflow 调用失败 ${res.status}：${errText.slice(0, 300) || res.statusText}`
    )
  }

  const data = await res.json().catch(() => null)
  if (!data) {
    throw new Error('Dify workflow 返回非 JSON')
  }

  // Dify 标准返回：{ workflow_run_id, task_id, data: { id, status, outputs, error, ... } }
  const inner = data?.data || {}
  if (inner.status && inner.status !== 'succeeded') {
    throw new Error(`Dify workflow 状态异常：${inner.status} | ${inner.error || ''}`)
  }

  return {
    outputs: inner.outputs || {},
    raw: data,
    workflowRunId: data.workflow_run_id || inner.id,
    status: inner.status,
    elapsedTime: inner.elapsed_time,
    totalTokens: inner.total_tokens,
  }
}

/**
 * 便捷方法：拿到 outputs 中的第一个 string 字段
 * （适用于工作流只输出一个文本结果、且字段名不固定的情况）
 */
export function pickFirstStringOutput(outputs: Record<string, any>): string {
  for (const key of Object.keys(outputs || {})) {
    const v = outputs[key]
    if (typeof v === 'string' && v.trim()) return v
    if (v && typeof v === 'object') {
      // 嵌套对象：找第一个 string 字段
      for (const k2 of Object.keys(v)) {
        if (typeof v[k2] === 'string' && v[k2].trim()) return v[k2]
      }
    }
  }
  return ''
}
