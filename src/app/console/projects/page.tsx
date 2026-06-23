'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, FileText, ChevronRight, X } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  content: string
  category: string
  cityId: string
  createdAt: string
}

const categories = ['工具库', '项目库', '服务库', '资源库']

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '项目库',
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/console/projects')
      const data = await res.json()
      if (data.success) {
        setProjects(data.data)
      }
    } catch (error) {
      console.error('获取项目列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingProject ? `/api/console/projects/${editingProject.id}` : '/api/console/projects'
      const method = editingProject ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        setEditingProject(null)
        setFormData({ title: '', description: '', content: '', category: '项目库' })
        fetchProjects()
      }
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      content: project.content,
      category: project.category,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) return
    try {
      const res = await fetch(`/api/console/projects/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchProjects()
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
            <h1 className="text-lg font-bold text-gray-900 mt-1">项目管理</h1>
          </div>
          <button
            onClick={() => {
              setEditingProject(null)
              setFormData({ title: '', description: '', content: '', category: '项目库' })
              setShowModal(true)
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm">发布项目</span>
          </button>
        </div>
      </header>

      <main className="px-5 py-6">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无项目内容</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                发布第一个项目
              </button>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                      {project.category}
                    </span>
                    <h3 className="font-semibold text-gray-900 mt-2">{project.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3">{project.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>{new Date(project.createdAt).toLocaleDateString('zh-CN')}</span>
                  <button className="flex items-center gap-1 text-blue-600">
                    <span>查看详情</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {editingProject ? '编辑项目' : '发布新项目'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingProject(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">简介 *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="请输入项目简介"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">详细内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="请输入详细内容（支持 Markdown）"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                {editingProject ? '保存修改' : '发布项目'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}