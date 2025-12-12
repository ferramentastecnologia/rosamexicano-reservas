'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LogOut,
  LayoutDashboard,
  List,
  BarChart3,
  Table as TableIcon,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  MapPin,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

type TableArea = 'interno' | 'semi-externo' | 'externo';

const AREA_NAMES: Record<TableArea, string> = {
  'interno': 'Interno',
  'semi-externo': 'Semi Externo',
  'externo': 'Externo',
};

const AREA_DESCRIPTIONS: Record<TableArea, string> = {
  'interno': 'Mesas 01-25',
  'semi-externo': 'Mesas 26-37',
  'externo': 'Mesas 38-51',
};

type Reservation = {
  id: string;
  code: string;
  name: string;
  people: number;
  status: string;
  horario: string;
};

type TableInfo = {
  tableNumber: number;
  capacity: number;
  area: TableArea;
  areaName: string;
  occupied: boolean;
  reservation: Reservation | null;
  reservations: Reservation[];
};

type OccupancyData = {
  date: string;
  time: string;
  area: string;
  tables: TableInfo[];
  summary: {
    total: number;
    occupied: number;
    available: number;
    totalPeople: number;
  };
};

const horarios = ['18:00', '18:30', '19:00', '19:30'];

type SortColumn = 'number' | 'capacity' | null;
type SortDirection = 'asc' | 'desc';

export default function AdminTables() {
  const router = useRouter();
  const [occupancyData, setOccupancyData] = useState<OccupancyData | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [selectedArea, setSelectedArea] = useState<TableArea | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, [router]);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      loadOccupancy();
    }
  }, [selectedDate, selectedTime, selectedArea]);

  const loadOccupancy = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/table-occupancy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: selectedDate,
          horario: selectedTime,
          area: selectedArea === 'all' ? null : selectedArea,
        }),
      });

      const data = await response.json();
      setOccupancyData(data);
    } catch (error) {
      console.error('Erro ao carregar ocupação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4 ml-1 inline" />
      : <ChevronDown className="w-4 h-4 ml-1 inline" />;
  };

  const sortTables = (tables: TableInfo[]) => {
    const sorted = [...tables];
    if (!sortColumn) return sorted;

    sorted.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortColumn) {
        case 'number':
          aValue = a.tableNumber;
          bValue = b.tableNumber;
          break;
        case 'capacity':
          aValue = a.capacity;
          bValue = b.capacity;
          break;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const getTableColor = (table: TableInfo) => {
    if (!table.occupied) {
      return 'bg-green-900/30 border-green-800 hover:bg-green-900/40';
    }
    if (table.reservation?.status === 'confirmed') {
      return 'bg-blue-900/30 border-blue-800 hover:bg-blue-900/40';
    }
    return 'bg-yellow-900/30 border-yellow-800 hover:bg-yellow-900/40';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
      confirmed: 'bg-green-900/30 text-green-400 border-green-800',
    };

    const labels: Record<string, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmada',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs border ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Agrupar mesas por área para exibição
  const groupedTables = occupancyData?.tables.reduce((acc, table) => {
    const area = table.area;
    if (!acc[area]) {
      acc[area] = [];
    }
    acc[area].push(table);
    return acc;
  }, {} as Record<TableArea, TableInfo[]>);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/images/logo-rosa-mexicano.png" alt="Rosa Mexicano" width={120} height={40} className="h-10 w-auto" />
              <span className="text-sm text-zinc-400 border-l border-zinc-700 pl-4">Painel Administrativo</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition">
              <LogOut className="w-4 h-4" />Sair
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-zinc-900 border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition">
              <LayoutDashboard className="w-4 h-4" />Dashboard
            </Link>
            <Link href="/admin/reservations" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition">
              <List className="w-4 h-4" />Reservas
            </Link>
            <Link href="/admin/tables" className="flex items-center gap-2 px-4 py-3 border-b-2 border-[#E53935] text-white">
              <TableIcon className="w-4 h-4" />Mesas
            </Link>
            <Link href="/admin/reports" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition">
              <BarChart3 className="w-4 h-4" />Relatórios
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mapa de Mesas</h1>
          <p className="text-zinc-400">
            Visualize a ocupação das mesas por data e área.
            <span className="text-orange-400 ml-2">48 mesas disponíveis (3 áreas)</span>
          </p>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E53935]" />
                Data
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E53935]" />
                Horário
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
              >
                {horarios.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E53935]" />
                Área
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value as TableArea | 'all')}
                className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
              >
                <option value="all">Todas as Áreas</option>
                <option value="interno">Interno (01-25)</option>
                <option value="semi-externo">Semi Externo (26-37)</option>
                <option value="externo">Externo (38-51)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadOccupancy}
                className="w-full px-4 py-2 bg-[#E53935] hover:bg-[#B71C1C] rounded-lg transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {occupancyData && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Total de Mesas</p>
                  <p className="text-2xl font-bold">{occupancyData.summary.total}</p>
                </div>
                <TableIcon className="w-8 h-8 text-zinc-600" />
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Ocupadas</p>
                  <p className="text-2xl font-bold text-red-400">{occupancyData.summary.occupied}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Disponíveis</p>
                  <p className="text-2xl font-bold text-green-400">{occupancyData.summary.available}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Total de Pessoas</p>
                  <p className="text-2xl font-bold text-blue-400">{occupancyData.summary.totalPeople}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        )}

        {/* Table Map */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E53935]"></div>
          </div>
        ) : occupancyData ? (
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Mesas - {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Mostrando reservas de {selectedTime}
                    {selectedArea !== 'all' && ` • Área: ${AREA_NAMES[selectedArea as TableArea]}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSort('number')}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-sm transition flex items-center gap-1"
                    title="Ordenar por número da mesa"
                  >
                    Nº {renderSortIcon('number')}
                  </button>
                  <button
                    onClick={() => handleSort('capacity')}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-sm transition flex items-center gap-1"
                    title="Ordenar por capacidade"
                  >
                    Cap. {renderSortIcon('capacity')}
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-900/30 border border-green-800 rounded"></div>
                  <span className="text-zinc-400">Disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-900/30 border border-yellow-800 rounded"></div>
                  <span className="text-zinc-400">Pendente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-900/30 border border-blue-800 rounded"></div>
                  <span className="text-zinc-400">Confirmada</span>
                </div>
              </div>
            </div>

            {/* Table Grid by Area */}
            {selectedArea === 'all' && groupedTables ? (
              <div className="space-y-8">
                {(['interno', 'semi-externo', 'externo'] as TableArea[]).map(area => (
                  groupedTables[area] && groupedTables[area].length > 0 && (
                    <div key={area}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#E53935]" />
                        {AREA_NAMES[area]}
                        <span className="text-sm font-normal text-zinc-400">({AREA_DESCRIPTIONS[area]})</span>
                      </h3>
                      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-3">
                        {sortTables(groupedTables[area]).map(table => (
                          <button
                            key={table.tableNumber}
                            onClick={() => setSelectedTable(table)}
                            className={`
                              aspect-square rounded-lg border-2 flex flex-col items-center justify-center
                              transition-all cursor-pointer
                              ${getTableColor(table)}
                            `}
                          >
                            <span className="text-lg font-bold mb-0.5">{table.tableNumber}</span>
                            {table.occupied ? (
                              <>
                                <Users className="w-4 h-4 mb-0.5" />
                                <span className="text-xs">{table.reservation?.people}p</span>
                              </>
                            ) : (
                              <span className="text-xs text-zinc-500">{table.capacity}p</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {sortTables(occupancyData.tables).map(table => (
                  <button
                    key={table.tableNumber}
                    onClick={() => setSelectedTable(table)}
                    className={`
                      aspect-square rounded-lg border-2 flex flex-col items-center justify-center
                      transition-all cursor-pointer
                      ${getTableColor(table)}
                    `}
                  >
                    <span className="text-2xl font-bold mb-1">{table.tableNumber}</span>
                    {table.occupied ? (
                      <>
                        <Users className="w-5 h-5 mb-1" />
                        <span className="text-xs">{table.reservation?.people}p</span>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-500">{table.capacity}p</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-lg p-12 border border-zinc-800 text-center">
            <p className="text-zinc-400">Selecione uma data e horário para visualizar as mesas</p>
          </div>
        )}
      </main>

      {/* Modal de Detalhes da Mesa */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg max-w-md w-full border border-zinc-800">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Mesa {selectedTable.tableNumber}</h2>
                  <p className="text-sm text-zinc-400">{selectedTable.areaName}</p>
                </div>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedTable.occupied && selectedTable.reservations && selectedTable.reservations.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-orange-400">
                      Esta mesa possui {selectedTable.reservations.length} reserva(s) neste horário
                    </p>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {selectedTable.reservations.map((reservation, index) => (
                      <div key={index} className="bg-black/50 rounded-lg p-4 border border-zinc-700">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-zinc-400">Horário: {reservation.horario}</span>
                          {getStatusBadge(reservation.status)}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-zinc-400">Código:</span>
                            <span className="ml-2 font-mono font-medium">{reservation.code}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400">Cliente:</span>
                            <span className="ml-2 font-medium">{reservation.name}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400">Pessoas:</span>
                            <span className="ml-2 font-medium">{reservation.people}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/admin/reservations"
                    className="block w-full mt-4 px-4 py-2 bg-[#E53935] hover:bg-[#B71C1C] text-center rounded-lg transition"
                    onClick={() => setSelectedTable(null)}
                  >
                    Ver Todas as Reservas
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-2">Mesa Disponível</p>
                  <p className="text-zinc-400 text-sm">
                    Esta mesa está livre neste horário
                  </p>
                  <div className="mt-4 p-4 bg-black rounded-lg">
                    <p className="text-sm text-zinc-400">Capacidade</p>
                    <p className="text-2xl font-bold">{selectedTable.capacity} pessoas</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedTable(null)}
                className="w-full mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
