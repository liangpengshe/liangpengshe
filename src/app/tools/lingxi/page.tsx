'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Sparkles,
  Palette,
  Film,
  Zap,
  Rocket,
  CheckCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LingxiPage() {
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
          toolSlug: 'lingxi',
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
      icon: Palette,
      title: '多模态 AIGC 创作矩阵',
      desc: '支持图生视频、参考生视频等多种创作模式。率先引入"前置生成场景图"环节，极大提升画面连贯性与场景一致性，支持 4K 超高清输出，满足电商、自媒体、品牌宣传等严苛需求。',
    },
    {
      icon: Film,
      title: '智能漫剧与商业短剧工厂',
      desc: '上传剧本，AI 自动分配角色、配音、分镜，打造影视级漫剧。多集并发生成，高效制作完整内容。不仅是漫剧工具，更是跨境电商短视频、带货视频、企业宣传片的极速生成引擎。',
    },
    {
      icon: Zap,
      title: '全栈大模型算力基座',
      desc: '深度整合国内主流前沿大模型（支持种子模型、图生视频模型、视频模型等）。用户无需切换平台，即可在统一的界面内调用不同垂直领域的顶尖模型，实现"算力随选，场景通用"。',
    },
    {
      icon: Rocket,
      title: '零门槛极速工作流',
      desc: '无需剪辑基础、无需专业技能。新用户注册即可免费领取体验积分。从上传剧本到输出高质量成片，3 步完成"剧本→成片"的商业闭环，用 AI 大幅拉升内容生产力。',
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
          <span className="font-bold text-gray-900">灵犀 AI</span>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="px-5 py-6">
        <section className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white mb-6">
          <h1 className="text-2xl font-bold mb-2">灵犀 AI</h1>
          <p className="text-purple-100 text-sm mb-4">智能对话助手，让 AI 成为您的得力伙伴</p>
          <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1.5 rounded-full w-fit">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>OPC 独家自研工具</span>
          </div>
        </section>

        <section className="relative w-full h-56 md:h-80 lg:h-[420px] overflow-hidden rounded-2xl shadow-md mb-6 bg-slate-100">
          <Image
            src="/images/lingxi-banner.png"
            alt="灵犀 AI 演示界面"
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
                className="group relative bg-gradient-to-br from-purple-50/70 via-violet-50/50 to-indigo-50/60 border border-purple-200/60 rounded-xl p-4 hover:border-purple-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 flex-shrink-0 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <feature.icon className="text-purple-600" size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm mb-1.5 group-hover:text-purple-700 transition-colors">
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
              <p className="text-sm text-gray-500 mb-4">灵犀 AI 官方页面已在新窗口打开</p>
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
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="请输入您的手机号"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="请输入您的公司名称（选填）"
                />
                <p className="mt-1.5 text-xs text-purple-700">
                  *OPC 将为您的体验账号提供专属技术支持
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium py-3 rounded-lg hover:from-purple-600 hover:to-indigo-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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