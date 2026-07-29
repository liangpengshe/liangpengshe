'use client'

/**
 * 良朋社 OPC · 城市站首页（动态路由）
 * ------------------------------------------------------------
 * 架构进化（演进六）：
 *   - 1 → N：消除 /dongguan /liuzhou /wuhai 三个 481 行重复文件
 *   - 单源数据：_data/cities.ts 集中管理所有城市文案
 *   - 新增城市：仅需在 CITIES 数组加一项，无需复制粘贴
 *   - 旧路径 301：next.config.js redirects() 配置
 *   - SEO 友好：动态 metadata、静态预渲染
 * ------------------------------------------------------------
 * 路由：/city/[slug]   slugs: dongguan / liuzhou / wuhai
 * 兼容：/dongguan → 301 → /city/dongguan（同理）
 * ------------------------------------------------------------
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Rocket, AlertCircle, Home } from 'lucide-react'

import ClientLayout from '@/components/ClientLayout'
import { getCityBySlug, type CityActivity } from '../_data/cities'

// ════════════════════════════════════════════════════════════════
// 1. 静态数据（所有城市共用）
// ════════════════════════════════════════════════════════════════

const stats = [
  { label: '已赋能企业', value: 300, suffix: '+', unit: '家' },
  { label: '举办沙龙', value: 50, suffix: '+', unit: '期' },
  { label: '服务客户', value: 500, suffix: '+', unit: '位' },
  { label: 'AI案例', value: 100, suffix: '+', unit: '个' },
]

interface BentoItem {
  title: string
  icon: string
  description: string
  href: string
  large: boolean
  bgColor: string
  textColor: string
  badge?: { text: string; icon: typeof Rocket; color: string }
}

const fallbackBentoItems: BentoItem[] = [
  {
    title: 'OPC 城市主理人生态圈',
    icon: '🚀',
    description: '全国 7 座城市已联动，招募更多城市合伙人共拓 AI 市场',
    href: '/partner',
    large: true,
    bgColor: 'bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800',
    textColor: 'text-white',
    badge: { text: '招募中', icon: Rocket, color: 'bg-orange-500' },
  },
  {
    title: '工具库 · 智富引擎',
    icon: '🔧',
    description: '实用AI工具推荐与教程，赋能个人创业者',
    href: '/tools',
    large: false,
    bgColor: '',
    textColor: '',
  },
  {
    title: '项目库 · 创富引擎',
    icon: '📁',
    description: '精选AI落地项目案例，可复制到各城市运营',
    href: '/projects',
    large: false,
    bgColor: '',
    textColor: '',
  },
  {
    title: '服务库 · 护航引擎',
    icon: '💼',
    description: 'AI内训、GEO增长、陪跑服务，解决落地最后一环',
    href: '/services',
    large: false,
    bgColor: '',
    textColor: '',
  },
  {
    title: '资源库 · 链接引擎',
    icon: '📚',
    description: '学习资料、行业报告、城市运营干货分享',
    href: '/resources',
    large: false,
    bgColor: '',
    textColor: '',
  },
]

// ════════════════════════════════════════════════════════════════
// 2. 子组件
// ════════════════════════════════════════════════════════════════

function CommunityHeartbeat() {
  const [activeCount, setActiveCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHeartbeat = async () => {
      try {
        const res = await fetch('/api/community/heartbeat')
        const data = await res.json()
        if (data.success) {
          setActiveCount(data.data.activeCount)
        } else {
          setActiveCount(238)
        }
      } catch {
        setActiveCount(238)
      } finally {
        setLoading(false)
      }
    }
    fetchHeartbeat()
    const interval = setInterval(fetchHeartbeat, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex-shrink-0 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-2 ml-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
      </span>
      <div className="text-xs leading-tight">
        <div className="text-white/70">社区今日活跃</div>
        <div className="text-white font-semibold">{loading ? '...' : activeCount} 人</div>
      </div>
    </div>
  )
}

function ActivityTicker({ activities }: { activities: CityActivity[] }) {
  if (activities.length === 0) return null

  return (
    <div className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-2.5 mb-6">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...activities, ...activities].map((activity, idx) => (
          <div
            key={`${activity.id}-${idx}`}
            className="flex items-center gap-2 px-5 text-sm text-white/90 flex-shrink-0"
          >
            <span className="text-yellow-300">📍</span>
            <span className="font-semibold text-white">{activity.city}</span>
            <span className="text-white/80">
              {activity.user} {activity.action}
            </span>
            <span className="text-white/40 mx-3">|</span>
          </div>
        ))}
      </div>
      <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-slate-900/80 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-slate-900/80 to-transparent pointer-events-none" />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 3. 主页面
// ════════════════════════════════════════════════════════════════

interface CityPageProps {
  params: { slug: string }
}

export default function CityHomePage({ params }: CityPageProps) {
  const city = getCityBySlug(params.slug)
  // 🛡️ 因为本页面是 'use client' 组件，notFound() 不会改变 HTTP 状态码（仍返回 200），
  //    所以这里直接渲染 404 UI（与 app/not-found.tsx 一致），让用户看到清晰提示。
  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-5">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 mb-6">
            <AlertCircle size={40} className="text-rose-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404</h1>
          <h2 className="text-xl font-bold text-slate-700 mb-3">城市未找到</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            您访问的城市 <span className="font-bold text-slate-700">{params.slug}</span> 暂未开通。
            <br />
            目前已开通东莞、柳州、乌海，更多城市正在筹备中。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-5 py-2.5 rounded-full text-sm hover:scale-105 transition-transform shadow-md"
            >
              <Home size={14} />
              返回首页
            </Link>
            <Link
              href="/partner"
              className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-full text-sm hover:scale-105 transition-transform"
            >
              <Sparkles size={14} />
              申请新城市
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 城市专用 Bento 卡片：第 0 项动态替换描述
  const bentoItems: BentoItem[] = fallbackBentoItems.map((item, idx) =>
    idx === 0
      ? {
          ...item,
          description: city.partnersDescription,
        }
      : item
  )

  return (
    <ClientLayout>
      <div className="min-h-screen bg-slate-50">
        {/* ═══ HERO 区：深色渐变 + 玻璃拟态 + 3D 数字人占位 ═══ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-16 pb-24 px-5">
          {/* 装饰光晕 */}
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-32 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent" />

          <div className="relative max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* 左侧：标题 + 按钮 */}
              <div className="text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/15 via-yellow-400/15 to-amber-500/15 backdrop-blur-md border border-amber-400/40 rounded-full px-4 py-1.5 mb-6 shadow-lg shadow-amber-500/10"
                >
                  <span className="text-base">🏆</span>
                  <span className="text-sm text-amber-100 font-semibold tracking-wide">
                    良朋社<span className="text-amber-300">OPC</span> 智富生态系统 ·{' '}
                    <span className="text-cyan-300">{city.name}站</span>
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4"
                >
                  <span className="text-white">一人公司 ×</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    AI 商业操作系统
                  </span>
                </motion.h1>

                {/* 智富渐变小字标语 - 移动端 <390px 不换行 + 缩放适配 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.18 }}
                  className="mb-4 flex items-center justify-center md:justify-start gap-1.5 sm:gap-2 whitespace-nowrap max-w-full origin-center md:origin-left scale-90 max-[389px]:scale-[0.82] max-[359px]:scale-[0.74] max-[340px]:scale-[0.68]"
                >
                  <span className="text-lg sm:text-xl md:text-lg font-extrabold tracking-wide shrink-0">
                    <span className="bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(99,102,241,0.45)]">
                      智
                    </span>
                    <span className="mx-0.5 text-slate-200">·</span>
                    <span className="bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]">
                      富
                    </span>
                  </span>
                  <span className="text-[11px] sm:text-sm md:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-wider shrink min-w-0 truncate">
                    以智生财，富在当下
                  </span>
                  <span className="text-slate-500 text-xs shrink-0">·</span>
                  <span className="text-[11px] sm:text-sm md:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-300 tracking-wider shrink min-w-0 truncate">
                    用 AI 武装你的生意
                  </span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="text-slate-300 mb-8 max-w-md md:max-w-lg mx-auto md:mx-0 text-sm md:text-base"
                >
                  {city.tagline}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                >
                  <Link
                    href="/salon"
                    className="group relative inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3.5 px-8 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/40"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 flex items-center gap-2">
                      <Sparkles size={18} />
                      智富沙龙 · 立即报名
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  <Link
                    href="/partner"
                    className="group relative inline-flex items-center justify-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold py-3.5 px-8 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 flex items-center gap-2">
                      <Rocket size={18} />
                      智富合伙人 · 城市招募
                    </span>
                  </Link>
                </motion.div>
              </div>

              {/* 右侧：城市主理人形象（CSS 渐变 + 文字占位） */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative hidden md:flex items-center justify-center overflow-hidden"
              >
                <div className="relative w-full aspect-square max-w-md">
                  {/* 1) 背景：紫色光晕底 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/25 to-pink-500/20 rounded-3xl blur-2xl" />

                  {/* 2) 赛博光带 */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    <div
                      className="absolute left-0 right-0 h-24 -translate-y-2 animate-pulse"
                      style={{
                        top: '58%',
                        background:
                          'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0) 5%, rgba(168,85,247,0.55) 30%, rgba(236,72,153,0.7) 50%, rgba(99,102,241,0.55) 70%, rgba(168,85,247,0) 95%, transparent 100%)',
                        filter: 'blur(8px)',
                        mixBlendMode: 'screen',
                      }}
                    />
                    <div
                      className="absolute left-0 right-0 h-3 -translate-y-2 animate-pulse"
                      style={{
                        top: '58%',
                        background:
                          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 10%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 90%, transparent 100%)',
                        filter: 'blur(3px)',
                        animationDelay: '0.6s',
                        mixBlendMode: 'screen',
                      }}
                    />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/40 rounded-full blur-3xl animate-pulse" />
                    <div
                      className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl animate-pulse"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)',
                      }}
                    />
                  </div>

                  {/* 3) 主体图片：城市主理人照片（呼吸悬浮） */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={city.cityImage}
                      alt={`${city.name}主理人 - 良朋社OPC 城市合伙人`}
                      width={400}
                      height={400}
                      priority
                      quality={95}
                      className="relative w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(168,85,247,0.35)]"
                    />
                  </motion.div>

                  {/* 4) 装饰光环 */}
                  <div className="absolute -inset-4 border-2 border-blue-400/30 rounded-3xl animate-spin-slow pointer-events-none" />
                  <div className="absolute -inset-8 border border-purple-400/20 rounded-3xl animate-spin-reverse pointer-events-none" />

                  {/* 5) 浮动标签 */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="absolute top-8 -right-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-xs text-white shadow-lg"
                  >
                    ✨ AI 智富助理
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                    className="absolute bottom-12 -left-2 bg-gradient-to-r from-cyan-500/80 to-blue-500/80 backdrop-blur-md rounded-full px-3 py-1.5 text-xs text-white shadow-lg"
                  >
                    {city.onePersonTag}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 实时动态横幅：使用城市静态数据 ═══ */}
        <section className="relative -mt-10 px-5 z-10">
          <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <ActivityTicker activities={city.staticActivities} />
          </div>
        </section>

        {/* ═══ 数据条：玻璃拟态 + 静态数字 ═══ */}
        <section className="px-5 py-8">
          <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <div
              className={`bg-gradient-to-r ${city.bgGradient} backdrop-blur-md border border-white/20 rounded-3xl px-6 py-6`}
            >
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {stats.map((stat, index) => (
                  <div key={index} className="flex-shrink-0 w-28 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">
                      <span>{stat.value}</span>
                      {stat.suffix}
                    </div>
                    <div className="text-xs text-white/70 mt-1">
                      {stat.label} {stat.unit}
                    </div>
                  </div>
                ))}
                <div className="flex-shrink-0 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-2 ml-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <div className="text-xs leading-tight">
                    <div className="text-white/70">社区今日活跃</div>
                    <div className="text-white font-semibold">{city.activeUsers} 人</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ OPC 城市主理人生态圈：顶部蓝色大横幅 ═══ */}
        <section className="px-5 py-4">
          <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <Link
              href="/partner"
              className="group relative block bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 md:p-8 text-white overflow-hidden hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-300/20 rounded-full blur-3xl" />
              <div className="relative flex items-center gap-5">
                <div className="text-5xl md:text-6xl flex-shrink-0">🚀</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                      <Rocket size={12} />
                      🔥 招募中
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1.5">OPC 城市主理人生态圈</h2>
                  <p className="text-sm md:text-base text-white/90 leading-relaxed">
                    {city.partnersDescription}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-sm text-white font-semibold group-hover:gap-2 transition-all">
                    <span>立即加入</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ═══ 四库全胜系统：四大引擎 2x2 网格 ═══ */}
        <section className="px-5 py-8">
          <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  四库全胜系统
                </h2>
                <Link href="/market" className="text-sm text-blue-600 hover:text-blue-700">
                  查看全部 →
                </Link>
              </div>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                工具智选、项目创富、服务护航、资源链接。
                <span className="font-semibold text-blue-600">四大引擎协同驱动</span>
                ，助你赢在 AI 时代。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bentoItems
                .filter((item) => !item.large)
                .map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="group relative bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-h-[160px] flex flex-col"
                  >
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h3 className="font-bold text-base md:text-lg mb-1.5 text-blue-800 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed flex-1">
                      {item.description}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 group-hover:gap-2 transition-all">
                      <span>立即查看</span>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA 区 ═══ */}
        <section className="px-5 py-8">
          <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <div className="relative bg-gradient-to-br from-cyan-600/90 via-blue-600/90 to-violet-700/90 backdrop-blur-md border border-white/20 rounded-3xl p-8 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/30 rounded-full blur-3xl" />
              <div className="relative text-center">
                <h3 className="text-xl font-bold text-white mb-3">{city.joinCTA}</h3>
                <p className="text-white/80 mb-6 text-sm">
                  与全国顶尖 AI 从业者一起，开启企业智能化转型之旅
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center bg-white text-slate-900 font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-transform shadow-lg"
                  >
                    免费注册
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    {city.contactLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ClientLayout>
  )
}
