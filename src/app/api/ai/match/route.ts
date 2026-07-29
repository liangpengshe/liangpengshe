/**
 * AI 合伙人匹配接口（演进项 3.4 重构）
 * ------------------------------------------------------------
 * 任务：withFallback 迁移 ai/match（W3.1）
 *
 * 数据流：
 *   1. Dify 提取标签 + intent（失败 → 本地 extractLocalKeywords）
 *   2. Supabase 查 partner_applications（失败 → mockPartners）
 *   3. 计算 matchScore 并排序，返回 top 5
 *
 * 失败兜底（最外层 withSmartFallback 包裹）：
 *   - handler 整体 throw → mockBuilder 生成纯本地匹配结果
 *   - 调用方无感知，前端 UI 始终有内容渲染
 * ------------------------------------------------------------
 */
import { withSmartFallback } from '@/lib/api-handler'
import { callDifyChat, extractJsonFromText } from '@/lib/dify'
import { createClient } from '@/lib/supabase/server'
import { MOCK_PARTNERS } from './_data/mockPartners'
import {
  buildMatchResponse,
  computeMockMatches,
  extractLocalKeywords,
  rankPartners,
  type MatchedPartner,
  type MatchResult,
} from './_lib/match-helpers'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// ════════════════════════════════════════════════════════════════
// 入参 / 出参 类型
// ════════════════════════════════════════════════════════════════
interface MatchRequest {
  userInput?: string
  city?: string
}

interface ExtractedTags {
  tags: string[]
  intent: string
}

// ════════════════════════════════════════════════════════════════
// 数据源 1：Dify 提取标签
// 失败时降级到本地关键词提取，不抛错
// ════════════════════════════════════════════════════════════════
async function extractTagsViaDify(
  cleanInput: string,
  userCity: string
): Promise<ExtractedTags> {
  if (!process.env.DIFY_API_KEY) {
    throw new Error('DIFY_API_KEY not configured')
  }
  const prompt = `将以下需求归类，提取行业和资源标签，以 JSON 格式返回，仅返回 JSON，不要有任何多余的解释。例如：{ "tags": ["杭州", "电商", "供应链"], "intent": "找货源" }

用户需求：${cleanInput}${userCity ? `\n所在城市：${userCity}` : ''}`

  const difyRes = await callDifyChat(prompt, `match-${Date.now()}`)
  const extracted = extractJsonFromText(difyRes.answer || '')

  if (extracted && Array.isArray(extracted.tags)) {
    return {
      tags: extracted.tags.filter((t: unknown) => typeof t === 'string'),
      intent: typeof extracted.intent === 'string' ? extracted.intent : '',
    }
  }
  throw new Error('Dify response not in expected JSON shape')
}

// ════════════════════════════════════════════════════════════════
// 数据源 2：Supabase 查合伙人
// 失败时降级到 mockPartners，不抛错
// ════════════════════════════════════════════════════════════════
async function fetchPartnersFromDB(userCity: string): Promise<MatchedPartner[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
    throw new Error('Supabase not configured')
  }
  const supabase = await createClient()
  if (!supabase) {
    throw new Error('Supabase client is null')
  }

  let query = supabase
    .from('partner_applications')
    .select('*')
    .eq('status', 'APPROVED')
    .order('created_at', { ascending: false })
    .limit(50)

  if (userCity) {
    query = query.ilike('city', `%${userCity}%`)
  }

  const { data, error } = await query
  if (error) {
    throw new Error(`partner_applications query failed: ${error.message}`)
  }
  if (!data || data.length === 0) {
    throw new Error('partner_applications empty')
  }

  return data.map((p: any) => {
    let tagsArr: string[] = []
    if (Array.isArray(p.tags)) {
      tagsArr = p.tags
    } else if (typeof p.tags === 'string' && p.tags) {
      try {
        const parsed = JSON.parse(p.tags)
        tagsArr = Array.isArray(parsed) ? parsed : p.tags.split(/[,，]/)
      } catch {
        tagsArr = p.tags.split(/[,，]/)
      }
    }
    if (userCity && !tagsArr.includes(userCity)) {
      tagsArr.unshift(userCity)
    }
    return {
      id: p.id,
      name: p.name || '匿名合伙人',
      city: p.city || '',
      description: p.description || p.notes || '该合伙人暂未填写简介',
      tags: tagsArr,
      status: p.status,
      matchScore: 0,
    }
  })
}

// ════════════════════════════════════════════════════════════════
// 主 handler
// 数据源失败时不 throw，由 mockBuilder 兜底
// 但 userInput 缺失必须 throw（业务校验）
// ════════════════════════════════════════════════════════════════
async function matchHandler(body: MatchRequest) {
  const { userInput, city } = body
  if (!userInput || typeof userInput !== 'string') {
    throw new Error('缺少有效的用户输入')
  }

  const userCity = (city || '').trim()
  const cleanInput = userInput.trim()

  // 数据源 1：Dify（失败 → 本地）
  let extracted: ExtractedTags
  try {
    extracted = await extractTagsViaDify(cleanInput, userCity)
  } catch (difyErr) {
    console.info('[ai-match] Dify 失败，降级本地关键词:', difyErr)
    const keywords = extractLocalKeywords(cleanInput)
    extracted = {
      tags: userCity ? [userCity, ...keywords] : keywords,
      intent: '',
    }
  }

  // 数据源 2：Supabase（失败 → mock）
  let partners: MatchedPartner[]
  let source: string
  try {
    partners = await fetchPartnersFromDB(userCity)
    source = 'dify+supabase'
  } catch (sbErr) {
    console.info('[ai-match] Supabase 失败，降级 mockPartners:', sbErr)
    partners = MOCK_PARTNERS.map((p) => ({ ...p, matchScore: 0 }))
    source = 'mock'
  }

  // 计算匹配并排序
  const matches = rankPartners(partners, extracted.tags, userCity)
  return buildMatchResponse({
    matches,
    tags: extracted.tags,
    intent: extracted.intent,
    city: userCity,
    source,
  })
}

// ════════════════════════════════════════════════════════════════
// 兜底 mockBuilder
// 任何主流程异常都降级到"完全本地匹配"
// （与 mockBuilder 一致，保证响应结构稳定）
// ════════════════════════════════════════════════════════════════
async function buildMockMatch(body: MatchRequest): Promise<MatchResult> {
  const userInput = body.userInput || ''
  const city = body.city || ''
  const matches = computeMockMatches(userInput, city)
  const keywords = extractLocalKeywords(userInput)
  const tags = keywords.includes(city) ? keywords : [city, ...keywords]
  return buildMatchResponse({
    matches,
    tags,
    intent: '',
    city,
    source: 'mock-fallback',
  })
}

// ════════════════════════════════════════════════════════════════
// 出口（演进项 3.4：withSmartFallback 替代手写 try/catch）
// ════════════════════════════════════════════════════════════════
export const POST = withSmartFallback<MatchRequest, MatchResult>({
  tag: 'ai-match',
  handler: matchHandler,
  mockBuilder: buildMockMatch,
})
