import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ALL_TABLES, TOTAL_TABLES, TableArea, getTablesByArea, AREA_NAMES } from '@/lib/tables-config';

export async function POST(request: Request) {
  try {
    const { data, horario, area } = await request.json();

    if (!data) {
      return NextResponse.json(
        { error: 'Data é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar todas as reservas CONFIRMADAS para a DATA
    const whereClause: Record<string, unknown> = {
      data,
      status: 'confirmed'
    };

    if (horario) {
      whereClause.horario = horario;
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      select: {
        id: true,
        externalRef: true,
        nome: true,
        numeroPessoas: true,
        mesasSelecionadas: true,
        status: true,
        horario: true,
      }
    });

    // Criar mapa de mesas com informações
    const tableMap = new Map<number, Array<{
      id: string;
      code: string;
      name: string;
      people: number;
      status: string;
      horario: string;
    }>>();

    reservations.forEach(reservation => {
      if (reservation.mesasSelecionadas) {
        try {
          const tables = JSON.parse(reservation.mesasSelecionadas);
          tables.forEach((tableNum: number) => {
            if (!tableMap.has(tableNum)) {
              tableMap.set(tableNum, []);
            }
            tableMap.get(tableNum)!.push({
              id: reservation.id,
              code: reservation.externalRef,
              name: reservation.nome,
              people: reservation.numeroPessoas,
              status: reservation.status,
              horario: reservation.horario,
            });
          });
        } catch (e) {
          console.error('Erro ao parsear mesas:', e);
        }
      }
    });

    // Filtrar mesas por área se especificada
    const tablesToShow = area
      ? getTablesByArea(area as TableArea)
      : ALL_TABLES;

    // Criar array de mesas com status de ocupação
    const tables = tablesToShow.map(tableConfig => {
      const reservationsForTable = tableMap.get(tableConfig.number);

      if (reservationsForTable && reservationsForTable.length > 0) {
        return {
          tableNumber: tableConfig.number,
          capacity: tableConfig.capacity,
          area: tableConfig.area,
          areaName: AREA_NAMES[tableConfig.area],
          occupied: true,
          reservations: reservationsForTable,
          reservation: reservationsForTable[0],
        };
      }

      return {
        tableNumber: tableConfig.number,
        capacity: tableConfig.capacity,
        area: tableConfig.area,
        areaName: AREA_NAMES[tableConfig.area],
        occupied: false,
        reservations: [],
        reservation: null,
      };
    });

    // Contar ocupação
    const occupiedCount = tables.filter(t => t.occupied).length;

    return NextResponse.json({
      date: data,
      time: horario,
      area: area || 'all',
      tables,
      summary: {
        total: tablesToShow.length,
        occupied: occupiedCount,
        available: tablesToShow.length - occupiedCount,
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
