'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ClientLayout from '@/components/ClientLayout'
import {
  ArrowLeft,
  Trophy,
  Wrench,
  Briefcase,
  FileText,
  BookOpen,
  Sparkles,
  Rocket,
  Gift,
  Coins,
  ChevronRight,
  Zap,
  TrendingUp,
} from 'lucide-react'

const FOUR_ENGINES = [
  {
    key: 'tool',
    title: '工具库 · 提效引擎',
    icon: '🔧',
    color: 'from-blue-500 to-indigo-600',
    Icon: Wrench,
    description: '实用AI工具推荐与教程，赋能个人创业者',
    href: '/tools',
    items: ['AI 数字人口播', 'AI 文案助手', '智能数据分析', 'AI 图像生成'],
  },
  {
    key: 'project',
    title: '项目库 · 创收引擎',
    icon: '📁',
    color: 'from-emerald-500 to-teal-600',
    Icon: FileText,
    description: '精选AI落地项目案例，可复制到各城市运营',
    href: '/projects',
    items: ['城市主理人 SOP', 'AI 私域代运营', '本地生活短视频', 'AI 培训课包'],
  },
  {
    key: 'service',
    title: '服务库 · 护航引擎',
    icon: '💼',
    color: 'from-purple-500 to-pink-600',
    Icon: Briefcase,
    description: 'AI内训、GEO增长、陪跑服务，解决落地最后一环',
    href: '/services',
    items: ['企业 AI 内训', 'GEO 搜索增长', 'AI 陪跑落地', '定制化陪跑'],
  },
  {
    key: 'resource',
    title: '资源库 · 链接引擎',
    icon: '📚',
    color: 'from-amber-500 to-orange-600',
    Icon: BookOpen,
    description: '学习资料、行业报告、城市运营干货分享',
    href: '/resources',
    items: ['行业研究报告', '城市运营 SOP', 'AI 政策汇编', '课程笔记合集'],
  },
]

export default function MorePage() {
  const [coins, setCoins] = useState<any>(null)

  useEffect(() => {
    const phone = localStorage.getItem('userPhone') || '13800000000'
    fetch(`/api/coins?phone=${phone}`)
      .then((r) => r.json())
      .then((j) => j.success && setCoins(j.data))
      .catch(() => {})
  }, [])

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/30">
        {/* 顶部导航 */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="flex-1">
              <h1 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                <Trophy size={18} className="text-amber-500" />
                四库全胜系统
              </h1>
              <p className="text-[11px] text-gray-500">Four-Library Victory System</p>
            </div>
            {coins && (
              <Link
                href="/member"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-md"
              >
                <Coins size={12} />
                {coins.coins.toLocaleString()} 良朋币
              </Link>
            )}
          </div>
        </header>

        {/* 顶部介绍 Banner */}
        <section className="px-4 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-6 md:p-8 overflow-hidden text-white shadow-2xl">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-100 text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 border border-yellow-400/30">
                  <Sparkles size={10} />
                  良朋社 OPC · 核心系统
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                  🏆 四库全胜系统
                </h1>
                <p className="text-sm md:text-base text-blue-100 leading-relaxed mb-4">
                  工具提效、项目创收、服务护航、资源链接。<br className="md:hidden" />
                  <span className="font-bold text-yellow-200">四大引擎协同驱动</span>
                  ，助你赢在 AI 时代。
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold border border-white/20">
                    🔧 提效引擎
                  </span>
                  <span className="px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold border border-white/20">
                    📁 创收引擎
                  </span>
                  <span className="px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold border border-white/20">
                    💼 护航引擎
                  </span>
                  <span className="px-3 py-1 bg-white/15 backdrop-blur rounded-full text-xs font-semibold border border-white/20">
                    📚 链接引擎
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 四大引擎卡片 */}
        <section className="px-4 py-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                四大核心组件
              </h2>
              <span className="text-xs text-gray-500">协同驱动 · 各有专攻</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FOUR_ENGINES.map((eng) => {
                const Icon = eng.Icon
                return (
                  <Link
                    key={eng.key}
                    href={eng.href}
                    className="group block bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${eng.color} rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <span className="text-2xl">{eng.icon}</span>
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                    <h3 className="text-base font-bold text-blue-800 group-hover:text-blue-600 transition-colors mb-1.5">
                      {eng.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">
                      {eng.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {eng.items.map((item) => (
                        <span
                          key={item}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* 价值主张 */}
        <section className="px-4 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-emerald-500" />
                为什么要用四库全胜系统？
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">1.</span>
                  <span>
                    <span className="font-bold text-gray-900">提效</span>：用 AI 工具替代重复劳动，把时间留给创造
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  <span>
                    <span className="font-bold text-gray-900">创收</span>：复制经过验证的项目 SOP，30 天跑通最小成交
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">3.</span>
                  <span>
                    <span className="font-bold text-gray-900">护航</span>：专业服务商陪跑，避免踩坑少走弯路
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">4.</span>
                  <span>
                    <span className="font-bold text-gray-900">链接</span>：与同路人线下沙龙，资源人脉源源不断
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 行动 CTA */}
        <section className="px-4 py-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/member"
                className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <Coins size={20} className="mb-2" />
                <div className="text-sm font-bold">我的良朋币</div>
                <div className="text-[10px] opacity-90 mt-0.5">查看余额 · 赚取积分</div>
              </Link>
              <Link
                href="/partner"
                className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <Rocket size={20} className="mb-2" />
                <div className="text-sm font-bold">加入 OPC 城市</div>
                <div className="text-[10px] opacity-90 mt-0.5">招募城市合伙人</div>
              </Link>
            </div>
          </div>
        </section>

        {/* 启动包引导 */}
        <section className="px-4 py-4 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-2xl p-5 text-white overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/15 rounded-full blur-2xl" />
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
                  <Gift size={22} className="text-yellow-200" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-1">⚡️ 解锁四库全胜启动包</h3>
                  <p className="text-[11px] text-white/90 leading-relaxed">
                    完成 AI 诊断 + 商业规划，自动生成《四库全胜报告》
                  </p>
                </div>
                <Link
                  href="/projects"
                  className="px-3 py-2 bg-white text-rose-600 text-xs font-bold rounded-lg shadow-md hover:scale-105 transition-all"
                >
                  去解锁
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ClientLayout>
  )
}
