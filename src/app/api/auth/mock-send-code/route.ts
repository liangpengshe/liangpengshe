import { NextResponse } from 'next/server'

/**
 * ════════════════════════════════════════════════════════════════
 *  Mock 发送验证码
 * ════════════════════════════════════════════════════════════════
 *  演示模式：任何合法格式手机号都返回成功，验证码固定 6666
 *  生产模式：可替换为阿里云 / 腾讯云短信网关
 * ════════════════════════════════════════════════════════════════
 */

export const dynamic = 'force-dynamic'

/** 简单手机号校验（11 位数字，1 开头） */
function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { phone } = body || {}

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, error: '手机号不能为空' },
        { status: 400 }
      )
    }

    const trimmed = phone.trim()
    if (!isValidPhone(trimmed)) {
      return NextResponse.json(
        { success: false, error: '请输入正确的 11 位手机号' },
        { status: 400 }
      )
    }

    // 模拟发送延时（让 UI 倒计时更真实）
    await new Promise((r) => setTimeout(r, 400))

    // 演示码固定 6666（前端 UI 会提示用户）
    return NextResponse.json({
      success: true,
      mock: true,
      phone: trimmed,
      demoCode: '6666',
      cooldownSec: 60,
      message: '验证码已发送（演示模式：固定 6666）',
    })
  } catch (error: any) {
    console.error('[mock-send-code] error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || '发送失败，请稍后重试' },
      { status: 500 }
    )
  }
}
