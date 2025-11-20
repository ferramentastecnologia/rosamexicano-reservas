// Configuração das Mesas - Rosa Mexicano

export type TableArea = 'interna' | 'primeiro-salao' | 'externa';

export interface TableConfig {
  number: number;
  capacity: number;
  area: TableArea;
  description?: string;
}

// Área Interna (01-25, exceto 9, 13, 15)
const areaInterna: TableConfig[] = [
  // Mesas regulares de 4 lugares
  { number: 1, capacity: 4, area: 'interna' },
  { number: 2, capacity: 4, area: 'interna' },
  { number: 3, capacity: 4, area: 'interna' },
  { number: 4, capacity: 4, area: 'interna' },
  { number: 5, capacity: 4, area: 'interna' },
  { number: 6, capacity: 4, area: 'interna' },
  { number: 7, capacity: 4, area: 'interna' },
  { number: 8, capacity: 4, area: 'interna' },
  // Mesa 9 não existe
  // Mesas pequenas de 2 lugares
  { number: 10, capacity: 2, area: 'interna', description: 'Mesa pequena' },
  { number: 11, capacity: 2, area: 'interna', description: 'Mesa pequena' },
  { number: 12, capacity: 2, area: 'interna', description: 'Mesa pequena' },
  // Mesa 13 não existe
  { number: 14, capacity: 4, area: 'interna' },
  // Mesa 15 não existe
  // Mesa grande de 8 lugares
  { number: 16, capacity: 8, area: 'interna', description: 'Mesa grande' },
  // Booths de 6 lugares
  { number: 17, capacity: 6, area: 'interna', description: 'Booth' },
  { number: 18, capacity: 6, area: 'interna', description: 'Booth' },
  { number: 19, capacity: 6, area: 'interna', description: 'Booth' },
  { number: 20, capacity: 6, area: 'interna', description: 'Booth' },
  // Mesas regulares continuação
  { number: 21, capacity: 4, area: 'interna' },
  { number: 22, capacity: 4, area: 'interna' },
  { number: 23, capacity: 4, area: 'interna' },
  { number: 24, capacity: 4, area: 'interna' },
  { number: 25, capacity: 4, area: 'interna' },
];

// Primeiro Salão (26-37)
const primeiroSalao: TableConfig[] = Array.from({ length: 12 }, (_, i) => ({
  number: 26 + i,
  capacity: 4,
  area: 'primeiro-salao' as TableArea,
}));

// Área Externa (38-52)
const areaExterna: TableConfig[] = [
  { number: 38, capacity: 4, area: 'externa' },
  { number: 39, capacity: 4, area: 'externa' },
  { number: 40, capacity: 4, area: 'externa' },
  { number: 41, capacity: 4, area: 'externa' },
  { number: 42, capacity: 4, area: 'externa' },
  { number: 43, capacity: 4, area: 'externa' },
  { number: 44, capacity: 4, area: 'externa' },
  { number: 45, capacity: 4, area: 'externa' },
  { number: 46, capacity: 4, area: 'externa' },
  // Mesas grandes de 6 lugares
  { number: 47, capacity: 6, area: 'externa', description: 'Mesa grande' },
  { number: 48, capacity: 6, area: 'externa', description: 'Mesa grande' },
  { number: 49, capacity: 6, area: 'externa', description: 'Mesa grande' },
  // Continuação
  { number: 50, capacity: 4, area: 'externa' },
  { number: 51, capacity: 4, area: 'externa' },
  { number: 52, capacity: 4, area: 'externa' },
];

// Todas as mesas
export const ALL_TABLES: TableConfig[] = [
  ...areaInterna,
  ...primeiroSalao,
  ...areaExterna,
];

// Constantes
export const TOTAL_TABLES = ALL_TABLES.length; // 49 mesas
export const TOTAL_CAPACITY = ALL_TABLES.reduce((sum, table) => sum + table.capacity, 0); // 208 pessoas

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

export function calculateTablesNeeded(people: number): number {
  // Estratégia: tentar usar mesas da forma mais eficiente
  let remaining = people;
  let tablesNeeded = 0;

  // 1. Usar mesas de 8 lugares se necessário
  while (remaining >= 8) {
    const table8Available = ALL_TABLES.find(t => t.capacity === 8);
    if (table8Available) {
      remaining -= 8;
      tablesNeeded++;
    } else {
      break;
    }
  }

  // 2. Usar mesas de 6 lugares (booths e externas)
  while (remaining >= 6) {
    const table6Available = ALL_TABLES.find(t => t.capacity === 6);
    if (table6Available) {
      remaining -= 6;
      tablesNeeded++;
    } else {
      break;
    }
  }

  // 3. Usar mesas de 4 lugares
  while (remaining >= 4) {
    remaining -= 4;
    tablesNeeded++;
  }

  // 4. Usar mesas de 2 lugares para o restante
  while (remaining > 0) {
    if (remaining <= 2) {
      tablesNeeded++;
      remaining = 0;
    } else {
      remaining -= 4; // Usa mesa de 4 para 3 pessoas
      tablesNeeded++;
    }
  }

  return tablesNeeded;
}

// Nomes das áreas para exibição
export const AREA_NAMES: Record<TableArea, string> = {
  'interna': 'Área Interna',
  'primeiro-salao': 'Primeiro Salão',
  'externa': 'Área Externa',
};
