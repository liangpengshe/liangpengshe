import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const memoryStore: any[] = ((global as any).__commissionStore ||= [])

// 列出主理人佣金 + 聚合统计
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const referrerId = url.searchParams.get('referrerId') || 'demo-city'
    const status = url.searchParams.get('status') // 可选过滤

    const list: any[] = []

    // Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

    if (hasSupabase) {
      try {
        const supabase = await createClient()
        let query = supabase
          .from('CommissionRecord')
          .select('*')
          .eq('referrerId', referrerId)
          .order('createdAt', { ascending: false })
        if (status) query = query.eq('status', status)
        const { data, error } = await query
        if (!error && data) data.forEach((d) => list.push(d))
      } catch (e) {
        console.warn('[revenue/dashboard] Supabase 失败:', e)
      }
    }

    // Prisma
    try {
      const where: any = { referrerId }
      if (status) where.status = status
      const prismaList = await prisma.commissionRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      prismaList.forEach((p) => {
        if (!list.find((l) => l.id === p.id)) {
          list.push({
            id: p.id,
            orderId: p.orderId,
            sellerId: p.sellerId,
            referrerId: p.referrerId,
            amount: p.amount,
            commissionRate: p.commissionRate,
            commission: p.commission,
            status: p.status,
            createdAt: p.createdAt.toISOString(),
          })
        }
      })
    } catch (e) {
      console.warn('[revenue/dashboard] Prisma 失败:', e)
    }

    // 内存兜底：直接从全局 CommissionRecord store 读取
    if (typeof (global as any).__commissionStore !== 'undefined') {
      const allComm: any[] = (global as any).__commissionStore
      allComm.forEach((m) => {
        if (m.referrerId !== referrerId) return
        if (status && m.status !== status) return
        if (!list.find((l) => l.id === m.id)) {
          list.push({
            id: m.id,
            orderId: m.orderId,
            sellerId: m.sellerId,
            referrerId: m.referrerId,
            amount: m.amount,
            commissionRate: m.commissionRate,
            commission: m.commission,
            status: m.status,
            createdAt: m.createdAt,
          })
        }
      })
    }

    // 备用兜底：从全局 order store 反推（如果 order/create 未写 commission store）
    if (list.length === 0 && typeof (global as any).__orderStore !== 'undefined') {
      const allOrders: any[] = (global as any).__orderStore
      allOrders.forEach((o) => {
        // 简化推断：若 order 含 referrerId，对应 5% 佣金
        if (o.referrerId !== referrerId) return
        if (o.commissionRecordId) return
        const commission = +(o.grossAmount * 0.05).toFixed(2)
        const id = `comm-from-order-${o.id}`
        if (list.find((l) => l.id === id)) return
        list.push({
          id,
          orderId: o.orderId,
          sellerId: o.sellerId,
          referrerId: o.referrerId,
          amount: o.grossAmount,
          commissionRate: 0.05,
          commission,
          status: o.status || 'PENDING',
          createdAt: o.createdAt,
        })
      })
    }

    // 统计
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

    const monthComm = list
      .filter((r) => new Date(r.createdAt).getTime() >= thisMonthStart)
      .reduce((s, r) => s + (r.commission || 0), 0)
    const totalComm = list.reduce((s, r) => s + (r.commission || 0), 0)
    const settledComm = list.filter((r) => r.status === 'SETTLED').reduce((s, r) => s + (r.commission || 0), 0)
    const pendingComm = list.filter((r) => r.status === 'PENDING').reduce((s, r) => s + (r.commission || 0), 0)
    const pendingCount = list.filter((r) => r.status === 'PENDING').length
    const settledCount = list.filter((r) => r.status === 'SETTLED').length
    const totalAmount = list.reduce((s, r) => s + (r.amount || 0), 0)
    const orderCount = list.length

    return NextResponse.json({
      success: true,
      referrerId,
      records: list,
      stats: {
        monthCommission: +monthComm.toFixed(2),
        totalCommission: +totalComm.toFixed(2),
        settledCommission: +settledComm.toFixed(2),
        pendingCommission: +pendingComm.toFixed(2),
        pendingCount,
        settledCount,
        orderCount,
        totalAmount: +totalAmount.toFixed(2),
        avgCommissionRate:
          list.length > 0
            ? +(list.reduce((s, r) => s + (r.commissionRate || 0), 0) / list.length).toFixed(3)
            : 0.05,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '查询失败', records: [], stats: null },
      { status: 500 }
    )
  }
}

// 标记结算（管理员/主理人手动提现）
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { ids, action, referrerId } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: '请选择要操作的记录' }, { status: 400 })
    }
    if (!['settle', 'pending'].includes(action)) {
      return NextResponse.json({ success: false, error: 'action 必须是 settle/pending' }, { status: 400 })
    }

    const newStatus = action === 'settle' ? 'SETTLED' : 'PENDING'
    let updated = 0

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

    if (hasSupabase) {
      try {
        const supabase = await createClient()
        for (const id of ids) {
          await supabase.from('CommissionRecord').update({ status: newStatus }).eq('id', id)
        }
      } catch {}
    }

    try {
      const result = await prisma.commissionRecord.updateMany({
        where: { id: { in: ids } },
        data: { status: newStatus },
      })
      updated = result.count
    } catch (e) {
      console.warn('[revenue/dashboard] Prisma update 失败:', e)
    }

    // 内存
    ids.forEach((id) => {
      const item = memoryStore.find((m) => m.id === id)
      if (item) item.status = newStatus
    })

    return NextResponse.json({
      success: true,
      updated: updated || ids.length,
      message: action === 'settle' ? `已结算 ${ids.length} 笔佣金` : '已重置为待结算',
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || '操作失败' }, { status: 500 })
  }
}
