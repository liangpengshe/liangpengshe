'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Download,
  Zap,
  Search,
  PenLine,
  MessageCircle,
  FolderOpen,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'

export default function LeopardPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const features = [
    {
      icon: Search,
      title: '爆款调研与灵感捕捉',
      desc: '爆款查看 · 选题灵感一眼看。全平台爆款内容逻辑一目了然，精准捕捉热点，推荐选题灵感，让每次创作都直击用户心智。',
    },
    {
      icon: PenLine,
      title: '内容创作与一键仿改',
      desc: '从爆款调研到一键仿改。支持链接或原文本输入，AI 自动完成结构、风格、逻辑的全面仿写与改写，轻松写出爆款，无需重复造轮子。',
    },
    {
      icon: MessageCircle,
      title: '运营互动与私域成交',
      desc: '评论神回复 · 条条涨粉引流；私域话术 · 10 大成交场景覆盖。自动生成针对不同场景的评论互动文案、社群及私信沟通话术，打通流量到成交的最后一环。',
    },
    {
      icon: FolderOpen,
      title: '素材管理与品牌规范',
      desc: '存储创作素材、设定品牌规范，让 AI 创作更贴合品牌调性；支持生成记录复用修改与心得计划，规范内容产出节奏。',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/tools/market" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft size={20} />
            <span>返回工具库</span>
          </Link>
          <span className="font-bold text-gray-900">豹纹工坊</span>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="px-5 py-6">
        <section className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white mb-6">
          <h1 className="text-2xl font-bold mb-2">豹纹工坊</h1>
          <p className="text-amber-100 text-sm mb-4">AI 驱动的内容生产引擎，让创意无限可能</p>
          <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1.5 rounded-full w-fit">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>OPC 独家自研工具</span>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Zap className="text-white" size={40} />
              </div>
              <p className="text-amber-600 font-medium">豹纹工坊演示截图</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-yellow-50/60 border border-amber-200/60 rounded-xl p-4 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 flex-shrink-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <feature.icon className="text-amber-600" size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm mb-1.5 group-hover:text-amber-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">获取下载</h2>
          
          {submitted ? (
            <div className="bg-green-50 rounded-xl p-5 text-center">
              <CheckCircle className="text-green-600 mx-auto mb-3" size={48} />
              <h3 className="font-semibold text-gray-900 mb-1">提交成功</h3>
              <p className="text-sm text-gray-500">工作人员将在1个工作日内联系您</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="请输入您的姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="请输入您的手机号"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="请输入您的公司名称（选填）"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium py-3 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
              >
                <Download size={20} />
                <span>立即下载</span>
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}