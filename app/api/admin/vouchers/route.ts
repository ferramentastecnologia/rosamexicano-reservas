import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Listar todos os vouchers
export async function GET() {
  try {
    const vouchers = await prisma.voucher.findMany({
      include: {
        reservation: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            data: true,
            horario: true,
            numeroPessoas: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    return NextResponse.json({
      total: vouchers.length,
      vouchers: vouchers.map(v => ({
        id: v.id,
        codigo: v.codigo,
        valor: v.valor,
        utilizado: v.utilizado,
        dataUtilizacao: v.dataUtilizacao,
        dataValidade: v.dataValidade,
        createdAt: v.createdAt,
        reservation: v.reservation
      }))
    });
  } catch (error) {
    console.error('Erro ao listar vouchers:', error);
    return NextResponse.json(
      { error: 'Erro ao listar vouchers' },
      { status: 500 }
    );
  }
}
