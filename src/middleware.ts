import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/console')) {
    const session = await fetch(`${request.nextUrl.origin}/api/auth/session`).then(res => res.json())
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/login', request.nextUrl.origin))
    }

    const user = await fetch(`${request.nextUrl.origin}/api/user`, {
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
    }).then(res => res.json())

    if (user.role !== 'CITY_MAINTAINER' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', request.nextUrl.origin))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/console/:path*'],
}