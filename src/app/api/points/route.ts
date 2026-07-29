import { NextRequest, NextResponse } from 'next/server'
import {
  changePoints,
  getPointsBalance,
  getPointsLogs,
  calcApplyPoints,
  parseSubscription,
  ok,
  fail,
} from '@/lib/subscription-middleware'
import { prisma } from '@/lib/prisma'

/**
 * 智富积分系统 · 统一路由
 * ------------------------------------------------------------
 * GET  /api/points?userId=xxx&type=balance|logs
 *   - type=balance (默认): 返回余额 + 今日是否已签到
 *   - type=logs: 返回最近 50 条流水
 *
 * POST /api/points/sign-in
 *   - body: { userId, deviceId? }
 *   - 每日签到：普通 +5 / 月度会员 +10
 *   - 防刷：同 userId 当天只发一次
 *
 * POST /api/points/task-reward
 *   - body: { userId, taskType, amount, remark? }
 *   - SOP 打卡 / 新手任务奖励
 *
 * POST /api/points/apply-discount
 *   - body: { userId, orderAmount, usePoints }
 *   - 返回抵扣金额 + 实际应付
 *
 * 所有错误遵循 { success: false, error: string } 结构
 * 所有代码块 try...catch 包裹防止 Node 进程崩溃
 * ------------------------------------------------------------
 */

// ═══════ 辅助：识别用户（userId / deviceId → 内部 ID） ═══════
function resolveUserId(body: any, req: NextRequest): string {
  return (
    body?.userId ||
    body?.deviceId ||
    req.headers.get('x-user-id') ||
    req.headers.get('x-device-id') ||
    req.headers.get('x-opc-device-id') ||
    ''
  )
}

// 今日是否已签到
function hasSignedToday(userId: string): boolean {
  const store: any = (global as any).__pointsStore
  if (!store) return false
  const today = new Date().toISOString().slice(0, 10)
  return store.logs.some(
    (l: any) =>
      l.userId === userId &&
      l.type === 'SIGN_IN' &&
      l.createdAt.startsWith(today)
  )
}

// 是否为月度会员（用于签到翻倍）
async function isMonthlyMember(userId: string): Promise<boolean> {
  // 1. 先查 Prisma（带 try/catch 兜底）
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { email: `device_${userId}@opc.local` }],
      },
      select: {
        subscription_type: true,
        subscription_status: true,
      },
    })
    if (
      user?.subscription_type === 'MONTHLY_69' &&
      user?.subscription_status === 'ACTIVE'
    ) {
      return true
    }
  } catch {
    // 静默降级
  }
  // 2. 兜底：查 localStorage 注入了的全局标记（前端注入）
  return false
}

// ════════════════════════════════════════════════════════════════
// GET · 余额 / 流水
// ════════════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const userId =
      url.searchParams.get('userId') ||
      url.searchParams.get('deviceId') ||
      ''
    const type = url.searchParams.get('type') || 'balance'

    if (!userId) {
      return fail('userId / deviceId 必填', 400)
    }

    if (type === 'logs') {
      const logs = await getPointsLogs(userId, 50)
      return ok({ userId, logs, count: logs.length })
    }

    // type=balance (默认)
    const balance = await getPointsBalance(userId)
    const monthly = await isMonthlyMember(userId)
    const signedToday = hasSignedToday(userId)
    return ok({
      userId,
      points: balance.points,
      totalEarned: balance.totalEarned,
      signedToday,
      isMonthlyMember: monthly,
      todayReward: monthly ? 10 : 5,
    })
  } catch (err) {
    console.error('[points GET] 错误:', err)
    return fail(String(err), 500)
  }
}

// ════════════════════════════════════════════════════════════════
// POST · 统一入口（按 action 路由）
// ════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      return fail('请求体 JSON 解析失败', 400)
    }

    const action = body.action as
      | 'sign-in'
      | 'task-reward'
      | 'apply-discount'
      | 'redeem-sop'
      | undefined

    if (!action) {
      return fail(
        'action 必填，可选值：sign-in | task-reward | apply-discount | redeem-sop',
        400
      )
    }

    const userId = resolveUserId(body, req)
    if (!userId) {
      return fail('userId / deviceId 必填', 400)
    }

    // ─── 1. 每日签到 ───
    if (action === 'sign-in') {
      if (hasSignedToday(userId)) {
        const bal = await getPointsBalance(userId)
        return fail('今天已签到，请明天再来 ⏰', 409)
      }

      const monthly = await isMonthlyMember(userId)
      const amount = monthly ? 10 : 5
      const today = new Date().toISOString().slice(0, 10)
      const result = await changePoints(
        userId,
        'SIGN_IN',
        amount,
        monthly ? '每日签到（月度会员奖励翻倍）' : '每日签到',
        today
      )
      return ok({
        ...result,
        isMonthlyMember: monthly,
        nextSignInDate: getNextDay(),
      })
    }

    // ─── 2. 任务奖励 ───
    if (action === 'task-reward') {
      const taskType = body.taskType as string | undefined
      const amount = Number(body.amount)
      if (!taskType) return fail('taskType 必填', 400)
      if (!amount || isNaN(amount)) return fail('amount 必填且为正数', 400)
      if (amount < 0) return fail('amount 必须为正数（增加）', 400)
      if (amount > 500) return fail('单次任务奖励上限 500 积分（防作弊）', 400)

      const result = await changePoints(
        userId,
        'TASK_COMPLETE',
        amount,
        body.remark || `任务奖励：${taskType}`,
        body.relatedId
      )
      return ok({ ...result, taskType })
    }

    // ─── 3. 积分抵扣 ───
    if (action === 'apply-discount') {
      const orderAmount = Number(body.orderAmount)
      const usePoints = Number(body.usePoints)
      if (!orderAmount || isNaN(orderAmount) || orderAmount <= 0) {
        return fail('orderAmount 必填且 > 0', 400)
      }
      if (usePoints < 0 || isNaN(usePoints)) {
        return fail('usePoints 不能为负数', 400)
      }

      const balance = await getPointsBalance(userId)
      if (usePoints > balance.points) {
        return fail(
          `积分不足！当前 ${balance.points} 积分，无法使用 ${usePoints} 积分`,
          400
        )
      }

      const calc = calcApplyPoints(orderAmount, usePoints)
      if (calc.actualPointsUsed === 0) {
        return fail(
          '积分不足 100，无法抵扣（100 积分 = 1 元）',
          400
        )
      }

      // 实际扣减积分
      const result = await changePoints(
        userId,
        'EXCHANGE_DISCOUNT',
        -calc.actualPointsUsed,
        `订单抵扣：¥${calc.discount}（${calc.actualPointsUsed} 积分）`,
        body.orderId
      )

      return ok({
        discount: calc.discount,
        finalAmount: calc.finalAmount,
        actualPointsUsed: calc.actualPointsUsed,
        capped: calc.capped,
        remainingPoints: result.balance,
      })
    }

    // ─── 4. 积分兑换 SOP 资料 ───
    if (action === 'redeem-sop') {
      return handleRedeemSop(body, userId)
    }

    return fail(`未知 action：${action}`, 400)
  } catch (err) {
    console.error('[points POST] 错误:', err)
    return fail(String(err), 500)
  }
}

/* ═══════ 任务 1：积分兑换 SOP 资料（独立路由更清晰） ═══════ */
export async function PUT(req: NextRequest) {
  // 路由到 redeem-sop（兼容某些 fetch 实现不允许 action 字段）
  return POST(req)
}

// 实际 redeem-sop 处理逻辑（被 POST 和 PUT 共用）
async function handleRedeemSop(body: any, userId: string) {
  const sopId = body.sopId as string | undefined
  const costPoints = Number(body.costPoints)
  if (!sopId) return fail('sopId 必填', 400)
  if (!costPoints || isNaN(costPoints) || costPoints <= 0) {
    return fail('costPoints 必填且 > 0', 400)
  }

  // 校验余额
  const balance = await getPointsBalance(userId)
  if (balance.points < costPoints) {
    return fail(
      `积分不足！当前 ${balance.points} 积分，无法兑换 ${costPoints} 积分的 SOP`,
      400
    )
  }

  // 扣减积分 + 写流水
  const result = await changePoints(
    userId,
    'EXCHANGE_SOP',
    -costPoints,
    `兑换 SOP：${body.sopTitle || sopId}`,
    sopId
  )

  // 未来：把兑换记录写到 sop_redemption 表，关联资源中心
  // 内存兜底
  const memStore: any[] = ((globalThis as any).__sopRedemptionStore ||= [])
  memStore.unshift({
    id: `sop-redemption-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    sopId,
    sopTitle: body.sopTitle,
    costPoints,
    createdAt: new Date().toISOString(),
  })

  return ok({
    sopId,
    sopTitle: body.sopTitle,
    costPoints,
    remainingPoints: result.balance,
    message: 'SOP 兑换成功！请到资源中心查看',
  })
}

// 计算明天日期
function getNextDay(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}
