import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Uma única query que busca tudo de uma vez
    const [statsResult, todayCount] = await Promise.all([
      // Query principal com agregação
      prisma.reservation.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { valor: true, numeroPessoas: true },
      }),
      // Query para reservas de hoje (separada pois precisa de filtro de data)
      prisma.reservation.count({
        where: {
          data: today,
          status: { in: ['pending', 'confirmed', 'approved'] }
        }
      })
    ]);

    // Processar resultados
    let totalReservations = 0;
    let confirmedReservations = 0;
    let approvedReservations = 0;
    let pendingReservations = 0;
    let cancelledReservations = 0;
    let totalRevenue = 0;
    let totalPeople = 0;

    statsResult.forEach(stat => {
      const count = stat._count.id;
      totalReservations += count;

      switch (stat.status) {
        case 'confirmed':
          confirmedReservations = count;
          totalRevenue += (stat._sum.valor || 0) * 100;
          totalPeople += stat._sum.numeroPessoas || 0;
          break;
        case 'approved':
          approvedReservations = count;
          totalRevenue += (stat._sum.valor || 0) * 100;
          totalPeople += stat._sum.numeroPessoas || 0;
          break;
        case 'pending':
          pendingReservations = count;
          totalRevenue += (stat._sum.valor || 0) * 100;
          totalPeople += stat._sum.numeroPessoas || 0;
          break;
        case 'cancelled':
          cancelledReservations = count;
          break;
      }
    });

    return NextResponse.json({
      totalReservations,
      confirmedReservations: confirmedReservations + approvedReservations,
      pendingReservations,
      cancelledReservations,
      totalRevenue,
      totalPeople,
      todayReservations: todayCount,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
