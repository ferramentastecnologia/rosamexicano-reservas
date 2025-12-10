import { NextResponse } from 'next/server';

// Rota de teste para verificar se o webhook está acessível
export async function GET() {
  console.log('Teste de webhook acessado via GET');
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook está acessível',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  console.log('Teste de webhook acessado via POST:', body);
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook POST funcionando',
    received: body,
    timestamp: new Date().toISOString()
  });
}
