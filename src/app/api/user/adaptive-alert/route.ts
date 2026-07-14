// 用户自适应路径 · 卡点检测 API
// ------------------------------------------------------------
// GET /api/user/adaptive-alert?phone=xxx
//   响应：{ success, alert: AdaptiveAlert | null, score, practiceDone }
//   - alert 为 null 表示无卡点，不推送任何 UI
//   - alert.kind = 'learning-stuck' / 'practice-stuck'
// ------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server'
import { buildAlertApiResp } from '@/lib/adaptive-path'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone') || ''
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'phone 必填' },
        { status: 400 }
      )
    }
    return NextResponse.json(buildAlertApiResp(phone))
  } catch (error) {
    console.error('[user/adaptive-alert] API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
