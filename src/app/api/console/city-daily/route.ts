/**
 * 城市主理人 · 本地 AI 商业日报生成
 * ------------------------------------------------------------
 * GET  /api/console/city-daily?city=xxx              → 拉取该城市最近文章
 * POST /api/console/city-daily  { city, force, title, authorName }  → 生成新文章
 *
 * 流程：
 *   1. 聚合该城市近 7 天的 OPC 行为
 *   2. 调用 Dify 写 600 字公众号文章（含本地选品建议 + 社群链接）
 *   3. 落库到 /news/[city]/[slug] 落地页（SEO 友好）
 *   4. 返回可访问的 URL
 *
 * SEO 价值：
 *   - wuhai.liangpengshe.com/news/wuhai/ai-e-commerce-wuhai-guide
 *   - shenzhen.liangpengshe.com/news/shenzhen/...
 *   百度/谷歌将这类 URL 视为"优质本地化内容"，提升城市分站排名
 */
import { NextRequest, NextResponse } from 'next/server'
import { extractJsonFromText } from '@/lib/dify'

export const dynamic = 'force-dynamic'

// ════════════════════════════════════════════════════════════════
// 全局存储（演示用，生产应落 Supabase）
// ════════════════════════════════════════════════════════════════

interface CityArticle {
  id: string
  city: string
  title: string
  slug: string
  content: string // Markdown
  excerpt: string // 150 字 SEO 描述
  authorName: string
  generatedAt: string
  source: 'dify' | 'fallback'
  localTips: string[] // 本地选品建议
  communityLinks: string[] // 本地社群链接
  relatedKeywords: string[] // 长尾词
}

const g = globalThis as unknown as { __lpCityDailyStore?: CityArticle[] }
if (!g.__lpCityDailyStore) g.__lpCityDailyStore = []
const store: CityArticle[] = g.__lpCityDailyStore

// ════════════════════════════════════════════════════════════════
// 城市数据提取
// ════════════════════════════════════════════════════════════════

const CITY_ALIAS: Record<string, string> = {
  柳州: 'liuzhou',
  东莞: 'dongguan',
  乌海: 'wuhai',
  深圳: 'shenzhen',
  广州: 'guangzhou',
  上海: 'shanghai',
  北京: 'beijing',
  杭州: 'hangzhou',
  成都: 'chengdu',
  武汉: 'wuhan',
}

function cityToSlug(city: string): string {
  if (CITY_ALIAS[city]) return CITY_ALIAS[city]
  return city.toLowerCase().replace(/\s+/g, '-')
}

function pinyinSlug(text: string): string {
  return text
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 60)
    || `post-${Date.now()}`
}

// ════════════════════════════════════════════════════════════════
// 数据聚合：获取指定城市近 7 天的 OPC 行为
// ════════════════════════════════════════════════════════════════

function gatherCityActivity(city: string) {
  const actG = globalThis as unknown as {
    __lpActivityStore?: { items: Array<{ userId: string; type: string; title: string; payload?: any; createdAt: string }> }
  }
  const items = actG.__lpActivityStore?.items || []
  return items.filter((a) => a.payload?.city === city)
}

function ensureSeedData() {
  const actG = globalThis as unknown as {
    __lpActivityStore?: { items: any[] }
  }
  if (!actG.__lpActivityStore) {
    actG.__lpActivityStore = { items: [] }
  }
  if (actG.__lpActivityStore.items.length === 0) {
    actG.__lpActivityStore.items.push(
      { userId: 'seed-1', type: 'inquiry', title: '柳州螺蛳粉代发', payload: { opc_level: 'trader', city: '柳州' }, createdAt: new Date().toISOString() },
      { userId: 'seed-2', type: 'inquiry', title: '柳州特色选品', payload: { opc_level: 'trader', city: '柳州' }, createdAt: new Date().toISOString() },
      { userId: 'seed-3', type: 'plan', title: '东莞 AI 玩具店', payload: { opc_level: 'trader', city: '东莞' }, createdAt: new Date().toISOString() },
      { userId: 'seed-4', type: 'inquiry', title: '乌海 AI 直播', payload: { opc_level: 'flow', city: '乌海' }, createdAt: new Date().toISOString() }
    )
  }
}

// ════════════════════════════════════════════════════════════════
// Dify 调用：写一篇 600 字本地公众号文章
// ════════════════════════════════════════════════════════════════

async function callDify(prompt: string): Promise<string | null> {
  const apiKey = process.env.DIFY_API_KEY_CITY || process.env.DIFY_API_KEY_DAILY
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
        user: 'city-daily-writer',
      }),
    })
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    const outputs = data?.data?.outputs || {}
    return (
      outputs.result ||
      outputs.article ||
      outputs.content ||
      outputs.markdown ||
      (typeof outputs === 'string' ? outputs : '') ||
      data?.answer ||
      null
    )
  } catch {
    return null
  }
}

// ════════════════════════════════════════════════════════════════
// 本地兜底：模板化生成 600 字公众号文章
// ════════════════════════════════════════════════════════════════

function fallbackArticle(city: string, activities: any[]): { content: string; localTips: string[]; keywords: string[] } {
  const titles = Array.from(new Set(activities.map((a) => a.title))).slice(0, 3)
  const levelSet = new Set(activities.map((a) => a.payload?.opc_level).filter(Boolean))

  const levelMap: Record<string, string> = {
    trader: '交易型',
    flow: '流量型',
    system: '系统型',
    asset: '资产型',
  }
  const levelDesc = Array.from(levelSet).map((l) => levelMap[l as string] || '').join('、') || '多种'

  // 城市特色数据库（演示用）
  const cityFeature: Record<string, { tip: string; community: string }> = {
    柳州: {
      tip: '本地化选品：螺蛳粉、柳州酸笋、五菱周边。',
      community: 'liuzhou-opc',
    },
    东莞: {
      tip: '本地化选品：东莞潮玩、电子周边、跨境选品。',
      community: 'dongguan-opc',
    },
    乌海: {
      tip: '本地化选品：西部特产、煤化工周边、蒙古族手作。',
      community: 'wuhai-opc',
    },
    深圳: {
      tip: '本地化选品：3C 数码、跨境出海、智能硬件。',
      community: 'shenzhen-opc',
    },
  }
  const feature = cityFeature[city] || { tip: '结合本地资源与产业带优势选品。', community: `${cityToSlug(city)}-opc` }

  const localTips = [
    feature.tip,
    '建议从 1 个垂类切入，跑通 SOP 后再横向扩展。',
    '加入本地 OPC 社群，每周 1 次线下对接。',
  ]
  const keywords = [
    `${city} AI 网店`,
    `${city} AI 自媒体`,
    `${city} OPC 创业`,
    `${city} AI 创业`,
  ]

  const content = `# ${city} AI 商业日报 · 本周风向

**发布时间**：${new Date().toLocaleDateString('zh-CN')} · ${city} OPC 联运站

---

## 一、本周数据

本周 ${city} OPC 联运站共记录到 **${activities.length}** 条真实用户行为，覆盖 **${levelDesc}** 创业者。${titles.length > 0 ? `本周热议方向：「${titles.join('」「')}」` : '本周暂无显著热点。'}

## 二、本地选品建议

${localTips.map((t, i) => `${i + 1}. ${t}`).join('\n')}

## 三、OPC 实战路径

对于 ${city} 的新手 OPC，建议按以下节奏推进：
- **第 1 周**：完成 AI 商业 IP 诊断，定位 4 库切入点。
- **第 2-3 周**：跑通一个 SOP（如 AI 数字网店 / AI 自媒体），单店首单为目标。
- **第 4 周起**：进入矩阵放大阶段，复制到多店 / 多号。

## 四、加入本地社群

扫码加入「${city} OPC 联运群」，每周 1 场线下对接 + 主理人 1V1 答疑。

> 本地链接：https://${cityToSlug(city)}.liangpengshe.com/community/${feature.community}

## 五、AI 鼓励

> 智富不是追风口，而是在**一个城市、一个行业里扎得足够深**。

---

🤖 ${city} 站 AI 主理人 · 自动生成于 ${new Date().toLocaleString('zh-CN')}`
  return { content, localTips, keywords }
}

// ════════════════════════════════════════════════════════════════
// 主入口
// ════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city') || ''

    if (!city) {
      // 返回所有城市最新文章
      return NextResponse.json({
        success: true,
        data: store
          .sort((a, b) => +new Date(b.generatedAt) - +new Date(a.generatedAt))
          .slice(0, 20),
        total: store.length,
      })
    }

    const articles = store
      .filter((a) => a.city === city)
      .sort((a, b) => +new Date(b.generatedAt) - +new Date(a.generatedAt))

    return NextResponse.json({
      success: true,
      data: articles,
      total: articles.length,
    })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureSeedData()
    const body = await req.json().catch(() => ({}))
    const city: string = (body?.city || '').trim()
    const authorName: string = (body?.authorName || `${city}主理人`).trim()
    const force: boolean = !!body?.force

    if (!city) {
      return NextResponse.json({ success: false, error: '请填写城市' }, { status: 400 })
    }

    // 缓存命中：今日已生成且非强制刷新
    if (!force) {
      const today = new Date().toDateString()
      const cached = store.find(
        (a) => a.city === city && new Date(a.generatedAt).toDateString() === today
      )
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
          url: `/news/${cityToSlug(city)}/${cached.slug}`,
        })
      }
    }

    // 1) 聚合本地数据
    const activities = gatherCityActivity(city)

    // 2) 调用 Dify
    const prompt = `你是一名 ${city} 城市的本地 AI 商业内容编辑。请根据下列 ${city} 本地 OPC 行为数据，写一篇 600 字左右的"${city} AI 商业日报"公众号文章。

要求：
1. 标题：包含城市名 + 主题词（如"${city} AI 网店创业者指南"）
2. 结构：本地数据 / 选品建议 / 实战路径 / 加入社群 / AI 鼓励
3. 文风：有数据感、有本地特色，结尾给本地社群链接
4. 输出 Markdown 格式
5. 必须包含至少 3 个本地选品建议和 1 个本地社群链接

${city} 本周行为（最多 10 条）：
${activities.slice(0, 10).map((a) => `- [${a.payload?.opc_level || 'OPC'}] ${a.title}`).join('\n') || '（暂无）'}`

    let aiText = await callDify(prompt)
    let source: 'dify' | 'fallback' = 'dify'
    let content: string
    let localTips: string[]
    let keywords: string[]

    if (aiText && aiText.length > 200) {
      content = aiText
      // 从内容里提取 tips
      const tipMatches = content.match(/[•\-\d][\.\)、]?\s*([^\n]{8,80})/g) || []
      localTips = tipMatches.slice(0, 5).map((s) => s.replace(/^[•\-\d][\.\)、]?\s*/, '').trim())
      keywords = [
        `${city} AI 网店`,
        `${city} AI 自媒体`,
        `${city} OPC 创业`,
      ]
    } else {
      const fb = fallbackArticle(city, activities)
      content = fb.content
      localTips = fb.localTips
      keywords = fb.keywords
      source = 'fallback'
    }

    // 3) 生成 slug + excerpt
    const titleMatch = content.match(/^#\s+(.+?)$/m)
    const title = titleMatch?.[1]?.trim() || `${city} AI 商业日报 · ${new Date().toLocaleDateString('zh-CN')}`
    const slug = pinyinSlug(title.replace(/[市县区]/g, '')) + `-${Date.now().toString(36)}`

    // excerpt：取首段去掉 markdown
    const excerpt = content
      .replace(/^#.*$/gm, '')
      .replace(/\*\*/g, '')
      .replace(/---/g, '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('>') && !l.startsWith('-'))
      .slice(0, 3)
      .join(' ')
      .slice(0, 150)

    const communityLinks = [`https://${cityToSlug(city)}.liangpengshe.com/community/${cityToSlug(city)}-opc`]

    // 4) 落库
    const article: CityArticle = {
      id: `art-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      city,
      title,
      slug,
      content,
      excerpt,
      authorName,
      generatedAt: new Date().toISOString(),
      source,
      localTips,
      communityLinks,
      relatedKeywords: keywords,
    }
    store.unshift(article)

    return NextResponse.json({
      success: true,
      data: article,
      url: `/news/${cityToSlug(city)}/${slug}`,
      source,
    })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || '生成失败' },
      { status: 500 }
    )
  }
}
