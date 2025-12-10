import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar reserva pelo paymentId
    const reservation = await prisma.reservation.findUnique({
      where: { paymentId },
      include: {
        voucher: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    if (!reservation.voucher) {
      return NextResponse.json(
        { error: 'Voucher ainda não foi gerado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      voucher: {
        codigo: reservation.voucher.codigo,
        reservation: {
          nome: reservation.nome,
          data: reservation.data,
          horario: reservation.horario,
          numeroPessoas: reservation.numeroPessoas,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar voucher:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
