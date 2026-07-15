'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import CitySelector, { CITY_STORAGE_KEY } from '@/components/CitySelector'
import Link from 'next/link'
import { Lock, ArrowRight, Target, Wrench, CheckCircle2, Sparkles } from 'lucide-react'
import MobileBottomNav from '@/components/MobileBottomNav'
import AIAssistant from '@/components/AIAssistant'
import MobileHamburgerMenu from '@/components/MobileHamburgerMenu'

/**
 * 工作台前置条件检查
 * 达标条件（满足任一即可）：
 *   - localStorage.getItem('learning_score') >= 80
 *   - localStorage.getItem('opc_user_can_unlock_practice') === 'true'
 *   - localStorage.getItem('opc_user_opc_level') 存在（已诊断）
 *     （与 /api/user/learning-progress 数据对齐：已诊断 + 完成 80 分任务可解锁；
 *      实际生产可与 user.can_unlock_practice === true 等价）
 */
function checkWorkspaceAllowed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const scoreStr = window.localStorage.getItem('learning_score')
    const score = scoreStr ? parseInt(scoreStr, 10) : 0
    if (!isNaN(score) && score >= 80) return true
    if (window.localStorage.getItem('opc_user_can_unlock_practice') === 'true') return true
  } catch {
    // localStorage 不可用 → 默认锁住
  }
  return false
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [showCitySelector, setShowCitySelector] = useState(false)
  const [citySuffix, setCitySuffix] = useState<string>('') // 当前城市站后缀，例 "· 乌海站"

  // 「工作台前置拦截」模态框状态
  const [workspaceGuardOpen, setWorkspaceGuardOpen] = useState(false)

  // 从 localStorage 读取当前城市，hydrate 后展示在 logo 旁
  useEffect(() => {
    const compute = () => {
      try {
        const code = window.localStorage.getItem(CITY_STORAGE_KEY) || 'shenzhen'
        const map: Record<string, string> = {
          shenzhen: '深圳站',
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

  /** 工作台点击：前置检查 + 拦截/放行 */
  const handleWorkspaceClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      e.preventDefault()
      if (checkWorkspaceAllowed()) {
        router.push('/workspace')
      } else {
        setWorkspaceGuardOpen(true)
      }
    },
    [router]
  )

  return (
    <div className="max-w-lg mx-auto md:max-w-7xl min-h-screen relative" suppressHydrationWarning>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50" suppressHydrationWarning>
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
          <div className="flex items-center gap-2 md:gap-3">
            <CitySelector />
            {/* 移动端：仅显示汉堡菜单（进化项 2.2） */}
            <MobileHamburgerMenu onWorkspaceClick={handleWorkspaceClick} />
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/market/tools"
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                📚 学习中心
              </Link>
              <Link
                href="/pitch"
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                💼 商业全景
              </Link>
              <button
                type="button"
                onClick={handleWorkspaceClick}
                className="text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-1"
                data-testid="workspace-link"
              >
                🚀 我的工作台
              </button>
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
      {/* AIAssistant 使用了 useSearchParams，需要 Suspense 边界 */}
      <Suspense fallback={null}>
        <AIAssistant />
      </Suspense>

      {/* ════════ 工作台前置拦截模态框 ═══════ */}
      {workspaceGuardOpen && (
        <WorkspaceGuardModal
          onClose={() => setWorkspaceGuardOpen(false)}
          onGoDiagnosis={() => {
            setWorkspaceGuardOpen(false)
            router.push('/diagnosis')
          }}
          onBypass={() => {
            setWorkspaceGuardOpen(false)
            router.push('/workspace?bypass=true')
          }}
        />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// 工作台前置拦截模态框
// ════════════════════════════════════════════════════════════════

function WorkspaceGuardModal({
  onClose,
  onGoDiagnosis,
  onBypass,
}: {
  onClose: () => void
  onGoDiagnosis: () => void
  onBypass: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部渐变 Banner */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border-b border-amber-100">
          <div aria-hidden className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-amber-200/40 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Lock size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-extrabold tracking-widest text-amber-700 uppercase mb-0.5 flex items-center gap-1">
                <Sparkles size={10} />
                WORKSPACE · 前置检查
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                工作台尚未解锁
              </h3>
            </div>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <p className="text-sm text-slate-700 leading-relaxed">
            「我的工作台」会根据你的<strong className="text-blue-700">诊断结果</strong>和<strong className="text-blue-700">新手启航进度（≥ 80 分）</strong>生成专属 SOP 任务卡。
            为避免无效推荐，建议先完成诊断 + 新手启航任务。
          </p>

          <ul className="mt-4 space-y-2">
            {[
              { icon: Target, text: '完成《OPC 智富入局诊断》确定你的层级' },
              { icon: CheckCircle2, text: '完成新手 3 任务（浏览/注册/下载）累计 ≥ 80 分' },
              { icon: Wrench, text: '解锁后自动获得 AI 个性化工作台' },
            ].map((it, i) => {
              const Icon = it.icon
              return (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[12px] text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-2.5"
                >
                  <Icon size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{it.text}</span>
                </li>
              )
            })}
          </ul>

          {/* 按钮区 */}
          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={onGoDiagnosis}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
            >
              🎯 先去诊断 + 完成新手任务
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={onBypass}
              className="w-full inline-flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
            >
              <Lock size={10} />
              跳过，仅查看基础页面
            </button>
          </div>
        </div>

        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center text-lg transition-colors"
          aria-label="关闭"
        >
          ×
        </button>
      </div>
    </div>
  )
}
