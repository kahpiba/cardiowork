import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEMO_PERSONAS, COOKIE_NAME, isPathAllowed, DemoUser } from './lib/session';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(COOKIE_NAME);
  let activeUser: DemoUser | null = null;

  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(decodeURIComponent(sessionCookie.value));
      const matched = DEMO_PERSONAS.find(p => p.id === parsed.id || p.role === parsed.role);
      if (matched) {
        activeUser = matched;
      }
    } catch {
      // Cookie rusak / tidak valid
      activeUser = null;
    }
  }

  const pathname = request.nextUrl.pathname;

  // 1. Rute publik: Halaman beranda, login, access-denied, atau endpoints API
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/access-denied') ||
    pathname.startsWith('/api/');

  // Jika sudah login dan membuka halaman /login, alihkan ke defaultPath perannya
  if (activeUser && pathname.startsWith('/login')) {
    const returnUrl = request.nextUrl.searchParams.get('returnUrl');
    let target = activeUser.defaultPath;
    if (returnUrl && returnUrl !== '/login' && returnUrl !== '/access-denied') {
      if (isPathAllowed(activeUser.role, returnUrl)) {
        target = returnUrl;
      }
    }
    const url = request.nextUrl.clone();
    url.pathname = target;
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Jika belum login dan mengakses halaman yang dilindungi
  if (!activeUser && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('returnUrl', pathname);
    loginUrl.searchParams.set('reason', 'unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login, periksa apakah perannya diizinkan mengakses path ini
  if (activeUser && !isPublicRoute) {
    const isAllowed = isPathAllowed(activeUser.role, pathname);

    if (!isAllowed) {
      const deniedUrl = request.nextUrl.clone();
      deniedUrl.pathname = '/access-denied';
      deniedUrl.searchParams.set('role', activeUser.role);
      deniedUrl.searchParams.set('deniedPath', pathname);
      return NextResponse.redirect(deniedUrl);
    }
  }

  // Teruskan header identitas terverifikasi ke seluruh API & Server Component
  const requestHeaders = new Headers(request.headers);
  if (activeUser) {
    requestHeaders.set('x-user-id', activeUser.id);
    requestHeaders.set('x-user-role', activeUser.role);
    requestHeaders.set('x-user-name', activeUser.name);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - models/ (ONNX static models)
     */
    '/((?!_next/static|_next/image|favicon.ico|models).*)',
  ],
};
