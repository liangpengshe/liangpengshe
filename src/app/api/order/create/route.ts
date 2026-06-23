import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const memoryStore: any[] = []

// 三方分润比例：卖家/平台/推荐人
// 卖家 = 85%，平台 = 10%（含运营成本），推荐主理人 = 5%
// 也可由请求参数覆盖
const DEFAULT_SELLER_RATE = 0.85
const DEFAULT_PLATFORM_RATE = 0.10
const DEFAULT_REFERRER_RATE = 0.05

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      orderId,
      sellerId,
      sellerName,
      buyerId,
      buyerName,
      referrerId, // 来自 ?ref=cityId 推荐链接
      amount,
      source, // project/tool/service
      description,
    } = body

    if (!orderId || !sellerId || !amount || amount <= 0) {
      return NextResponse.json({ success: false, error: '订单参数不完整' }, { status: 400 })
    }

    const sellerIncome = +(amount * DEFAULT_SELLER_RATE).toFixed(2)
    const platformFee = +(amount * DEFAULT_PLATFORM_RATE).toFixed(2)
    const commission = referrerId ? +(amount * DEFAULT_REFERRER_RATE).toFixed(2) : 0

    // 1. 写入 RevenueRecord（平台分润账本）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

    if (hasSupabase) {
      try {
        const supabase = await createClient()
        await supabase.from('RevenueRecord').insert({
          source: source || 'project',
          orderId,
          sellerId,
          sellerName: sellerName || null,
          buyerId: buyerId || null,
          buyerName: buyerName || null,
          grossAmount: amount,
          platformFee,
          sellerIncome,
          description: description || null,
          status: 'PENDING',
        })
      } catch (e) {
        console.warn('[order/create] Supabase RevenueRecord 失败:', e)
      }
    }

    try {
      await prisma.revenueRecord.create({
        data: {
          source: source || 'project',
          orderId,
          sellerId,
          sellerName: sellerName || null,
          buyerId: buyerId || null,
          buyerName: buyerName || null,
          grossAmount: amount,
          platformFee,
          sellerIncome,
          description: description || null,
          status: 'PENDING',
        },
      })
    } catch (e) {
      console.warn('[order/create] Prisma RevenueRecord 失败:', e)
    }

    memoryStore.unshift({
      id: `mem-order-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      source: source || 'project',
      orderId,
      sellerId,
      sellerName: sellerName || null,
      buyerId: buyerId || null,
      buyerName: buyerName || null,
      referrerId: referrerId || null,
      grossAmount: amount,
      platformFee,
      sellerIncome,
      description: description || null,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    })

    // 同步写入全局 order store（让 dashboard 反推）
    if (typeof (global as any).__orderStore !== 'undefined' || true) {
      const store: any[] = ((global as any).__orderStore ||= [])
      store.unshift({
        id: `mem-order-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        orderId,
        sellerId,
        referrerId: referrerId || null,
        grossAmount: amount,
        platformFee,
        sellerIncome,
        commission,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      })
    }

    // 2. 如果有推荐人，单独写 CommissionRecord（主理人收益账本）
    let commissionRecordId: string | null = null
    if (referrerId && commission > 0) {
      const rate = DEFAULT_REFERRER_RATE
      const record = {
        orderId,
        sellerId,
        referrerId,
        amount,
        commissionRate: rate,
        commission,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }

      if (hasSupabase) {
        try {
          const supabase = await createClient()
          const { data } = await supabase
            .from('CommissionRecord')
            .insert(record)
            .select('id')
            .single()
          if (data) commissionRecordId = data.id
        } catch (e) {
          console.warn('[order/create] Supabase CommissionRecord 失败:', e)
        }
      }

      try {
        const created = await prisma.commissionRecord.create({ data: record })
        commissionRecordId = created.id
      } catch (e) {
        console.warn('[order/create] Prisma CommissionRecord 失败:', e)
      }

      if (!commissionRecordId) {
        commissionRecordId = `mem-comm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      }

      // 内存兜底：写入一个与 dashboard 共享的全局 store
      if (typeof (global as any).__commissionStore !== 'undefined') {
        (global as any).__commissionStore.unshift({
          id: commissionRecordId,
          orderId,
          sellerId,
          referrerId,
          amount,
          commissionRate: rate,
          commission,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      breakdown: {
        amount,
        sellerIncome,
        platformFee,
        commission,
        referrerId: referrerId || null,
      },
      commissionRecordId,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '订单创建失败' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'POST 创建订单并触发分润' })
}
