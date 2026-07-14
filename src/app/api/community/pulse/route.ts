/**
 * AI 社区脉冲 API
 * GET  /api/community/pulse             → 全局 TOP 3 + 城市分布
 * GET  /api/community/pulse?city=xxx    → 单城市 TOP 3
 *
 * 数据流:
 *   1. 聚合 globalThis.__lpActivityStore（诊断/规划/咨询/工具提交等）
 *   2. 按 opc_level + city 分组
 *   3. 调用 Dify 生成"本周 OPC 创业者热议话题 TOP 3"
 *   4. Dify 失败 → 本地统计模板兜底
 *
 * SEO 价值：返回的 "热词" 数组是极好的长尾词来源
 *   例：交易型 OPC 无货源供应链 / 流量型 OPC 抖音高转化脚本
 */
import { NextRequest, NextResponse } from 'next/server'
import { extractJsonFromText } from '@/lib/dify'

export const dynamic = 'force-dynamic'

// ════════════════════════════════════════════════════════════════
// 数据聚合：从全局活动池中提取近 7 天的行为
// ════════════════════════════════════════════════════════════════

interface Activity {
  userId: string
  type: 'diagnosis' | 'plan' | 'inquiry' | 'tool' | 'comment'
  title: string
  payload?: Record<string, any>
  createdAt: string
}

interface PulsePoint {
  opc_level: 'trader' | 'flow' | 'system' | 'asset' | 'unknown'
  city: string
  type: Activity['type']
  title: string
  count: number
  /** 提取的关键词（如"无货源供应链"），用于 SEO 长尾 */
  keywords: string[]
}

function gatherRecentActivity(days = 7): Activity[] {
  const g = globalThis as unknown as {
    __lpActivityStore?: { items: Activity[] }
  }
  const store = g.__lpActivityStore?.items || []
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return store.filter((a) => new Date(a.createdAt) >= start)
}

function extractOpcLevel(activity: Activity): PulsePoint['opc_level'] {
  const lvl = activity.payload?.opc_level
  if (lvl === 'trader' || lvl === 'flow' || lvl === 'system' || lvl === 'asset') return lvl
  if (lvl === 'TRADER') return 'trader'
  if (lvl === 'FLOW') return 'flow'
  if (lvl === 'SYSTEM') return 'system'
  if (lvl === 'ASSET') return 'asset'
  return 'unknown'
}

function extractCity(activity: Activity): string {
  return (
    activity.payload?.city ||
    activity.payload?.userCity ||
    '未填写'
  )
}

/** 中文分词兜底：提取与 OPC 行业相关的关键词 */
function extractKeywords(text: string): string[] {
  if (!text) return []
  const opcKeywords = [
    'AI 网店', 'AI 数字网店', 'AI 无货源', 'AI 有货源',
    'AI 自媒体', 'AI 跨境', 'AI 编程', 'AI 工具', 'AI 系统',
    'GEO', '数字人', '私域', '直播', '短视频', '小红书', '抖音',
    '供应链', '选品', '脚本', '代运营', '内训', '陪跑', '转型',
    '交易型', '流量型', '系统型', '资产型',
  ]
  return opcKeywords.filter((k) => text.includes(k))
}

function aggregateByLevelCity(activities: Activity[]): PulsePoint[] {
  const map = new Map<string, PulsePoint>()
  activities.forEach((a) => {
    const lvl = extractOpcLevel(a)
    const city = extractCity(a)
    const k = `${lvl}::${city}::${a.type}::${a.title}`
    const existing = map.get(k)
    if (existing) {
      existing.count += 1
    } else {
      map.set(k, {
        opc_level: lvl,
        city,
        type: a.type,
        title: a.title,
        count: 1,
        keywords: extractKeywords(a.title),
      })
    }
  })
  return Array.from(map.values())
}

// ════════════════════════════════════════════════════════════════
// Dify 调用：让 AI 帮我们把数据"翻译"成 SEO 长尾友好句式
// ════════════════════════════════════════════════════════════════

async function callDify(prompt: string): Promise<string | null> {
  const apiKey = process.env.DIFY_API_KEY_PULSE || process.env.DIFY_API_KEY_DAILY
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
        inputs: { query: prompt },
        response_mode: 'blocking',
        user: 'community-pulse',
      }),
    })
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    const outputs = data?.data?.outputs || {}
    return (
      outputs.result ||
      outputs.summary ||
      outputs.content ||
      outputs.text ||
      (typeof outputs === 'string' ? outputs : '') ||
      data?.answer ||
      null
    )
  } catch {
    return null
  }
}

function buildPrompt(points: PulsePoint[]): string {
  return `你是 OPC 社区运营专家。请根据下面近 7 天的用户行为数据，生成"本周 OPC 创业者热议话题 TOP 3"。

要求：
1. 每条话题 1 句话，包含 数字 + OPC 类型 + 城市分布 + 痛点关键词
2. 文风紧凑、有数据感
3. 输出纯 JSON 数组：[{ rank, summary, opc_level, city, count, keywords: [..] }]

数据：
${points.slice(0, 30).map((p) => `- [${p.opc_level}] ${p.city} · ${p.type} · "${p.title}" × ${p.count}`).join('\n')}`
}

function buildFallback(points: PulsePoint[]): Array<{
  rank: number
  summary: string
  opc_level: PulsePoint['opc_level']
  city: string
  count: number
  keywords: string[]
}> {
  // 按 opc_level 聚合，统计出现频次最高的关键词
  const byLevel = new Map<string, { level: PulsePoint['opc_level']; total: number; cities: Set<string>; keywords: Map<string, number> }>()
  points.forEach((p) => {
    if (p.opc_level === 'unknown') return
    const cur = byLevel.get(p.opc_level) || {
      level: p.opc_level,
      total: 0,
      cities: new Set<string>(),
      keywords: new Map<string, number>(),
    }
    cur.total += p.count
    if (p.city && p.city !== '未填写') cur.cities.add(p.city)
    p.keywords.forEach((k) => {
      cur.keywords.set(k, (cur.keywords.get(k) || 0) + 1)
    })
    byLevel.set(p.opc_level, cur)
  })

  const levelLabel: Record<PulsePoint['opc_level'], string> = {
    trader: '交易型 OPC',
    flow: '流量型 OPC',
    system: '系统型 OPC',
    asset: '资产型 OPC',
    unknown: 'OPC',
  }
  const cityTag = (s: Set<string>) => {
    if (s.size === 0) return ''
    const arr = Array.from(s).slice(0, 2)
    return arr.join(' / ')
  }

  return Array.from(byLevel.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map((g, i) => {
      const topKw = Array.from(g.keywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map((x) => x[0])
      return {
        rank: i + 1,
        summary: `本周有 ${g.total} 位${levelLabel[g.level]}在${topKw[0] ? `找【${topKw[0]}】` : '讨论'}${topKw[1] ? `和【${topKw[1]}】` : ''}${g.cities.size > 0 ? `，主要分布在 ${cityTag(g.cities)}` : ''}。`,
        opc_level: g.level,
        city: cityTag(g.cities) || '全国',
        count: g.total,
        keywords: topKw,
      }
    })
}

// ════════════════════════════════════════════════════════════════
// 演示用：在没有真实活动时注入一些种子数据
// ════════════════════════════════════════════════════════════════

function ensureSeedData() {
  const g = globalThis as unknown as { __lpActivityStore?: { items: Activity[] } }
  if (!g.__lpActivityStore) {
    g.__lpActivityStore = { items: [] }
  }
  const store = g.__lpActivityStore
  // 仅在没有数据时注入演示数据
  if (store.items.length === 0) {
    const seed: Activity[] = [
      { userId: 'seed-1', type: 'inquiry', title: '无货源供应链对接', payload: { opc_level: 'trader', city: '柳州' }, createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
      { userId: 'seed-2', type: 'inquiry', title: '无货源实物供应链', payload: { opc_level: 'trader', city: '东莞' }, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
      { userId: 'seed-3', type: 'inquiry', title: '无货源代发', payload: { opc_level: 'trader', city: '柳州' }, createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
      { userId: 'seed-4', type: 'inquiry', title: '抖音高转化脚本模板', payload: { opc_level: 'flow', city: '乌海' }, createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
      { userId: 'seed-5', type: 'plan', title: 'AI 自媒体起号 SOP', payload: { opc_level: 'flow', city: '深圳' }, createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
      { userId: 'seed-6', type: 'inquiry', title: '企业 GEO 排名优化', payload: { opc_level: 'system', city: '东莞' }, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
      { userId: 'seed-7', type: 'plan', title: '数字人直播系统', payload: { opc_level: 'asset', city: '深圳' }, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
      { userId: 'seed-8', type: 'inquiry', title: 'AI 网店选品', payload: { opc_level: 'trader', city: '柳州' }, createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
    ]
    store.items.push(...seed)
  }
}

// ════════════════════════════════════════════════════════════════
// 主入口
// ════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  try {
    ensureSeedData()
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city') || ''

    const activities = gatherRecentActivity(7)
    let points = aggregateByLevelCity(activities)
    if (city) {
      points = points.filter((p) => p.city === city)
    }

    // 调用 Dify
    const prompt = buildPrompt(points)
    let topics: any[] = []
    let source: 'dify' | 'fallback' = 'fallback'
    if (points.length > 0) {
      const aiText = await callDify(prompt)
      if (aiText) {
        const json = extractJsonFromText(aiText)
        if (Array.isArray(json)) {
          topics = json
          source = 'dify'
        } else {
          // AI 没返回 JSON 时，将纯文本按行切分
          topics = aiText
            .split('\n')
            .filter((l) => l.trim())
            .slice(0, 3)
            .map((line, i) => ({
              rank: i + 1,
              summary: line.replace(/^\d+[\.、]\s*/, '').trim(),
              opc_level: 'unknown',
              city: '全国',
              count: 0,
              keywords: extractKeywords(line),
            }))
          if (topics.length > 0) source = 'dify'
        }
      }
    }
    // 兜底模板
    if (topics.length === 0) {
      topics = buildFallback(points)
    }

    // 城市分布
    const cityDist = new Map<string, number>()
    points.forEach((p) => {
      if (p.city && p.city !== '未填写') {
        cityDist.set(p.city, (cityDist.get(p.city) || 0) + p.count)
      }
    })
    const cityDistribution = Array.from(cityDist.entries())
      .map(([c, n]) => ({ city: c, count: n }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    // 所有提取的关键词
    const allKeywords = new Map<string, number>()
    points.forEach((p) => p.keywords.forEach((k) => allKeywords.set(k, (allKeywords.get(k) || 0) + 1)))
    const keywords = Array.from(allKeywords.entries())
      .map(([k, n]) => ({ keyword: k, count: n }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        topics,
        cityDistribution,
        keywords,
        totalActivities: activities.length,
        filteredActivities: points.reduce((s, p) => s + p.count, 0),
        generatedAt: new Date().toISOString(),
        rangeDays: 7,
      },
      source,
    })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || '社区脉冲生成失败' },
      { status: 500 }
    )
  }
}
