import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar reserva pelo paymentId
    const reservation = await prisma.reservation.findFirst({
      where: {
        paymentId: paymentId
      },
      select: {
        id: true,
        status: true,
        nome: true,
        email: true,
        data: true,
        horario: true,
        numeroPessoas: true,
      }
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: reservation.status,
      confirmed: reservation.status === 'confirmed',
      reservation: reservation
    });

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao verificar pagamento' },
      { status: 500 }
    );
  }
}
