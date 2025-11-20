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
  AlertCircle
} from 'lucide-react';

type TableInfo = {
  tableNumber: number;
  occupied: boolean;
  reservation: {
    id: string;
    code: string;
    name: string;
    people: number;
    status: string;
  } | null;
};

type OccupancyData = {
  date: string;
  time: string;
  tables: TableInfo[];
  summary: {
    total: number;
    occupied: number;
    available: number;
    totalPeople: number;
  };
};

const horarios = ['18:00', '18:30', '19:00', '19:30'];

export default function AdminTables() {
  const router = useRouter();
  const [occupancyData, setOccupancyData] = useState<OccupancyData | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }

    // Definir data de hoje como padrão
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, [router]);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      loadOccupancy();
    }
  }, [selectedDate, selectedTime]);

  const loadOccupancy = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/table-occupancy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: selectedDate,
          horario: selectedTime,
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
    const styles = {
      pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
      confirmed: 'bg-green-900/30 text-green-400 border-green-800',
    };

    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmada',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

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
          <p className="text-zinc-400">Visualize a ocupação das mesas por data e horário</p>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
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

            <div className="flex items-end">
              <button
                onClick={loadOccupancy}
                className="w-full px-4 py-2 bg-[#E53935] hover:bg-[#B71C1C] rounded-lg transition"
              >
                🔄 Atualizar
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
              <h2 className="text-xl font-semibold mb-4">
                Mesas - {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')} às {selectedTime}
              </h2>

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

            {/* Table Grid */}
            <div className="grid grid-cols-5 gap-4">
              {occupancyData.tables.map(table => (
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
                    <span className="text-xs text-zinc-500">4p</span>
                  )}
                </button>
              ))}
            </div>
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
                <h2 className="text-2xl font-bold">Mesa {selectedTable.tableNumber}</h2>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {selectedTable.occupied && selectedTable.reservation ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedTable.reservation.status)}</div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400">Código da Reserva</label>
                    <p className="font-medium font-mono">{selectedTable.reservation.code}</p>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400">Cliente</label>
                    <p className="font-medium">{selectedTable.reservation.name}</p>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400">Número de Pessoas</label>
                    <p className="font-medium">{selectedTable.reservation.people}</p>
                  </div>

                  <Link
                    href="/admin/reservations"
                    className="block w-full mt-4 px-4 py-2 bg-[#E53935] hover:bg-[#B71C1C] text-center rounded-lg transition"
                    onClick={() => setSelectedTable(null)}
                  >
                    Ver Detalhes da Reserva
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-2">Mesa Disponível</p>
                  <p className="text-zinc-400 text-sm">
                    Esta mesa está livre para este horário
                  </p>
                  <div className="mt-4 p-4 bg-black rounded-lg">
                    <p className="text-sm text-zinc-400">Capacidade</p>
                    <p className="text-2xl font-bold">4 pessoas</p>
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
