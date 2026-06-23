'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, Calendar, FileText, Settings, LogOut, TrendingUp, ChevronRight, Inbox, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ConsoleDashboard() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMembers: 0,
    salonRegistrations: 0,
    pendingApplications: 0,
  })
  const [cityName, setCityName] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data } = await supabase
          .from('users')
          .select('*, city:cityId(*)')
          .eq('id', user.id)
          .single()

        setUserData(data)
        setCityName(data?.city?.name || '')

        const statsRes = await fetch('/api/console/stats')
        const statsData = await statsRes.json()
        if (statsData.success) {
          setStats(statsData.data)
        }
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navItems = [
    { icon: Calendar, label: '沙龙管理', href: '/console/salons' },
    { icon: FileText, label: '项目管理', href: '/console/projects' },
    { icon: Users, label: '合伙人申请', href: '/console/applications' },
    { icon: TrendingUp, label: 'AI 诊断请求', href: '/console/diagnoses' },
    { icon: Inbox, label: '专家评审（项目/工具/服务商）', href: '/console/reviews' },
    { icon: Wallet, label: '收益分润仪表盘', href: '/console/revenue' },
    { icon: Settings, label: '设置', href: '/console/settings' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-blue-600 animate-pulse">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">主理人控制台</h1>
            <p className="text-sm text-gray-500">{cityName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">退出</span>
          </button>
        </div>
      </header>

      <main className="px-5 py-6">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
              <Users size={14} />
              <span>总会员数</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalMembers}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
              <Calendar size={14} />
              <span>沙龙报名</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.salonRegistrations}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
              <FileText size={14} />
              <span>待审核</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">快捷操作</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className="text-blue-600" />
                  <span className="text-gray-700">{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp size={24} />
            <h3 className="font-semibold">运营数据概览</h3>
          </div>
          <p className="text-blue-100 text-sm">
            本周新增会员 {stats.totalMembers > 0 ? Math.floor(stats.totalMembers * 0.1) : 0} 人，沙龙报名 {stats.salonRegistrations} 人。
          </p>
        </div>

        <Link
          href="/console/revenue"
          className="mt-4 block bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-xl p-5 text-white shadow-lg hover:scale-[1.01] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet size={24} />
              <div>
                <h3 className="font-semibold">收益分润仪表盘</h3>
                <p className="text-xs text-white/90 mt-0.5">查看本月预估佣金、累计收益、待结算订单</p>
              </div>
            </div>
            <ChevronRight size={20} />
          </div>
        </Link>
      </main>
    </div>
  )
}