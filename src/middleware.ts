import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const isAuthenticated = !!session;
  
  const publicRoutes = ['/login', '/register'];
  
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Permite acesso aos arquivos do AdSense e bots
  const isAdSense = request.nextUrl.pathname === '/ads.txt' || request.nextUrl.pathname === '/robots.txt';
  const userAgent = request.headers.get('user-agent') || '';
  const isGoogleBot = userAgent.includes('Googlebot') || userAgent.includes('AdsBot-Google');

  if (isAdSense || isGoogleBot) {
    return NextResponse.next();
  }

  // Se não estiver autenticado e tentar acessar rota protegida
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se estiver autenticado e tentar acessar login ou registro
  if (isAuthenticated && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, jpg, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
