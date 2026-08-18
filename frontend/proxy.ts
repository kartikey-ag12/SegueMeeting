import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from './lib/constants';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Get the session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const isAuthenticated = !!sessionCookie?.value;

  // If user is not authenticated and trying to access a private route
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and trying to access login/register
  if (isAuthenticated && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
    if (request.nextUrl.searchParams.has('clear')) {
      const response = NextResponse.next();
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }
    return NextResponse.redirect(new URL('/meetings', request.url));
  }


  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, favicon.ico
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
