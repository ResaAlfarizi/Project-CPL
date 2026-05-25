import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/unauthorized'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If trying to access protected route without token, redirect to login
  if (!isPublicRoute && !token && pathname !== '/') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access login/register with valid token, redirect based on role
  if (isPublicRoute && token && pathname !== '/unauthorized') {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const role = payload.role?.toLowerCase();
        
        // Redirect based on role
        if (role === 'superadmin') {
          return NextResponse.redirect(new URL('/superadmin', request.url));
        } else if (role === 'dosen') {
          return NextResponse.redirect(new URL('/dosen', request.url));
        } else if (role === 'admin' || role === 'admin_prodi') {
          return NextResponse.redirect(new URL('/admin', request.url));
        } else if (role === 'mahasiswa') {
          return NextResponse.redirect(new URL('/mahasiswa', request.url));
        }
      }
    } catch (error) {
      // If decode fails, just redirect to /dosen as default
      return NextResponse.redirect(new URL('/dosen', request.url));
    }
    // Fallback to /dosen
    return NextResponse.redirect(new URL('/dosen', request.url));
  }

  // Validate token format (basic check)
  if (token && !isPublicRoute) {
    try {
      // Check if token has 3 parts (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        // Invalid token format, clear and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
      }

      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        // Token expired, clear and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
      }
    } catch (error) {
      // Invalid token, clear and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
