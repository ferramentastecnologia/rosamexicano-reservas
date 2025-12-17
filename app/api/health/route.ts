import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    database: 'unknown',
    reservationsCount: 0,
    adminsCount: 0,
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL ? 'configured' : 'missing',
      JWT_SECRET: !!process.env.JWT_SECRET ? 'configured' : 'missing',
      ASAAS_API_KEY: !!process.env.ASAAS_API_KEY ? 'configured' : 'missing',
    }
  };

  try {
    // Testar conexão com banco
    const [reservations, admins] = await Promise.all([
      prisma.reservation.count(),
      prisma.admin.count(),
    ]);

    checks.database = 'connected';
    checks.reservationsCount = reservations;
    checks.adminsCount = admins;

    return NextResponse.json({ success: true, ...checks });
  } catch (error) {
    checks.database = 'error';
    return NextResponse.json({
      success: false,
      ...checks,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
