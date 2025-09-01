import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('firebase-auth-token'); // Example cookie name

  // Allow requests for auth pages and static assets
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/')
  ) {
    return NextResponse.next();
  }

  // Redirect to login if no session token and trying to access a protected route
  // Note: This is a conceptual example. Real Firebase auth state should be
  // checked on the client-side, as server cookies are not the primary
  // method for session management in Firebase client SDK.
  // The client-side logic in page.tsx will handle the redirect.
  // This middleware is a placeholder for potential server-side checks.

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
