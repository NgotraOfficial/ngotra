import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ngotra-secret-key-change-in-production-2024'
)

const protectedRoutes = ['/dashboard', '/tickets']

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    try {
      const { payload } = await jwtVerify(token, SECRET)
      if ((payload as { role: string }).role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  if (protectedRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    try {
      await jwtVerify(token, SECRET)
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard', '/dashboard/:path*', '/tickets/new/:path*', '/tickets/:id/:path*'],
}
