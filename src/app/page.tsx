'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ClientLayout from '@/components/ClientLayout'

const stats = [
  { label: '已赋能企业', value: 70, suffix: '+', unit: '家' },
  { label: '举办沙龙', value: 5, suffix: '', unit: '期' },
  { label: '服务客户', value: 500, suffix: '+', unit: '位' },
  { label: 'AI案例', value: 100, suffix: '+', unit: '个' },
]

const fallbackBentoItems = [
  {
    title: '服务库',
    icon: '💼',
    description: 'AI咨询、落地指导、商业变现方案，助力城市合伙人开拓本地市场',
    href: '/services',
    large: true,
    bgColor: 'bg-blue-700',
    textColor: 'text-white',
  },
  {
    title: '工具库',
    icon: '🔧',
    description: '实用AI工具推荐与教程，赋能个人创业者',
    href: '/tools',
    large: false,
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
  },
  {
    title: '项目库',
    icon: '📁',
    description: '精选AI落地项目案例，可复制到各城市运营',
    href: '/projects',
    large: false,
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
  },
  {
    title: '资源库',
    icon: '📚',
    description: '学习资料、行业报告、城市运营干货分享',
    href: '/resources',
    large: false,
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
  },
]

interface Project {
  id: string
  title: string
  description: string
  content: string
  category: string
  cityId: string
  createdAt: string
  updatedAt: string
}

function AnimatedNumber({ value, suffix, unit, label }: { value: number; suffix: string; unit: string; label: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 2000
          const steps = 60
          const increment = value / steps
          let current = 0

          const timer = setInterval(() => {
            current += increment
            if (current >= value) {
              setDisplayValue(value)
              clearInterval(timer)
            } else {
              setDisplayValue(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="flex-shrink-0 w-28 text-center">
      <div className="text-3xl font-bold text-blue-600">
        {displayValue}{suffix}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label} {unit}</div>
    </div>
  )
}

export default function HomePage() {
  const [bentoItems, setBentoItems] = useState(fallbackBentoItems)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects?city=shenzhen')
        const data = await response.json()
        
        if (data.success && data.data) {
          const categories = ['服务库', '工具库', '项目库', '资源库']
          const icons = { '服务库': '💼', '工具库': '🔧', '项目库': '📁', '资源库': '📚' }
          const newItems = categories.map((category, index) => {
            const projects = data.data[category] || []
            const project = projects[0]
            
            return {
              title: category,
              icon: icons[category as keyof typeof icons],
              description: project ? project.description : fallbackBentoItems[index].description,
              href: `/${category.replace('库', '').toLowerCase()}`,
              large: category === '服务库',
              bgColor: category === '服务库' ? 'bg-blue-700' : 'bg-white',
              textColor: category === '服务库' ? 'text-white' : 'text-gray-900',
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

    fetchProjects()
  }, [])

  return (
    <ClientLayout>
      <div className="min-h-screen bg-slate-50">
      <section className="px-5 py-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            全国 AI 创业者社群
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
            企业 AI 落地与
            <br />
            <span className="text-blue-600">商业变现实战社区</span>
          </h1>

          <p className="text-gray-600 mb-8 max-w-md mx-auto text-sm">
            汇聚全国 AI 从业者与企业家，共同探索人工智能在企业中的实际应用与商业价值
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 hover:scale-105"
            >
              🎫 预约线下沙龙
            </Link>
            <Link 
              href="/partner" 
              className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-8 rounded-xl border border-gray-200 transition-all duration-200"
            >
              成为城市合伙人
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 bg-white border-y border-gray-100">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {stats.map((stat, index) => (
            <AnimatedNumber
              key={index}
              value={stat.value}
              suffix={stat.suffix}
              unit={stat.unit}
              label={stat.label}
            />
          ))}
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">四库全书</h2>
          <Link href="/more" className="text-sm text-blue-600 hover:text-blue-700">
            查看全部 →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`bg-gray-100 rounded-2xl p-5 animate-pulse ${
                  i === 1 ? 'col-span-2 row-span-2' : ''
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {bentoItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`${item.bgColor} ${item.textColor} rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  item.large ? 'col-span-2 row-span-2' : ''
                }`}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className={`text-xs opacity-80 ${item.large ? '' : 'line-clamp-2'}`}>
                  {item.description}
                </p>
                {item.large && (
                  <div className="mt-4 flex items-center gap-1 text-xs opacity-80">
                    <span>立即探索</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="px-5 py-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-t-3xl">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-4">加入良朋社OPC</h3>
          <p className="text-gray-600 mb-6 text-sm">
            与全国顶尖 AI 从业者一起，开启企业智能化转型之旅
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup" 
              className="btn-primary w-full sm:w-auto text-center"
            >
              免费注册
            </Link>
            <Link 
              href="/contact" 
              className="btn-secondary w-full sm:w-auto text-center"
            >
              联系我们
            </Link>
          </div>
        </div>
      </section>
    </div>
    </ClientLayout>
  )
}