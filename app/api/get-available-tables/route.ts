import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ALL_TABLES, TOTAL_TABLES, getTableCapacity } from '@/lib/tables-config';

export async function POST(request: Request) {
  try {
    const { data, horario } = await request.json();

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

    // Criar array de todas as mesas com status usando configuração real
    const tables = ALL_TABLES.map(tableConfig => ({
      number: tableConfig.number,
      available: !occupiedTables.has(tableConfig.number),
      capacity: tableConfig.capacity,
      area: tableConfig.area,
      description: tableConfig.description,
    }));

    // Contar mesas disponíveis e capacidade total
    const availableTablesList = tables.filter(t => t.available);
    const totalCapacity = availableTablesList.reduce((sum, t) => sum + t.capacity, 0);

    return NextResponse.json({
      tables,
      summary: {
        totalTables: TOTAL_TABLES,
        availableTables: availableTablesList.length,
        occupiedTables: occupiedTables.size,
        totalCapacity,
      }
    });

  } catch (error) {
    console.error('Erro ao buscar mesas disponíveis:', error);

    // Em caso de erro, retornar mesas padrão vazias usando configuração real
    const tables = ALL_TABLES.map(tableConfig => ({
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
        totalTables: TOTAL_TABLES,
        availableTables: TOTAL_TABLES,
        occupiedTables: 0,
        totalCapacity,
      },
      warning: 'Não foi possível verificar reservas existentes. Mostrando todas as mesas como disponíveis.'
    });
  }
}
