import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TOTAL_TABLES = 15;

export async function POST(request: Request) {
  try {
    const { data, horario } = await request.json();

    if (!data || !horario) {
      return NextResponse.json(
        { error: 'Data e horário são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar todas as reservas para a data e horário
    const reservations = await prisma.reservation.findMany({
      where: {
        data,
        horario,
        status: {
          in: ['pending', 'confirmed']
        }
      },
      select: {
        id: true,
        externalRef: true,
        nome: true,
        numeroPessoas: true,
        mesasSelecionadas: true,
        status: true,
      }
    });

    // Criar mapa de mesas com informações
    const tableMap = new Map<number, any>();

    reservations.forEach(reservation => {
      if (reservation.mesasSelecionadas) {
        try {
          const tables = JSON.parse(reservation.mesasSelecionadas);
          tables.forEach((tableNum: number) => {
            tableMap.set(tableNum, {
              tableNumber: tableNum,
              occupied: true,
              reservation: {
                id: reservation.id,
                code: reservation.externalRef,
                name: reservation.nome,
                people: reservation.numeroPessoas,
                status: reservation.status,
              }
            });
          });
        } catch (e) {
          console.error('Erro ao parsear mesas:', e);
        }
      }
    });

    // Criar array completo de mesas (1-15)
    const tables = Array.from({ length: TOTAL_TABLES }, (_, i) => {
      const tableNumber = i + 1;
      const tableInfo = tableMap.get(tableNumber);

      return tableInfo || {
        tableNumber,
        occupied: false,
        reservation: null,
      };
    });

    return NextResponse.json({
      date: data,
      time: horario,
      tables,
      summary: {
        total: TOTAL_TABLES,
        occupied: tableMap.size,
        available: TOTAL_TABLES - tableMap.size,
        totalPeople: reservations.reduce((sum, r) => sum + r.numeroPessoas, 0),
      }
    });

  } catch (error) {
    console.error('Erro ao buscar ocupação:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ocupação de mesas' },
      { status: 500 }
    );
  }
}
