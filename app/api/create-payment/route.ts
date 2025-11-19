import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { nome, email, telefone, data: dataReserva, horario, numeroPessoas } = data;

    console.log('Dados recebidos:', { nome, email, telefone, dataReserva, horario, numeroPessoas });

    // Validação
    if (!nome || !email || !telefone || !dataReserva || !horario || !numeroPessoas) {
      console.error('Validação falhou - dados incompletos');
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Verificar se as variáveis de ambiente estão configuradas
    if (!ASAAS_API_KEY || ASAAS_API_KEY === 'COLOQUE_SUA_CHAVE_ASAAS_AQUI') {
      console.error('ASAAS_API_KEY não configurada');
      return NextResponse.json(
        { success: false, error: 'Configuração do gateway de pagamento pendente' },
        { status: 500 }
      );
    }

    console.log('Usando Asaas API URL:', ASAAS_API_URL);

    // 1. Criar cliente no Asaas
    const cleanPhone = telefone.replace(/\D/g, '');

    console.log('Criando cliente no Asaas...');
    console.log('URL:', `${ASAAS_API_URL}/customers`);
    console.log('Dados:', { name: nome, email, mobilePhone: cleanPhone });

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
    console.log('Resposta do Asaas (cliente):', JSON.stringify(customer, null, 2));
    console.log('Status:', customerResponse.status);

    if (!customerResponse.ok) {
      console.error('Erro ao criar cliente:', customer);
      const errorMsg = customer.errors?.[0]?.description || customer.message || 'Erro ao criar cliente no gateway de pagamento';
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 500 }
      );
    }

    // 2. Criar referência externa única
    const externalRef = `RESERVA-${Date.now()}`;

    // 3. Criar cobrança no Asaas
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);

    console.log('Criando cobrança no Asaas...');
    const paymentData = {
      customer: customer.id,
      billingType: 'UNDEFINED', // Permite escolher PIX, Boleto ou Cartão
      value: 50.00,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Reserva Rosa Mexicano - ${dataReserva} às ${horario} - ${numeroPessoas} pessoas`,
      externalReference: externalRef,
      postalService: false,
    };
    console.log('Dados do pagamento:', paymentData);

    const paymentResponse = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify(paymentData),
    });

    const payment = await paymentResponse.json();
    console.log('Resposta do Asaas (pagamento):', JSON.stringify(payment, null, 2));
    console.log('Status:', paymentResponse.status);

    if (!paymentResponse.ok) {
      console.error('Erro ao criar cobrança:', payment);
      const errorMsg = payment.errors?.[0]?.description || payment.message || 'Erro ao criar cobrança';
      return NextResponse.json(
        { success: false, error: errorMsg },
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
