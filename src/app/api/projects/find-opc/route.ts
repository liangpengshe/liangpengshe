import { NextResponse } from 'next/server'
import { projectItems, getProjectById } from '@/data/project-items'

/**
 * 项目库 · 寻找资深 OPC 主理人 接口
 * ------------------------------------------------------------
 * POST /api/projects/find-opc
 *
 * Body:
 *   {
 *     projectId: string,        // 项目 id（与 data/project-items.ts 一致）
 *     projectCategory?: string  // 可选：项目分类（用于匹配主理人 expertise_tags）
 *   }
 *
 * 业务逻辑：
 *   1. 解析传入的项目，定位 category
 *   2. 从城市主理人池（CITY_MAINTAINERS）中筛选
 *        - role === 'CITY_MAINTAINER'
 *        - expertise_tags 包含项目 category 关键词
 *        - is_active === true
 *   3. 按 score 降序排，取前 3 名
 *   4. 返回 JSON 格式的主理人列表（包含姓名/城市/手机号/微信/擅长领域/已操盘同类项目数）
 *
 * 当前实现：纯 mock（演示用）
 * 接入真实后端时：
 *   - 替换为 Supabase: supabase.from('users').select('*').eq('role','CITY_MAINTAINER').contains('expertise_tags', [category])
 *   - 写入对接日志:  supabase.from('opc_match_logs').insert({...})
 * ------------------------------------------------------------
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface FindOPCBody {
  projectId?: string
  projectCategory?: string
}

interface SeniorOPCMaintainer {
  id: string
  name: string
  city: string
  phone: string
  wechat: string
  /** 擅长领域标签（与 project.category 模糊匹配） */
  expertise_tags: string[]
  /** 已操盘同类项目数 */
  handledProjectCount: number
  /** 主理人简介 */
  bio: string
  /** 评分（用于排序） */
  score: number
}

// ════════════════════════════════════════════════════════════════
// Mock 城市主理人池
// role: 'CITY_MAINTAINER' | expertise_tags: 城市主理人专长标签
// 与 User 表对齐（生产环境替换为 Supabase 查询）
// ════════════════════════════════════════════════════════════════
const CITY_MAINTAINERS: SeniorOPCMaintainer[] = [
  {
    id: 'opc-sz-001',
    name: '弓老师',
    city: '深圳',
    phone: '138-0011-8801',
    wechat: 'opc_gong_sz',
    expertise_tags: ['数字产品', 'AI数字网店', '实物电商', '无货源'],
    handledProjectCount: 5,
    bio: '前阿里 P7，连续创业者，主攻数字产品变现，孵化 50+ 数字店铺。',
    score: 98,
  },
  {
    id: 'opc-sz-002',
    name: '陈主理人',
    city: '深圳',
    phone: '138-0011-8802',
    wechat: 'opc_chen_sz',
    expertise_tags: ['实物电商', '无货源', '品牌实物', '1688 选品'],
    handledProjectCount: 3,
    bio: '深耕 1688 一件代发 3 年，实战操盘 30+ 实物店铺，首月出单率 95%。',
    score: 95,
  },
  {
    id: 'opc-sz-003',
    name: '林主理人',
    city: '深圳',
    phone: '138-0011-8803',
    wechat: 'opc_lin_sz',
    expertise_tags: ['技术研发', 'SaaS 工具', '系统开发'],
    handledProjectCount: 4,
    bio: '前腾讯高级工程师，独立开发 3 款 SaaS 工具 ARR 累计破 500 万。',
    score: 93,
  },
  {
    id: 'opc-bj-001',
    name: '王主理人',
    city: '北京',
    phone: '138-0011-8804',
    wechat: 'opc_wang_bj',
    expertise_tags: ['内容赛道', 'AI自媒体', '短视频', '抖音'],
    handledProjectCount: 6,
    bio: '抖音 / 视频号双平台万粉操盘手，擅长 0 粉冷启动。',
    score: 96,
  },
  {
    id: 'opc-bj-002',
    name: '周主理人',
    city: '北京',
    phone: '138-0011-8805',
    wechat: 'opc_zhou_bj',
    expertise_tags: ['企业服务', '企业 GEO', '本地化', 'BD'],
    handledProjectCount: 2,
    bio: '前 4A 广告策略总监，专注本地企业 GEO 项目交付。',
    score: 89,
  },
  {
    id: 'opc-sh-001',
    name: '李主理人',
    city: '上海',
    phone: '138-0011-8806',
    wechat: 'opc_li_sh',
    expertise_tags: ['全球电商', 'TikTok Shop', '亚马逊', '跨境电商'],
    handledProjectCount: 4,
    bio: '跨境电商老兵，TikTok Shop 美区单月 GMV 破 10 万美金。',
    score: 94,
  },
  {
    id: 'opc-gz-001',
    name: '黄主理人',
    city: '广州',
    phone: '138-0011-8807',
    wechat: 'opc_huang_gz',
    expertise_tags: ['实物电商', '无货源', '淘宝', '拼多多'],
    handledProjectCount: 3,
    bio: '广州 13 行女装供应链资源，擅长无货源女装起店。',
    score: 91,
  },
  {
    id: 'opc-hz-001',
    name: '张主理人',
    city: '杭州',
    phone: '138-0011-8808',
    wechat: 'opc_zhang_hz',
    expertise_tags: ['内容赛道', '小红书', '种草', '私域'],
    handledProjectCount: 5,
    bio: '小红书万粉 KOC 矩阵操盘手，单月最高 50 万 GMV。',
    score: 92,
  },
  {
    id: 'opc-cd-001',
    name: '何主理人',
    city: '成都',
    phone: '138-0011-8809',
    wechat: 'opc_he_cd',
    expertise_tags: ['渠道销售', '工具销售', 'SaaS 分销'],
    handledProjectCount: 3,
    bio: 'AI 工具代理分销冠军，单月最高签约 200+ 客户。',
    score: 90,
  },
]

/**
 * 关键词与 expertise_tags 的命中度评分
 */
function scoreMatch(maintainer: SeniorOPCMaintainer, category: string): number {
  if (!category) return 0
  const cat = category.toLowerCase()
  let hit = 0
  for (const tag of maintainer.expertise_tags) {
    if (cat.includes(tag.toLowerCase()) || tag.toLowerCase().includes(cat)) {
      hit += 1
    }
  }
  return hit
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as FindOPCBody
    const { projectId, projectCategory } = body

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: '缺少 projectId' },
        { status: 400 }
      )
    }

    const project = getProjectById(projectId)
    if (!project) {
      return NextResponse.json(
        { success: false, message: '项目不存在' },
        { status: 404 }
      )
    }

    const category = projectCategory || project.category

    // 模拟网络延迟
    await new Promise((r) => setTimeout(r, 400))

    // 计算匹配分并排序
    const matched = CITY_MAINTAINERS.map((m) => ({
      ...m,
      matchScore: scoreMatch(m, category),
    }))
      .filter((m) => m.matchScore > 0) // 没有任何标签命中则排除
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
        return b.score - a.score
      })
      .slice(0, 3)

    // 若没有任何匹配 → 返回默认兜底（保留头部 3 名资深主理人）
    const final = matched.length > 0
      ? matched
      : CITY_MAINTAINERS
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((m) => ({ ...m, matchScore: 0, fallback: true }))

    // 为前端展示脱敏微信（保留 6 位）
    const safeForDisplay = final.map((m) => ({
      id: m.id,
      name: m.name,
      city: m.city,
      phone: m.phone,
      wechatMasked: m.wechat.length > 4
        ? m.wechat.slice(0, 3) + '***' + m.wechat.slice(-1)
        : m.wechat,
      expertise_tags: m.expertise_tags,
      handledProjectCount: m.handledProjectCount,
      bio: m.bio,
      matchScore: m.matchScore,
      fallback: (m as { fallback?: boolean }).fallback ?? false,
    }))

    return NextResponse.json({
      success: true,
      projectId,
      projectTitle: project.title,
      projectCategory: category,
      maintainers: safeForDisplay,
      total: safeForDisplay.length,
    })
  } catch (err) {
    console.error('[projects/find-opc] error:', err)
    return NextResponse.json(
      { success: false, message: '服务异常，请稍后再试' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/projects/find-opc',
    method: 'POST',
    description: '寻找资深 OPC 主理人（按项目 category 匹配 expertise_tags）',
    bodyExample: { projectId: 'digital-shop' },
  })
}
