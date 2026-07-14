// 用户学习进度 API（OPC 4 步闭环：诊断 → 学习 → 实操 → 放大）
// ------------------------------------------------------------
// GET    /api/user/learning-progress?phone=xxx            查询学习进度
// PATCH  /api/user/learning-progress                      完成任务 / 标记阶段完成
//   Body: { phone, action: 'browse' | 'register' | 'download' | 'set-opc' | 'practice-done' | 'scaleup-done', opcLevel? }
// ------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server'
import {
  getLearningProgress,
  markTask,
  markPracticeDone,
  markScaleupDone,
  setOPCLevel,
  type OPCLevel,
} from '@/lib/learning-progress-store'

export const dynamic = 'force-dynamic'

const VALID_ACTIONS = [
  'browse',
  'register',
  'download',
  'set-opc',
  'practice-done',
  'scaleup-done',
] as const

type Action = (typeof VALID_ACTIONS)[number]

function isOPCLevel(v: unknown): v is OPCLevel {
  return v === 'TRADER' || v === 'FLOW' || v === 'SYSTEM' || v === 'ASSET'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get('phone') || ''
  if (!phone) {
    return NextResponse.json(
      { success: false, error: 'phone 必填' },
      { status: 400 }
    )
  }
  const data = getLearningProgress(phone)
  return NextResponse.json({ success: true, data, source: 'memory' })
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      phone?: string
      action?: string
      opcLevel?: string
    }
    const { phone, action, opcLevel } = body
    if (!phone || !action) {
      return NextResponse.json(
        { success: false, error: 'phone 和 action 必填' },
        { status: 400 }
      )
    }
    if (!VALID_ACTIONS.includes(action as Action)) {
      return NextResponse.json(
        {
          success: false,
          error: `action 必须是 ${VALID_ACTIONS.join(' / ')}`,
        },
        { status: 400 }
      )
    }
    const act = action as Action

    let data
    if (act === 'browse' || act === 'register' || act === 'download') {
      data = markTask(phone, act)
    } else if (act === 'set-opc') {
      if (!isOPCLevel(opcLevel)) {
        return NextResponse.json(
          { success: false, error: 'opcLevel 必须是 TRADER/FLOW/SYSTEM/ASSET' },
          { status: 400 }
        )
      }
      data = setOPCLevel(phone, opcLevel)
    } else if (act === 'practice-done') {
      data = markPracticeDone(phone)
    } else if (act === 'scaleup-done') {
      data = markScaleupDone(phone)
    }

    return NextResponse.json({ success: true, data, source: 'memory' })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: (e as Error).message },
      { status: 500 }
    )
  }
}
