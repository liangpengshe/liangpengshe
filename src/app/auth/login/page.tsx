'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  AlertCircle,
  CheckCircle2,
  Compass,
  Crown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

/**
 * 良朋社 OPC · 登录页
 *
 * 设计语言（遵循 user_profile.md）：
 *   - Tech Blue 主题（蓝→靛→紫渐变）
 *   - 浅灰背景（slate-50）+ 白色卡片
 *   - 金色点缀（amber-500）
 *   - 移动端优先：移动单列 / PC 左品牌 + 右表单 1:1 布局
 *
 * 登录能力：
 *   - 邮箱 + 密码（Supabase signInWithPassword）
 *   - 记住我（持久化到 localStorage）
 *   - 演示账号一键填充
 *   - 忘记密码（占位按钮）
 *   - 社交登录（Google / WeChat / GitHub 占位）
 *
 * 角色分流（与 src/lib/auth 保持一致）：
 *   - CITY_MAINTAINER / SUPER_ADMIN → /console
 *   - 其他 → /（首页）
 */
export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get('redirectedFrom') || ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // 读取"记住我"邮箱
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem('opc_remember_email')
    if (saved) {
      setEmail(saved)
      setRemember(true)
    }
    // 注册成功回跳
    if (searchParams.get('registered') === '1') {
      setSuccess('注册成功，请使用刚注册的账号登录')
    }
  }, [searchParams])

  /**
   * 提交登录
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('请输入邮箱和密码')
      return
    }
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        // 中文友好错误映射
        if (signInError.message.includes('Invalid login credentials')) {
          setError('邮箱或密码错误，请重试')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('邮箱尚未验证，请先到邮箱中点击确认链接')
        } else if (signInError.message.includes('Too many requests')) {
          setError('登录尝试过于频繁，请稍后再试')
        } else {
          setError(signInError.message)
        }
        setLoading(false)
        return
      }

      // 记住我
      if (remember && typeof window !== 'undefined') {
        window.localStorage.setItem('opc_remember_email', email.trim())
      } else if (typeof window !== 'undefined') {
        window.localStorage.removeItem('opc_remember_email')
      }

      // 角色分流
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('email', email.trim())
        .single()

      const role = userData?.role || 'MEMBER'
      const dest =
        redirectedFrom ||
        (role === 'CITY_MAINTAINER' || role === 'SUPER_ADMIN' ? '/console' : '/')

      router.push(dest)
      router.refresh()
    } catch (err) {
      console.error('[Login] submit error:', err)
      setError('登录失败，请稍后重试')
      setLoading(false)
    }
  }

  /**
   * 演示账号一键填充
   */
  const handleDemoFill = () => {
    setEmail('demo@liangpengshe.com')
    setPassword('demo123456')
    setError('')
    setSuccess('')
  }

  /**
   * 社交登录（占位 · 后续接入 Supabase OAuth）
   */
  const handleSocialLogin = (provider: 'google' | 'wechat' | 'github') => {
    setError(`${provider} 登录功能开发中，敬请期待`)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* ════════════════ 左侧：品牌区（PC 显示）════════════════ */}
      <aside className="hidden md:flex md:w-1/2 lg:w-[55%] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-10 lg:p-16 flex-col justify-between relative overflow-hidden">
        {/* 装饰光斑 */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl" />

        {/* 顶部：Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl shadow-lg">
            🏢
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-tight">良朋社 OPC</div>
            <div className="text-[10px] text-white/70 tracking-widest uppercase">
              AI Wealth Platform
            </div>
          </div>
        </div>

        {/* 中部：价值主张 */}
        <div className="relative space-y-8 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-amber-400/20 backdrop-blur-sm border border-amber-300/30 text-amber-100 text-xs font-bold">
            <Crown size={12} />
            <span>个人创业者的 AI 智富平台</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight">
            登录，开启你的
            <br />
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              OPC 智富之旅
            </span>
          </h1>

          <p className="text-sm lg:text-base text-white/80 leading-relaxed">
            从诊断到跑通首单，从单兵作战到城市主理人。AI四库全胜系统 + OPC 创业路径，让每个人都能成为自己事业的主理人。
          </p>

          <ul className="space-y-3">
            {[
              { icon: Compass, label: 'AI 商业 IP 诊断 · 个性化路径' },
              { icon: Sparkles, label: 'AI四库全胜系统 · 工具/项目/服务/资源' },
              { icon: Globe, label: '7 城主理人生态 · 全国联运' },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-white/90">
                <span className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <item.icon size={14} />
                </span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 底部：数据证明 */}
        <div className="relative grid grid-cols-3 gap-4 max-w-md">
          {[
            { v: '300+', l: '已赋能企业' },
            { v: '500+', l: '服务主理人' },
            { v: '50+', l: '举办沙龙' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl lg:text-3xl font-extrabold text-amber-300">{s.v}</div>
              <div className="text-[11px] text-white/70 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* ════════════════ 右侧：表单区 ═══════════════ */}
      <main className="flex-1 md:w-1/2 lg:w-[45%] flex items-center justify-center p-5 md:p-10 lg:p-16">
        <div className="w-full max-w-md">
          {/* 移动端 Logo（PC 端隐藏在左侧） */}
          <div className="md:hidden flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-md">
              🏢
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900">良朋社 OPC</div>
              <div className="text-[10px] text-slate-500 tracking-widest uppercase">
                AI Wealth Platform
              </div>
            </div>
          </div>

          {/* 标题 */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              欢迎回来 👋
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              登录你的账号，继续你的 OPC 智富之路
            </p>
          </div>

          {/* 社交登录 */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { id: 'google' as const, label: 'Google', emoji: '🔵' },
              { id: 'wechat' as const, label: '微信', emoji: '💚' },
              { id: 'github' as const, label: 'GitHub', emoji: '⚫' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSocialLogin(s.id)}
                disabled={loading}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
              >
                <span className="text-lg leading-none">{s.emoji}</span>
                <span className="text-[10px] font-semibold text-slate-600">{s.label}</span>
              </button>
            ))}
          </div>

          {/* 分隔线 */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-3 bg-slate-50 text-slate-400 font-semibold tracking-widest uppercase">
                或使用邮箱
              </span>
            </div>
          </div>

          {/* 成功提示（注册成功回跳） */}
          {success && (
            <div className="mb-4 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
              <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* 邮箱 */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                邮箱地址
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                  className="w-full pl-9 pr-3 h-11 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-bold text-slate-700">
                  密码
                </label>
                <button
                  type="button"
                  onClick={() => setError('忘记密码功能开发中，请联系管理员重置')}
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  忘记密码？
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-10 h-11 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* 记住我 + 演示账号 */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-600">记住我</span>
              </label>
              <button
                type="button"
                onClick={handleDemoFill}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:text-amber-700"
                title="一键填充演示账号"
              >
                <Zap size={10} />
                演示账号
              </button>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full h-11 mt-1 rounded-xl font-bold text-sm text-white transition-all',
                'bg-gradient-to-r from-blue-600 to-indigo-600',
                'hover:from-blue-700 hover:to-indigo-700',
                'disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed',
                'shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30',
                'flex items-center justify-center gap-2'
              )}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>登录中...</span>
                </>
              ) : (
                <>
                  <span>立即登录</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* 注册引导 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              还没有账号？{' '}
              <Link
                href="/auth/signup"
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                立即注册
              </Link>
            </p>
          </div>

          {/* 安全标识 */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <Shield size={10} />
            <span>由 Supabase 加密保护 · 端到端 TLS</span>
          </div>
        </div>
      </main>
    </div>
  )
}
