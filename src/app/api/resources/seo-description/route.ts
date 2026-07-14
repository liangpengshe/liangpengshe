/**
 * 资源 SEO 描述自动生成 API
 * ------------------------------------------------------------
 * POST /api/resources/seo-description
 *   { resourceId, title, category, tags, content, slug }
 *   → { success, description, keywords, source }
 *
 * 应用场景：
 *   - 资源审核通过时自动调用，生成 150 字 SEO 描述
 *   - 资源卡片渲染时直接读取
 *   - /market/resources/[id] 详情页的 <meta name="description">
 *
 * SEO 价值：
 *   - 数千条资源（实物、软件、教程）都自动拥有高质量搜索引擎摘要
 *   - 极大提升长尾流量的转化率
 */
import { NextRequest, NextResponse } from 'next/server'
import { extractJsonFromText } from '@/lib/dify'

export const dynamic = 'force-dynamic'

// ════════════════════════════════════════════════════════════════
// 内存缓存（演示用）
// ════════════════════════════════════════════════════════════════

interface SeoCache {
  resourceId: string
  title: string
  description: string
  keywords: string[]
  source: 'dify' | 'fallback'
  generatedAt: string
}

const g = globalThis as unknown as { __lpResourceSeoCache?: Map<string, SeoCache> }
if (!g.__lpResourceSeoCache) g.__lpResourceSeoCache = new Map()
const cache: Map<string, SeoCache> = g.__lpResourceSeoCache

// ════════════════════════════════════════════════════════════════
// Dify 调用
// ════════════════════════════════════════════════════════════════

async function callDify(prompt: string): Promise<string | null> {
  const apiKey = process.env.DIFY_API_KEY_SEO || process.env.DIFY_API_KEY_DAILY
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
        user: 'resource-seo',
      }),
    })
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    const outputs = data?.data?.outputs || {}
    return (
      outputs.result ||
      outputs.description ||
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

// ════════════════════════════════════════════════════════════════
// 本地兜底：模板化生成 150 字 SEO 描述
// ════════════════════════════════════════════════════════════════

function fallbackDescription(input: {
  title: string
  category: string
  tags: string[]
  content: string
}): { description: string; keywords: string[] } {
  const tagStr = input.tags?.slice(0, 3).join('、') || '精选资源'
  const categoryStr = input.category || 'OPC 工具'
  const contentSnippet = (input.content || '')
    .replace(/[#*`>\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)

  const description = `【${categoryStr}】${input.title} - ${tagStr}，由良朋社 OPC 资源库精选收录。${
    contentSnippet ? `${contentSnippet}...` : '面向 OPC 创业者的优质资源。'
  }立即查看详情、用户评价与可下载链接。`

  const keywords = [
    input.title,
    ...(input.tags || []).slice(0, 4),
    'OPC',
    '良朋社',
    categoryStr,
  ].slice(0, 8)

  return {
    description: description.slice(0, 160),
    keywords,
  }
}

// ════════════════════════════════════════════════════════════════
// 主入口
// ════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { resourceId, title, category, tags, content, slug } = body || {}

    if (!resourceId && !title) {
      return NextResponse.json(
        { success: false, error: 'resourceId 与 title 至少传一个' },
        { status: 400 }
      )
    }

    const id = resourceId || slug || `tmp-${Date.now()}`

    // 缓存命中（24h 内）
    const cached = cache.get(id)
    if (cached && Date.now() - new Date(cached.generatedAt).getTime() < 24 * 3600 * 1000) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      })
    }

    const titleStr = (title || '').trim()
    const categoryStr = (category || 'OPC 资源').trim()
    const tagsArr: string[] = Array.isArray(tags) ? tags : []
    const contentStr = (content || '').trim().slice(0, 500)

    // 1) Dify
    const prompt = `你是一名 SEO 内容编辑。请根据以下资源信息，生成一段 150 字以内的中文 SEO 描述（用于 <meta name="description">）。

要求：
1. 包含资源标题和分类
2. 突出 OPC 创业者关心的"可解决问题 / 适用场景"
3. 自然嵌入 2-3 个长尾关键词
4. 输出纯 JSON：{ "description": "...", "keywords": ["..", ".."] }

资源信息：
- 标题：${titleStr}
- 分类：${categoryStr}
- 标签：${tagsArr.join('、') || '无'}
- 内容摘要：${contentStr || '无'}`

    let result: { description: string; keywords: string[] } | null = null
    let source: 'dify' | 'fallback' = 'fallback'
    const aiText = await callDify(prompt)
    if (aiText) {
      const json = extractJsonFromText(aiText)
      if (json && typeof json.description === 'string') {
        result = {
          description: json.description.slice(0, 160),
          keywords: Array.isArray(json.keywords) ? json.keywords.slice(0, 8) : [],
        }
        source = 'dify'
      } else {
        // 尝试从纯文本里提取第一段
        const firstParagraph = aiText.split('\n').find((l) => l.trim().length > 30)
        if (firstParagraph) {
          result = {
            description: firstParagraph.trim().slice(0, 160),
            keywords: tagsArr.slice(0, 5),
          }
          source = 'dify'
        }
      }
    }

    // 2) 兜底
    if (!result) {
      result = fallbackDescription({
        title: titleStr,
        category: categoryStr,
        tags: tagsArr,
        content: contentStr,
      })
    }

    // 3) 入库
    const record: SeoCache = {
      resourceId: id,
      title: titleStr,
      description: result.description,
      keywords: result.keywords,
      source,
      generatedAt: new Date().toISOString(),
    }
    cache.set(id, record)

    return NextResponse.json({
      success: true,
      data: record,
      cached: false,
    })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || '生成失败' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const resourceId = searchParams.get('resourceId') || ''
  if (!resourceId) {
    return NextResponse.json({ success: false, error: 'resourceId 必填' }, { status: 400 })
  }
  const cached = cache.get(resourceId)
  if (!cached) {
    return NextResponse.json({ success: false, error: '暂无 SEO 描述' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: cached })
}
