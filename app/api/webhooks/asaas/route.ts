import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Webhook Asaas recebido:', JSON.stringify(body, null, 2));

    const { event, payment } = body;

    // Eventos que indicam pagamento confirmado
    const confirmedEvents = [
      'PAYMENT_RECEIVED',
      'PAYMENT_CONFIRMED',
      'PAYMENT_RECEIVED_IN_CASH'
    ];

    if (!confirmedEvents.includes(event)) {
      console.log(`Evento ${event} ignorado (não é confirmação de pagamento)`);
      return NextResponse.json({ received: true });
    }

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

    // Atualizar status da reserva para 'confirmed'
    const updatedReservation = await prisma.reservation.update({
      where: {
        id: reservation.id
      },
      data: {
        status: 'confirmed'
      }
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

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}
