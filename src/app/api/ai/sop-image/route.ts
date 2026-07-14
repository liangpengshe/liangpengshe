// 进化三：AI SOP 简图生成 API
// ------------------------------------------------------------
// POST /api/ai/sop-image
//   Body: { opcLevel: 'TRADER'|'FLOW'|'SYSTEM'|'ASSET'|'NONE', stage: 'diagnosis'|'learning'|'operation'|'scaling' }
//   响应：{ success, data: { html: string, source: 'dify'|'local' } }
//
// 行为：
//   1. 优先调用 Dify Workflow（如果配置了 DIFY_API_KEY_SOP_IMAGE）
//   2. 失败时降级为本地模板 HTML
// ------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server'
import { callDifyWorkflow } from '@/lib/dify-workflow'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface SopImageBody {
  opcLevel?: string
  stage?: string
}

const STAGE_LABELS: Record<string, string> = {
  diagnosis: 'STEP 01 · AI 商业 IP 诊断',
  learning: 'STEP 02 · 智富严选学习',
  operation: 'STEP 03 · 运营实操',
  scaling: 'STEP 04 · 矩阵放大',
}

const LEVEL_LABELS: Record<string, string> = {
  TRADER: '交易型 OPC',
  FLOW: '流量型 OPC',
  SYSTEM: '系统型 OPC',
  ASSET: '资产型 OPC',
  NONE: 'OPC 新手',
}

function buildFallbackHtml(opcLevel: string, stage: string): string {
  const levelLabel = LEVEL_LABELS[opcLevel] || LEVEL_LABELS.NONE
  const stageTitle = STAGE_LABELS[stage] || STAGE_LABELS.learning
  const tasks: Record<string, string[]> = {
    diagnosis: [
      '回答 4 个核心问题，定位 OPC 类型',
      '获取专属 OPC 路径推荐',
      '解锁四库全胜系统访问权限',
    ],
    learning: [
      '通读《智富严选选品 SOP》',
      '完成 3 项新手启航任务（+100分）',
      '解锁运营实操权限（≥80分）',
    ],
    operation: [
      '在四库中挑选 2-3 个工具/项目',
      '搭建首单 SOP 模板',
      '跑通首单，赚第一笔钱',
    ],
    scaling: [
      '城市主理人申请',
      '搭建本地沙龙网络',
      '对接 OPC 全球生态',
    ],
  }
  const taskList = tasks[stage] || tasks.learning
  return JSON.stringify({ levelLabel, stageTitle, taskList })
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as SopImageBody
    const { opcLevel = 'NONE', stage = 'learning' } = body

    // 1. 尝试 Dify
    const apiKey = process.env.DIFY_API_KEY_SOP_IMAGE
    if (apiKey) {
      try {
        const result = await callDifyWorkflow(
          apiKey,
          {
            opc_level: opcLevel,
            stage,
            instruction:
              '请输出一段可直接渲染的 HTML 简图代码（600px 宽），包含品牌 header、阶段标题、3 项核心任务。',
          },
          { timeoutMs: 30000 }
        )
        const html = result.outputs?.html || result.outputs?.text || ''
        if (html && html.includes('<')) {
          return NextResponse.json({
            success: true,
            data: { html, source: 'dify' },
          })
        }
      } catch (e) {
        console.warn('[sop-image] Dify 失败，降级为本地模板:', (e as Error).message)
      }
    }

    // 2. 降级：返回本地 fallback（前端会用 buildLocalHTML 渲染）
    return NextResponse.json({
      success: true,
      data: {
        html: buildFallbackHtml(opcLevel, stage),
        source: 'local-fallback-marker',
      },
    })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: (e as Error).message || '生成失败' },
      { status: 500 }
    )
  }
}
