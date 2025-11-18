import { NextRequest, NextResponse } from 'next/server';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';
const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, email, telefone, data, horario, numeroPessoas, valor } = body;

    // Validações básicas
    if (!nome || !email || !telefone || !data || !horario || !numeroPessoas) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Criar ou buscar cliente no Asaas
    const clienteResponse = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify({
        name: nome,
        email: email,
        phone: telefone.replace(/\D/g, ''),
        cpfCnpj: '', // Opcional
        notificationDisabled: false,
      }),
    });

    if (!clienteResponse.ok) {
      const errorData = await clienteResponse.json();
      console.error('Erro ao criar cliente:', errorData);
      return NextResponse.json(
        { success: false, error: 'Erro ao criar cliente' },
        { status: 500 }
      );
    }

    const cliente = await clienteResponse.json();

    // Criar cobrança no Asaas
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 3); // Vencimento em 3 dias

    const cobrancaResponse = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify({
        customer: cliente.id,
        billingType: 'CREDIT_CARD', // Pode ser PIX, BOLETO, CREDIT_CARD
        value: valor,
        dueDate: dataVencimento.toISOString().split('T')[0],
        description: `Reserva Mortadella - ${data} às ${horario} - ${numeroPessoas} pessoas`,
        externalReference: `RESERVA-${Date.now()}`,
        postalService: false,
      }),
    });

    if (!cobrancaResponse.ok) {
      const errorData = await cobrancaResponse.json();
      console.error('Erro ao criar cobrança:', errorData);
      return NextResponse.json(
        { success: false, error: 'Erro ao criar cobrança' },
        { status: 500 }
      );
    }

    const cobranca = await cobrancaResponse.json();

    // Salvar reserva no banco (aqui você implementaria a lógica de banco de dados)
    // Por enquanto, vamos apenas retornar o link de pagamento

    return NextResponse.json({
      success: true,
      paymentId: cobranca.id,
      paymentUrl: cobranca.invoiceUrl,
      bankSlipUrl: cobranca.bankSlipUrl,
      pixQrCode: cobranca.pixQrCodeUrl,
    });
  } catch (error) {
    console.error('Erro no checkout:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
