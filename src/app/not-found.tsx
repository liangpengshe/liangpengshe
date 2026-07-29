'use client'

import Link from 'next/link'
import { Home, ArrowLeft, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-5">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 mb-6">
          <AlertCircle size={40} className="text-rose-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-700 mb-3">页面未找到</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          您访问的页面不存在、已迁移或被删除。
          <br />
          请检查 URL 是否正确，或返回首页继续浏览。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-5 py-2.5 rounded-full text-sm hover:scale-105 transition-transform shadow-md"
          >
            <Home size={14} />
            返回首页
          </Link>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.history.back()
            }}
            className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-300 text-slate-700 font-medium px-5 py-2.5 rounded-full text-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={14} />
            返回上一页
          </button>
        </div>
      </div>
    </div>
  )
}
