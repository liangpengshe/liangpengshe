// AI 智富日报生成 API
// GET  /api/ai/daily-brief?userId=xxx          拉取最新日报
// POST /api/ai/daily-brief  { userId, force }  生成新日报
//
// 流程：
//  1. 聚合用户昨日活动轨迹（diagnosis / plan / tool / salon）
//  2. 调用 Dify chat-messages
//  3. AI 失败则用本地模板兜底，保证前端永远能展示
//  4. 存到共享 store（内存）+ 可选持久化到 Supabase/Prisma

import { NextRequest, NextResponse } from 'next/server'
import { addBrief, getLatestBrief, listBriefs, markBriefRead } from '@/lib/ai-daily-store'

export const dynamic = 'force-dynamic'

// ────────────── 活动轨迹聚合 ──────────────
type Activity = {
  type: 'diagnosis' | 'plan' | 'tool' | 'salon'
  title: string
  at: string
}

function gatherActivity(userId: string): Activity[] {
  // 真实场景应查 DiagnosisRequest / ProjectPlanRequest / ToolSubmission / SalonRegistrations
  // 这里用全局内存模拟（与 roadmap 共享同一思路）
  const g = globalThis as unknown as {
    __lpActivityStore?: { items: Array<{ userId: string; type: string; title: string; createdAt: string }> }
  }
  const store = g.__lpActivityStore?.items || []
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const yStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
  const tStart = new Date()
  tStart.setHours(0, 0, 0, 0)

  return store
    .filter(
      (a) =>
        a.userId === userId &&
        new Date(a.createdAt) >= yStart &&
        new Date(a.createdAt) < tStart
    )
    .map((a) => ({
      type: a.type as Activity['type'],
      title: a.title,
      at: a.createdAt,
    }))
}

// ────────────── 本地兜底模板 ──────────────
function fallbackBrief(activities: Activity[]): string {
  const has = (t: string) => activities.some((a) => a.type === t)
  const lines: string[] = []
  lines.push('## 🌅 昨日智富日报')
  lines.push('')
  lines.push('> ' + new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN'))
  lines.push('')
  lines.push('### 📌 昨日关键动作复盘')
  if (activities.length === 0) {
    lines.push('昨日暂无新动作。**建议今天**：去 [/projects](file:///projects) 浏览 1 个项目库案例，或到 [/tools](file:///tools) 体验一款智富工具。')
  } else {
    activities.forEach((a) => {
      const icon = a.type === 'diagnosis' ? '🩺' : a.type === 'plan' ? '📋' : a.type === 'tool' ? '🔧' : '🎤'
      lines.push(`- ${icon} **${labelOf(a.type)}**：${a.title}`)
    })
  }
  lines.push('')
  lines.push('### 🎯 今日推荐：智富动作')
  let rec = ''
  if (has('diagnosis') && !has('plan')) {
    rec = '你已完成自我诊断，下一步建议**生成商业规划报告**：前往 [/projects/submit](file:///projects/submit)'
  } else if (has('plan') && !has('tool')) {
    rec = '规划已就位，**立刻用工具放大产能**：到 [/tools/leopard](file:///tools/leopard) 体验豹纹工坊一键仿改爆款'
  } else if (has('tool') && !has('salon')) {
    rec = '工具已上手，**线下沙龙才是加速器**：报名 [/salon](file:///salon) 智富沙龙 +50 智富积分'
  } else {
    rec = '四库进度齐全，**现在可申请城市合伙人**：[/partner](file:///partner)'
  }
  lines.push(rec)
  lines.push('')
  lines.push('### 💡 AI 鼓励')
  lines.push('> 智富不是一次性动作，而是**每天 1% 的小步迭代**。今天先做最小可执行的那一件。')
  lines.push('')
  lines.push('---')
  lines.push('🤖 智富助理 · 自动生成于 ' + new Date().toLocaleString('zh-CN'))
  return lines.join('\n')
}

function labelOf(t: Activity['type']) {
  return t === 'diagnosis'
    ? '商业诊断'
    : t === 'plan'
    ? '规划报告'
    : t === 'tool'
    ? '工具提交'
    : '沙龙报名'
}

// ────────────── Dify 调用（智富日报生成器） ──────────────
async function callDify(systemPrompt: string, userInput: string): Promise<string | null> {
  // 智富日报 → DIFY_API_KEY_DAILY
  const apiKey = process.env.DIFY_API_KEY_DAILY
  const baseUrl = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1'
  if (!apiKey) return null
  try {
    const res = await fetch(`${baseUrl}/workflows/run`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          system_prompt: systemPrompt,
          user_input: userInput,
        },
        response_mode: 'blocking',
        user: 'opc_user',
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.warn('[daily-brief] Dify workflow 状态异常', res.status, errText.slice(0, 200))
      return null
    }
    const data = await res.json().catch(() => null)
    // 兼容两种输出：data.data.outputs.result（最常见）或 data.answer
    const outputs = data?.data?.outputs || {}
    const candidate =
      outputs.result ||
      outputs.daily_brief ||
      outputs.content ||
      outputs.markdown ||
      pickFirstString(outputs) ||
      data?.answer ||
      ''
    return typeof candidate === 'string' ? candidate : null
  } catch (e) {
    console.warn('[daily-brief] Dify workflow 调用失败', (e as Error).message)
    return null
  }
}

function pickFirstString(obj: Record<string, any>): string {
  if (!obj) return ''
  for (const k of Object.keys(obj)) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim()) return v
  }
  return ''
}

// ────────────── GET 拉取最新 ──────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId') || ''
  const op = searchParams.get('op') || 'latest' // latest | list
  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId 必填' }, { status: 400 })
  }
  if (op === 'list') {
    return NextResponse.json({
      success: true,
      data: listBriefs(userId),
      source: 'memory',
    })
  }
  const latest = getLatestBrief(userId)
  return NextResponse.json({
    success: true,
    data: latest,
    hasToday: latest
      ? new Date(latest.generatedAt).toDateString() === new Date().toDateString()
      : false,
    source: 'memory',
  })
}

// ────────────── POST 生成日报 ──────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const userId: string = body?.userId || ''
    const force: boolean = !!body?.force
    const markRead: string | null = body?.markRead || null
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId 必填' }, { status: 400 })
    }

    // 标记已读
    if (markRead) {
      const ok = markBriefRead(markRead, userId)
      return NextResponse.json({ success: ok, source: 'memory' })
    }

    // 1) 今日已生成且不强制刷新 → 直接返回
    const existing = getLatestBrief(userId)
    if (existing && !force) {
      const isToday = new Date(existing.generatedAt).toDateString() === new Date().toDateString()
      if (isToday) {
        return NextResponse.json({
          success: true,
          data: existing,
          cached: true,
          source: 'memory',
        })
      }
    }

    // 2) 聚合昨日活动
    const activities = gatherActivity(userId)

    // 3) 调用 Dify
    const systemPrompt = `你是一个专属 AI 商业助理，请根据用户昨天的活动轨迹，生成一份简短、有启发性的《良朋社OPC 智富日报》。日报需包含：昨日关键动作复盘、结合用户行为推荐一个当前最符合他的OPC项目或工具（带内链）、一句AI鼓励语。请以 Markdown 格式输出，文风紧凑、高价值。`
    const userInput = `用户昨日活动（最多 10 条）：\n${
      activities.length === 0
        ? '（昨日暂无新动作）'
        : activities.map((a) => `- [${a.type}] ${a.title} @ ${a.at}`).join('\n')
    }\n\n请生成日报。`

    let content = await callDify(systemPrompt, userInput)
    let source: 'dify' | 'fallback' = content ? 'dify' : 'fallback'

    // 4) 降级到本地模板
    if (!content) content = fallbackBrief(activities)

    // 5) 入库
    const saved = addBrief(userId, content)

    return NextResponse.json({
      success: true,
      data: saved,
      activityCount: activities.length,
      source,
    })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: (e as Error).message },
      { status: 500 }
    )
  }
}
