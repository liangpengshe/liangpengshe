import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const memoryStore: any[] = []

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, company, contact, specialty, experience, priceRange } = body

    if (!name || !Array.isArray(specialty) || specialty.length === 0 || !experience) {
      return NextResponse.json({ success: false, error: '请完整填写服务商信息' }, { status: 400 })
    }

    let savedId: string | null = null
    let source = 'memory'

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

    if (hasSupabase) {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('ServiceProvider')
          .insert({
            name,
            company: company || null,
            contact: contact || null,
            specialty,
            experience,
            priceRange: priceRange || null,
            isVerified: false,
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

    if (!savedId) {
      try {
        const record = await prisma.serviceProvider.create({
          data: {
            name,
            company: company || null,
            contact: contact || null,
            specialty,
            experience,
            priceRange: priceRange || null,
            isVerified: false,
            status: 'PENDING',
          },
        })
        savedId = record.id
        source = 'prisma'
      } catch (e) {
        console.warn('[service-join] Prisma 失败:', e)
      }
    }

    if (!savedId) {
      savedId = `mem-svc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      memoryStore.unshift({
        id: savedId,
        name,
        company: company || null,
        contact: contact || null,
        specialty,
        experience,
        priceRange: priceRange || null,
        isVerified: false,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      })
      source = 'memory'
    }

    return NextResponse.json({ success: true, id: savedId, source })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '提交失败' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const list: any[] = []

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

  if (hasSupabase) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('ServiceProvider')
        .select('*')
        .order('createdAt', { ascending: false })
      if (!error && data) data.forEach((d) => list.push(d))
    } catch {}
  }

  try {
    const prismaList = await prisma.serviceProvider.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    prismaList.forEach((p) => {
      if (!list.find((l) => l.id === p.id)) {
        list.push({
          id: p.id,
          name: p.name,
          company: p.company,
          contact: p.contact,
          specialty: p.specialty,
          experience: p.experience,
          priceRange: p.priceRange,
          isVerified: p.isVerified,
          status: p.status,
          createdAt: p.createdAt.toISOString(),
        })
      }
    })
  } catch {}

  memoryStore.forEach((m) => {
    if (!list.find((l) => l.id === m.id)) list.push(m)
  })

  return NextResponse.json({ success: true, data: list, total: list.length })
}
