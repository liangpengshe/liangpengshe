/**
 * AI 轻互动留言板 API
 * ------------------------------------------------------------
 * GET  /api/community/comments?slug=xxx                → 拉取某项目/页面的留言
 * POST /api/community/comments  { slug, content, userId, stage? }  → 提交留言
 *
 * 设计理念：
 *   - 不渲染传统论坛楼层结构
 *   - 留言自动归类到对应项目/页面的"卡点"池
 *   - SOP 页面打开时，AI 主动推送"其他 OPC 的热议"
 *   - 每周自动汇总成《OPC 实战避坑合集》
 */
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// ════════════════════════════════════════════════════════════════
// 数据模型
// ════════════════════════════════════════════════════════════════

interface Comment {
  id: string
  slug: string
  userId: string
  userName: string
  content: string
  /** 用户做项目时卡在哪一步（可选） */
  stage?: string
  /** AI 自动从 content 提取的卡点关键词 */
  stuckKeywords: string[]
  /** AI 相似度聚类后的 group id */
  clusterId: string
  createdAt: string
  /** 点赞 / 有用计数 */
  helpfulCount: number
}

const STUCK_KEYWORDS = [
  '选品', '供应链', '货源', '代发',
  '上架', '详情页', '主图',
  '运营', '投流', '流量', '转化率',
  '客服', '售后', '退货',
  '物流', '发货', '打包',
  '直播', '短视频', '脚本', '文案',
  '定位', '起号', '矩阵', '涨粉',
  'GEO', 'SEO', '收录', '排名',
  '数字人', 'AI 工具', '系统定制',
]

function extractStuckKeywords(text: string): string[] {
  if (!text) return []
  return STUCK_KEYWORDS.filter((k) => text.includes(k))
}

function makeClusterId(slug: string, keywords: string[]): string {
  if (keywords.length === 0) return `${slug}::general`
  const top = [...keywords].sort()[0]
  return `${slug}::${top}`
}

const g = globalThis as unknown as { __lpCommentStore?: Comment[] }
if (!g.__lpCommentStore) g.__lpCommentStore = []
const store: Comment[] = g.__lpCommentStore

// ════════════════════════════════════════════════════════════════
// 演示种子数据
// ════════════════════════════════════════════════════════════════

function ensureSeed() {
  if (store.length > 0) return
  const seeds: Comment[] = [
    {
      id: 'c-1', slug: 'ai-digital-shop', userId: 'demo-1', userName: '柳州·阿良',
      content: '做 AI 数字网店，选品卡了很久。淘宝数字阅读榜前 50 我都看过了，但不知道哪类适合无货源。',
      stage: '精准选品',
      stuckKeywords: ['选品', '数字人'],
      clusterId: 'ai-digital-shop::选品',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      helpfulCount: 5,
    },
    {
      id: 'c-2', slug: 'ai-digital-shop', userId: 'demo-2', userName: '东莞·阿明',
      content: '上架环节，AI 生成主图风格不统一，平台审核不过。',
      stage: '货品上架',
      stuckKeywords: ['上架', '主图'],
      clusterId: 'ai-digital-shop::上架',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      helpfulCount: 3,
    },
    {
      id: 'c-3', slug: 'ai-digital-shop', userId: 'demo-3', userName: '深圳·小李',
      content: '数字人直播时客服跟不上，咨询量一上来就崩。',
      stage: '客服发货',
      stuckKeywords: ['客服', '直播', '数字人'],
      clusterId: 'ai-digital-shop::客服',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      helpfulCount: 8,
    },
    {
      id: 'c-4', slug: 'ai-self-media', userId: 'demo-4', userName: '乌海·小张',
      content: '小红书起号，AI 写出来的脚本都太"AI 味"了，平台限流。',
      stage: '内容生成',
      stuckKeywords: ['脚本', '文案', '起号'],
      clusterId: 'ai-self-media::脚本',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      helpfulCount: 6,
    },
  ]
  store.push(...seeds)
}

// ════════════════════════════════════════════════════════════════
// GET：拉取某 slug 的留言（可选 cluster 过滤 / 数量限制）
// ════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  try {
    ensureSeed()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug') || ''
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const cluster = searchParams.get('cluster') || ''

    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug 必填' }, { status: 400 })
    }

    let list = store.filter((c) => c.slug === slug)
    if (cluster) list = list.filter((c) => c.clusterId === cluster)

    // 按 helpfulCount 降序，再按时间
    list.sort((a, b) => {
      if (b.helpfulCount !== a.helpfulCount) return b.helpfulCount - a.helpfulCount
      return +new Date(b.createdAt) - +new Date(a.createdAt)
    })

    // 聚类统计：返回 top 3 卡点集群
    const clusterMap = new Map<string, { clusterId: string; count: number; keywords: string[]; sample: Comment }>()
    list.forEach((c) => {
      const cur = clusterMap.get(c.clusterId)
      if (!cur) {
        clusterMap.set(c.clusterId, {
          clusterId: c.clusterId,
          count: 1,
          keywords: c.stuckKeywords,
          sample: c,
        })
      } else {
        cur.count += 1
      }
    })
    const clusters = Array.from(clusterMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((c) => ({
        clusterId: c.clusterId,
        count: c.count,
        keywords: c.keywords,
        sample: {
          userName: c.sample.userName,
          content: c.sample.content.slice(0, 60) + (c.sample.content.length > 60 ? '...' : ''),
        },
      }))

    return NextResponse.json({
      success: true,
      data: {
        list: list.slice(0, limit),
        total: list.length,
        clusters,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message }, { status: 500 })
  }
}

// ════════════════════════════════════════════════════════════════
// POST：提交新留言
// ════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    ensureSeed()
    const body = await req.json().catch(() => ({}))
    const { slug, content, userId, userName, stage, helpfulCount } = body || {}

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ success: false, error: 'slug 必填' }, { status: 400 })
    }
    if (!content || typeof content !== 'string' || content.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: '留言内容至少 5 个字' },
        { status: 400 }
      )
    }
    if (content.length > 500) {
      return NextResponse.json(
        { success: false, error: '留言不超过 500 字' },
        { status: 400 }
      )
    }

    const keywords = extractStuckKeywords(content)
    const record: Comment = {
      id: `c-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      slug: slug.trim(),
      userId: userId || `anon-${Date.now()}`,
      userName: userName || '匿名 OPC',
      content: content.trim(),
      stage: stage || undefined,
      stuckKeywords: keywords,
      clusterId: makeClusterId(slug.trim(), keywords),
      createdAt: new Date().toISOString(),
      helpfulCount: helpfulCount || 0,
    }
    store.unshift(record)

    return NextResponse.json({
      success: true,
      data: record,
      message: '你的卡点已同步给 AI Copilot，将自动与同主题的 OPC 经验归类。',
    })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || '提交失败' },
      { status: 500 }
    )
  }
}
