'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Calendar, MapPin, Users, Edit, Trash2, ChevronRight, X } from 'lucide-react'

interface Salon {
  id: string
  title: string
  description: string
  date: string
  location: string
  maxCapacity: number
  status: string
  cityId: string
}

export default function SalonManagement() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxCapacity: 50,
  })

  useEffect(() => {
    fetchSalons()
  }, [])

  const fetchSalons = async () => {
    try {
      const res = await fetch('/api/console/salons')
      const data = await res.json()
      if (data.success) {
        setSalons(data.data)
      }
    } catch (error) {
      console.error('获取沙龙列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingSalon ? `/api/console/salons/${editingSalon.id}` : '/api/console/salons'
      const method = editingSalon ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        setEditingSalon(null)
        setFormData({ title: '', description: '', date: '', location: '', maxCapacity: 50 })
        fetchSalons()
      }
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  const handleEdit = (salon: Salon) => {
    setEditingSalon(salon)
    setFormData({
      title: salon.title,
      description: salon.description,
      date: salon.date.split('T')[0],
      location: salon.location,
      maxCapacity: salon.maxCapacity,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个沙龙吗？')) return
    try {
      const res = await fetch(`/api/console/salons/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchSalons()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

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
            <Link href="/console" className="text-gray-500 hover:text-gray-700">← 返回</Link>
            <h1 className="text-lg font-bold text-gray-900 mt-1">沙龙管理</h1>
          </div>
          <button
            onClick={() => {
              setEditingSalon(null)
              setFormData({ title: '', description: '', date: '', location: '', maxCapacity: 50 })
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm">添加沙龙</span>
          </button>
        </div>
      </header>

      <main className="px-5 py-6">
        <div className="space-y-4">
          {salons.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无沙龙排期</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                添加第一个沙龙
              </button>
            </div>
          ) : (
            salons.map((salon) => (
              <div key={salon.id} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{salon.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                      salon.status === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                    }`}>
                      {salon.status === 'upcoming' ? '即将举办' : '已结束'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(salon)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(salon.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{new Date(salon.date).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{salon.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>名额：{salon.maxCapacity}人</span>
                  </div>
                </div>
                {salon.description && (
                  <p className="text-gray-600 text-sm mt-3 line-clamp-2">{salon.description}</p>
                )}
                <button className="mt-4 flex items-center gap-1 text-blue-600 text-sm">
                  <span>查看报名名单</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {editingSalon ? '编辑沙龙' : '添加新沙龙'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingSalon(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">沙龙标题 *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入沙龙标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">举办日期 *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地点 *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入地点"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最大人数</label>
                <input
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 50 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="请输入沙龙描述"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                {editingSalon ? '保存修改' : '添加沙龙'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}