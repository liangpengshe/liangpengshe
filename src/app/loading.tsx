'use client'

/**
 * 全局路由 Loading 骨架屏（进化项 3.2）
 * ------------------------------------------------------------
 * - Next.js App Router 自动使用此组件作为路由切换 fallback
 * - 通过在 layout.tsx 中用 Suspense 包裹 children 触发
 * - 用户感知：从点击 → 白屏 → 内容 优化为 点击 → 骨架屏 → 内容
 * ------------------------------------------------------------
 */

import { Loader2 } from 'lucide-react'

export default function GlobalLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="页面加载中"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-3">
        {/* 旋转 loader */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 blur-xl animate-pulse" />
          <Loader2 className="relative h-10 w-10 text-blue-500 animate-spin" />
        </div>
        {/* 文案 */}
        <div className="text-center">
          <p className="text-sm font-bold text-slate-700">正在加载</p>
          <p className="text-[10px] text-slate-400 mt-1 tracking-widest uppercase">
            loading
          </p>
        </div>
        {/* 进度条装饰 */}
        <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden mt-2">
          <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}
