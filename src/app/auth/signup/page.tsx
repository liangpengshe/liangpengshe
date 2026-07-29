'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * 注册页（已合并到 /auth/login）
 * 注册通过"未注册手机号自动创建账号"实现，无需独立页面
 * 此页面保留 URL 是为了兼容老链接 → 直接 302 跳转到 /auth/login
 */
export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/auth/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">正在跳转到登录页...</p>
      </div>
    </div>
  )
}
