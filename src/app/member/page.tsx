'use client'

import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'
import ClientLayout from '@/components/ClientLayout'
import { User, Mail, MapPin, Calendar, Wrench, ChevronRight, LogOut } from 'lucide-react'

interface UserSession {
  user: {
    name?: string
    email?: string
  }
}

export default function MemberPage() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const result = await auth()
      if (!result?.user) {
        redirect('/auth/login')
      } else {
        setSession(result)
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const registeredSalons = [
    { id: 1, title: 'AI商业变现实战沙龙（深圳站）', date: '2026-07-15', status: 'pending' },
    { id: 2, title: '企业AI落地闭门会', date: '2026-07-28', status: 'pending' },
  ]

  const toolExperiences = [
    { id: 1, name: 'AI文案助手', status: 'active', lastUsed: '2026-06-22' },
    { id: 2, name: '智能数据分析平台', status: 'active', lastUsed: '2026-06-20' },
    { id: 3, name: 'AI图像生成工具', status: 'trial', lastUsed: '2026-06-18' },
  ]

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-blue-600 animate-pulse">加载中...</div>
        </div>
      </ClientLayout>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <ClientLayout>
      <div className="min-h-screen bg-slate-50">
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 px-5 py-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">{session.user.name || '用户'}</h1>
              <div className="flex items-center gap-2 text-blue-100 text-sm mt-1">
                <Mail size={14} />
                <span>{session.user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100 text-sm mt-1">
                <MapPin size={14} />
                <span>深圳</span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-6 -mt-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-around text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">2</div>
                <div className="text-xs text-gray-500 mt-1">报名沙龙</div>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div>
                <div className="text-2xl font-bold text-gray-900">3</div>
                <div className="text-xs text-gray-500 mt-1">工具体验</div>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-xs text-gray-500 mt-1">获得证书</div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            我的报名沙龙
          </h2>
          <div className="space-y-3">
            {registeredSalons.map((salon) => (
              <div
                key={salon.id}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{salon.title}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                      <Calendar size={12} />
                      <span>{salon.date}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                    待参加
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench size={18} className="text-blue-600" />
            我的工具体验
          </h2>
          <div className="space-y-3">
            {toolExperiences.map((tool) => (
              <div
                key={tool.id}
                className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{tool.name}</h3>
                  <div className="text-gray-500 text-xs mt-1">
                    上次使用：{tool.lastUsed}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tool.status === 'active' 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-yellow-50 text-yellow-600'
                  }`}>
                    {tool.status === 'active' ? '使用中' : '试用中'}
                  </span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={async () => {
                'use server'
                await signOut({ redirectTo: '/auth/login' })
              }}
              className="w-full flex items-center justify-between p-4 text-red-600 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} />
                <span className="font-medium">退出登录</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>
        </section>

        <div className="h-20"></div>
      </div>
    </ClientLayout>
  )
}