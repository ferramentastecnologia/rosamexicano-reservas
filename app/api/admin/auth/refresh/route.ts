/**
 * Endpoint de Refresh Token
 *
 * POST /api/admin/auth/refresh
 *
 * Permite renovar um access token expirado usando um refresh token válido
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token ausente' },
        { status: 400 }
      );
    }

    // Validar refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Buscar usuário para validar que ainda existe e está ativo
    const user = await prisma.admin.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { success: false, error: 'Usuário inválido ou desativado' },
        { status: 401 }
      );
    }

    // Gerar novo access token
    const permissions = user.permissions ? JSON.parse(user.permissions) : [];
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions,
    });

    console.log(`✅ Token renovado: ${user.email}`);

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      expiresIn: 3600, // 1 hora em segundos
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao renovar token';
    console.error('❌ Erro ao renovar token:', error);

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 401 }
    );
  }
}
