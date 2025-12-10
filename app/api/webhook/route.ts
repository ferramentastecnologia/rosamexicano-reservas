import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const webhook = await request.json();
    console.log('Webhook recebido:', JSON.stringify(webhook, null, 2));

    const { event, payment } = webhook;

    // Processar apenas eventos de pagamento confirmado
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      console.log(`Pagamento confirmado: ${payment.id}`);

      // Buscar reserva no banco de dados
      const reservation = await prisma.reservation.findUnique({
        where: { paymentId: payment.id },
      });

      if (!reservation) {
        console.error('Reserva não encontrada para payment ID:', payment.id);
        return NextResponse.json({ received: true });
      }

      // Atualizar status da reserva para "confirmed" (aguardando aprovação do estabelecimento)
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'confirmed' },
      });

      console.log('Pagamento confirmado! Reserva aguardando aprovação do estabelecimento.');

      return NextResponse.json({
        received: true,
        reservationId: reservation.id,
        message: 'Pagamento confirmado, aguardando aprovação'
      });
    }

    // Outros eventos
    if (event === 'PAYMENT_OVERDUE') {
      console.log('Pagamento vencido:', payment.id);

      const reservation = await prisma.reservation.findUnique({
        where: { paymentId: payment.id },
      });

      if (reservation) {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: 'cancelled' },
        });
      }
    }

    if (event === 'PAYMENT_DELETED') {
      console.log('Pagamento cancelado:', payment.id);

      const reservation = await prisma.reservation.findUnique({
        where: { paymentId: payment.id },
      });

      if (reservation) {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: 'cancelled' },
        });
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}
