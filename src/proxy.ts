import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export default async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname.startsWith('/login');
  
  if (!token) {
    if (!isAuthRoute && (pathname.startsWith('/admin') || pathname.startsWith('/ess'))) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // Jika user sudah login tapi mencoba ke halaman login
  if (isAuthRoute) {
    if (token.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', req.url));
    } else {
      return NextResponse.redirect(new URL('/ess', req.url));
    }
  }

  // Proteksi berdasarkan Role
  if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/ess', req.url));
  }

  if (pathname.startsWith('/ess') && token.role !== 'EMPLOYEE') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/ess/:path*', '/login'],
};
