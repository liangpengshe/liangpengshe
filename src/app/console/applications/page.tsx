'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, X, Clock, User, MapPin, Phone, Mail, ChevronRight } from 'lucide-react'

interface Application {
  id: string
  name: string
  city: string
  phone: string
  status: string
  createdAt: string
}

export default function ApplicationManagement() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/console/applications')
      const data = await res.json()
      if (data.success) {
        setApplications(data.data)
      }
    } catch (error) {
      console.error('获取申请列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/console/applications/${id}/approve`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        fetchApplications()
      }
    } catch (error) {
      console.error('审批失败:', error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/console/applications/${id}/reject`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        fetchApplications()
      }
    } catch (error) {
      console.error('拒绝失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-blue-600 animate-pulse">加载中...</div>
      </div>
    )
  }

  const pendingApplications = applications.filter(a => a.status === 'PENDING')
  const approvedApplications = applications.filter(a => a.status === 'APPROVED')
  const rejectedApplications = applications.filter(a => a.status === 'REJECTED')

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <Link href="/console" className="text-gray-500 hover:text-gray-700">← 返回</Link>
            <h1 className="text-lg font-bold text-gray-900 mt-1">合伙人申请审批</h1>
          </div>
        </div>
      </header>

      <main className="px-5 py-6">
        <div className="flex gap-4 mb-6">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium text-sm">
            待审核 ({pendingApplications.length})
          </button>
          <button className="flex-1 bg-white text-gray-700 py-2 rounded-lg font-medium text-sm border border-gray-200">
            已通过 ({approvedApplications.length})
          </button>
          <button className="flex-1 bg-white text-gray-700 py-2 rounded-lg font-medium text-sm border border-gray-200">
            已拒绝 ({rejectedApplications.length})
          </button>
        </div>

        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Clock size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无申请记录</p>
            </div>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-900">{app.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                      app.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                      app.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {app.status === 'PENDING' ? '待审核' :
                       app.status === 'APPROVED' ? '已通过' : '已拒绝'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>意向城市：{app.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>联系方式：{app.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>提交时间：{new Date(app.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                </div>
                {app.status === 'PENDING' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleApprove(app.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Check size={16} />
                      <span>通过</span>
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <X size={16} />
                      <span>拒绝</span>
                    </button>
                  </div>
                )}
                {app.status === 'APPROVED' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                    ✅ 已升级为城市主理人
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}