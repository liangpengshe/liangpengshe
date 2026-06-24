import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase 服务端客户端
 * - 当环境变量缺失或 SDK 初始化失败时，返回一个安全的 mock 客户端
 *   所有数据查询返回 { data: null, error: null }，避免上层 500
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const EMPTY = Object.freeze({ data: null, error: null, count: 0 })
const NO_USER = Object.freeze({ data: { user: null }, error: null })

// 链式查询对象：所有未知属性访问都返回 newChain()
function newChain(): any {
  const chain: any = {}
  const terminalMethods = ['single', 'maybeSingle']
  const chainMethods = [
    'select', 'eq', 'neq', 'in', 'order', 'limit', 'range',
    'gte', 'lte', 'gt', 'lt', 'like', 'ilike', 'match',
    'not', 'or', 'filter', 'update', 'delete', 'upsert', 'insert',
  ]
  for (const m of chainMethods) {
    chain[m] = () => newChain()
  }
  for (const m of terminalMethods) {
    chain[m] = () => Promise.resolve(EMPTY)
  }
  return chain
}

function newClient(): any {
  const client: any = {
    auth: {
      getUser: () => Promise.resolve(NO_USER),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  }
  // from/rpc/schema/functions 等都返回 chain
  for (const m of ['from', 'rpc', 'schema', 'functions', 'storage', 'realtime']) {
    client[m] = () => newChain()
  }
  return client
}

export async function createClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY ||
      SUPABASE_URL.includes('your_supabase') || SUPABASE_KEY.includes('your_supabase')) {
    return newClient()
  }

  try {
    const cookieStore = await cookies()
    return createServerClient(
      SUPABASE_URL,
      SUPABASE_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // ignore in Server Components
            }
          },
        },
      }
    )
  } catch {
    return newClient()
  }
}
