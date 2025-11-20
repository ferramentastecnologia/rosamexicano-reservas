import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Configurações do restaurante
const MAX_TABLES = 15;
const PEOPLE_PER_TABLE = 4;
const MAX_CAPACITY = MAX_TABLES * PEOPLE_PER_TABLE; // 60 pessoas

export async function POST(request: Request) {
  try {
    const { data, horario, numeroPessoas } = await request.json();

    if (!data || !numeroPessoas) {
      return NextResponse.json(
        { available: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Buscar TODAS as reservas da DATA (não apenas do horário)
    const reservations = await prisma.reservation.findMany({
      where: {
        data: data,
        status: {
          in: ['pending', 'confirmed'] // Considera pendentes e confirmadas
        }
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

    // Calcular mesas necessárias para a nova reserva
    const tablesNeeded = Math.ceil(numeroPessoas / PEOPLE_PER_TABLE);
    const currentTablesUsed = Math.ceil(totalReserved / PEOPLE_PER_TABLE);
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
    const tablesNeeded = Math.ceil(numeroPessoas / PEOPLE_PER_TABLE);

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
