import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * Middleware Global
 * Aplica rate limiting e headers de segurança
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Rate Limiting
  const identifier = getClientIdentifier(request);
  const pathname = request.nextUrl.pathname;

  // Determinar tipo de rate limit baseado na rota
  let rateLimitConfig = RATE_LIMITS.PUBLIC;

  if (pathname.startsWith('/api/auth')) {
    // Rotas de autenticação: NextAuth faz múltiplas requisições
    rateLimitConfig = { interval: 60 * 1000, maxRequests: 30 }; // 30 req/min
  } else if (pathname.startsWith('/api/usuarios/cadastro')) {
    // Cadastro: muito restritivo
    rateLimitConfig = { interval: 60 * 60 * 1000, maxRequests: 3 }; // 3 req/hora
  } else if (pathname.startsWith('/api/') && request.method !== 'GET') {
    // APIs de escrita: restritivo
    rateLimitConfig = RATE_LIMITS.WRITE;
  } else if (pathname.startsWith('/api/')) {
    // APIs de leitura: menos restritivo
    rateLimitConfig = RATE_LIMITS.READ;
  }

  const limit = rateLimit(identifier, rateLimitConfig);

  if (!limit.success) {
    return NextResponse.json(
      {
        erro: 'Muitas requisições. Tente novamente mais tarde.',
        retryAfter: Math.ceil(limit.reset / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(limit.reset / 1000)),
          'X-RateLimit-Limit': String(limit.limit),
          'X-RateLimit-Remaining': String(limit.remaining),
          'X-RateLimit-Reset': String(limit.reset),
        },
      }
    );
  }

  // Adicionar headers de rate limit na resposta
  response.headers.set('X-RateLimit-Limit', String(limit.limit));
  response.headers.set('X-RateLimit-Remaining', String(limit.remaining));
  response.headers.set('X-RateLimit-Reset', String(limit.reset));

  // 2. Headers de Segurança
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js precisa de unsafe-eval
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
};
