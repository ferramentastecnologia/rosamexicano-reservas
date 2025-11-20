import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TOTAL_TABLES = 15;
const PEOPLE_PER_TABLE = 4;

export async function POST(request: Request) {
  try {
    const { data, horario } = await request.json();

    if (!data) {
      return NextResponse.json(
        { error: 'Data é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar TODAS as reservas da DATA (não apenas do horário específico)
    // As mesas são compartilhadas entre todos os horários do dia
    const reservations = await prisma.reservation.findMany({
      where: {
        data: data,
        status: {
          in: ['pending', 'confirmed']
        }
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

    // Criar array de todas as mesas com status
    const tables = Array.from({ length: TOTAL_TABLES }, (_, i) => {
      const tableNumber = i + 1;
      return {
        number: tableNumber,
        available: !occupiedTables.has(tableNumber),
        capacity: PEOPLE_PER_TABLE,
      };
    });

    // Contar mesas disponíveis
    const availableTables = tables.filter(t => t.available).length;
    const totalCapacity = availableTables * PEOPLE_PER_TABLE;

    return NextResponse.json({
      tables,
      summary: {
        totalTables: TOTAL_TABLES,
        availableTables,
        occupiedTables: occupiedTables.size,
        totalCapacity,
      }
    });

  } catch (error) {
    console.error('Erro ao buscar mesas disponíveis:', error);

    // Em caso de erro, retornar mesas padrão vazias para que o frontend possa usar o fallback
    const tables = Array.from({ length: TOTAL_TABLES }, (_, i) => ({
      number: i + 1,
      available: true,
      capacity: PEOPLE_PER_TABLE,
    }));

    return NextResponse.json({
      tables,
      summary: {
        totalTables: TOTAL_TABLES,
        availableTables: TOTAL_TABLES,
        occupiedTables: 0,
        totalCapacity: TOTAL_TABLES * PEOPLE_PER_TABLE,
      },
      warning: 'Não foi possível verificar reservas existentes. Mostrando todas as mesas como disponíveis.'
    });
  }
}
