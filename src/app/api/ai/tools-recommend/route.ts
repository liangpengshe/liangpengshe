import { NextResponse } from 'next/server'
import { callDifyChat, extractJsonFromText } from '@/lib/dify'

export const dynamic = 'force-dynamic'

interface ToolRecommendation {
  toolName: string
  category: string
  reason: string
  learningTime: string
  efficiency: string
  isOpcTool: boolean
}

const SYSTEM_PROMPT = `你是一个全栈 AI 商业落地专家，擅长将业务需求转化为技术选型。请根据用户的需求，输出一个包含 4-6 个工具推荐的 JSON 数组。JSON 数组的每一个对象必须包含：toolName（工具名）、category（分类，如开发、设计、运营）、reason（核心推荐理由）、learningTime（预估学习周期）、efficiency（预估效率提升比例）、isOpcTool（是否为 OPC 自研，布尔值）。仅输出 JSON，无需多余解释。`

// 模拟推荐数据（Dify / DeepSeek 不可用时降级）
function buildMockRecommendations(userInput: string): ToolRecommendation[] {
  const lower = userInput.toLowerCase()
  const isLive = lower.includes('直播') || lower.includes('带货') || lower.includes('数字人')
  const isDesign = lower.includes('设计') || lower.includes('海报') || lower.includes('logo')
  const isCode = lower.includes('开发') || lower.includes('编程') || lower.includes('app') || lower.includes('网站')
  const isContent = lower.includes('内容') || lower.includes('文案') || lower.includes('写作')

  const baseList: ToolRecommendation[] = [
    {
      toolName: '先锋派数字人',
      category: '视频 / 内容',
      reason: 'OPC 自研的 AI 数字人视频生成工具，输入文案即可生成口播视频，适合批量生产带货内容',
      learningTime: '1-2 天',
      efficiency: '提升 500%',
      isOpcTool: true,
    },
    {
      toolName: '灵犀 AI',
      category: '内容 / 运营',
      reason: '智能内容创作助手，可批量产出公众号、小红书、抖音文案，7×24 不间断',
      learningTime: '半天',
      efficiency: '提升 400%',
      isOpcTool: true,
    },
    {
      toolName: '豹纹工坊',
      category: '电商 / 设计',
      reason: '一键生成爆款商品素材图与详情页，提升电商店铺转化率',
      learningTime: '1 天',
      efficiency: '提升 350%',
      isOpcTool: true,
    },
  ]

  if (isLive) {
    baseList.unshift({
      toolName: 'D-ID 数字人',
      category: '视频',
      reason: '支持 100+ 语言数字人口播，可与先锋派数字人配合使用，覆盖海外直播场景',
      learningTime: '2-3 天',
      efficiency: '提升 300%',
      isOpcTool: false,
    })
  }

  if (isDesign) {
    baseList.push({
      toolName: 'Midjourney',
      category: '设计',
      reason: '顶级 AI 绘画工具，生成高品质素材图，可与豹纹工坊配合产出电商店铺图',
      learningTime: '1-2 天',
      efficiency: '提升 400%',
      isOpcTool: false,
    })
  }

  if (isCode) {
    baseList.push({
      toolName: 'Cursor',
      category: '开发',
      reason: 'AI 编程 IDE，自然语言直接生成完整项目代码，OPC 项目的全栈开发首选',
      learningTime: '1 天',
      efficiency: '提升 600%',
      isOpcTool: false,
    })
  }

  if (isContent) {
    baseList.push({
      toolName: 'Notion AI',
      category: '内容 / 协作',
      reason: '智能写作 + 知识管理一体，适合内容创作者沉淀素材库',
      learningTime: '半天',
      efficiency: '提升 250%',
      isOpcTool: false,
    })
  }

  // 补足到 4-6 个
  const fillers: ToolRecommendation[] = [
    {
      toolName: 'Coze（扣子）',
      category: '智能体',
      reason: '字节出品的 AI Agent 编排平台，零代码搭建行业 Bot，可一键发布到飞书/微信',
      learningTime: '1 天',
      efficiency: '提升 300%',
      isOpcTool: false,
    },
    {
      toolName: '即梦 AI',
      category: '视频',
      reason: '字节跳动出品的文生视频工具，适合生成短视频片段补素材',
      learningTime: '半天',
      efficiency: '提升 200%',
      isOpcTool: false,
    },
  ]

  for (const f of fillers) {
    if (baseList.length >= 6) break
    if (!baseList.find((b) => b.toolName === f.toolName)) {
      baseList.push(f)
    }
  }

  return baseList.slice(0, 6)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userInput } = body

    if (!userInput || typeof userInput !== 'string' || !userInput.trim()) {
      return NextResponse.json(
        { success: false, error: '请输入业务需求描述' },
        { status: 400 }
      )
    }

    const input = userInput.trim()
    let recommendations: ToolRecommendation[] = []

    // 尝试调用 Dify
    if (process.env.DIFY_API_KEY) {
      try {
        const difyRes = await callDifyChat(
          `${SYSTEM_PROMPT}\n\n用户需求：${input}`,
          `tools-advisor-${Date.now()}`
        )
        const parsed = extractJsonFromText(difyRes.answer || '')

        if (parsed && Array.isArray(parsed)) {
          recommendations = parsed.filter(
            (item: any) =>
              item &&
              typeof item.toolName === 'string' &&
              typeof item.category === 'string'
          )
        } else if (parsed && Array.isArray(parsed.tools)) {
          recommendations = parsed.tools
        } else if (parsed && parsed.recommendations && Array.isArray(parsed.recommendations)) {
          recommendations = parsed.recommendations
        }
      } catch (difyErr) {
        console.warn('[tools-recommend] Dify 调用失败，使用降级方案:', difyErr)
      }
    }

    // 降级方案
    if (recommendations.length === 0) {
      recommendations = buildMockRecommendations(input)
    }

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        total: recommendations.length,
        source: process.env.DIFY_API_KEY ? 'dify' : 'mock',
      },
    })
  } catch (error: any) {
    console.error('[tools-recommend] 错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '推荐服务暂时不可用',
      },
      { status: 500 }
    )
  }
}
