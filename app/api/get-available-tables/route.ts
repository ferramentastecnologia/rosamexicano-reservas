import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ALL_TABLES, TOTAL_TABLES, TableArea, getTablesByArea } from '@/lib/tables-config';

export async function POST(request: Request) {
  try {
    const { data, horario, area } = await request.json();

    if (!data) {
      return NextResponse.json(
        { error: 'Data é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar TODAS as reservas CONFIRMADAS da DATA
    // Apenas reservas com pagamento confirmado bloqueiam mesas
    const reservations = await prisma.reservation.findMany({
      where: {
        data: data,
        status: 'confirmed' // Apenas confirmadas bloqueiam mesas
      },
      select: {
        mesasSelecionadas: true,
        numeroPessoas: true,
      }
    });

    // Coletar todas as mesas ocupadas
    const occupiedTables = new Set<number>();
    reservations.forEach(reservation => {
      if (reservation.mesasSelecionadas) {
        try {
          const tables = JSON.parse(reservation.mesasSelecionadas);
          tables.forEach((tableNum: number) => occupiedTables.add(tableNum));
        } catch (e) {
          console.error('Erro ao parsear mesas:', e);
        }
      }
    });

    // Filtrar mesas por área se especificada
    const tablesToShow = area
      ? getTablesByArea(area as TableArea)
      : ALL_TABLES;

    // Criar array de mesas com status
    const tables = tablesToShow.map(tableConfig => ({
      number: tableConfig.number,
      available: !occupiedTables.has(tableConfig.number),
      capacity: tableConfig.capacity,
      area: tableConfig.area,
      description: tableConfig.description,
    }));

    // Contar mesas disponíveis e capacidade total
    const availableTablesList = tables.filter(t => t.available);
    const totalCapacity = availableTablesList.reduce((sum, t) => sum + t.capacity, 0);

    // Adicionar headers de cache para melhorar performance
    return NextResponse.json({
      tables,
      summary: {
        totalTables: tablesToShow.length,
        availableTables: availableTablesList.length,
        occupiedTables: tables.length - availableTablesList.length,
        totalCapacity,
        area: area || 'all',
      }
    }, {
      headers: {
        'Cache-Control': 'private, max-age=10, stale-while-revalidate=30',
      }
    });

  } catch (error) {
    console.error('Erro ao buscar mesas disponíveis:', error);

    const { area } = await request.json().catch(() => ({ area: null }));

    // Filtrar mesas por área se especificada
    const tablesToShow = area
      ? getTablesByArea(area as TableArea)
      : ALL_TABLES;

    // Em caso de erro, retornar mesas como disponíveis
    const tables = tablesToShow.map(tableConfig => ({
      number: tableConfig.number,
      available: true,
      capacity: tableConfig.capacity,
      area: tableConfig.area,
      description: tableConfig.description,
    }));

    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

    return NextResponse.json({
      tables,
      summary: {
        totalTables: tablesToShow.length,
        availableTables: tablesToShow.length,
        occupiedTables: 0,
        totalCapacity,
        area: area || 'all',
      },
      warning: 'Não foi possível verificar reservas existentes. Mostrando todas as mesas como disponíveis.'
    });
  }
}
