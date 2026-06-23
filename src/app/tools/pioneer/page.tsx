'use client'

import { useState } from 'react'
import { ArrowLeft, Download, Users, Video, Wand2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function PioneerPage() {
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
    { icon: Users, title: '数字人形象', desc: '自定义数字人外观，打造专属IP' },
    { icon: Video, title: '视频生成', desc: '一键生成数字人视频，无需拍摄' },
    { icon: Wand2, title: '智能驱动', desc: 'AI驱动的表情动作，自然逼真' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/tools/market" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft size={20} />
            <span>返回工具库</span>
          </Link>
          <span className="font-bold text-gray-900">先锋派数字人</span>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="px-5 py-6">
        <section className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white mb-6">
          <h1 className="text-2xl font-bold mb-2">先锋派数字人</h1>
          <p className="text-cyan-100 text-sm mb-4">AI 数字人视频生成平台，开启虚拟主播新时代</p>
          <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1.5 rounded-full w-fit">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>OPC 独家自研工具</span>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="aspect-video bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="text-white" size={40} />
              </div>
              <p className="text-cyan-600 font-medium">先锋派数字人演示截图</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">核心功能</h2>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="text-cyan-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{feature.desc}</p>
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
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="请输入您的手机号"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="请输入您的公司名称（选填）"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
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