import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { nome, email, telefone, data: dataReserva, horario, numeroPessoas } = data;

    // Validação
    if (!nome || !email || !telefone || !dataReserva || !horario || !numeroPessoas) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // 1. Criar cliente no Asaas
    const cleanPhone = telefone.replace(/\D/g, '');

    const customerResponse = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify({
        name: nome,
        email: email,
        mobilePhone: cleanPhone,
      }),
    });

    const customer = await customerResponse.json();

    if (!customerResponse.ok) {
      console.error('Erro ao criar cliente:', customer);
      return NextResponse.json(
        { success: false, error: 'Erro ao criar cliente no gateway de pagamento' },
        { status: 500 }
      );
    }

    // 2. Criar referência externa única
    const externalRef = `RESERVA-${Date.now()}`;

    // 3. Criar cobrança no Asaas
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);

    const paymentResponse = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify({
        customer: customer.id,
        billingType: 'UNDEFINED', // Permite escolher PIX, Boleto ou Cartão
        value: 50.00,
        dueDate: dueDate.toISOString().split('T')[0],
        description: `Reserva Mortadella - ${dataReserva} às ${horario} - ${numeroPessoas} pessoas`,
        externalReference: externalRef,
        postalService: false,
      }),
    });

    const payment = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error('Erro ao criar cobrança:', payment);
      return NextResponse.json(
        { success: false, error: 'Erro ao criar cobrança' },
        { status: 500 }
      );
    }

    // 4. Salvar reserva no banco de dados
    const reservation = await prisma.reservation.create({
      data: {
        paymentId: payment.id,
        externalRef: externalRef,
        nome: nome,
        email: email,
        telefone: telefone,
        data: dataReserva,
        horario: horario,
        numeroPessoas: numeroPessoas,
        valor: 50.00,
        status: 'pending',
      },
    });

    console.log('Reserva criada:', reservation.id);

    // 5. Retornar URL de pagamento
    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      paymentId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      bankSlipUrl: payment.bankSlipUrl,
    });

  } catch (error) {
    console.error('Erro no processamento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
