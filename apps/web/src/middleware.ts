import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEMO_PERSONAS, COOKIE_NAME, getDefaultPersona } from './lib/session';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(COOKIE_NAME);
  let activeUser = getDefaultPersona();

  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(decodeURIComponent(sessionCookie.value));
      const matched = DEMO_PERSONAS.find(p => p.id === parsed.id || p.role === parsed.role);
      if (matched) activeUser = matched;
    } catch {
      // Fallback default
    }
  }

  // Teruskan header identitas terverifikasi ke seluruh API & Server Component
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', activeUser.id);
  requestHeaders.set('x-user-role', activeUser.role);
  requestHeaders.set('x-user-name', activeUser.name);

  // Proteksi rute berbasis role (RBAC)
  const pathname = request.nextUrl.pathname;

  // Jika pekerja mencoba membuka analitik agregat populasi K3, berikan pembatasan
  if (activeUser.role === 'WORKER' && pathname.startsWith('/population')) {
    const url = request.nextUrl.clone();
    url.pathname = '/worker/W-00192';
    url.searchParams.set('restricted', 'population_k3_only');
    return NextResponse.redirect(url);
  }

  // Jika Petugas K3 mencoba membuka rute upload klinis, arahkan ke populasi
  if (activeUser.role === 'HSSE_OFFICER' && pathname.startsWith('/upload')) {
    const url = request.nextUrl.clone();
    url.pathname = '/population';
    url.searchParams.set('restricted', 'upload_paramedic_only');
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Jika cookie belum ada, set cookie default
  if (!sessionCookie) {
    response.cookies.set({
      name: COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(activeUser)),
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 hari
    });
  }

  return response;
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
