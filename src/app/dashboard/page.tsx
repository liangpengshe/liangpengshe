'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setUserData(data)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">加载中...</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">请先登录</p>
      </div>
    )
  }

  const quickActions = [
    { icon: '📋', label: '控制台', href: '/console' },
    { icon: '🤖', label: 'AI助手', href: '/' },
    { icon: '📁', label: '工具库', href: '/market' },
    { icon: '👤', label: '个人中心', href: '/member' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              <span className="text-xl font-bold text-blue-600">良朋社OPC</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">欢迎回来，{userData.name || userData.email}</span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
          <p className="text-gray-500 mt-1">查看你的工作概览</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-600 text-white rounded-xl p-6">
            <p className="text-white/80 text-sm mb-2">用户角色</p>
            <p className="text-3xl font-bold">
              {userData.role === 'SUPER_ADMIN' ? '超级管理员' : 
               userData.role === 'CITY_MAINTAINER' ? '城市主理人' : '会员'}
            </p>
          </div>
          <div className="bg-green-500 text-white rounded-xl p-6">
            <p className="text-white/80 text-sm mb-2">所在城市</p>
            <p className="text-3xl font-bold">{userData.cityId ? '已分配' : '未分配'}</p>
          </div>
          <div className="bg-purple-500 text-white rounded-xl p-6">
            <p className="text-white/80 text-sm mb-2">注册时间</p>
            <p className="text-lg font-bold">{new Date(userData.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">快速导航</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl mb-2">{action.icon}</span>
                  <span className="text-sm text-gray-700">{action.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">账户信息</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">邮箱</span>
                <span className="text-gray-900">{userData.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">姓名</span>
                <span className="text-gray-900">{userData.name || '未设置'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">角色</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  userData.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-600' :
                  userData.role === 'CITY_MAINTAINER' ? 'bg-blue-50 text-blue-600' :
                  'bg-green-50 text-green-600'
                }`}>
                  {userData.role === 'SUPER_ADMIN' ? '超级管理员' : 
                   userData.role === 'CITY_MAINTAINER' ? '城市主理人' : '会员'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}