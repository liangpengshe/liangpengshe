/**
 * AI 随行教练 · 子步骤实操指引生成接口
 * ------------------------------------------------------------
 * 用途：用户在 SOP 详情页点击「🧠 AI 助手：帮我做」或
 *       「打开淘宝后台」类悬浮按钮时调用此接口，生成针对
 *       当前子步骤的具体操作指引（如："进入千牛后台，点击
 *       '店铺管理'，找到'子账号管理'，绑定手机号..."）。
 *
 * 入参：{ projectTitle, stepTitle, subStepTitle, actionUrl? }
 * 出参：{ success, data: { guidance: string } }
 *
 * 降级：未配置 DIFY_API_KEY 时返回内置 mock 指引
 *       保证 UI 流畅性，避免阻塞用户体验
 * ------------------------------------------------------------
 */
import { NextResponse } from 'next/server'
import { callDifyWorkflow, pickFirstStringOutput } from '@/lib/dify-workflow'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const SYSTEM_PROMPT = `你是一位资深的 AI 商业落地教练，擅长把复杂操作拆解为 3-5 步可直接执行的动作。
请根据用户当前所处的子步骤，生成一份「具体到鼠标点击」的操作指引：

1. 用编号列出 3-5 个具体动作（必须包含"打开/点击/输入/确认"等可执行动词）
2. 每一步用一句简短的话说完，不要长篇大论
3. 如果涉及第三方平台（淘宝、抖店、小红书、微信公众号、千牛、灵犀AI、豹纹工坊等），给出该平台的具体路径
4. 文末附一句情绪化的鼓励

仅输出 Markdown，不要任何额外解释。`

function buildFallbackGuidance(
  projectTitle: string,
  stepTitle: string,
  subStepTitle: string
): string {
  // 基于子步骤关键词生成降级指引（确保 UI 始终能拿到内容）
  return `### 🎯 ${subStepTitle} · 操作指引

1. **打开目标平台**：在浏览器中前往【${projectTitle}】对应的官方后台，建议使用 Chrome 浏览器登录
2. **找到功能入口**：在后台左侧导航中定位「${stepTitle.replace(/^第 \d+ 步 · /, '')}」相关模块
3. **完成核心操作**：按平台提示完成「${subStepTitle}」的具体配置，记得随时截图保存
4. **校验与提交**：确认信息无误后，保存并提交系统，等待平台反馈
5. **回到本页打卡**：操作完成后，回到 SOP 页面点击右侧的圆形 ✓ 标记此子任务完成

> 💡 提示：每个平台都有新手引导，3 分钟内即可完成；如遇问题可点击左下角 AI 助手实时提问。`
}

interface RequestBody {
  projectTitle?: string
  stepTitle?: string
  subStepTitle?: string
  actionUrl?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as RequestBody
    const { projectTitle = '当前项目', stepTitle = '当前步骤', subStepTitle = '当前子步骤', actionUrl } = body

    if (!subStepTitle) {
      return NextResponse.json(
        { success: false, error: '缺少 subStepTitle 字段' },
        { status: 400 }
      )
    }

    // 优先调用 Dify，失败/未配置时降级
    const userPrompt = `项目：${projectTitle}\n步骤：${stepTitle}\n子步骤：${subStepTitle}\n${actionUrl ? `外部链接：${actionUrl}\n` : ''}请生成操作指引。`
    const apiKey = process.env.DIFY_API_KEY_PRACTICE || process.env.DIFY_API_KEY_CHAT || process.env.DIFY_API_KEY
    let guidance: string | null = null
    if (apiKey) {
      try {
        const result = await callDifyWorkflow(
          apiKey,
          {
            system_prompt: SYSTEM_PROMPT,
            user_prompt: userPrompt,
            project_title: projectTitle,
            step_title: stepTitle,
            sub_step_title: subStepTitle,
          },
          { timeoutMs: 20_000 }
        )
        const outputs = (result?.outputs || {}) as Record<string, any>
        const out = pickFirstStringOutput(outputs)
        if (out && out.length > 20) {
          guidance = out
        }
      } catch {
        /* 降级 */
      }
    }

    if (!guidance) {
      guidance = buildFallbackGuidance(projectTitle, stepTitle, subStepTitle)
    }

    const isFallback = guidance === buildFallbackGuidance(projectTitle, stepTitle, subStepTitle)

    return NextResponse.json({
      success: true,
      data: {
        guidance,
        source: isFallback ? 'fallback' : 'dify',
      },
    })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : '未知错误' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: '请使用 POST 方法调用此接口' },
    { status: 405 }
  )
}
