/**
 * AI 四库动态推荐 API
 * ------------------------------------------------------------
 * POST /api/ai/recommend-tools
 *
 * 接收：{ userId, opcLevel }
 * 内部：读取诊断数据 → 组装 Prompt → 调用 Dify → 解析 JSON → 返回
 * 兑底：Dify 不可用时返回"基于 opcLevel 的高质量静态推荐"
 *
 * 响应数据形状：
 *   {
 *     success: true,
 *     data: {
 *       tools: LibraryItem[],
 *       projects: LibraryItem[],
 *       services: LibraryItem[],
 *       resources: LibraryItem[],
 *     },
 *     source: 'dify' | 'fallback',
 *     meta: { opcLevel, diagnosisUsed, model },
 *   }
 * ------------------------------------------------------------
 */

import { NextRequest, NextResponse } from 'next/server'
import { callDifyWorkflow, pickFirstStringOutput } from '@/lib/dify-workflow'
import { extractJsonFromText } from '@/lib/dify'
import { getUserDiagnosis } from '@/lib/diagnosis-store'
import type { OPCLevel } from '@/lib/learning-progress-store'
import { FALLBACK_RECOMMENDATIONS, type LibraryItem } from '@/lib/recommend-fallback'

export const dynamic = 'force-dynamic'

const VALID_LEVELS: OPCLevel[] = ['TRADER', 'FLOW', 'SYSTEM', 'ASSET']

function isOPCLevel(v: unknown): v is OPCLevel {
  return typeof v === 'string' && VALID_LEVELS.includes(v as OPCLevel)
}

const SYSTEM_PROMPT = `你是一个良朋社 OPC 的 AI 商业顾问，专精于为不同类型的用户精准匹配"工具 + 项目 + 服务 + 资源"4 大维度的实操路径。

任务：
1. 根据用户的 OPC 类型（{{opcLevel}}）与详细诊断数据（痛点、资金、经验、风险偏好等），从工具库、项目库、服务库、资源库中各精准推荐 2-3 个最匹配用户当前现状的资源。
2. 必须是真实存在或 OPC 平台已有的资源，名称、URL、描述需具体可执行。
3. 每个推荐需要说明：为什么推荐、预估学习周期、效率提升。

返回 JSON（不要任何其他文本/解释/注释/Markdown 围栏）：
{
  "tools": [
    { "name": "工具名", "desc": "一句话描述（≤30字）+ 推荐理由", "icon": "emoji", "href": "/market/tools?...", "badge": "可选标签" }
  ],
  "projects": [
    { "name": "项目名", "desc": "一句话描述 + 适合人群", "icon": "emoji", "href": "/market/projects?...", "badge": "可选" }
  ],
  "services": [
    { "name": "服务名", "desc": "服务内容 + 价值", "icon": "emoji", "href": "/market/services?...", "badge": "可选" }
  ],
  "resources": [
    { "name": "资源名", "desc": "资源用途", "icon": "emoji", "href": "/market/resources?...", "badge": "可选" }
  ]
}

约束：
- 每个数组 2-3 个对象
- href 必须以 /market/ 开头
- 重点关注"用户痛点"而非"功能全不全"
- 优先推荐 OPC 自研工具（豹纹工坊、灵犀AI、先锋派数字人）以提升品牌一致`

function buildUserPrompt(diag: ReturnType<typeof getUserDiagnosis>): string {
  return `用户 OPC 类型：${diag.opcLevel}
痛点：${diag.painPoints.join('、') || '无'}
启动资金：${diag.funds}
创业经验：${diag.experience}
货源：${diag.supplyChain ?? '未填'}
期待收入：${diag.targetIncome ?? '未填'}
风险偏好：${diag.riskTolerance ?? 'balanced'}
行业背景：${diag.background ?? ''}
${diag.description ? `补充描述：${diag.description}` : ''}

请基于以上数据为该用户从 4 大维度各推荐 2-3 个最匹配资源。`
}

function normalizeItem(item: any, fallbackHref: string, fallbackIcon: string): LibraryItem | null {
  if (!item || typeof item !== 'object') return null
  const name = String(item.name || item.title || '').trim()
  if (!name) return null
  return {
    name: name.slice(0, 30),
    desc: String(item.desc || item.description || item.reason || '推荐资源').slice(0, 80),
    icon: String(item.icon || fallbackIcon).slice(0, 4),
    href: String(item.href || item.url || fallbackHref),
    badge: item.badge ? String(item.badge).slice(0, 8) : undefined,
    highlight: Boolean(item.highlight),
  }
}

function buildFallback(opcLevel: OPCLevel) {
  return FALLBACK_RECOMMENDATIONS[opcLevel]
}

function tryParseDifyJson(rawText: string): { tools: any[]; projects: any[]; services: any[]; resources: any[] } | null {
  const parsed = extractJsonFromText(rawText)
  if (!parsed || typeof parsed !== 'object') return null
  // 多种结构兼容
  const obj: any = parsed
  const tools = Array.isArray(obj.tools) ? obj.tools : Array.isArray(obj.data?.tools) ? obj.data.tools : []
  const projects = Array.isArray(obj.projects) ? obj.projects : Array.isArray(obj.data?.projects) ? obj.data.projects : []
  const services = Array.isArray(obj.services) ? obj.services : Array.isArray(obj.data?.services) ? obj.data.services : []
  const resources = Array.isArray(obj.resources) ? obj.resources : Array.isArray(obj.data?.resources) ? obj.data.resources : []
  if (tools.length + projects.length + services.length + resources.length === 0) {
    return null
  }
  return { tools, projects, services, resources }
}

export async function POST(req: NextRequest) {
  const t0 = Date.now()
  try {
    const body = (await req.json().catch(() => ({}))) as {
      userId?: string
      opcLevel?: string
    }
    const { userId, opcLevel } = body
    if (!userId || !isOPCLevel(opcLevel)) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId 必填；opcLevel 必须是 TRADER/FLOW/SYSTEM/ASSET',
        },
        { status: 400 }
      )
    }

    // 1. 读取用户诊断
    const diagnosis = getUserDiagnosis(userId, opcLevel)
    const usedLevel = diagnosis.opcLevel || opcLevel

    // 2. 优先调用 Dify
    let source: 'dify' | 'fallback' = 'fallback'
    let parsed: ReturnType<typeof tryParseDifyJson> = null
    const apiKey = process.env.DIFY_API_KEY_TOOL
    if (apiKey) {
      try {
        const result = await callDifyWorkflow(apiKey, {
          system_prompt: SYSTEM_PROMPT.replace('{{opcLevel}}', usedLevel),
          user_input: buildUserPrompt(diagnosis),
        })
        const text =
          pickFirstStringOutput(result.outputs) ||
          (result.outputs as any)?.recommendations_text ||
          (result.outputs as any)?.result ||
          ''
        parsed = tryParseDifyJson(text)
        if (parsed) {
          source = 'dify'
        }
      } catch (difyErr) {
        console.warn('[recommend-tools] Dify 调用失败，使用兑底:', (difyErr as Error).message)
      }
    }

    // 3. 兑底（4 个 opcLevel 静态数据）
    const fallback = buildFallback(usedLevel)

    // 4. 组装响应
    const resp = {
      success: true,
      data: parsed
        ? {
            tools: parsed.tools.map((t) => normalizeItem(t, '/market/tools?from=guide', '🛠️')).filter(Boolean) as LibraryItem[],
            projects: parsed.projects.map((t) => normalizeItem(t, '/market/projects?from=guide', '🎯')).filter(Boolean) as LibraryItem[],
            services: parsed.services.map((t) => normalizeItem(t, '/market/services?from=guide', '🤝')).filter(Boolean) as LibraryItem[],
            resources: parsed.resources.map((t) => normalizeItem(t, '/market/resources?from=guide', '📚')).filter(Boolean) as LibraryItem[],
          }
        : fallback,
      source,
      meta: {
        opcLevel: usedLevel,
        diagnosisUsed: true,
        model: apiKey ? 'Dify Workflows (DIFY_API_KEY_TOOL)' : 'no-dify-key',
        latencyMs: Date.now() - t0,
        diagnosisSnapshot: {
          painPoints: diagnosis.painPoints,
          funds: diagnosis.funds,
          experience: diagnosis.experience,
          background: diagnosis.background,
        },
      },
    }
    return NextResponse.json(resp)
  } catch (e) {
    const opcLevel: OPCLevel = 'TRADER'
    return NextResponse.json(
      {
        success: true,
        data: FALLBACK_RECOMMENDATIONS[opcLevel],
        source: 'fallback',
        meta: { opcLevel, error: (e as Error).message, latencyMs: Date.now() - t0 },
      },
      { status: 200 } // 兑底也算成功，前端拿到数据不会崩
    )
  }
}

/** GET 兑底数据（仅用于调试/快速预览） */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const opcLevelRaw = searchParams.get('opcLevel') || 'TRADER'
  const opcLevel = isOPCLevel(opcLevelRaw) ? opcLevelRaw : 'TRADER'
  return NextResponse.json({
    success: true,
    data: FALLBACK_RECOMMENDATIONS[opcLevel],
    source: 'fallback',
    meta: { opcLevel, mode: 'preview' },
  })
}
