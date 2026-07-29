'use client'

/**
 * 移动端汉堡菜单
 * ------------------------------------------------------------
 * 进化项 2.2：
 *   - 屏幕宽度 < 768px 时显示
 *   - 点击 ≡ 弹出全屏抽屉式菜单
 *   - 包含：智富思维（始终）/ 工作台（登录态）/ 登录+注册 或 头像菜单
 *   - 流畅动画（framer-motion）
 *   - 点击菜单项自动关闭
 * ------------------------------------------------------------
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Menu,
  X,
  Rocket,
  LogIn,
  UserPlus,
  ArrowRight,
  Sparkles,
  UserCircle,
  Brain,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

interface AuthUser {
  id: string
  email?: string | null
  phone?: string | null
}

interface Props {
  /** 工作台点击：是否需要前置检查 */
  onWorkspaceClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void
  /** 是否已登录 */
  isAuthenticated?: boolean
  /** 当前登录用户 */
  authUser?: AuthUser | null
  /** 退出登录回调 */
  onSignOut?: () => void
}

interface MenuItem {
  href: string
  label: string
  icon: any
  highlight?: boolean
  isWorkspace?: boolean
  requireAuth?: boolean
}

const GUEST_ITEMS: MenuItem[] = [
  { href: '/mindset', label: '智富思维', icon: Brain, highlight: true },
]

const AUTH_ITEMS: MenuItem[] = [
  { href: '/mindset', label: '智富思维', icon: Brain },
  { href: '/workspace', label: '我的工作台', icon: Rocket, highlight: true, isWorkspace: true },
  { href: '/member', label: '个人中心', icon: UserCircle },
]

/** 头像首字符 */
function getAvatarLabel(user: AuthUser | null | undefined): string {
  if (!user) return 'U'
  const raw = (user.email || user.phone || '').trim()
  if (!raw) return 'U'
  return (raw.split('@')[0] || raw).charAt(0).toUpperCase()
}

export default function MobileHamburgerMenu({
  onWorkspaceClick,
  isAuthenticated = false,
  authUser = null,
  onSignOut,
}: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // 路由变化时自动关闭
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // 打开时锁定 body 滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleWorkspace = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    setOpen(false)
    onWorkspaceClick?.(e)
  }

  const handleSignOut = () => {
    setOpen(false)
    onSignOut?.()
  }

  const menuItems = isAuthenticated ? AUTH_ITEMS : GUEST_ITEMS

  return (
    <>
      {/* 汉堡按钮（仅移动端） */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="打开菜单"
        className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
        data-testid="hamburger-trigger"
      >
        <Menu size={22} />
      </button>

      {/* 全屏抽屉 */}
      <AnimatePresence>
        {open && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm md:hidden"
            />

            {/* 抽屉内容 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-[81] w-[85vw] max-w-sm bg-white shadow-2xl md:hidden flex flex-col"
            >
              {/* 顶部 Header：登录态显示头像 + 邮箱；未登录态显示品牌 */}
              <div className="relative px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                {isAuthenticated ? (
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-extrabold flex items-center justify-center shadow-sm border-2 border-white"
                      data-testid="mobile-avatar"
                    >
                      {getAvatarLabel(authUser)}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase flex items-center gap-1">
                        <ShieldCheck size={10} className="text-emerald-500" />
                        已登录
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {authUser?.email || authUser?.phone || 'OPC 会员'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm">
                      智
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                        良朋社
                        <Sparkles size={10} className="text-amber-500" />
                      </div>
                      <div className="text-[9px] text-slate-500 tracking-wider uppercase">
                        OPC 智富系统
                      </div>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="关闭菜单"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white/80 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 导航列表 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  if (item.isWorkspace) {
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={handleWorkspace}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                        data-testid={`mobile-${item.href.replace(/\//g, '-')}`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold flex items-center gap-1">
                            {item.label}
                            {item.highlight && (
                              <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                                热门
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            解锁后享受 AI 个性化工作台
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-400" />
                      </button>
                    )
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      data-testid={`mobile-${item.href.replace(/\//g, '-')}`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <span className="text-sm font-bold flex-1">{item.label}</span>
                      <ArrowRight size={14} className="text-slate-400" />
                    </Link>
                  )
                })}

                {/* 已登录态：菜单列表内追加"订阅管理"快捷入口 */}
                {isAuthenticated && (
                  <Link
                    href="/pricing"
                    onClick={() => setOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      pathname === '/pricing'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    data-testid="mobile-pricing"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        pathname === '/pricing'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Settings size={18} />
                    </div>
                    <span className="text-sm font-bold flex-1">订阅管理</span>
                    <ArrowRight size={14} className="text-slate-400" />
                  </Link>
                )}
              </div>

              {/* 底部操作区：根据登录态切换 */}
              <div className="border-t border-slate-100 p-4 space-y-2 bg-slate-50/50">
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setOpen(false)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                      data-testid="mobile-login"
                    >
                      <LogIn size={16} />
                      登录
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setOpen(false)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-extrabold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md hover:shadow-lg transition-all"
                      data-testid="mobile-signup"
                    >
                      <UserPlus size={16} />
                      注册 OPC 会员
                    </Link>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-extrabold text-rose-600 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors"
                    data-testid="mobile-signout"
                  >
                    <LogOut size={16} />
                    退出登录
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
