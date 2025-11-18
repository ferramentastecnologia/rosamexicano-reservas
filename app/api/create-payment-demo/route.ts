import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { nome, email, telefone, data: dataReserva, horario, numeroPessoas } = data;

    console.log('📝 Criando reserva DEMO:', { nome, email, dataReserva, horario, numeroPessoas });

    // Gerar IDs simulados
    const paymentId = `demo_pay_${Date.now()}`;
    const externalRef = `DEMO-${Date.now()}`;

    // Salvar reserva no banco
    const reservation = await prisma.reservation.create({
      data: {
        paymentId,
        externalRef,
        nome,
        email,
        telefone,
        data: dataReserva,
        horario,
        numeroPessoas: parseInt(numeroPessoas),
        valor: 50.0,
        status: 'pending',
      },
    });

    console.log('✅ Reserva DEMO criada:', reservation.id);

    // Retornar URL de pagamento simulado
    const demoPaymentUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pagamento-demo?reservation=${reservation.id}`;

    return NextResponse.json({
      success: true,
      invoiceUrl: demoPaymentUrl,
      paymentId,
      reservation,
    });
  } catch (error) {
    console.error('❌ Erro ao criar reserva DEMO:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar reserva',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
