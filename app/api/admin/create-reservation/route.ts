import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nome,
      email,
      telefone,
      data,
      horario,
      numeroPessoas,
      mesasSelecionadas,
      observacoes,
      status
    } = body;

    // Validações
    if (!nome || !email || !telefone || !data || !horario || !numeroPessoas) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Gerar código de referência único
    const externalRef = `MANUAL-${Date.now()}`;

    // Criar reserva no banco
    const reservation = await prisma.reservation.create({
      data: {
        paymentId: null, // Manual não tem pagamento
        externalRef: externalRef,
        nome: nome,
        email: email,
        telefone: telefone,
        data: data,
        horario: horario,
        numeroPessoas: parseInt(numeroPessoas),
        mesasSelecionadas: mesasSelecionadas || null,
        valor: 0, // Reserva manual sem cobrança
        status: status || 'confirmed', // Manual já vem confirmada
        observacoes: observacoes || '',
      },
    });

    console.log('✅ Reserva manual criada:', reservation.id);
    console.log(`   Cliente: ${reservation.nome}`);
    console.log(`   Data: ${reservation.data} às ${reservation.horario}`);
    console.log(`   Pessoas: ${reservation.numeroPessoas}`);
    console.log(`   Mesas: ${reservation.mesasSelecionadas}`);

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        externalRef: reservation.externalRef,
        nome: reservation.nome,
        data: reservation.data,
        horario: reservation.horario,
      }
    });

  } catch (error) {
    console.error('Erro ao criar reserva manual:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar reserva' },
      { status: 500 }
    );
  }
}
