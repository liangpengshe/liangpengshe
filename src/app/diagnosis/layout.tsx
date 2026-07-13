import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function DiagnosisLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* 极简顶栏：仅品牌文字 + 返回首页 */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-white/90 hover:text-white transition-colors"
          >
            <span className="text-lg">🏆</span>
            <span>良朋社 OPC</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-full border border-white/15 hover:border-white/30 transition-all"
          >
            <ArrowLeft size={12} />
            返回首页
          </Link>
        </div>
      </header>
      {children}
    </div>
  )
}
