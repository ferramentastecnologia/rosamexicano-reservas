import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Rota temporária para limpar dados de teste
// DELETE /api/admin/cleanup-test-data?secret=rm-teste-2024
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Proteção simples
  if (secret !== 'rm-teste-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Primeiro, buscar quantos registros serão afetados
    const toDelete = await prisma.reservation.findMany({
      where: {
        nome: {
          contains: 'teste',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        nome: true,
        email: true,
        data: true,
      },
    });

    // Deletar os registros
    const result = await prisma.reservation.deleteMany({
      where: {
        nome: {
          contains: 'teste',
          mode: 'insensitive',
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Removidas ${result.count} reservas de teste`,
      deleted: toDelete,
    });
  } catch (error) {
    console.error('Erro ao limpar dados de teste:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao limpar dados' },
      { status: 500 }
    );
  }
}

// GET para visualizar antes de deletar
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== 'rm-teste-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const testRecords = await prisma.reservation.findMany({
      where: {
        nome: {
          contains: 'teste',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        nome: true,
        email: true,
        data: true,
        horario: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: testRecords.length,
      records: testRecords,
    });
  } catch (error) {
    console.error('Erro ao buscar dados de teste:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados' },
      { status: 500 }
    );
  }
}
