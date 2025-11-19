import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Configurações do restaurante
const MAX_TABLES = 15;
const PEOPLE_PER_TABLE = 4;
const MAX_CAPACITY = MAX_TABLES * PEOPLE_PER_TABLE; // 60 pessoas

export async function POST(request: Request) {
  try {
    const { data, horario, numeroPessoas } = await request.json();

    if (!data || !horario || !numeroPessoas) {
      return NextResponse.json(
        { available: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Buscar todas as reservas confirmadas para a data e horário
    const reservations = await prisma.reservation.findMany({
      where: {
        data: data,
        horario: horario,
        status: {
          in: ['pending', 'confirmed'] // Considera pendentes e confirmadas
        }
      },
      select: {
        numeroPessoas: true,
      }
    });

    // Calcular total de pessoas já reservadas
    const totalReserved = reservations.reduce((sum, r) => sum + r.numeroPessoas, 0);

    // Calcular se há capacidade disponível
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
    return NextResponse.json(
      { available: false, error: 'Erro ao verificar disponibilidade' },
      { status: 500 }
    );
  }
}
