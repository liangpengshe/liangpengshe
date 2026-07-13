'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Sparkles,
  Drama,
  Repeat,
  Zap,
  CheckCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function PioneerPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
  })
  const [loading, setLoading] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/tools/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          company: formData.company,
          toolSlug: 'pioneer',
        }),
      })
      const data = await res.json()
      if (data.success && data.redirectUrl) {
        setRedirectUrl(data.redirectUrl)
        showToast(data.message || '体验账号已开通，正在跳转...', 'success')
        setTimeout(() => {
          window.open(data.redirectUrl, '_blank', 'noopener,noreferrer')
        }, 600)
      } else {
        showToast(data.message || '提交失败，请稍后重试', 'error')
      }
    } catch (err) {
      showToast('网络异常，请稍后重试', 'error')
    } finally {
      setLoading(false)
    }
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
          <Link href="/market" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
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

        <section className="relative w-full h-56 md:h-80 lg:h-[420px] overflow-hidden rounded-2xl shadow-md mb-6 bg-slate-100">
          <Image
            src="/images/pioneer-banner.png"
            alt="先锋派数字人演示界面"
            fill
            className="object-cover object-center"
            priority
            quality={95}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
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
          <h2 className="text-lg font-bold text-gray-900 mb-1">立即体验 OPC 专属工具</h2>
          <p className="text-xs text-gray-500 mb-4">填写信息后 1 个工作日内开通体验账号，享专属技术支持</p>

          {redirectUrl ? (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="text-white" size={28} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">体验账号已开通！</h3>
              <p className="text-sm text-gray-500 mb-4">先锋派数字人官方页面已在新窗口打开</p>
              <a
                href={redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                未自动打开？点这里
                <ExternalLink size={14} />
              </a>
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
                <p className="mt-1.5 text-xs text-cyan-700">
                  *OPC 将为您的体验账号提供专属技术支持
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>正在开通体验账号...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>立即体验</span>
                  </>
                )}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
  if (typeof window === 'undefined') return
  const palette =
    type === 'success'
      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
      : 'bg-gradient-to-r from-rose-500 to-red-500'
  const el = document.createElement('div')
  el.setAttribute('data-lps-toast', '1')
  el.className =
    'fixed left-1/2 top-20 z-[100] px-5 py-3 rounded-xl shadow-2xl text-sm font-medium text-white pointer-events-none transition-all duration-300 ' +
    palette
  el.style.opacity = '0'
  el.style.transform = 'translate(-50%, -10px)'
  el.textContent = message
  document.body.appendChild(el)
  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = 'translate(-50%, 0)'
    setTimeout(() => {
      el.style.opacity = '0'
      el.style.transform = 'translate(-50%, -10px)'
      setTimeout(() => el.remove(), 300)
    }, 2400)
  })
}