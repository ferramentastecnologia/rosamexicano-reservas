import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateTokenPair } from '@/lib/auth-utils';
import {
  successResponse,
  errorResponse,
  ValidationError,
  AuthenticationError,
  getJsonBody,
  generateRequestId,
  validateRequired,
  validateEmail,
} from '@/lib/error-handler';
import { applySecurityMiddleware } from '@/lib/security-headers';

export async function POST(request: Request) {
  const requestId = generateRequestId();

  try {
    // Extrair e validar body
    const { email, password } = await getJsonBody<{ email?: string; password?: string }>(request);

    // Validação de entrada
    validateRequired(email, 'Email');
    validateRequired(password, 'Senha');
    validateEmail(email);

    // Buscar usuário pelo email
    const user = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AuthenticationError('Email ou senha incorretos');
    }

    // Verificar se usuário está ativo
    if (!user.active) {
      throw new AuthenticationError('Usuário desativado');
    }

    // Verificar senha usando bcrypt
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      throw new AuthenticationError('Email ou senha incorretos');
    }

    // Gerar tokens JWT
    const permissions = user.permissions ? JSON.parse(user.permissions) : [];
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions,
    });

    console.log(`✅ Login realizado: ${user.email} (${requestId})`);

    // Criar resposta
    let response = successResponse(
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions,
        },
      },
      200
    );

    // Adicionar security headers
    response = applySecurityMiddleware(response, requestId);

    return response;
  } catch (error) {
    return errorResponse(error, undefined, requestId);
  }
}
