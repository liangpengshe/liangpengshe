import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withFallback } from '@/lib/api-handler'

// 模拟活动数据（当 Supabase 未配置时使用）
// 内测初期 · 去身份化文案（无"张总/李总"等假名）
const STATIC_DATE = '2026-07-15T10:00:00.000Z'
const MOCK_ACTIVITIES = [
  { id: '1', city: '内测', user: '首批内测用户', action: '已开启 AI 数字网店实操', createdAt: STATIC_DATE },
  { id: '2', city: '内测', user: 'AI 创业者', action: '加入了第 3 期实战营招募', createdAt: STATIC_DATE },
  { id: '3', city: '直播', user: '首期 AI 商业直播课', action: '即将开播（扫码预约）', createdAt: STATIC_DATE },
  { id: '4', city: '内测', user: 'AI 数字店主', action: '跑通了 AI 选品 → 上架 → 复购闭环', createdAt: STATIC_DATE },
  { id: '5', city: '内测', user: 'AI 自媒体创作者', action: '用 AI 写脚本 3 天涨粉 800+', createdAt: STATIC_DATE },
  { id: '6', city: '直播', user: '本周公开课', action: '主题：用 AI 把生意做成资产（免费）', createdAt: STATIC_DATE },
]

export const GET = withFallback({
  tag: 'activities',
  mock: MOCK_ACTIVITIES.slice(0, 6),
  fetcher: async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // 无配置直接抛错触发降级
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
      throw new Error('Supabase not configured')
    }

    const supabase = await createClient()
    const { data: applications, error: appError } = await supabase
      .from('partner_applications')
      .select('id, name, city, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    if (appError) {
      throw new Error(`partner_applications query failed: ${appError.message}`)
    }

    const activities = (applications || []).map((app: any) => ({
      id: app.id,
      city: app.city,
      user: app.name,
      action: '提交了合伙人申请',
      createdAt: app.created_at,
    }))

    // 不足 6 条时补 mock
    if (activities.length < 6) {
      activities.push(...MOCK_ACTIVITIES.slice(activities.length, 6))
    }

    return activities.slice(0, 6)
  },
})

// 保留原始导出供外部检查（向后兼容）
export const dynamic = 'force-dynamic'
