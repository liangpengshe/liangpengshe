import { NextResponse } from 'next/server'
import { callDifyChat, extractJsonFromText } from '@/lib/dify'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// 模拟数据（Supabase 未配置时使用）
const mockPartners = [
  {
    id: 'mock-1',
    name: '张总',
    city: '杭州',
    description: '跨境电商运营专家，5 年 Shopify 独立站操盘经验，专注 AI 选品与自动化广告投放',
    tags: ['杭州', '电商', '供应链', 'AI 选品', '独立站'],
    status: 'APPROVED',
    matchScore: 92,
  },
  {
    id: 'mock-2',
    name: '李总',
    city: '深圳',
    description: 'AI 自媒体矩阵操盘手，擅长抖音 + 小红书双平台内容分发与冷启动',
    tags: ['深圳', '自媒体', '内容创作', '抖音', '小红书'],
    status: 'APPROVED',
    matchScore: 87,
  },
  {
    id: 'mock-3',
    name: '王总',
    city: '广州',
    description: '本地生活服务商，主攻美团 + 抖音同城号，擅长 AI 数字人直播',
    tags: ['广州', '本地生活', '直播', '数字人', '短视频'],
    status: 'APPROVED',
    matchScore: 85,
  },
  {
    id: 'mock-4',
    name: '陈总',
    city: '成都',
    description: 'AI 工具代理与技术服务商，为本地中小企业提供 AI 培训 + 落地咨询',
    tags: ['成都', 'AI 工具', '培训', '咨询', '中小企业'],
    status: 'APPROVED',
    matchScore: 80,
  },
  {
    id: 'mock-5',
    name: '林总',
    city: '杭州',
    description: '传统外贸转型顾问，AI 跨境营销与多语言内容生成专家',
    tags: ['杭州', '外贸', '跨境', 'AI 营销', '多语言'],
    status: 'APPROVED',
    matchScore: 78,
  },
]

interface MatchedPartner {
  id: string
  name: string
  city: string
  description: string
  tags: string[]
  status: string
  matchScore: number
}

/**
 * 计算标签相似度（基于 Jaccard 相似度 + 城市加权）
 */
function calculateMatchScore(userTags: string[], partnerTags: string[], userCity: string, partnerCity: string): number {
  if (!userTags.length || !partnerTags.length) return 0

  // 标签转小写以便比较
  const userSet = new Set(userTags.map((t) => t.toLowerCase().trim()))
  const partnerSet = new Set(partnerTags.map((t) => t.toLowerCase().trim()))

  // Jaccard 相似度
  const intersection = new Set(Array.from(userSet).filter((x) => partnerSet.has(x)))
  const union = new Set([...Array.from(userSet), ...Array.from(partnerSet)])
  let score = (intersection.size / union.size) * 100

  // 城市匹配加权（+15 分）
  if (userCity && partnerCity && userCity.trim() === partnerCity.trim()) {
    score += 15
  }

  // 包含匹配加分（处理同义词/部分匹配）
  for (const ut of Array.from(userSet)) {
    if (ut.length < 2) continue
    for (const pt of Array.from(partnerSet)) {
      if (pt.length < 2) continue
      if (ut !== pt && (ut.includes(pt) || pt.includes(ut))) {
        score += 5
        break
      }
    }
  }

  return Math.min(Math.round(score), 100)
}

/**
 * 计算模拟匹配（无需 Dify 时的降级方案）
 */
function computeMockMatches(userInput: string, city: string): MatchedPartner[] {
  // 从用户输入中粗略提取关键词
  const keywords = userInput
    .replace(/[，。！？、,.!?\s]+/g, ' ')
    .split(' ')
    .filter((w) => w.length >= 2)

  const allTags = keywords.includes(city) ? keywords : [city, ...keywords]

  return mockPartners
    .map((p) => ({
      ...p,
      matchScore: calculateMatchScore(allTags, p.tags, city, p.city),
    }))
    .filter((p) => p.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userInput, city } = body

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { success: false, error: '缺少有效的用户输入' },
        { status: 400 }
      )
    }

    const userCity = (city || '').trim()
    const cleanInput = userInput.trim()

    // ──────────── 1. 调用 Dify 提取标签和意图 ────────────
    let extractedTags: string[] = []
    let intent: string = ''

    if (process.env.DIFY_API_KEY) {
      try {
        const prompt = `将以下需求归类，提取行业和资源标签，以 JSON 格式返回，仅返回 JSON，不要有任何多余的解释。例如：{ "tags": ["杭州", "电商", "供应链"], "intent": "找货源" }

用户需求：${cleanInput}${userCity ? `\n所在城市：${userCity}` : ''}`

        const difyRes = await callDifyChat(prompt, `match-${Date.now()}`)
        const extracted = extractJsonFromText(difyRes.answer || '')

        if (extracted && Array.isArray(extracted.tags)) {
          extractedTags = extracted.tags.filter((t: any) => typeof t === 'string')
        }
        if (extracted && typeof extracted.intent === 'string') {
          intent = extracted.intent
        }
      } catch (difyErr) {
        console.warn('[AI Match] Dify 调用失败，使用降级方案:', difyErr)
      }
    }

    // Dify 不可用时降级：本地提取关键词
    if (extractedTags.length === 0) {
      const keywords = cleanInput
        .replace(/[，。！？、,.!?\s]+/g, ' ')
        .split(' ')
        .filter((w) => w.length >= 2 && w.length <= 12)
      extractedTags = userCity ? [userCity, ...keywords] : keywords
    }

    // ──────────── 2. 在 Supabase 中查询合作伙伴 ────────────
    let partners: MatchedPartner[] = []

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

    if (hasSupabase) {
      try {
        const supabase = await createClient()

        // 查询已审核的合伙人（按 city 模糊匹配）
        let query = supabase
          .from('partner_applications')
          .select('*')
          .eq('status', 'APPROVED')
          .order('created_at', { ascending: false })
          .limit(50)

        if (userCity) {
          // Postgres 模糊匹配：city 包含用户所在城市
          query = query.ilike('city', `%${userCity}%`)
        }

        const { data, error } = await query

        if (!error && data && data.length > 0) {
          // 将每个合作伙伴的 tags 字段拆解（假设 tags 是逗号分隔字符串或 JSON 数组）
          partners = data.map((p: any) => {
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
      } catch (sbErr) {
        console.warn('[AI Match] Supabase 查询失败，使用模拟数据:', sbErr)
      }
    }

    // 3. 如果 Supabase 没有数据，使用模拟数据
    if (partners.length === 0) {
      partners = mockPartners.map((p) => ({ ...p, matchScore: 0 }))
    }

    // ──────────── 3. 计算匹配分数并排序 ────────────
    const matchedPartners = partners
      .map((p) => ({
        ...p,
        matchScore: calculateMatchScore(extractedTags, p.tags, userCity, p.city),
      }))
      .filter((p) => p.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      data: {
        matches: matchedPartners,
        extracted: {
          tags: extractedTags,
          intent,
          city: userCity,
        },
        source: process.env.DIFY_API_KEY ? 'dify+supabase' : 'mock',
        total: matchedPartners.length,
      },
    })
  } catch (error: any) {
    console.error('[AI Match] 错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '匹配服务暂时不可用',
        data: { matches: computeMockMatchesSafe(), extracted: null, source: 'fallback' },
      },
      { status: 200 }
    )
  }
}

function computeMockMatchesSafe() {
  return mockPartners
    .map((p) => ({ ...p }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)
}
