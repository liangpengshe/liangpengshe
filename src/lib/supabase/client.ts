import { createBrowserClient } from '@supabase/ssr'

/**
 * 浏览器端 Supabase 客户端（带容错）
 *
 * - 当 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 缺失时
 *   返回 null（不再 throw），让调用方在 useEffect 里走匿名访客分支
 * - 这样在测试环境 / 部署初期 / env 文件未配置时，
 *   依赖该客户端的页面（如 /member）仍可正常渲染
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 🛡️ 凭证缺失：返回 null，让调用方处理降级
  // 不在 console 抛警告（生产环境噪声），仅 dev 模式且首次记录
  if (!url || !anonKey) {
    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development' &&
      !(window as any).__supabase_warned
    ) {
      console.info(
        '[Supabase] 环境变量未配置，相关页面以匿名访客模式运行（仅 dev 提示一次）'
      )
      ;(window as any).__supabase_warned = true
    }
    return null as any
  }

  return createBrowserClient(url, anonKey)
}