import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';

// Cancelar cobrança no Asaas
async function cancelPaymentInAsaas(paymentId: string): Promise<boolean> {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY || '',
      },
    });

    if (response.ok) {
      console.log(`Pagamento ${paymentId} cancelado no Asaas`);
      return true;
    } else {
      const error = await response.text();
      console.error(`Erro ao cancelar no Asaas: ${error}`);
      return false;
    }
  } catch (error) {
    console.error('Erro ao conectar com Asaas:', error);
    return false;
  }
}

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
        paymentId: paymentId,
        status: 'pending'
      }
    });

    if (!reservation) {
      return NextResponse.json({
        success: false,
        error: 'Reserva não encontrada ou já processada'
      });
    }

    // Cancelar cobrança no Asaas
    await cancelPaymentInAsaas(paymentId);

    // Cancelar a reserva no banco
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: 'cancelled' }
    });

    console.log(`Reserva ${reservation.id} cancelada por expiração de pagamento`);

    return NextResponse.json({
      success: true,
      message: 'Reserva cancelada por expiração'
    });

  } catch (error) {
    console.error('Erro ao cancelar reserva expirada:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao cancelar reserva' },
      { status: 500 }
    );
  }
}

// GET: Limpar todas as reservas pendentes com mais de 10 minutos
export async function GET() {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Buscar reservas pendentes antigas
    const oldPendingReservations = await prisma.reservation.findMany({
      where: {
        status: 'pending',
        createdAt: {
          lt: tenMinutesAgo
        }
      }
    });

    console.log(`Encontradas ${oldPendingReservations.length} reservas pendentes para cancelar`);

    let cancelled = 0;
    for (const reservation of oldPendingReservations) {
      try {
        // Cancelar no Asaas se tiver paymentId
        if (reservation.paymentId) {
          await cancelPaymentInAsaas(reservation.paymentId);
        }

        // Cancelar no banco
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: 'cancelled' }
        });

        cancelled++;
        console.log(`Reserva ${reservation.id} cancelada`);
      } catch (err) {
        console.error(`Erro ao cancelar reserva ${reservation.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${cancelled} reservas canceladas`,
      total: oldPendingReservations.length,
      cancelled
    });

  } catch (error) {
    console.error('Erro ao limpar reservas expiradas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao limpar reservas' },
      { status: 500 }
    );
  }
}
