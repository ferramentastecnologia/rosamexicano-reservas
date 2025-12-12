import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { nome, email, telefone, data: dataReserva, horario, numeroPessoas, mesasSelecionadas } = data;

    console.log('Dados recebidos:', { nome, email, telefone, dataReserva, horario, numeroPessoas, mesasSelecionadas });

    // Validação
    if (!nome || !email || !telefone || !dataReserva || !horario || !numeroPessoas) {
      console.error('Validação falhou - dados incompletos');
      return NextResponse.json(
        { success: false, error: 'Dados incompletos. Preencha todos os campos.' },
        { status: 400 }
      );
    }

    // Verificar se as variáveis de ambiente estão configuradas
    console.log('ASAAS_API_KEY length:', ASAAS_API_KEY.length);
    console.log('ASAAS_API_KEY primeiros 20 chars:', ASAAS_API_KEY.substring(0, 20));
    console.log('ASAAS_API_KEY últimos 20 chars:', ASAAS_API_KEY.substring(ASAAS_API_KEY.length - 20));

    if (!ASAAS_API_KEY || ASAAS_API_KEY.trim().length === 0 || ASAAS_API_KEY === 'COLOQUE_SUA_CHAVE_ASAAS_AQUI') {
      console.error('ASAAS_API_KEY não configurada ou vazia');
      console.error('Valor atual:', ASAAS_API_KEY);
      return NextResponse.json(
        { success: false, error: 'Configuração do gateway de pagamento pendente' },
        { status: 500 }
      );
    }

    console.log('Usando Asaas API URL:', ASAAS_API_URL);
    console.log('ASAAS_API_KEY configurada com sucesso');

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
        cpfCnpj: '00000000000191', // CPF padrão quando não fornecido
        notificationDisabled: true, // DESATIVA TODAS AS NOTIFICAÇÕES AUTOMÁTICAS DO ASAAS
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

    // 3. Gerar PIX dinâmico - criar payment temporário para obter QR Code
    console.log('Gerando PIX dinâmico via Asaas...');

    const dueDate = new Date();
    dueDate.setMinutes(dueDate.getMinutes() + 10); // Expira em 10 minutos

    const paymentData = {
      customer: customer.id,
      billingType: 'PIX',
      value: 50.00,
      dueDate: dueDate.toISOString().split('T')[0],
      dueTime: dueDate.toISOString().split('T')[1].substring(0, 8), // Expira em 10 minutos
      description: `Reserva Rosa Mexicano - ${dataReserva} às ${horario} - ${numeroPessoas} pessoas`,
      externalReference: externalRef,
      postalService: false,
      // Notificações são desabilitadas no nível do cliente (customer)
    };
    console.log('Criando pagamento com notificações desativadas...');

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
      console.error('Erro ao criar pagamento:', payment);
      const errorMsg = payment.errors?.[0]?.description || payment.message || 'Erro ao criar pagamento';
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
        mesasSelecionadas: mesasSelecionadas || null,
        valor: 50.00,
        status: 'pending',
      },
    });

    console.log('Reserva criada com sucesso:', reservation.id);

    // 5. Buscar dados do PIX (QR Code)
    console.log('Buscando QR Code PIX...');
    const pixResponse = await fetch(`${ASAAS_API_URL}/payments/${payment.id}/pixQrCode`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
    });

    const pixData = await pixResponse.json();
    console.log('Dados do PIX recebidos:', pixResponse.ok ? 'Sucesso' : 'Falhou');
    console.log('PIX payload:', pixData.payload ? 'Presente' : 'Ausente');
    console.log('PIX encodedImage:', pixData.encodedImage ? 'Presente' : 'Ausente');

    if (!pixResponse.ok || !pixData.payload) {
      console.error('Erro ao buscar QR Code PIX:', pixData);
      return NextResponse.json(
        { success: false, error: 'Erro ao gerar QR Code PIX. Tente novamente.' },
        { status: 500 }
      );
    }

    // 6. Retornar dados do PIX para checkout transparente
    console.log('Pagamento PIX criado com sucesso');

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      paymentId: payment.id,
      pixQrCode: pixData.payload, // Código PIX para gerar QR Code
      pixCopyPaste: pixData.payload, // Código PIX Copia e Cola
      pixEncodedImage: pixData.encodedImage, // QR Code base64 do Asaas (opcional)
      expirationDate: pixData.expirationDate || dueDate.toISOString(),
      reservationData: {
        nome,
        email,
        telefone,
        data: dataReserva,
        horario,
        numeroPessoas,
      },
    });

  } catch (error) {
    console.error('Erro no processamento:', error);

    // Identificar tipo de erro para melhor diagnóstico
    let errorMessage = 'Erro interno do servidor';

    if (error instanceof Error) {
      console.error('Detalhes do erro:', error.message);
      console.error('Stack:', error.stack);

      // Erros comuns do Prisma/DB
      if (error.message.includes('prisma') || error.message.includes('database') || error.message.includes('connect')) {
        errorMessage = 'Erro de conexão com banco de dados. Tente novamente.';
      }
      // Erros de rede/fetch
      else if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Erro de conexão com gateway de pagamento. Tente novamente.';
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
