'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Download,
  Drama,
  Repeat,
  Sparkles,
  Zap,
  Users,
  CheckCircle,
} from 'lucide-react'
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
    {
      icon: Drama,
      title: 'AI 数字演员库与分身定制',
      desc: '海量公共演员模型库，一键调用。无需真人出镜，1:1 超写实复刻专属数字人 IP，支持录屏、直播、口播等多种商业化场景，大幅解放生产力。',
    },
    {
      icon: Repeat,
      title: '爆款提取与超级复制',
      desc: '深度集成抖音、小红书爆款解析引擎。一键提取热门文案、结构与关键词，快速完成内容模仿与重构。结合"超级员工"能力，实现矩阵化精准分发。',
    },
    {
      icon: Sparkles,
      title: '全模态 AI 内容生成工厂',
      desc: '无缝覆盖文生图、文生视频、图生视频三大模态。支持"照片说话"、"AI 宠物视频"等创意玩法。一次性满足电商商品图、企业宣传视频、娱乐二次创作等多元需求。',
    },
    {
      icon: Zap,
      title: '音视频智能处理工作流',
      desc: '集成智能水印消除、视频/音频/文案一键提取。AI 自动配音、AI 音乐创作与多语言视频翻译，打通从素材抓取、处理到成片的全链路生产闭环。',
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-cyan-50/70 via-sky-50/50 to-blue-50/60 border border-cyan-200/60 rounded-xl p-4 hover:border-cyan-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 flex-shrink-0 bg-gradient-to-br from-cyan-100 to-sky-100 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <feature.icon className="text-cyan-600" size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm mb-1.5 group-hover:text-cyan-700 transition-colors">
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