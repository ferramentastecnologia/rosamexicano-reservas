/**
 * Headers de Segurança
 *
 * Implementa:
 * - CORS configurável
 * - Security Headers (CSP, X-Frame-Options, etc)
 * - HSTS
 * - Prevenção de MIME sniffing
 */

import { NextResponse, NextRequest } from 'next/server';

// ============================================
// CONFIGURAÇÃO
// ============================================

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://rosamexicano.com',
  'https://rosamexicano-reservas.netlify.app',
];

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-User-Id',
  'X-User-Email',
  'X-User-Role',
  'X-Request-Id',
];

const MAX_AGE = 86400; // 24 horas em segundos

// ============================================
// CORS HANDLER
// ============================================

/**
 * Função para adicionar headers CORS
 */
export function addCorsHeaders(response: NextResponse, origin?: string): NextResponse {
  // Verificar se origem é permitida
  const isOriginAllowed = !origin || ALLOWED_ORIGINS.includes(origin);

  if (isOriginAllowed && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
  response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '));
  response.headers.set('Access-Control-Max-Age', MAX_AGE.toString());
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}

/**
 * Handler para requisições OPTIONS (preflight)
 */
export function handleCorsPreFlight(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response, origin);
}

/**
 * Middleware para aplicar CORS
 */
export function withCors(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Lidar com preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreFlight(request);
    }

    // Executar handler e adicionar headers CORS
    let response = await handler(request);
    const origin = request.headers.get('origin');
    response = addCorsHeaders(response, origin || undefined);

    return response;
  };
}

// ============================================
// SECURITY HEADERS
// ============================================

/**
 * Content Security Policy
 * Previne XSS, clickjacking, etc
 */
const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net", // Permitir scripts locais e de CDN confiável
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Permitir estilos locais e Google Fonts
  "font-src 'self' https://fonts.gstatic.com", // Permitir fontes do Google
  "img-src 'self' data: https:",
  "connect-src 'self' https://api.asaas.com", // API de pagamento
  "frame-ancestors 'none'", // Previne clickjacking
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/**
 * Headers de segurança padrão
 */
export const SECURITY_HEADERS = {
  // Prevenção de clickjacking
  'X-Frame-Options': 'DENY',

  // Prevenção de MIME sniffing
  'X-Content-Type-Options': 'nosniff',

  // XSS Protection (antigo, mas ainda útil)
  'X-XSS-Protection': '1; mode=block',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Feature Policy / Permissions Policy
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=(self "https://api.asaas.com")',
  ].join(', '),

  // HSTS (HTTPS only) - Comentado para desenvolvimento
  // 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Content Security Policy
  'Content-Security-Policy': CSP_HEADER,

  // Prevenção de informações sensíveis em referrer
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
};

/**
 * Adicionar security headers a uma resposta
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Adicionar HSTS apenas em produção
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Store em memória (usar Redis em produção)
const rateLimitStore: RateLimitStore = {};

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requisições por minuto

/**
 * Função para verificar rate limit
 */
export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore[identifier];

  // Se não existe registro, criar novo
  if (!record) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  // Se janela expirou, resetar
  if (now > record.resetTime) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  // Incrementar contador
  record.count++;

  // Verificar se ultrapassou limite
  const allowed = record.count <= RATE_LIMIT_MAX_REQUESTS;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count);

  return { allowed, remaining };
}

/**
 * Middleware para rate limiting
 */
export function withRateLimit(identifier: string) {
  return (response: NextResponse): NextResponse => {
    const { allowed, remaining } = checkRateLimit(identifier);

    // Adicionar headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());

    // Se excedeu limite, retornar erro
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            message: 'Muitas requisições. Tente novamente mais tarde.',
            code: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
          },
        }),
        {
          status: 429,
          headers: response.headers,
        }
      );
    }

    return response;
  };
}

// ============================================
// REQUEST ID
// ============================================

/**
 * Adicionar Request-ID a resposta
 */
export function addRequestId(response: NextResponse, requestId: string): NextResponse {
  response.headers.set('X-Request-Id', requestId);
  return response;
}

// ============================================
// COMPOSIÇÃO DE MIDDLEWARES
// ============================================

/**
 * Aplicar todos os headers de segurança a uma resposta
 */
export function applySecurityMiddleware(response: NextResponse, requestId: string): NextResponse {
  response = addSecurityHeaders(response);
  response = addRequestId(response, requestId);
  return response;
}

// ============================================
// VALIDAÇÃO DE ORIGEM
// ============================================

/**
 * Verificar se origem é permitida
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Middleware para validar origem
 */
export function withOriginValidation(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const origin = request.headers.get('origin');

    if (origin && !isOriginAllowed(origin)) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            message: 'Origem não autorizada',
            code: 'FORBIDDEN_ORIGIN',
            statusCode: 403,
          },
        }),
        { status: 403 }
      );
    }

    return handler(request);
  };
}

// ============================================
// SANITIZAÇÃO DE RESPOSTA
// ============================================

/**
 * Remover headers sensíveis da resposta
 */
export function sanitizeResponseHeaders(response: NextResponse): NextResponse {
  // Remover headers que expõem informações do servidor
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');
  response.headers.delete('X-AspNet-Version');

  return response;
}

// ============================================
// CONFIGURAÇÃO DE AMBIENTE
// ============================================

/**
 * Validar que CORS está configurado corretamente
 */
export function validateSecurityConfig(): void {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.ALLOWED_ORIGINS) {
      console.warn('⚠️ ALLOWED_ORIGINS não configurado em produção');
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET não configurado');
      process.exit(1);
    }
  }
}

// Executar validação
if (typeof window === 'undefined') {
  // Apenas no servidor
  validateSecurityConfig();
}
