import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth/session'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/menu',
    '/order-status',
    '/dashboard-xR7m9/login',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/me',
    '/dev/qr',
  ]
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Check if the route is a protected dashboard route
  if (path.startsWith('/dashboard-xR7m9')) {
    const token = request.cookies.get('qr-table-token')
    
    if (!token) {
      return NextResponse.redirect(new URL('/dashboard-xR7m9/login', request.url))
    }
    
    const user = await verifyToken(token.value)
    
    if (!user) {
      return NextResponse.redirect(new URL('/dashboard-xR7m9/login', request.url))
    }
    
    // Role-based access control
    const headers = new Headers(request.headers)
    headers.set('x-user-role', user.role)
    headers.set('x-user-id', user.id)
    headers.set('x-restaurant-id', user.restaurantId)
    
    // Check specific role permissions
    if (path.startsWith('/dashboard-xR7m9/cashier') && user.role === 'waiter') {
      return NextResponse.redirect(new URL('/dashboard-xR7m9/waiter', request.url))
    }
    
    if (path.startsWith('/dashboard-xR7m9/dashboard') && user.role !== 'admin') {
      if (user.role === 'cashier') {
        return NextResponse.redirect(new URL('/dashboard-xR7m9/cashier', request.url))
      } else if (user.role === 'waiter') {
        return NextResponse.redirect(new URL('/dashboard-xR7m9/waiter', request.url))
      }
    }
    
    return NextResponse.next({
      request: {
        headers,
      },
    })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}