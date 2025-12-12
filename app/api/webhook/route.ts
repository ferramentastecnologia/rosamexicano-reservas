import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @deprecated Use /api/webhooks/asaas/route.ts instead
 *
 * Este arquivo é mantido por compatibilidade backwards.
 * Novos webhooks devem ser configurados em: https://seu-dominio.com/api/webhooks/asaas
 */
export async function POST(request: Request) {
  try {
    const webhook = await request.json();
    console.log('Webhook recebido (legacy):', JSON.stringify(webhook, null, 2));

    const { event, payment } = webhook;

    if (!payment || !payment.id) {
      console.error('Webhook sem payment ID');
      return NextResponse.json({ received: true });
    }

    // Buscar reserva no banco de dados
    const reservation = await prisma.reservation.findUnique({
      where: { paymentId: payment.id },
    });

    if (!reservation) {
      console.error('Reserva não encontrada para payment ID:', payment.id);
      return NextResponse.json({ received: true });
    }

    // ========== EVENTOS DE CONFIRMAÇÃO ==========
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED_IN_CASH') {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'confirmed' },
      });
      console.log('✅ Pagamento confirmado! Reserva aguardando aprovação do estabelecimento.');
      return NextResponse.json({
        received: true,
        reservationId: reservation.id,
        message: 'Pagamento confirmado, aguardando aprovação'
      });
    }

    // ========== EVENTO DE REEMBOLSO ==========
    if (event === 'PAYMENT_REFUNDED') {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'refunded' },
      });
      console.log(`💰 Pagamento reembolsado! Reserva ${reservation.id}`);
      return NextResponse.json({
        received: true,
        reservationId: reservation.id,
        message: 'Reembolso processado'
      });
    }

    // ========== EVENTO DE VENCIMENTO ==========
    if (event === 'PAYMENT_OVERDUE') {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'cancelled' },
      });
      console.log('⏰ Pagamento vencido:', payment.id);
      return NextResponse.json({ received: true });
    }

    // ========== EVENTO DE CANCELAMENTO ==========
    if (event === 'PAYMENT_DELETED') {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'cancelled' },
      });
      console.log('❌ Pagamento cancelado:', payment.id);
      return NextResponse.json({ received: true });
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
