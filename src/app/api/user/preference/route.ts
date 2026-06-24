// 用户偏好设置 API
// GET  /api/user/preference?userId=xxx
// POST /api/user/preference  { userId, dailyBrief }

import { NextRequest, NextResponse } from 'next/server'
import { getPreference, setPreference } from '@/lib/ai-daily-store'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId') || ''
  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId 必填' }, { status: 400 })
  }
  const pref = getPreference(userId)
  return NextResponse.json({ success: true, data: pref, source: 'memory' })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { userId, dailyBrief } = body || {}
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId 必填' }, { status: 400 })
    }
    const updated = setPreference(userId, !!dailyBrief)
    return NextResponse.json({ success: true, data: updated, source: 'memory' })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: (e as Error).message },
      { status: 500 }
    )
  }
}
