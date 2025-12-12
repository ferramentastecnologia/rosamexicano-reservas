import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Webhook Asaas recebido:', JSON.stringify(body, null, 2));

    const { event, payment } = body;

    if (!payment || !payment.id) {
      console.error('Webhook sem payment ID');
      return NextResponse.json({ error: 'Payment ID não encontrado' }, { status: 400 });
    }

    // Buscar reserva pelo paymentId
    const reservation = await prisma.reservation.findFirst({
      where: {
        paymentId: payment.id
      }
    });

    if (!reservation) {
      console.error(`Reserva não encontrada para payment ID: ${payment.id}`);
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    // ========== EVENTOS DE CONFIRMAÇÃO DE PAGAMENTO ==========
    const confirmedEvents = [
      'PAYMENT_RECEIVED',
      'PAYMENT_CONFIRMED',
      'PAYMENT_RECEIVED_IN_CASH'
    ];

    if (confirmedEvents.includes(event)) {
      const updatedReservation = await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'confirmed' }
      });

      console.log(`✅ Reserva ${updatedReservation.id} confirmada! Payment ID: ${payment.id}`);
      console.log(`   Cliente: ${updatedReservation.nome}`);
      console.log(`   Data: ${updatedReservation.data} às ${updatedReservation.horario}`);
      console.log(`   Pessoas: ${updatedReservation.numeroPessoas}`);
      console.log(`   Mesas: ${updatedReservation.mesasSelecionadas}`);

      return NextResponse.json({
        success: true,
        reservationId: updatedReservation.id,
        message: 'Reserva confirmada com sucesso'
      });
    }

    // ========== EVENTO DE REEMBOLSO ==========
    if (event === 'PAYMENT_REFUNDED') {
      const updatedReservation = await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'refunded' }
      });

      console.log(`💰 Pagamento reembolsado! Reserva ${updatedReservation.id}`);
      console.log(`   Cliente: ${updatedReservation.nome}`);
      console.log(`   Valor reembolsado: R$ ${payment.value || 50.00}`);
      console.log(`   Motivo: ${payment.refundReason || 'Não especificado'}`);

      return NextResponse.json({
        success: true,
        reservationId: updatedReservation.id,
        message: 'Reembolso processado com sucesso'
      });
    }

    // ========== EVENTO DE PAGAMENTO VENCIDO ==========
    if (event === 'PAYMENT_OVERDUE') {
      const updatedReservation = await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'cancelled' }
      });

      console.log(`⏰ Pagamento vencido! Reserva ${updatedReservation.id} cancelada`);
      return NextResponse.json({
        success: true,
        reservationId: updatedReservation.id,
        message: 'Reserva cancelada por falta de pagamento'
      });
    }

    // ========== EVENTO DE PAGAMENTO DELETADO ==========
    if (event === 'PAYMENT_DELETED') {
      const updatedReservation = await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'cancelled' }
      });

      console.log(`❌ Pagamento cancelado! Reserva ${updatedReservation.id} cancelada`);
      return NextResponse.json({
        success: true,
        reservationId: updatedReservation.id,
        message: 'Reserva cancelada'
      });
    }

    // Eventos não reconhecidos são ignorados com sucesso
    console.log(`ℹ️  Evento ${event} recebido mas não requer ação`);
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}
