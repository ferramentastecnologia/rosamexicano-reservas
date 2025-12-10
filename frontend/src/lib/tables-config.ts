import { TableArea, TableConfig } from '../types';

// Mesas que NÃO existem
const MESAS_INEXISTENTES = [9, 13, 15];

// Área Interna (01-25, exceto 9, 13, 15)
const areaInterna: TableConfig[] = [
  { number: 1, capacity: 4, area: 'interno' },
  { number: 2, capacity: 4, area: 'interno' },
  { number: 3, capacity: 4, area: 'interno' },
  { number: 4, capacity: 4, area: 'interno' },
  { number: 5, capacity: 4, area: 'interno' },
  { number: 6, capacity: 4, area: 'interno' },
  { number: 7, capacity: 4, area: 'interno' },
  { number: 8, capacity: 4, area: 'interno' },
  // Mesa 9 não existe
  { number: 10, capacity: 4, area: 'interno' },
  { number: 11, capacity: 4, area: 'interno' },
  { number: 12, capacity: 4, area: 'interno' },
  // Mesa 13 não existe
  { number: 14, capacity: 4, area: 'interno' },
  // Mesa 15 não existe
  { number: 16, capacity: 4, area: 'interno' },
  { number: 17, capacity: 4, area: 'interno' },
  { number: 18, capacity: 4, area: 'interno' },
  { number: 19, capacity: 4, area: 'interno' },
  { number: 20, capacity: 4, area: 'interno' },
  { number: 21, capacity: 4, area: 'interno' },
  { number: 22, capacity: 4, area: 'interno' },
  { number: 23, capacity: 4, area: 'interno' },
  { number: 24, capacity: 4, area: 'interno' },
  { number: 25, capacity: 4, area: 'interno' },
];

// Área Semi Externa (26-37)
const areaSemiExterna: TableConfig[] = Array.from({ length: 12 }, (_, i) => ({
  number: 26 + i,
  capacity: 4,
  area: 'semi-externo' as TableArea,
}));

// Área Externa (38-51)
const areaExterna: TableConfig[] = Array.from({ length: 14 }, (_, i) => ({
  number: 38 + i,
  capacity: 4,
  area: 'externo' as TableArea,
}));

// Todas as mesas
export const ALL_TABLES: TableConfig[] = [
  ...areaInterna,
  ...areaSemiExterna,
  ...areaExterna,
];

// Constantes
export const TOTAL_TABLES = ALL_TABLES.length; // 48 mesas
export const TOTAL_CAPACITY = ALL_TABLES.reduce((sum, table) => sum + table.capacity, 0);

// Helper functions
export function getTablesByArea(area: TableArea): TableConfig[] {
  return ALL_TABLES.filter(table => table.area === area);
}

export function getTableByNumber(number: number): TableConfig | undefined {
  return ALL_TABLES.find(table => table.number === number);
}

export function getTableCapacity(number: number): number {
  const table = getTableByNumber(number);
  return table?.capacity || 4;
}

export function isValidTable(number: number): boolean {
  return !MESAS_INEXISTENTES.includes(number) && ALL_TABLES.some(t => t.number === number);
}

export function calculateTablesNeeded(people: number): number {
  return Math.ceil(people / 4);
}

// Nomes das áreas para exibição
export const AREA_NAMES: Record<TableArea, string> = {
  'interno': 'Interno',
  'semi-externo': 'Semi Externo',
  'externo': 'Externo',
};

// Descrições das áreas
export const AREA_DESCRIPTIONS: Record<TableArea, string> = {
  'interno': 'Mesas 01-25',
  'semi-externo': 'Mesas 26-37',
  'externo': 'Mesas 38-51',
};

// Horários disponíveis
export const HORARIOS = ['18:00', '18:30', '19:00', '19:30'];

// Datas fechadas
export const CLOSED_DATES = [
  '2024-12-24', // Véspera de Natal
  '2024-12-25', // Natal
  '2024-12-31', // Réveillon
  '2025-12-24', // Véspera de Natal 2025
  '2025-12-25', // Natal 2025
  '2025-12-31', // Réveillon 2025
];
