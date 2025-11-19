import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Total de reservas
    const totalReservations = await prisma.reservation.count();

    // Reservas confirmadas
    const confirmedReservations = await prisma.reservation.count({
      where: { status: 'confirmed' }
    });

    // Reservas pendentes
    const pendingReservations = await prisma.reservation.count({
      where: { status: 'pending' }
    });

    // Reservas canceladas
    const cancelledReservations = await prisma.reservation.count({
      where: { status: 'cancelled' }
    });

    // Receita total (em centavos)
    const reservations = await prisma.reservation.findMany({
      where: {
        status: {
          in: ['pending', 'confirmed']
        }
      },
      select: {
        valor: true
      }
    });

    const totalRevenue = reservations.reduce((sum, r) => sum + (r.valor * 100), 0);

    // Total de pessoas
    const allReservations = await prisma.reservation.findMany({
      where: {
        status: {
          in: ['pending', 'confirmed']
        }
      },
      select: {
        numeroPessoas: true
      }
    });

    const totalPeople = allReservations.reduce((sum, r) => sum + r.numeroPessoas, 0);

    // Reservas de hoje
    const today = new Date().toISOString().split('T')[0];
    const todayReservations = await prisma.reservation.count({
      where: {
        data: today,
        status: {
          in: ['pending', 'confirmed']
        }
      }
    });

    return NextResponse.json({
      totalReservations,
      confirmedReservations,
      pendingReservations,
      cancelledReservations,
      totalRevenue,
      totalPeople,
      todayReservations,
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
