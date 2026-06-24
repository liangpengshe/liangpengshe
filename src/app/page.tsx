'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Rocket } from 'lucide-react'
import ClientLayout from '@/components/ClientLayout'

const stats = [
  { label: '已赋能企业', value: 70, suffix: '+', unit: '家' },
  { label: '举办沙龙', value: 5, suffix: '', unit: '期' },
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
    description: '全国 5 座城市已联动，招募更多城市合伙人共拓 AI 市场',
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

interface Activity {
  id: string
  city: string
  user: string
  action: string
  createdAt: string
}

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
        <div className="text-white font-semibold">
          {loading ? '...' : activeCount} 人
        </div>
      </div>
    </div>
  )
}

function ActivityTicker({ activities }: { activities: Activity[] }) {
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
      {/* 渐变遮罩 */}
      <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-slate-900/80 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-slate-900/80 to-transparent pointer-events-none" />
    </div>
  )
}

export default function HomePage() {
  const [bentoItems, setBentoItems] = useState<BentoItem[]>(fallbackBentoItems)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects?city=shenzhen')
        const data = await response.json()
        if (data.success && data.data) {
          const categories = ['服务库', '工具库', '项目库', '资源库']
          const icons: Record<string, string> = { '服务库': '💼', '工具库': '🔧', '项目库': '📁', '资源库': '📚' }
          const subTags: Record<string, string> = {
            '服务库': '· 护航引擎',
            '工具库': '· 智富引擎',
            '项目库': '· 创富引擎',
            '资源库': '· 链接引擎',
          }
          const newItems = categories.map((category, index) => {
            const projects = data.data[category] || []
            const project = projects[0]
            return {
              title: index === 0 ? 'OPC 城市主理人生态圈' : `${category}${subTags[category]}`,
              icon: index === 0 ? '🚀' : icons[category],
              description: index === 0
                ? '全国 5 座城市已联动，招募更多城市合伙人共拓 AI 市场'
                : (project ? project.description : fallbackBentoItems[index].description),
              href: index === 0 ? '/partner' : `/${category.replace('库', '').toLowerCase()}`,
              large: index === 0,
              bgColor: index === 0
                ? 'bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800'
                : 'bg-white/10',
              textColor: 'text-white',
              badge: index === 0 ? { text: '招募中', icon: Rocket, color: 'bg-orange-500' } : undefined,
            }
          })
          setBentoItems(newItems)
        }
      } catch (error) {
        console.log('使用备用数据')
      } finally {
        setLoading(false)
      }
    }

    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/activities')
        const data = await res.json()
        if (data.success && data.data) {
          setActivities(data.data)
        }
      } catch {
        setActivities([])
      }
    }

    fetchProjects()
    fetchActivities()
  }, [])

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
                    良朋社<span className="text-amber-300">OPC</span> 智富生态系统
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

                {/* 🪙 智富渐变小字标语 - 移动端 <390px 不换行 + 缩放适配 */}
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
                  汇聚全国 AI 从业者与企业家，共同探索人工智能在企业中的实际应用与商业价值
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

              {/* 右侧：3D 数字人占位 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative hidden md:flex items-center justify-center"
              >
                <div
                  id="three-avatar-container"
                  className="relative w-full aspect-square max-w-md"
                >
                  {/* 占位装饰 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-30 animate-pulse" />
                      <p className="text-white/60 text-sm">3D 数字人容器</p>
                      <p className="text-white/40 text-xs mt-1">#three-avatar-container</p>
                    </div>
                  </div>
                  {/* 装饰光圈 */}
                  <div className="absolute -inset-4 border-2 border-blue-400/30 rounded-3xl animate-spin-slow" />
                  <div className="absolute -inset-8 border border-purple-400/20 rounded-3xl animate-spin-reverse" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ 实时动态横幅 ═══ */}
        <section className="relative -mt-10 px-5 z-10">
          <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <ActivityTicker activities={activities} />
          </div>
        </section>

        {/* ═══ 数据条：玻璃拟态 + framer-motion 数字滚动 + 社区心跳 ═══ */}
        <section className="px-5 py-8">
          <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-white/20 rounded-3xl px-6 py-6">
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {stats.map((stat, index) => (
                  <div key={index} className="flex-shrink-0 w-28 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">
                      <span>{stat.value}</span>
                      {stat.suffix}
                    </div>
                    <div className="text-xs text-white/70 mt-1">{stat.label} {stat.unit}</div>
                  </div>
                ))}
                <CommunityHeartbeat />
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
                    全国 5 座城市已联动，招募更多城市合伙人共拓 AI 市场
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-sm text-white font-semibold group-hover:gap-2 transition-all">
                    <span>立即加入</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ═══ 四库全胜系统：玻璃卡片 + 四大引擎 2x2 网格 ═══ */}
        <section className="px-5 py-8">
          <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  四库全胜系统
                </h2>
                <Link href="/more" className="text-sm text-blue-600 hover:text-blue-700">
                  查看全部 →
                </Link>
              </div>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                工具智选、项目创富、服务护航、资源链接。<span className="font-semibold text-blue-600">四大引擎协同驱动</span>，助你赢在 AI 时代。
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-100 rounded-2xl p-5 animate-pulse h-40"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bentoItems
                  .filter((item) => !item.large) // 过滤掉 OPC 大卡（已抽到独立节）
                  .map((item, index) => {
                  return (
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
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* ═══ CTA 区：玻璃拟态 ═══ */}
        <section className="px-5 py-8">
          <div className="max-w-lg mx-auto md:max-w-6xl md:mx-auto">
            <div className="relative bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-purple-700/90 backdrop-blur-md border border-white/20 rounded-3xl p-8 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl" />
              <div className="relative text-center">
                <h3 className="text-xl font-bold text-white mb-3">加入良朋社OPC</h3>
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
                    联系我们
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
