/**
 * OPC 专家申请 API
 * 接收 { name, city, specialty, experience, userId } 写入 ServiceProvider 表
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/** Supabase 不可用时的内存兜底存储（演示用） */
const memoryStore: Array<{
  id: string
  name: string
  city: string
  specialty: string[]
  experience: string
  userId?: string
  status: string
  createdAt: string
}> = []

const VALID_SPECIALTIES = [
  'OPC内训',
  'OPC陪跑',
  'AI网店代运营',
  'AI自媒体代运营',
  '企业GEO',
  '企业AI转型',
  '企业系统定制',
] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, city, specialty, experience, userId } = body || {}

    // ────── 字段校验 ──────
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '请填写姓名' },
        { status: 400 }
      )
    }
    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '请填写所属城市' },
        { status: 400 }
      )
    }
    if (!Array.isArray(specialty) || specialty.length === 0) {
      return NextResponse.json(
        { success: false, error: '请至少选择一个擅长领域' },
        { status: 400 }
      )
    }
    // 过滤非法值（防止前端传脏数据）
    const safeSpecialty = specialty.filter((s) =>
      VALID_SPECIALTIES.includes(s)
    )
    if (safeSpecialty.length === 0) {
      return NextResponse.json(
        { success: false, error: '擅长领域不合法' },
        { status: 400 }
      )
    }
    if (!experience || typeof experience !== 'string' || experience.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: '请填写个人简介与案例（不少于 10 字）' },
        { status: 400 }
      )
    }

    const specialtyJson = JSON.stringify(safeSpecialty)
    let savedId: string | null = null
    let source: 'supabase' | 'prisma' | 'memory' = 'memory'

    // ────── 写入 Supabase ──────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')

    if (hasSupabase) {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('ServiceProvider')
          .insert({
            name: name.trim(),
            city: city.trim(),
            userId: userId || null,
            specialty: safeSpecialty,
            experience: experience.trim(),
            isVerified: false,
            status: 'PENDING',
          })
          .select('id')
          .single()
        if (!error && data) {
          savedId = data.id
          source = 'supabase'
        } else if (error) {
          console.error('[expert-apply] Supabase insert error:', error.message)
        }
      } catch (e) {
        console.error('[expert-apply] Supabase unavailable, falling back:', e)
      }
    }

    // ────── 兜底：Prisma + 内存 ──────
    if (!savedId) {
      try {
        const record = await prisma.serviceProvider.create({
          data: {
            name: name.trim(),
            city: city.trim(),
            userId: userId || null,
            specialty: specialtyJson,
            experience: experience.trim(),
            isVerified: false,
            status: 'PENDING',
          },
        })
        savedId = record.id
        source = 'prisma'
      } catch (e) {
        // Prisma 不可用时写入内存（仅供演示）
        const memRecord = {
          id: `mem-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          name: name.trim(),
          city: city.trim(),
          specialty: safeSpecialty,
          experience: experience.trim(),
          userId: userId || undefined,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        }
        memoryStore.push(memRecord)
        savedId = memRecord.id
        source = 'memory'
      }
    }

    return NextResponse.json({
      success: true,
      id: savedId,
      source,
      message: '申请已提交，后台审核通过后将为您开通专家权限。',
    })
  } catch (e: any) {
    console.error('[expert-apply] Unexpected error:', e)
    return NextResponse.json(
      { success: false, error: e?.message || '服务器异常，请稍后重试' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    memoryCount: memoryStore.length,
    validSpecialties: VALID_SPECIALTIES,
  })
}
