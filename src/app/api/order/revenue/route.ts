import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const memoryStore: any[] = []

// 平台佣金比例（按 source 不同）
const PLATFORM_FEE_RATE: Record<string, number> = {
  project: 0.2, // 项目库 20%
  tool: 0.15, // 工具库 15%
  service: 0.25, // 服务库 25%
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { source, sellerId, sellerName, buyerId, buyerName, grossAmount, description, orderId } = body

    if (!source || !grossAmount || grossAmount <= 0) {
      return NextResponse.json({ success: false, error: '参数不完整' }, { status: 400 })
    }

    if (!['project', 'tool', 'service'].includes(source)) {
      return NextResponse.json({ success: false, error: 'source 必须是 project/tool/service' }, { status: 400 })
    }

    const rate = PLATFORM_FEE_RATE[source] || 0.2
    const platformFee = +(grossAmount * rate).toFixed(2)
    const sellerIncome = +(grossAmount - platformFee).toFixed(2)

    let savedId: string | null = null
    let storageSource = 'memory'

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

    if (hasSupabase) {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('RevenueRecord')
          .insert({
            source,
            sellerId: sellerId || null,
            sellerName: sellerName || null,
            buyerId: buyerId || null,
            buyerName: buyerName || null,
            grossAmount,
            platformFee,
            sellerIncome,
            orderId: orderId || null,
            description: description || null,
            status: 'PENDING',
          })
          .select('id')
          .single()
        if (!error && data) {
          savedId = data.id
          storageSource = 'supabase'
        }
      } catch {}
    }

    if (!savedId) {
      try {
        const record = await prisma.revenueRecord.create({
          data: {
            source,
            sellerId: sellerId || null,
            sellerName: sellerName || null,
            buyerId: buyerId || null,
            buyerName: buyerName || null,
            grossAmount,
            platformFee,
            sellerIncome,
            orderId: orderId || null,
            description: description || null,
            status: 'PENDING',
          },
        })
        savedId = record.id
        storageSource = 'prisma'
      } catch (e) {
        console.warn('[revenue] Prisma 失败:', e)
      }
    }

    if (!savedId) {
      savedId = `mem-rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      memoryStore.unshift({
        id: savedId,
        source,
        sellerId: sellerId || null,
        sellerName: sellerName || null,
        buyerId: buyerId || null,
        buyerName: buyerName || null,
        grossAmount,
        platformFee,
        sellerIncome,
        orderId: orderId || null,
        description: description || null,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      })
      storageSource = 'memory'
    }

    return NextResponse.json({
      success: true,
      id: savedId,
      source: storageSource,
      data: { grossAmount, platformFee, sellerIncome, rate },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '记录失败' },
      { status: 500 }
    )
  }
}

// 查询分润记录 + 统计
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    const list: any[] = []

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

    if (hasSupabase) {
      try {
        const supabase = await createClient()
        let query = supabase
          .from('RevenueRecord')
          .select('*')
          .order('createdAt', { ascending: false })
        if (status) query = query.eq('status', status)
        const { data, error } = await query
        if (!error && data) data.forEach((d) => list.push(d))
      } catch {}
    }

    try {
      const where: any = status ? { status } : undefined
      const prismaList = await prisma.revenueRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      prismaList.forEach((p) => {
        if (!list.find((l) => l.id === p.id)) {
          list.push({
            id: p.id,
            source: p.source,
            sellerId: p.sellerId,
            sellerName: p.sellerName,
            buyerId: p.buyerId,
            buyerName: p.buyerName,
            grossAmount: p.grossAmount,
            platformFee: p.platformFee,
            sellerIncome: p.sellerIncome,
            orderId: p.orderId,
            description: p.description,
            status: p.status,
            createdAt: p.createdAt.toISOString(),
          })
        }
      })
    } catch {}

    memoryStore.forEach((m) => {
      if (status && m.status !== status) return
      if (!list.find((l) => l.id === m.id)) list.push(m)
    })

    // 统计
    const total = list.length
    const pending = list.filter((r) => r.status === 'PENDING')
    const settled = list.filter((r) => r.status === 'SETTLED')
    const totalGross = list.reduce((s, r) => s + (r.grossAmount || 0), 0)
    const totalPlatformFee = list.reduce((s, r) => s + (r.platformFee || 0), 0)
    const totalSellerIncome = list.reduce((s, r) => s + (r.sellerIncome || 0), 0)
    const pendingPlatformFee = pending.reduce((s, r) => s + (r.platformFee || 0), 0)
    const settledPlatformFee = settled.reduce((s, r) => s + (r.platformFee || 0), 0)

    return NextResponse.json({
      success: true,
      data: list,
      stats: {
        total,
        pendingCount: pending.length,
        settledCount: settled.length,
        totalGross: +totalGross.toFixed(2),
        totalPlatformFee: +totalPlatformFee.toFixed(2),
        totalSellerIncome: +totalSellerIncome.toFixed(2),
        pendingPlatformFee: +pendingPlatformFee.toFixed(2),
        settledPlatformFee: +settledPlatformFee.toFixed(2),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '查询失败', data: [], stats: null },
      { status: 500 }
    )
  }
}
