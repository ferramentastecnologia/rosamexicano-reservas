import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TOTAL_TABLES, TOTAL_CAPACITY, calculateTablesNeeded } from '@/lib/tables-config';

// Configurações do restaurante Rosa Mexicano
const MAX_TABLES = TOTAL_TABLES; // 49 mesas
const MAX_CAPACITY = TOTAL_CAPACITY; // ~216 pessoas

export async function POST(request: Request) {
  try {
    const { data, horario, numeroPessoas } = await request.json();

    if (!data || !numeroPessoas) {
      return NextResponse.json(
        { available: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Buscar TODAS as reservas CONFIRMADAS da DATA
    // Apenas reservas com pagamento confirmado contam para disponibilidade
    const reservations = await prisma.reservation.findMany({
      where: {
        data: data,
        status: 'confirmed' // Apenas confirmadas bloqueiam capacidade
      },
      select: {
        numeroPessoas: true,
      }
    });

    // Calcular total de pessoas já reservadas NA DATA
    const totalReserved = reservations.reduce((sum, r) => sum + r.numeroPessoas, 0);

    // Calcular se há capacidade disponível NA DATA
    const availableCapacity = MAX_CAPACITY - totalReserved;
    const canAccommodate = availableCapacity >= numeroPessoas;

    // Calcular mesas necessárias usando algoritmo inteligente
    const tablesNeeded = calculateTablesNeeded(numeroPessoas);
    const currentTablesUsed = calculateTablesNeeded(totalReserved);
    const tablesAvailable = MAX_TABLES - currentTablesUsed;

    return NextResponse.json({
      available: canAccommodate,
      capacity: {
        maxCapacity: MAX_CAPACITY,
        reserved: totalReserved,
        available: availableCapacity,
        requested: numeroPessoas,
      },
      tables: {
        total: MAX_TABLES,
        used: currentTablesUsed,
        available: tablesAvailable,
        needed: tablesNeeded,
      }
    });

  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);

    // Em caso de erro de conexão, assumir que está disponível
    // (melhor permitir a reserva do que bloquear completamente)
    const tablesNeeded = calculateTablesNeeded(numeroPessoas);

    return NextResponse.json({
      available: true,
      capacity: {
        maxCapacity: MAX_CAPACITY,
        reserved: 0,
        available: MAX_CAPACITY,
        requested: numeroPessoas,
      },
      tables: {
        total: MAX_TABLES,
        used: 0,
        available: MAX_TABLES,
        needed: tablesNeeded,
      },
      warning: 'Não foi possível verificar reservas existentes. Assumindo disponibilidade.'
    });
  }
}
