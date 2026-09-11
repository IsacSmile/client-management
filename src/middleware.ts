import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretString = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(
  secretString || 'default_dev_secret_key_change_in_env_32chars'
);

const COOKIE_NAME = 'client_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude static assets, next internal routes, and login api
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch (err) {
      isAuthenticated = false;
    }
  }

  // Redirect root path to /dashboard if logged in, else /login
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and trying to access /login
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
