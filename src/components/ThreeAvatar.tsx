'use client'

/**
 * 数字人形象组件（2D CSS 动画版）
 * --------------------------------------------------
 * 设计要点：
 * 1. 移动端（< 768px）直接返回 null，避免在低端机上加载图片/CSS 动画导致卡顿
 * 2. 通过 useEffect 监听 window.innerWidth，并在挂载后才设置 state
 *    （🛡️ SSR 安全：渲染期间不读 window，避免 hydration mismatch）
 * 3. PC 端渲染带光晕、装饰光带、旋转光圈、浮动徽章的完整形象
 * 4. 命名沿用 ThreeAvatar，便于后续升级到真正的 3D 模型
 *    （届时只需把内部 <Image> 替换为 <Canvas>，外层签名不变）
 * --------------------------------------------------
 */

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface ThreeAvatarProps {
  /** 数字人图片路径 */
  src?: string
  /** 图片描述（无障碍） */
  alt?: string
  /** 移动端断点（默认 768px） */
  mobileBreakpoint?: number
}

export default function ThreeAvatar({
  src = '/images/liangliang.png',
  alt = '良良 - 良朋社 AI 数字助手',
  mobileBreakpoint = 768,
}: ThreeAvatarProps) {
  // SSR 期间统一为 true（PC 默认），挂载后再根据实际视口修正
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= mobileBreakpoint)
    }
    // 挂载时立即同步一次真实视口
    checkViewport()
    // 监听视口变化（横竖屏切换、外接显示器）
    window.addEventListener('resize', checkViewport)
    return () => window.removeEventListener('resize', checkViewport)
  }, [mobileBreakpoint])

  // 移动端：直接返回 null，避免加载图片 + CSS 动画
  if (!isDesktop) return null

  return (
    <div className="relative w-full aspect-square max-w-md">
      {/* 光晕背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/25 to-pink-500/20 rounded-3xl blur-2xl" />

      {/* 装饰光带 */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div
          className="absolute left-0 right-0 h-24 -translate-y-2 animate-pulse"
          style={{
            top: '58%',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0) 5%, rgba(168,85,247,0.55) 30%, rgba(236,72,153,0.7) 50%, rgba(99,102,241,0.55) 70%, rgba(168,85,247,0) 95%, transparent 100%)',
            filter: 'blur(8px)',
            mixBlendMode: 'screen',
          }}
        />
        <div
          className="absolute left-0 right-0 h-3 -translate-y-2 animate-pulse"
          style={{
            top: '58%',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 10%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 90%, transparent 100%)',
            filter: 'blur(3px)',
            animationDelay: '0.6s',
            mixBlendMode: 'screen',
          }}
        />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/40 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)',
            animationDelay: '1.2s',
          }}
        />
      </div>

      {/* 数字人图片（CSS 浮动） */}
      <div className="relative w-full h-full animate-float">
        <Image
          src={src}
          alt={alt}
          width={400}
          height={400}
          priority
          quality={95}
          className="relative w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(168,85,247,0.35)]"
        />
      </div>

      {/* 旋转光圈 */}
      <div className="absolute -inset-4 border-2 border-blue-400/30 rounded-3xl animate-spin-slow pointer-events-none" />
      <div className="absolute -inset-8 border border-purple-400/20 rounded-3xl animate-spin-reverse pointer-events-none" />

      {/* 浮动徽章 */}
      <div className="absolute top-8 -right-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-xs text-white shadow-lg">
        ✨ AI 智富助理
      </div>
      <div className="absolute bottom-12 -left-2 bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-md rounded-full px-3 py-1.5 text-xs text-white shadow-lg">
        🎯 一人公司 × 智富引擎
      </div>
    </div>
  )
}
