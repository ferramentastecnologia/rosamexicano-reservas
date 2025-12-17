/**
 * Middleware de Autenticação para Next.js
 *
 * Valida JWT tokens em requisições para rotas protegidas
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader, AuthToken } from './lib/auth-utils';

// Rotas que requerem autenticação
const PROTECTED_ROUTES = ['/api/admin', '/admin'];

// Rotas públicas (sem autenticação)
const PUBLIC_ROUTES = ['/api/admin/auth', '/'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verificar se é rota protegida
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route);

  // Se é rota pública, deixar passar
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Se é rota protegida, validar token
  if (isProtectedRoute) {
    const authHeader = request.headers.get('authorization') || undefined;

    try {
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Token ausente' },
          { status: 401 }
        );
      }

      // Validar token
      const decoded = verifyAccessToken(token) as AuthToken;

      // Adicionar dados do usuário ao request
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.userId);
      requestHeaders.set('x-user-email', decoded.email);
      requestHeaders.set('x-user-role', decoded.role);
      requestHeaders.set('x-user-permissions', JSON.stringify(decoded.permissions));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro de autenticação';
      return NextResponse.json(
        { success: false, error: message },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// Configurar rotas monitoradas pelo middleware
export const config = {
  matcher: ['/api/admin/:path*', '/admin/:path*'],
};
