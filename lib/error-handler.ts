/**
 * Tratamento Centralizado de Erros
 *
 * Fornece:
 * - Tipos customizados de erro
 * - Formatação consistente de erros
 * - Logging estruturado
 * - HTTP status mapping
 */

import { NextResponse } from 'next/server';

// ============================================
// TIPOS DE ERRO CUSTOMIZADOS
// ============================================

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Falha na autenticação') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Recurso já existe') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Muitas requisições') {
    super(message, 429, 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Erro interno do servidor', public originalError?: Error) {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
    this.name = 'InternalServerError';
  }
}

// ============================================
// INTERFACE DE RESPOSTA DE ERRO
// ============================================

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    field?: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  requestId?: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

// ============================================
// FUNÇÃO DE RESPOSTA DE ERRO
// ============================================

export function errorResponse(
  error: unknown,
  statusCode?: number,
  requestId?: string
): NextResponse<ErrorResponse> {
  let appError: AppError;

  // Converter erro genérico em AppError
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new InternalServerError(error.message, error);
  } else {
    appError = new InternalServerError('Erro desconhecido');
  }

  // Usar statusCode fornecido ou do erro
  const finalStatusCode = statusCode || appError.statusCode;

  // Logar o erro
  logError(appError, requestId);

  // Montar resposta
  const response: ErrorResponse = {
    success: false,
    error: {
      message: appError.message,
      code: appError.code,
      statusCode: finalStatusCode,
      ...(appError instanceof ValidationError && appError.field && { field: appError.field }),
    },
    timestamp: new Date().toISOString(),
    ...(requestId && { requestId }),
  };

  return NextResponse.json(response, { status: finalStatusCode });
}

// ============================================
// FUNÇÃO DE RESPOSTA DE SUCESSO
// ============================================

export function successResponse<T>(
  data: T,
  statusCode: number = 200
): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: statusCode });
}

// ============================================
// LOGGING ESTRUTURADO
// ============================================

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  error?: {
    name: string;
    message: string;
    code?: string;
    statusCode?: number;
    stack?: string;
  };
  metadata?: Record<string, any>;
  requestId?: string;
}

export function log(
  level: LogLevel,
  message: string,
  metadata?: Record<string, any>,
  requestId?: string
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(metadata && { metadata }),
    ...(requestId && { requestId }),
  };

  // Aqui você pode enviar para Sentry, Winston, etc
  const output = JSON.stringify(entry);

  switch (level) {
    case LogLevel.DEBUG:
      console.debug(output);
      break;
    case LogLevel.INFO:
      console.info(output);
      break;
    case LogLevel.WARN:
      console.warn(output);
      break;
    case LogLevel.ERROR:
      console.error(output);
      break;
  }
}

export function logError(error: AppError, requestId?: string): void {
  log(
    LogLevel.ERROR,
    error.message,
    {
      code: error.code,
      statusCode: error.statusCode,
      name: error.name,
      ...(error instanceof InternalServerError && error.originalError && {
        originalError: {
          name: error.originalError.name,
          message: error.originalError.message,
          stack: error.originalError.stack,
        },
      }),
    },
    requestId
  );
}

export function logInfo(message: string, metadata?: Record<string, any>, requestId?: string): void {
  log(LogLevel.INFO, message, metadata, requestId);
}

export function logWarn(message: string, metadata?: Record<string, any>, requestId?: string): void {
  log(LogLevel.WARN, message, metadata, requestId);
}

export function logDebug(message: string, metadata?: Record<string, any>, requestId?: string): void {
  log(LogLevel.DEBUG, message, metadata, requestId);
}

// ============================================
// GERADOR DE REQUEST ID
// ============================================

export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// WRAPPER PARA API ENDPOINTS
// ============================================

export type ApiHandler<T = any> = (request: Request, requestId: string) => Promise<NextResponse<T>>;

/**
 * Wrapper que adiciona try-catch e error handling automático
 */
export function withErrorHandling(handler: ApiHandler): (request: Request) => Promise<NextResponse> {
  return async (request: Request) => {
    const requestId = generateRequestId();

    try {
      logInfo(`${request.method} ${new URL(request.url).pathname}`, undefined, requestId);
      return await handler(request, requestId);
    } catch (error) {
      return errorResponse(error, undefined, requestId);
    }
  };
}

// ============================================
// VALIDAÇÃO COM ERRO CUSTOMIZADO
// ============================================

export function validateRequired(value: any, fieldName: string): void {
  if (!value) {
    throw new ValidationError(`${fieldName} é obrigatório`, fieldName);
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Email inválido', 'email');
  }
}

export function validatePhone(phone: string): void {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError('Telefone inválido', 'phone');
  }
}

export function validateCpf(cpf: string): void {
  const cleanCpf = cpf.replace(/\D/g, '');
  if (cleanCpf.length !== 11) {
    throw new ValidationError('CPF deve ter 11 dígitos', 'cpf');
  }

  // Validação básica de CPF
  const cpfArray = cleanCpf.split('').map(Number);

  // Verificar se todos os dígitos são iguais
  if (cpfArray.every((digit, _, arr) => digit === arr[0])) {
    throw new ValidationError('CPF inválido', 'cpf');
  }
}

export function validateMinLength(value: string, minLength: number, fieldName: string): void {
  if (value.length < minLength) {
    throw new ValidationError(
      `${fieldName} deve ter pelo menos ${minLength} caracteres`,
      fieldName
    );
  }
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string): void {
  if (value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} não pode exceder ${maxLength} caracteres`,
      fieldName
    );
  }
}

// ============================================
// RECUPERAÇÃO DE DADOS DE REQUEST
// ============================================

export async function getJsonBody<T = any>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch (error) {
    throw new ValidationError('Body JSON inválido');
  }
}

export function getQueryParam(url: URL, param: string, required = false): string | null {
  const value = url.searchParams.get(param);
  if (required && !value) {
    throw new ValidationError(`Parâmetro '${param}' é obrigatório`, param);
  }
  return value;
}
