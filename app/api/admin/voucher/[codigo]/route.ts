import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Buscar voucher pelo código
export async function GET(
  request: Request,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;

    const voucher = await prisma.voucher.findUnique({
      where: { codigo: codigo.toUpperCase() },
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
      }
    });

    if (!voucher) {
      return NextResponse.json(
        { error: 'Voucher não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(voucher);
  } catch (error) {
    console.error('Erro ao buscar voucher:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar voucher' },
      { status: 500 }
    );
  }
}
