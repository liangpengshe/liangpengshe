'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CitySelector, { CITY_STORAGE_KEY } from '@/components/CitySelector'
import Link from 'next/link'

// 这些组件本身就是 'use client'，SSR 正常；
// 保留 dynamic 拆包，但不再 ssr:false（避免触发 Next.js 14 BAILOUT_TO_CLIENT_SIDE_RENDERING）
const MobileBottomNav = dynamic(() => import('@/components/MobileBottomNav'))

const AIAssistant = dynamic(() => import('@/components/AIAssistant'))

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showCitySelector, setShowCitySelector] = useState(false)
  const [citySuffix, setCitySuffix] = useState<string>('') // 当前城市站后缀，例 "· 乌海站"

  // 从 localStorage 读取当前城市，hydrate 后展示在 logo 旁
  useEffect(() => {
    const compute = () => {
      try {
        const code = window.localStorage.getItem(CITY_STORAGE_KEY) || 'shenzhen'
        const map: Record<string, string> = {
          shenzhen: '深圳站',
          guangzhou: '广州站',
          hangzhou: '杭州站',
          chengdu: '成都站',
          wuhai: '乌海站',
          dongguan: '东莞站',
          liuzhou: '柳州站',
        }
        setCitySuffix(map[code] ? `· ${map[code]}` : '')
      } catch {
        setCitySuffix('')
      }
    }
    compute()
    const onChange = () => compute()
    window.addEventListener('lps:cityChanged', onChange)
    return () => window.removeEventListener('lps:cityChanged', onChange)
  }, [])

  return (
    <div className="max-w-lg mx-auto md:max-w-7xl min-h-screen relative" suppressHydrationWarning>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="良朋社 OPC 智富生态系统"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg object-contain"
            />
            <span className="font-bold text-gray-900 whitespace-nowrap">
              良朋社OPC
              {citySuffix && (
                <span className="ml-1 text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md align-middle">
                  {citySuffix}
                </span>
              )}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <CitySelector />
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/ip-reconstruction"
                className="text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors"
              >
                🦾 IP 重构
              </Link>
              <Link
                href="/pitch"
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                💼 商业全景
              </Link>
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                登录
              </Link>
              <Link href="/auth/signup" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                注册
              </Link>
            </div>
          </div>
        </div>
      </header>
      {children}
      <MobileBottomNav />
      <AIAssistant />
    </div>
  )
}