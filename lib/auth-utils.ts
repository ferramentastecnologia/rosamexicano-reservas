/**
 * Utilitários de Autenticação com JWT
 *
 * Fornece funções para:
 * - Gerar tokens JWT com expiração
 * - Verificar e validar tokens
 * - Refresh tokens
 * - Hash de senhas
 * - Middleware de autenticação
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface AuthToken {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================
// CONFIGURAÇÕES
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h'; // 1 hora
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d'; // 7 dias
const BCRYPT_ROUNDS = 10;

// ============================================
// FUNÇÕES DE HASH DE SENHA
// ============================================

/**
 * Hash uma senha usando bcrypt
 * @param password - Senha em texto plano
 * @returns Promise com hash da senha
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compara uma senha em texto plano com seu hash
 * @param password - Senha em texto plano
 * @param hash - Hash da senha armazenado
 * @returns Promise com resultado da comparação
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================
// FUNÇÕES DE TOKEN JWT
// ============================================

/**
 * Gera um novo JWT access token
 * @param payload - Dados a incluir no token
 * @returns Token JWT assinado
 */
export function generateAccessToken(payload: Omit<AuthToken, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256',
  });
}

/**
 * Gera um novo JWT refresh token
 * @param userId - ID do usuário
 * @returns Refresh token assinado
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
    algorithm: 'HS256',
  });
}

/**
 * Gera par de tokens (access + refresh)
 * @param payload - Dados para o access token
 * @returns Objeto com accessToken e refreshToken
 */
export function generateTokenPair(
  payload: Omit<AuthToken, 'iat' | 'exp'>
): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload.userId);

  // Decode token para pegar expiry
  const decoded = jwt.decode(accessToken) as any;
  const expiresIn = decoded.exp - decoded.iat;

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * Valida e decodifica um JWT access token
 * @param token - Token a validar
 * @returns Payload do token se válido
 * @throws Error se token inválido ou expirado
 */
export function verifyAccessToken(token: string): AuthToken {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as AuthToken;
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido');
    }
    throw error;
  }
}

/**
 * Valida e decodifica um JWT refresh token
 * @param token - Refresh token a validar
 * @returns User ID se válido
 * @throws Error se token inválido ou expirado
 */
export function verifyRefreshToken(token: string): { userId: string } {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
    }) as { userId: string };
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Refresh token inválido');
    }
    throw error;
  }
}

/**
 * Extrai o token do header Authorization
 * @param authHeader - Header Authorization da requisição
 * @returns Token ou null se não encontrado
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

// ============================================
// FUNÇÕES DE VALIDAÇÃO DE AUTENTICAÇÃO
// ============================================

/**
 * Valida um token da requisição
 * @param authHeader - Authorization header
 * @returns AuthToken se válido
 * @throws Error com mensagem apropriada se inválido
 */
export function validateAuthHeader(authHeader?: string): AuthToken {
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    throw new Error('Token ausente na requisição');
  }

  return verifyAccessToken(token);
}

/**
 * Verifica se um usuário tem uma permissão específica
 * @param permissions - Array de permissões do usuário
 * @param requiredPermission - Permissão a verificar
 * @returns true se tem permissão
 */
export function hasPermission(permissions: string[], requiredPermission: string): boolean {
  return permissions.includes(requiredPermission) || permissions.includes('*');
}

/**
 * Verifica se um usuário tem qualquer uma das permissões fornecidas
 * @param permissions - Array de permissões do usuário
 * @param requiredPermissions - Permissões a verificar
 * @returns true se tem qualquer uma
 */
export function hasAnyPermission(permissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(perm => hasPermission(permissions, perm));
}

/**
 * Verifica se um usuário tem todas as permissões fornecidas
 * @param permissions - Array de permissões do usuário
 * @param requiredPermissions - Permissões a verificar
 * @returns true se tem todas
 */
export function hasAllPermissions(permissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(perm => hasPermission(permissions, perm));
}

// ============================================
// TIPOS DE ERRO CUSTOMIZADOS
// ============================================

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class TokenExpiredError extends Error {
  constructor(message: string = 'Token expirado') {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

export class InvalidTokenError extends Error {
  constructor(message: string = 'Token inválido') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

// ============================================
// VALIDAÇÃO DE CONFIGURAÇÃO
// ============================================

/**
 * Valida que todas as variáveis de ambiente necessárias estão configuradas
 * @throws Error se variáveis obrigatórias não estão definidas
 */
export function validateAuthConfig(): void {
  const requiredVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];

  const missing = requiredVars.filter(
    varName => !process.env[varName] || process.env[varName] === `your-${varName.toLowerCase()}-change-in-production`
  );

  if (missing.length > 0) {
    console.warn(`⚠️ Variáveis de autenticação não configuradas: ${missing.join(', ')}`);
    console.warn('⚠️ Usando valores padrão (desenvolvimento apenas!)');
    console.warn('⚠️ Em produção, defina: JWT_SECRET e JWT_REFRESH_SECRET em .env');
  }
}

// Validar na inicialização
if (typeof window === 'undefined') {
  // Apenas no servidor
  validateAuthConfig();
}
