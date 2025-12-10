import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Listar todos os vouchers - otimizado
export async function GET() {
  try {
    // Selecionar apenas campos necessários (excluindo qrCodeData que é grande)
    const vouchers = await prisma.voucher.findMany({
      select: {
        id: true,
        codigo: true,
        valor: true,
        utilizado: true,
        dataUtilizacao: true,
        dataValidade: true,
        createdAt: true,
        reservation: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            data: true,
            horario: true,
            numeroPessoas: true,
            mesasSelecionadas: true,
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
      vouchers
    }, {
      headers: {
        'Cache-Control': 'private, max-age=15, stale-while-revalidate=30',
      }
    });
  } catch (error) {
    console.error('Erro ao listar vouchers:', error);
    return NextResponse.json(
      { error: 'Erro ao listar vouchers' },
      { status: 500 }
    );
  }
}
