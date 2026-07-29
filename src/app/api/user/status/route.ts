// /api/user/status - 统一用户订阅状态查询接口
// 返回用户当前的会员等级、订阅类型、付费状态
// - 用于前端 /projects/[slug] 页面挂载时异步同步付费状态
// - 用于其他需要根据会员等级做拦截的页面（/member、/workspace、/pricing 等）

import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * 解析当前请求的用户订阅状态
 * 优先级：
 *   1. localStorage-style header（前端调用时通过 x-mock-subscription 传入，方便测试）
 *   2. 真实的 cookie / session（生产环境接入 Supabase Auth 后启用）
 *   3. 默认 null（免费用户）
 */
function resolveSubscription(req: NextRequest): {
  subscriptionType: string | null
  membershipLevel: string | null
  isPaid: boolean
  expiresAt: string | null
} {
  // [测试通道] 允许前端通过 header 覆盖订阅状态，方便 e2e 测试
  const mockSub = req.headers.get('x-mock-subscription')?.toUpperCase() || null
  const mockLevel = req.headers.get('x-mock-membership-level')?.toLowerCase() || null

  if (mockSub) {
    return {
      subscriptionType: mockSub,
      membershipLevel: mockLevel || 'paid',
      isPaid: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    }
  }

  // [生产通道] Supabase Auth cookie 接入（当前 mock 为 null）
  // TODO: 接入 supabase auth.getUser() 后从 user_metadata 读取 subscription_type
  return {
    subscriptionType: null,
    membershipLevel: null,
    isPaid: false,
    expiresAt: null,
  }
}

export async function GET(req: NextRequest) {
  try {
    const result = resolveSubscription(req)
    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || '未知错误' },
      { status: 500 }
    )
  }
}
