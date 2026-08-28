import { NextResponse, type NextRequest } from 'next/server'
import { verifySessionCookie } from '@/lib/session'

// Gates logged-in-only routes (checkout, orders, account, admin). Next.js 16
// renamed `middleware.ts` to `proxy.ts` and it defaults to the Node.js
// runtime, so the same session-cookie verification used in Server
// Components/Actions works here too (see src/lib/session.ts).
export function proxy(request: NextRequest) {
  const protectedPrefixes = ['/checkout', '/orders', '/account', '/admin']
  const isProtected = protectedPrefixes.some((p) => request.nextUrl.pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const raw = request.cookies.get('session')?.value
  const profileId = raw ? verifySessionCookie(raw) : null

  if (!profileId) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/checkout/:path*', '/orders/:path*', '/account/:path*', '/admin/:path*'],
}
