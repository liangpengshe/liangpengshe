'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Phone,
  KeyRound,
  Loader2,
  Sparkles,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 良朋社 OPC · 手机号验证码登录（极简版）
 *
 * 设计目标：
 *   - 单页完成"登录 + 注册"（未注册手机号自动创建账号）
 *   - 演示模式：验证码固定 6666
 *   - localStorage 存 { token, user, isLoggedIn, loginAt }，让 /member 等页面即时识别
 *   - 移动端优先：极简卡片 + 单一行动号召
 *
 * 流程：
 *   1. 输入 11 位手机号 → 点"获取验证码"（60s 倒计时）
 *   2. 输入 6666 → 点"登录 / 注册"
 *   3. /api/auth/mock-verify-code 校验 → 写 localStorage → 跳 /member
 */

const PHONE_REGEX = /^1[3-9]\d{9}$/

export default function PhoneLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get('redirectedFrom') || '/member'

  // ── 状态 ──
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [isLoadingCode, setIsLoadingCode] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 用于防抖 / 防重复点击
  const sendingRef = useRef(false)
  const loggingRef = useRef(false)
  const phoneInputRef = useRef<HTMLInputElement>(null)

  // ── 倒计时 useEffect ──
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // ── 进入页面：自动 focus 手机号输入框 + 回显上次手机号 ──
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem('opc_login_phone')
    if (saved) setPhone(saved)
    // 自动 focus（移动端键盘弹起）
    setTimeout(() => phoneInputRef.current?.focus(), 300)
  }, [])

  // ── 获取验证码 ──
  const handleSendCode = useCallback(async () => {
    if (sendingRef.current) return
    setError('')
    setSuccess('')

    const trimmed = phone.trim()
    if (!PHONE_REGEX.test(trimmed)) {
      setError('请输入正确的 11 位手机号')
      phoneInputRef.current?.focus()
      return
    }

    sendingRef.current = true
    setIsLoadingCode(true)
    try {
      const res = await fetch('/api/auth/mock-send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: trimmed }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) {
        setError(data?.error || '发送失败，请稍后重试')
        return
      }
      setSuccess(`验证码已发送（演示码：${data.demoCode || '6666'}）`)
      setCountdown(data.cooldownSec || 60)
      // 缓存手机号，下次自动回显
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('opc_login_phone', trimmed)
      }
    } catch (e: any) {
      setError('网络异常，请稍后重试')
    } finally {
      setIsLoadingCode(false)
      sendingRef.current = false
    }
  }, [phone])

  // ── 登录 / 注册 ──
  const handleLogin = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      if (loggingRef.current) return
      setError('')
      setSuccess('')

      const trimmedPhone = phone.trim()
      const trimmedCode = code.trim()

      if (!PHONE_REGEX.test(trimmedPhone)) {
        setError('请输入正确的 11 位手机号')
        return
      }
      if (!trimmedCode) {
        setError('请输入验证码')
        return
      }

      loggingRef.current = true
      setIsLoggingIn(true)
      try {
        const res = await fetch('/api/auth/mock-verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: trimmedPhone, code: trimmedCode }),
        })
        const data = await res.json()
        if (!res.ok || !data?.success) {
          setError(data?.error || '登录失败，请重试')
          return
        }

        // ✅ 写入 localStorage（其他页面通过该 key 识别登录态）
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('opc_token', data.token || '')
          window.localStorage.setItem('opc_user', JSON.stringify(data.user))
          window.localStorage.setItem('isLoggedIn', 'true')
          window.localStorage.setItem('loginAt', String(Date.now()))
          // 兼容旧版 key（与 ClientLayout 共享）
          window.localStorage.setItem('opc_device_id', data.user?.phone || trimmedPhone)
          // [关键] 派发自定义事件，让 ClientLayout 立即刷新 nav 状态（不等 storage 事件）
          window.dispatchEvent(new Event('opc:auth-changed'))
        }

        setSuccess(data.message || (data.isNewUser ? '注册成功' : '登录成功'))

        // 短暂展示成功提示 → 跳转
        setTimeout(() => {
          router.push(redirectedFrom)
          router.refresh()
        }, 400)
      } catch (e: any) {
        setError('网络异常，请稍后重试')
      } finally {
        setIsLoggingIn(false)
        loggingRef.current = false
      }
    },
    [phone, code, router, redirectedFrom]
  )

  // 倒计时文案
  const codeBtnLabel = countdown > 0 ? `${countdown}s 后重试` : isLoadingCode ? '发送中...' : '获取验证码'
  const codeBtnDisabled = countdown > 0 || isLoadingCode || !PHONE_REGEX.test(phone.trim())

  return (
    <div className="min-h-screen flex flex-col items-center justify-start md:justify-center bg-slate-50 px-4 py-8 md:py-12">
      {/* 顶部 Logo（移动端 + PC 共用） */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
          <Building2 size={20} />
        </div>
        <div>
          <div className="text-base font-extrabold text-slate-900 flex items-center gap-1">
            良朋社 OPC
            <Sparkles size={11} className="text-amber-500" />
          </div>
          <div className="text-[10px] text-slate-500 tracking-widest uppercase">
            AI Wealth Platform
          </div>
        </div>
      </div>

      {/* ═══════ 主卡片 ═══════ */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 md:p-8">
        {/* 标题 */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold tracking-widest uppercase mb-3">
            <Smartphone size={11} />
            PHONE LOGIN
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
            手机号登录 / 注册
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            未注册的手机号将自动创建账号
          </p>
        </div>

        {/* 提示条 */}
        {error && (
          <div
            className="mb-4 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs"
            data-testid="login-error"
          >
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div
            className="mb-4 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs"
            data-testid="login-success"
          >
            <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* 表单 */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          {/* 手机号 */}
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              手机号
            </label>
            <div className="relative">
              <Phone
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                ref={phoneInputRef}
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                value={phone}
                onChange={(e) => {
                  // 只允许数字
                  const v = e.target.value.replace(/\D/g, '').slice(0, 11)
                  setPhone(v)
                  if (error) setError('')
                }}
                placeholder="请输入手机号"
                autoComplete="tel"
                className="w-full pl-9 pr-3 h-12 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                data-testid="phone-input"
              />
            </div>
          </div>

          {/* 验证码 */}
          <div>
            <label
              htmlFor="code"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              验证码
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setCode(v)
                    if (error) setError('')
                  }}
                  placeholder="请输入验证码"
                  autoComplete="one-time-code"
                  className="w-full pl-9 pr-3 h-12 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  data-testid="code-input"
                />
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={codeBtnDisabled}
                className={cn(
                  'h-12 px-4 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all',
                  'flex items-center justify-center min-w-[110px]',
                  codeBtnDisabled
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 active:scale-[0.98]'
                )}
                data-testid="send-code-btn"
              >
                {isLoadingCode ? (
                  <>
                    <Loader2 size={12} className="animate-spin mr-1" />
                    发送中
                  </>
                ) : (
                  codeBtnLabel
                )}
              </button>
            </div>
            {/* 演示码提示（仅展示在 UI） */}
            <p className="mt-1.5 text-[10px] text-slate-400 flex items-center gap-1">
              <Sparkles size={9} className="text-amber-500" />
              演示码：<span className="font-extrabold text-amber-600">6666</span>（任意手机号均可登录）
            </p>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isLoggingIn || !phone || !code}
            className={cn(
              'w-full h-12 rounded-xl text-sm font-extrabold text-white transition-all',
              'bg-gradient-to-r from-blue-600 to-indigo-600',
              'hover:from-blue-700 hover:to-indigo-700',
              'disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed',
              'shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30',
              'flex items-center justify-center gap-2',
              'mt-1'
            )}
            data-testid="login-submit"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>登录中...</span>
              </>
            ) : (
              <>
                <span>登录 / 注册</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* 底部说明 */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <Shield size={10} />
          <span>演示模式 · 任意手机号 + 验证码 6666 即可登录</span>
        </div>
      </div>

      {/* 底部辅助链接 */}
      <p className="mt-6 text-xs text-slate-500 text-center max-w-md">
        登录即代表您同意良朋社 OPC 的{' '}
        <Link href="/about/terms" className="text-blue-600 hover:underline">
          用户协议
        </Link>{' '}
        和{' '}
        <Link href="/about/privacy" className="text-blue-600 hover:underline">
          隐私政策
        </Link>
      </p>
    </div>
  )
}
