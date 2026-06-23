import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const memoryStore: any[] = []

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, category, officialUrl, pricingModel, affiliateLink, contactName, contactInfo } = body

    if (!name || !description || !category || !officialUrl || !pricingModel) {
      return NextResponse.json({ success: false, error: '请完整填写工具信息' }, { status: 400 })
    }

    // URL 简单校验
    try {
      new URL(officialUrl)
    } catch {
      return NextResponse.json({ success: false, error: '官网链接格式不正确' }, { status: 400 })
    }

    let savedId: string | null = null
    let source = 'memory'

    // Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

    if (hasSupabase) {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('ToolSubmission')
          .insert({
            name,
            description,
            category,
            officialUrl,
            pricingModel,
            affiliateLink: affiliateLink || null,
            contactName: contactName || null,
            contactInfo: contactInfo || null,
            status: 'PENDING',
          })
          .select('id')
          .single()
        if (!error && data) {
          savedId = data.id
          source = 'supabase'
        }
      } catch {}
    }

    // Prisma
    if (!savedId) {
      try {
        const record = await prisma.toolSubmission.create({
          data: {
            name,
            description,
            category,
            officialUrl,
            pricingModel,
            affiliateLink: affiliateLink || null,
            contactName: contactName || null,
            contactInfo: contactInfo || null,
            status: 'PENDING',
          },
        })
        savedId = record.id
        source = 'prisma'
      } catch (e) {
        console.warn('[tool-submit] Prisma 失败:', e)
      }
    }

    // 内存降级
    if (!savedId) {
      savedId = `mem-tool-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      memoryStore.unshift({
        id: savedId,
        name,
        description,
        category,
        officialUrl,
        pricingModel,
        affiliateLink: affiliateLink || null,
        contactName: contactName || null,
        contactInfo: contactInfo || null,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      })
      source = 'memory'
    }

    // 同步写入会员路线图 store
    try {
      const { recordMemberEvent } = await import('../../member/roadmap/route')
      recordMemberEvent(contactInfo || `anon-${savedId}`, 'tool', {
        id: savedId,
        name,
        category,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
      })
    } catch {}

    return NextResponse.json({ success: true, id: savedId, source })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '提交失败' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // 列出工具（管理后台用）
  const list: any[] = []

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

  if (hasSupabase) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('ToolSubmission')
        .select('*')
        .order('submittedAt', { ascending: false })
      if (!error && data) data.forEach((d) => list.push(d))
    } catch {}
  }

  try {
    const prismaList = await prisma.toolSubmission.findMany({
      orderBy: { submittedAt: 'desc' },
      take: 50,
    })
    prismaList.forEach((p) => {
      if (!list.find((l) => l.id === p.id)) {
        list.push({
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category,
          officialUrl: p.officialUrl,
          pricingModel: p.pricingModel,
          affiliateLink: p.affiliateLink,
          status: p.status,
          submittedAt: p.submittedAt.toISOString(),
        })
      }
    })
  } catch {}

  memoryStore.forEach((m) => {
    if (!list.find((l) => l.id === m.id)) list.push(m)
  })

  return NextResponse.json({ success: true, data: list, total: list.length })
}
