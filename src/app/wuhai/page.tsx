'use client'

/**
 * @deprecated 此页面已于 W4.1 演进中迁移到动态路由 /city/[slug]
 *
 * - 旧路径 /wuhai 已通过 next.config.js redirects() 配置 301 跳转
 *   到新路径 /city/wuhai（SEO 友好，保留外链权重）
 * - 此文件保留仅为 git 历史与回滚保险，业务逻辑全部抽离到
 *   /src/app/city/[slug]/page.tsx + /src/app/city/_data/cities.ts
 * - 如果 next.config.js 的 redirect 被回滚，此页面会用 client-side
 *   router.replace() 兜底跳转，确保用户不会看到 404
 * - 删除时间表：W4.4 e2e 验证稳定后下个迭代清理
 *
 * @see /src/app/city/[slug]/page.tsx
 * @see /src/app/city/_data/cities.ts
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function WuhaiDeprecatedPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/city/wuhai', { scroll: false })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🚚</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">页面已迁移</h1>
        <p className="text-sm text-slate-500 mb-4">
          乌海站已迁移到 <code className="px-1.5 py-0.5 bg-slate-200 rounded">/city/wuhai</code>
        </p>
        <p className="text-xs text-slate-400">正在自动跳转...</p>
      </div>
    </div>
  )
}
