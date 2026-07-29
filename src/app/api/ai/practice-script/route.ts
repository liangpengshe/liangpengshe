/**
 * AI 随行教练 · 子步骤实操指引生成接口（演进项 3.4 重构）
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 ai/practice-script（W3.2）
 *
 * 用途：用户在 SOP 详情页点击「🧠 AI 助手：帮我做」或
 *       「打开淘宝后台」类悬浮按钮时调用此接口，生成针对
 *       当前子步骤的具体操作指引（如："进入千牛后台，点击
 *       '店铺管理'，找到'子账号管理'，绑定手机号..."）。
 *
 * 入参：{ projectTitle, stepTitle, subStepTitle, actionUrl? }
 * 出参：{ success, data: { guidance, source } }
 *
 * 降级：未配置 DIFY_API_KEY 时返回内置 mock 指引
 *       保证 UI 流畅性，避免阻塞用户体验
 * ------------------------------------------------------------
 */
import { withSmartFallback } from '@/lib/api-handler'
import { callDifyWorkflow, pickFirstStringOutput } from '@/lib/dify-workflow'
import {
  PRACTICE_SCRIPT_SYSTEM_PROMPT,
  buildFallbackGuidance,
  MIN_GUIDANCE_LENGTH,
} from './_lib/practice-script-prompt'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// ════════════════════════════════════════════════════════════════
// 入参 / 出参 类型
// ════════════════════════════════════════════════════════════════
interface RequestBody {
  projectTitle?: string
  stepTitle?: string
  subStepTitle?: string
  actionUrl?: string
}

interface GuidanceResult {
  guidance: string
  source: 'dify' | 'fallback' | 'fallback-decorator'
}

// ════════════════════════════════════════════════════════════════
// Dify 调用
// 未配置 / 调用失败时 throw，由最外层 withSmartFallback 兜底
// ════════════════════════════════════════════════════════════════
async function fetchGuidanceFromDify(args: {
  apiKey: string
  projectTitle: string
  stepTitle: string
  subStepTitle: string
  actionUrl?: string
}): Promise<string> {
  const userPrompt = `项目：${args.projectTitle}\n步骤：${args.stepTitle}\n子步骤：${args.subStepTitle}\n${args.actionUrl ? `外部链接：${args.actionUrl}\n` : ''}请生成操作指引。`

  const result = await callDifyWorkflow(
    args.apiKey,
    {
      system_prompt: PRACTICE_SCRIPT_SYSTEM_PROMPT,
      user_prompt: userPrompt,
      project_title: args.projectTitle,
      step_title: args.stepTitle,
      sub_step_title: args.subStepTitle,
    },
    { timeoutMs: 20_000 }
  )
  const outputs = (result?.outputs || {}) as Record<string, any>
  const out = pickFirstStringOutput(outputs)
  if (out && out.length > MIN_GUIDANCE_LENGTH) {
    return out
  }
  throw new Error('Dify response empty or too short')
}

// ════════════════════════════════════════════════════════════════
// 主 handler
// Dify 失败 / 未配置 → 本地 fallback（局部降级，不 throw）
// 整个流程 throw → withSmartFallback 兜底
// ════════════════════════════════════════════════════════════════
async function scriptHandler(body: RequestBody): Promise<GuidanceResult> {
  const {
    projectTitle = '当前项目',
    stepTitle = '当前步骤',
    subStepTitle = '当前子步骤',
    actionUrl,
  } = body

  if (!subStepTitle) {
    throw new Error('缺少 subStepTitle 字段')
  }

  const apiKey =
    process.env.DIFY_API_KEY_PRACTICE ||
    process.env.DIFY_API_KEY_CHAT ||
    process.env.DIFY_API_KEY

  // 优先 Dify
  if (apiKey) {
    try {
      const guidance = await fetchGuidanceFromDify({
        apiKey,
        projectTitle,
        stepTitle,
        subStepTitle,
        actionUrl,
      })
      return { guidance, source: 'dify' }
    } catch (difyErr) {
      console.info('[ai-practice-script] Dify 失败，降级 fallback:', difyErr)
    }
  }

  // Dify 不可用 → fallback
  const guidance = buildFallbackGuidance(projectTitle, stepTitle, subStepTitle)
  return { guidance, source: 'fallback' }
}

// ════════════════════════════════════════════════════════════════
// 兜底 mockBuilder（最外层异常时使用）
// ════════════════════════════════════════════════════════════════
function buildMockGuidance(body: RequestBody): GuidanceResult {
  const {
    projectTitle = '当前项目',
    stepTitle = '当前步骤',
    subStepTitle = '当前子步骤',
  } = body
  return {
    guidance: buildFallbackGuidance(projectTitle, stepTitle, subStepTitle),
    source: 'fallback-decorator',
  }
}

// ════════════════════════════════════════════════════════════════
// 出口
// ════════════════════════════════════════════════════════════════
export const POST = withSmartFallback<RequestBody, GuidanceResult>({
  tag: 'ai-practice-script',
  handler: scriptHandler,
  mockBuilder: buildMockGuidance,
})

// 保留 GET 405（与原版一致，防止误用）
export async function GET() {
  return new Response(
    JSON.stringify({ success: false, error: '请使用 POST 方法调用此接口' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  )
}
