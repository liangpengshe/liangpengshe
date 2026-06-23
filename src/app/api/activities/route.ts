import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 模拟活动数据（当 Supabase 未配置时使用）
const mockActivities = [
  { id: '1', city: '深圳', user: '张总', action: '提交了合伙人申请', createdAt: new Date().toISOString() },
  { id: '2', city: '广州', user: '李总', action: '加入了 AI 创业者社群', createdAt: new Date(Date.now() - 60000).toISOString() },
  { id: '3', city: '杭州', user: '王总', action: '报名了线下沙龙', createdAt: new Date(Date.now() - 120000).toISOString() },
  { id: '4', city: '成都', user: '陈总', action: '下载了 OPC 工具全家桶', createdAt: new Date(Date.now() - 180000).toISOString() },
  { id: '5', city: '深圳', user: '林总', action: '提交了合伙人申请', createdAt: new Date(Date.now() - 240000).toISOString() },
]

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // 无配置则返回模拟数据
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
      return NextResponse.json({
        success: true,
        data: mockActivities.slice(0, 6),
        source: 'mock',
      })
    }

    const supabase = await createClient()

    // 尝试从 partner_applications 表读取最新 3 条
    const { data: applications, error: appError } = await supabase
      .from('partner_applications')
      .select('id, name, city, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    const activities: typeof mockActivities = []

    if (!appError && applications && applications.length > 0) {
      applications.forEach((app: { id: string; name: string; city: string; created_at: string }) => {
        activities.push({
          id: app.id,
          city: app.city,
          user: app.name,
          action: '提交了合伙人申请',
          createdAt: app.created_at,
        })
      })
    }

    // 补充模拟数据，确保有足够内容
    if (activities.length < 6) {
      activities.push(...mockActivities.slice(activities.length, 6))
    }

    return NextResponse.json({
      success: true,
      data: activities.slice(0, 6),
      source: appError ? 'mock' : 'supabase',
    })
  } catch (error) {
    console.error('获取活动流失败:', error)
    return NextResponse.json({
      success: true,
      data: mockActivities,
      source: 'mock',
    })
  }
}
