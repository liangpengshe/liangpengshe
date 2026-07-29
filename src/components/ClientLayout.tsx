'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import CitySelector, { CITY_STORAGE_KEY } from '@/components/CitySelector'
import Link from 'next/link'
import {
  Lock,
  ArrowRight,
  Target,
  Wrench,
  CheckCircle2,
  Sparkles,
  UserCircle,
  Brain,
  Rocket,
  LogIn,
  UserPlus,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import MobileBottomNav from '@/components/MobileBottomNav'
import AIAssistant from '@/components/AIAssistant'
import MobileHamburgerMenu from '@/components/MobileHamburgerMenu'
import { createClient } from '@/lib/supabase/client'

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

/** 头像首字符：从 email / phone 提取 */
function getAvatarLabel(user: { email?: string | null; phone?: string | null } | null): string {
  if (!user) return '?'
  const raw = (user.email || user.phone || '').trim()
  if (!raw) return 'U'
  // 取 @ 前第一个字符，或首字符
  const head = raw.split('@')[0] || raw
  return head.charAt(0).toUpperCase()
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

  // 登录态：null=加载中/未登录，object=已登录
  const [authUser, setAuthUser] = useState<{
    id: string
    email?: string | null
    phone?: string | null
  } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement | null>(null)

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

  // 读取 Supabase 登录态
  useEffect(() => {
    let mounted = true
    let unsub: (() => void) | null = null
    try {
      const supabase: any = createClient()
      if (!supabase) {
        if (mounted) {
          setAuthUser(null)
          setAuthLoading(false)
        }
        return
      }
      // 初次拉取
      supabase.auth
        .getUser()
        .then((resp: { data: { user: any } | null }) => {
          if (!mounted) return
          const u = resp?.data?.user
          if (u) {
            setAuthUser({
              id: u.id,
              email: u.email ?? null,
              phone: u.phone ?? null,
            })
          } else {
            setAuthUser(null)
          }
          setAuthLoading(false)
        })
        .catch(() => {
          if (mounted) {
            setAuthUser(null)
            setAuthLoading(false)
          }
        })
      // 订阅 auth 变化（登录/登出/刷新）
      const sub = supabase.auth.onAuthStateChange(
        (_event: string, session: { user: any } | null) => {
          if (!mounted) return
          const u = session?.user
          if (u) {
            setAuthUser({
              id: u.id,
              email: u.email ?? null,
              phone: u.phone ?? null,
            })
          } else {
            setAuthUser(null)
          }
        }
      )
      unsub = () => sub?.data?.subscription?.unsubscribe?.()
    } catch (e) {
      // 容错降级
      if (mounted) {
        setAuthUser(null)
        setAuthLoading(false)
      }
    }
    return () => {
      mounted = false
      if (unsub) unsub()
    }
  }, [])

  // 点击头像外侧关闭 dropdown
  useEffect(() => {
    if (!avatarOpen) return
    const onClick = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [avatarOpen])

  /** 工作台点击：前置检查 + 拦截/放行 */
  const handleWorkspaceClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      e.preventDefault()
      if (checkWorkspaceAllowed()) {
        router.push('/workspace', { scroll: false })
      } else {
        setWorkspaceGuardOpen(true)
      }
    },
    [router]
  )

  /** 退出登录 */
  const handleSignOut = useCallback(async () => {
    setAvatarOpen(false)
    try {
      const supabase = createClient()
      if (supabase) {
        await supabase.auth.signOut()
      }
    } catch {
      // 静默降级
    }
    // 清理本地用户态
    setAuthUser(null)
    router.push('/auth/login', { scroll: false })
  }, [router])

  const isAuthenticated = !!authUser

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
            {/* 移动端：仅显示汉堡菜单 */}
            <MobileHamburgerMenu
              onWorkspaceClick={handleWorkspaceClick}
              isAuthenticated={isAuthenticated}
              authUser={authUser}
              onSignOut={handleSignOut}
            />

            {/* ════════ PC 端 · 登录态分支渲染 ════════ */}
            <div className="hidden md:flex items-center gap-3">
              {/* 🧠 智富思维 · 双引擎 OPC 心法（登录/未登录都显示） */}
              <Link
                href="/mindset"
                className="text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors flex items-center gap-1"
                data-testid="nav-mindset"
              >
                <Brain size={16} className="text-amber-500" />
                智富思维
              </Link>

              {!authLoading && isAuthenticated && (
                <>
                  {/* 🚀 我的工作台 + 呼吸灯角标（提醒有进展） */}
                  <button
                    type="button"
                    onClick={handleWorkspaceClick}
                    className="relative text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-1"
                    data-testid="workspace-link"
                  >
                    🚀 我的工作台
                    <span
                      className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.7)]"
                      aria-label="有新进展"
                      data-testid="workspace-pulse"
                    />
                  </button>

                  {/* 👤 头像 + hover/click 下拉菜单 */}
                  <div
                    ref={avatarRef}
                    className="relative"
                    data-testid="avatar-menu-wrapper"
                  >
                    <button
                      type="button"
                      onClick={() => setAvatarOpen((o) => !o)}
                      className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-1 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                      aria-label="用户菜单"
                      aria-expanded={avatarOpen}
                      data-testid="avatar-button"
                    >
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-extrabold flex items-center justify-center shadow-sm border border-white">
                        {getAvatarLabel(authUser)}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-slate-500 transition-transform ${
                          avatarOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* 下拉菜单 */}
                    {avatarOpen && (
                      <div
                        className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-50"
                        data-testid="avatar-dropdown"
                        role="menu"
                      >
                        {/* 用户信息 */}
                        <div className="px-3 py-2 border-b border-slate-100 mb-1">
                          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                            当前账号
                          </div>
                          <div className="text-xs font-bold text-slate-700 truncate mt-0.5">
                            {authUser?.email || authUser?.phone || 'OPC 会员'}
                          </div>
                        </div>

                        <Link
                          href="/member"
                          onClick={() => setAvatarOpen(false)}
                          className="block px-3 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 flex items-center gap-2"
                          data-testid="dropdown-member"
                        >
                          <UserCircle size={14} className="text-slate-500" />
                          个人中心
                        </Link>
                        <Link
                          href="/pricing"
                          onClick={() => setAvatarOpen(false)}
                          className="block px-3 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 flex items-center gap-2"
                          data-testid="dropdown-settings"
                        >
                          <Settings size={14} className="text-slate-500" />
                          订阅管理
                        </Link>

                        <div className="h-px bg-slate-200 my-1" />

                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="block w-full text-left px-3 py-2 hover:bg-rose-50 rounded-lg text-sm text-rose-600 flex items-center gap-2"
                          data-testid="dropdown-signout"
                        >
                          <LogOut size={14} />
                          退出登录
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!authLoading && !isAuthenticated && (
                <>
                  {/* 未登录态：登录（白色描边）+ 注册（蓝紫渐变实体） */}
                  <Link
                    href="/auth/login"
                    className="text-sm font-bold text-slate-700 bg-white border border-slate-300 px-3.5 py-1.5 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
                    data-testid="nav-login"
                  >
                    登录
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="text-sm font-extrabold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-3.5 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all"
                    data-testid="nav-signup"
                  >
                    注册
                  </Link>
                </>
              )}
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

      {/* ════════ 工作台前置拦截模态框 ════════ */}
      {workspaceGuardOpen && (
        <WorkspaceGuardModal
          onClose={() => setWorkspaceGuardOpen(false)}
          onGoDiagnosis={() => {
            setWorkspaceGuardOpen(false)
            router.push('/diagnosis', { scroll: false })
          }}
          onBypass={() => {
            setWorkspaceGuardOpen(false)
            router.push('/workspace?bypass=true', { scroll: false })
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
