'use client'

import { useState } from 'react'
import MobileBottomNav from '@/components/MobileBottomNav'
import AIAssistant from '@/components/AIAssistant'
import CitySelector from '@/components/CitySelector'
import Link from 'next/link'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showCitySelector, setShowCitySelector] = useState(false)

  return (
    <div className="max-w-lg mx-auto md:max-w-7xl min-h-screen relative">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏢</span>
            <span className="font-bold text-gray-900">良朋社OPC</span>
          </div>
          <div className="flex items-center gap-3">
            <CitySelector />
            <div className="hidden md:flex items-center gap-2">
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