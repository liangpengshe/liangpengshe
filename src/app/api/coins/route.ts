import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * 良朋币系统
 * - 三级降级：Supabase → Prisma → 内存 store
 * - 行为 → 积分规则
 */

// 行为积分规则
const COIN_RULES: Record<string, { amount: number; note: string; label: string; icon: string }> = {
  signin: { amount: 10, note: '每日签到', label: '每日签到', icon: '📅' },
  salon: { amount: 50, note: '沙龙报名', label: '参加沙龙', icon: '👥' },
  tool: { amount: 100, note: '工具提交', label: '提交工具', icon: '🛠️' },
  diagnosis: { amount: 20, note: 'AI 商业诊断', label: '生成 AI 诊断', icon: '📊' },
  plan: { amount: 30, note: '人生商业规划', label: '生成商业规划', icon: '🗺️' },
  project: { amount: 80, note: '项目入驻', label: '提交项目', icon: '📁' },
  service: { amount: 60, note: '服务商入驻', label: '提交服务商', icon: '💼' },
  referral: { amount: 200, note: '邀请好友', label: '邀请好友注册', icon: '🎁' },
  review: { amount: 15, note: '评价工具/项目', label: '评价/反馈', icon: '⭐' },
  share: { amount: 5, note: '分享内容', label: '分享内容', icon: '🔗' },
  purchase: { amount: 0, note: '工具购买返利', label: '工具购买返利', icon: '🛒' }, // 动态金额
  redeem: { amount: 0, note: '兑换商品/服务', label: '兑换权益', icon: '🎟️' }, // 动态金额（扣减）
}

// 内存 store（兜底）
const memoryStore: any = (global as any).__coinStore ||= {
  balances: new Map<string, { coins: number; totalEarned: number; updatedAt: string }>(),
  ledger: [] as Array<{
    id: string
    phone: string
    action: string
    amount: number
    balance: number
    note: string
    createdAt: string
  }>,
}

function ensureMemory(phone: string) {
  if (!memoryStore.balances.has(phone)) {
    memoryStore.balances.set(phone, { coins: 0, totalEarned: 0, updatedAt: new Date().toISOString() })
  }
  return memoryStore.balances.get(phone)!
}

// 主操作：增/减积分（统一以内存 store 为最终一致源）
async function applyCoinChange(
  phone: string,
  action: string,
  amount?: number,
  note?: string
) {
  if (!phone) throw new Error('phone 必填')

  const rule = COIN_RULES[action]
  const finalAmount = amount ?? rule?.amount ?? 0
  const finalNote = note || rule?.note || action

  let source: 'supabase' | 'prisma' | 'memory' = 'memory'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabase = supabaseUrl && !supabaseUrl.includes('your_supabase')

  // 先确保内存账户存在
  const acc = ensureMemory(phone)

  // 1. 尝试 Supabase 同步
  if (hasSupabase) {
    try {
      const supabase = await createClient()
      const { data: existing } = await supabase
        .from('AssetBalance')
        .select('*')
        .eq('phone', phone)
        .maybeSingle()

      const newCoins = Math.max(0, (existing?.coins || 0) + finalAmount)
      const newTotal = (existing?.totalEarned || 0) + (finalAmount > 0 ? finalAmount : 0)
      const now = new Date().toISOString()

      if (existing) {
        await supabase
          .from('AssetBalance')
          .update({ coins: newCoins, totalEarned: newTotal, updatedAt: now })
          .eq('phone', phone)
      } else {
        await supabase
          .from('AssetBalance')
          .insert({ phone, coins: newCoins, totalEarned: newTotal, updatedAt: now })
      }

      await supabase.from('CoinLedger').insert({
        phone, action, amount: finalAmount, balance: newCoins, note: finalNote,
      })
      source = 'supabase'
    } catch (e) {
      console.warn('[coins] Supabase 同步失败:', (e as Error).message)
    }
  }

  // 2. Prisma 同步（失败不影响主流程）
  if (source === 'memory') {
    try {
      const existing = await prisma.assetBalance.findUnique({ where: { phone } }).catch(() => null)
      const newCoins = Math.max(0, (existing?.coins || 0) + finalAmount)
      const newTotal = (existing?.totalEarned || 0) + (finalAmount > 0 ? finalAmount : 0)

      if (existing) {
        await prisma.assetBalance.update({
          where: { phone },
          data: { coins: newCoins, totalEarned: newTotal, updatedAt: new Date() },
        }).catch(() => null)
      } else {
        await prisma.assetBalance.create({
          data: { phone, coins: newCoins, totalEarned: newTotal },
        }).catch(() => null)
      }
      await prisma.coinLedger.create({
        data: { phone, action, amount: finalAmount, balance: newCoins, note: finalNote },
      }).catch(() => null)
      source = 'prisma'
    } catch (e) {
      console.warn('[coins] Prisma 同步失败:', (e as Error).message)
    }
  }

  // 3. 内存兜底（最终一致源）
  acc.coins = Math.max(0, acc.coins + finalAmount)
  acc.totalEarned = acc.totalEarned + (finalAmount > 0 ? finalAmount : 0)
  acc.updatedAt = new Date().toISOString()
  const ledgerId = `mem-ledger-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  memoryStore.ledger.unshift({
    id: ledgerId,
    phone,
    action,
    amount: finalAmount,
    balance: acc.coins,
    note: finalNote,
    createdAt: new Date().toISOString(),
  })
  if (memoryStore.ledger.length > 500) memoryStore.ledger.length = 500

  return {
    phone,
    action,
    amount: finalAmount,
    balance: acc.coins,
    totalEarned: acc.totalEarned,
    source,
    ledgerId,
  }
}

// 读余额（统一以内存 store 为源）
async function getBalance(phone: string) {
  const acc = ensureMemory(phone)
  return { phone, coins: acc.coins, totalEarned: acc.totalEarned, source: 'memory' as const }
}

// POST: 增/减积分
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, action, amount, note } = body

    if (!phone) {
      return NextResponse.json({ success: false, error: 'phone 必填' }, { status: 400 })
    }
    if (!action) {
      return NextResponse.json({ success: false, error: 'action 必填' }, { status: 400 })
    }

    // 签到防刷：同一 phone 当天只发一次
    if (action === 'signin') {
      const today = new Date().toISOString().slice(0, 10)
      const hasTodaySignin = memoryStore.ledger.some(
        (l: any) => l.phone === phone && l.action === 'signin' && l.createdAt.startsWith(today)
      )
      if (hasTodaySignin) {
        const bal = await getBalance(phone)
        return NextResponse.json({
          success: false,
          error: '今天已签到，请明天再来',
          balance: bal.coins,
        })
      }
    }

    const result = await applyCoinChange(phone, action, amount, note)
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('[coins POST] 错误:', error)
    return NextResponse.json(
      { success: false, error: error.message || '操作失败' },
      { status: 500 }
    )
  }
}

// GET: 查询余额 / 流水 / 规则
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const phone = url.searchParams.get('phone') || ''
    const type = url.searchParams.get('type') || 'balance' // balance | ledger | rules

    if (type === 'rules') {
      return NextResponse.json({ success: true, data: COIN_RULES })
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'phone 必填' },
        { status: 400 }
      )
    }

    if (type === 'ledger') {
      // 统一从内存 store 读取流水
      const ledger = memoryStore.ledger.filter((l: any) => l.phone === phone).slice(0, 50)
      return NextResponse.json({ success: true, data: ledger })
    }

    // balance
    const result = await getBalance(phone)
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('[coins GET] 错误:', error)
    return NextResponse.json(
      { success: false, error: error.message || '查询失败' },
      { status: 500 }
    )
  }
}
