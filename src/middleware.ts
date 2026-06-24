import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * 城市子域名路由 —— 路线图（暂未启用）
 * ------------------------------------------------------------
 * 目标：识别 host 中的城市前缀（wuhai.liangpengshe.com → 乌海分站）
 * 启用前需先就位：
 *   1) DNS：泛解析 *.liangpengshe.com → Vercel
 *   2) SSL：Vercel 自动签发 wildcard 证书
 *   3) 部署：next.config 开启多租户
 *   4) Cookie：调整 SameSite/Scope，避免分站共享
 *   5) 中间件：用 Prisma 查 City 表，注入 x-lps-city-code 头
 *      const sub = request.headers.get('host')?.split('.')[0]
 *      if (sub && sub !== 'www' && sub !== 'liangpengshe') {
 *        // ... prisma.city.findUnique({ where: { code: sub }})
 *        // ... 注入 request.headers.set('x-lps-city-code', sub)
 *      }
 * 当前 MVP 用 /city/[code] 路径路由代替，详见 src/app/city/[code]/page.tsx
 * ------------------------------------------------------------
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/console')) {
    // Supabase 未配置时跳过中间件鉴权（页面层会自行处理）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
      return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              supabaseResponse.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.nextUrl.origin))
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'CITY_MAINTAINER' && userData?.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', request.nextUrl.origin))
    }

    return supabaseResponse
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/console/:path*'],
}