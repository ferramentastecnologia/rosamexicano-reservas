import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ALL_TABLES, TableArea, getTablesByArea } from '@/lib/tables-config';

// Cache em memória para reduzir queries ao banco
const cache = new Map<string, { data: Set<number>; timestamp: number }>();
const CACHE_TTL = 30000; // 30 segundos

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const { data, area } = await request.json();

    if (!data) {
      return NextResponse.json(
        { error: 'Data é obrigatória' },
        { status: 400 }
      );
    }

    // Verificar cache
    const cacheKey = `tables-${data}`;
    const cached = cache.get(cacheKey);
    let occupiedTables: Set<number>;

    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      // Usar dados do cache
      occupiedTables = cached.data;
    } else {
      // Buscar do banco - query otimizada apenas com campos necessários
      const reservations = await prisma.reservation.findMany({
        where: {
          data: data,
          status: 'confirmed'
        },
        select: {
          mesasSelecionadas: true
        }
      });

      // Processar mesas ocupadas
      occupiedTables = new Set<number>();
      for (const reservation of reservations) {
        if (reservation.mesasSelecionadas) {
          try {
            const tables = JSON.parse(reservation.mesasSelecionadas);
            for (const tableNum of tables) {
              occupiedTables.add(tableNum);
            }
          } catch {
            // Ignora erro de parse silenciosamente
          }
        }
      }

      // Salvar no cache
      cache.set(cacheKey, { data: occupiedTables, timestamp: Date.now() });
    }

    // Filtrar mesas por área
    const tablesToShow = area
      ? getTablesByArea(area as TableArea)
      : ALL_TABLES;

    // Criar array de mesas com status
    const tables = tablesToShow.map(tableConfig => ({
      number: tableConfig.number,
      available: !occupiedTables.has(tableConfig.number),
      capacity: tableConfig.capacity,
      area: tableConfig.area,
    }));

    // Calcular resumo
    const availableCount = tables.filter(t => t.available).length;
    const totalCapacity = tables.reduce((sum, t) => t.available ? sum + t.capacity : sum, 0);

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      tables,
      summary: {
        totalTables: tablesToShow.length,
        availableTables: availableCount,
        occupiedTables: tables.length - availableCount,
        totalCapacity,
        area: area || 'all',
      },
      _meta: { responseTime }
    }, {
      headers: {
        'Cache-Control': 'private, max-age=15, stale-while-revalidate=30',
      }
    });

  } catch (error) {
    console.error('Erro ao buscar mesas:', error);

    // Fallback: retornar mesas como disponíveis
    let area: TableArea | null = null;
    try {
      const body = await request.clone().json();
      area = body.area;
    } catch {}

    const tablesToShow = area ? getTablesByArea(area) : ALL_TABLES;
    const tables = tablesToShow.map(t => ({
      number: t.number,
      available: true,
      capacity: t.capacity,
      area: t.area,
    }));

    return NextResponse.json({
      tables,
      summary: {
        totalTables: tablesToShow.length,
        availableTables: tablesToShow.length,
        occupiedTables: 0,
        totalCapacity: tables.reduce((sum, t) => sum + t.capacity, 0),
        area: area || 'all',
      },
      warning: 'Fallback: mostrando todas as mesas como disponíveis.'
    });
  }
}
