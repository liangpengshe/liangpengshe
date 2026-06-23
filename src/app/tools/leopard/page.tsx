'use client'

import { useState } from 'react'
import { ArrowLeft, Download, Zap, Shield, BarChart3, CheckCircle } from 'lucide-react'
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
    { icon: Zap, title: '极速生成', desc: '毫秒级响应，一键生成高质量内容' },
    { icon: Shield, title: '数据安全', desc: '本地处理，企业级数据加密保护' },
    { icon: BarChart3, title: '智能分析', desc: '深度数据分析，精准洞察市场' },
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
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="text-amber-600" size={24} />
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