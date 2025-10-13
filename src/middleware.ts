import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user is trying to access admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Check for admin authentication in cookies
    const adminAuth = request.cookies.get('adminAuth')?.value;
    
    if (!adminAuth || adminAuth !== 'true') {
      // Redirect to admin login if not authenticated
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
