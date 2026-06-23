'use client'

import { useState } from 'react'
import { Home, Wrench, FolderOpen, Briefcase, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { icon: Home, label: '首页', href: '/' },
  { icon: Wrench, label: '工具库', href: '/tools' },
  { icon: FolderOpen, label: '项目库', href: '/projects' },
  { icon: Briefcase, label: '服务库', href: '/services' },
  { icon: User, label: '我的', href: '/member' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                isActive ? 'text-liangpeng-primary' : 'text-gray-400'
              }`}
            >
              <Icon
                size={24}
                className={`transition-transform ${isActive ? 'scale-110' : ''}`}
              />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}