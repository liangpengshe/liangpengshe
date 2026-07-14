'use client'

/**
 * 路由停留时长追踪 hook
 * ------------------------------------------------------------
 * - pathname 变化时自动重置计时
 * - 每秒返回累计停留秒数
 * - 卸载时清理 interval
 * ------------------------------------------------------------
 */

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function useDwellTime(): number {
  const pathname = usePathname()
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    setSeconds(0)
    const t = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(t)
  }, [pathname])

  return seconds
}
