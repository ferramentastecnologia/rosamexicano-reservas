'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Users,
  Calendar,
  LogOut,
  LayoutDashboard,
  List,
  BarChart3,
  QrCode,
  RefreshCw,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Voucher = {
  id: string;
  codigo: string;
  valor: number;
  utilizado: boolean;
  dataUtilizacao: string | null;
  dataValidade: string;
};

type Reservation = {
  id: string;
  externalRef: string;
  nome: string;
  email: string;
  telefone: string;
  data: string;
  horario: string;
  numeroPessoas: number;
  mesasSelecionadas: string | null;
  valor: number;
  status: string;
  createdAt: string;
  voucher?: Voucher | null;
};

type SortColumn = 'dataHora' | 'nome' | 'status' | null;
type SortDirection = 'asc' | 'desc';

export default function AdminReservations() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('dataHora'); // Padrão: ordenar por Data/Hora
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc'); // Mais recentes primeiro

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }

    loadReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, reservations, sortColumn, sortDirection]);

  const loadReservations = async () => {
    try {
      const response = await fetch('/api/admin/reservations');
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.nome.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.telefone.includes(term) ||
        r.externalRef.toLowerCase().includes(term)
      );
    }

    // Ordenação
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue: any = '';
        let bValue: any = '';

        switch (sortColumn) {
          case 'dataHora':
            // Ordena por data primeiro, depois por hora
            const aDate = new Date(a.data).getTime();
            const bDate = new Date(b.data).getTime();
            if (aDate !== bDate) {
              return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
            }
            // Se mesma data, ordena por hora
            aValue = a.horario;
            bValue = b.horario;
            break;
          case 'nome':
            aValue = a.nome.toLowerCase();
            bValue = b.nome.toLowerCase();
            break;
          case 'status':
            aValue = a.status.toLowerCase();
            bValue = b.status.toLowerCase();
            break;
        }

        if (sortColumn !== 'dataHora') {
          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredReservations(filtered);
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Se já está ordenando por esta coluna, muda a direção
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Se é uma coluna nova, ordena em ordem ascendente
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

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadReservations();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
      confirmed: 'bg-blue-900/30 text-blue-400 border-blue-800',
      approved: 'bg-green-900/30 text-green-400 border-green-800',
      rejected: 'bg-red-900/30 text-red-400 border-red-800',
      cancelled: 'bg-zinc-900/30 text-zinc-400 border-zinc-800',
    };

    const labels = {
      pending: 'Aguardando Pagamento',
      confirmed: 'Pago - Aguardando Aprovação',
      approved: 'Aprovada',
      rejected: 'Rejeitada',
      cancelled: 'Cancelada',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs border ${styles[status as keyof typeof styles] || styles.pending}`}>
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
              <Image
                src="/images/logo-rosa-mexicano.png"
                alt="Rosa Mexicano"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-sm text-zinc-400 border-l border-zinc-700 pl-4">
                Painel Administrativo
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-zinc-900 border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto">
            <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <LayoutDashboard className="w-4 h-4" />Dashboard
            </Link>
            <Link href="/admin/reservations" className="flex items-center gap-2 px-4 py-3 border-b-2 border-[#E53935] text-white whitespace-nowrap">
              <List className="w-4 h-4" />Reservas
            </Link>
            <Link href="/admin/validar-voucher" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <QrCode className="w-4 h-4" />Voucher
            </Link>
            <Link href="/admin/reports" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <BarChart3 className="w-4 h-4" />Relatórios
            </Link>
            <Link href="/admin/usuarios" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <Users className="w-4 h-4" />Usuários
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Reservas</h1>
          <div className="flex gap-3">
            <Link
              href="/admin/create-reservation"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Reserva
            </Link>
            <button
              onClick={loadReservations}
              className="px-4 py-2 bg-[#E53935] hover:bg-[#B71C1C] rounded-lg transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome, email, telefone ou código..."
                  className="w-full pl-10 pr-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
                >
                  <option value="all">Todos</option>
                  <option value="pending">Aguardando Pagamento</option>
                  <option value="confirmed">Aguardando Aprovação</option>
                  <option value="approved">Aprovadas</option>
                  <option value="rejected">Rejeitadas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-zinc-400">
            Mostrando {filteredReservations.length} de {reservations.length} reservas
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E53935]"></div>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Código</th>
                    <th
                      onClick={() => handleSort('nome')}
                      className="px-4 py-3 text-left text-xs font-medium text-zinc-400 cursor-pointer hover:text-white transition"
                    >
                      Cliente {renderSortIcon('nome')}
                    </th>
                    <th
                      onClick={() => handleSort('dataHora')}
                      className="px-4 py-3 text-left text-xs font-medium text-zinc-400 cursor-pointer hover:text-white transition"
                    >
                      Data/Hora {renderSortIcon('dataHora')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Pessoas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Mesas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Valor</th>
                    <th
                      onClick={() => handleSort('status')}
                      className="px-4 py-3 text-left text-xs font-medium text-zinc-400 cursor-pointer hover:text-white transition"
                    >
                      Status {renderSortIcon('status')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredReservations.map((reservation) => {
                    const mesas = reservation.mesasSelecionadas
                      ? JSON.parse(reservation.mesasSelecionadas).join(', ')
                      : '-';

                    return (
                      <tr key={reservation.id} className="hover:bg-zinc-800/50">
                        <td className="px-4 py-3 text-sm font-mono">{reservation.externalRef}</td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{reservation.nome}</div>
                            <div className="text-xs text-zinc-400">{reservation.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div>{new Date(reservation.data + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                            <div className="text-zinc-400">{reservation.horario}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{reservation.numeroPessoas}</td>
                        <td className="px-4 py-3 text-sm">{mesas}</td>
                        <td className="px-4 py-3 text-sm font-medium text-[#E53935]">R$ {reservation.valor.toFixed(2)}</td>
                        <td className="px-4 py-3">{getStatusBadge(reservation.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedReservation(reservation)}
                              className="p-2 bg-blue-900/30 hover:bg-blue-900/50 rounded transition"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4 text-blue-400" />
                            </button>
                            {reservation.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => updateStatus(reservation.id, 'approved')}
                                  className="p-2 bg-green-900/30 hover:bg-green-900/50 rounded transition"
                                  title="Aprovar Reserva"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                </button>
                                <button
                                  onClick={() => updateStatus(reservation.id, 'rejected')}
                                  className="p-2 bg-red-900/30 hover:bg-red-900/50 rounded transition"
                                  title="Rejeitar Reserva"
                                >
                                  <XCircle className="w-4 h-4 text-red-400" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Detalhes */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Detalhes da Reserva</h2>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-zinc-400">Código</label>
                    <p className="font-medium font-mono">{selectedReservation.externalRef}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedReservation.status)}</div>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <h3 className="font-semibold mb-3">Dados do Cliente</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-zinc-400">Nome</label>
                      <p className="font-medium">{selectedReservation.nome}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Email</label>
                      <p className="font-medium">{selectedReservation.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Telefone</label>
                      <p className="font-medium">{selectedReservation.telefone}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <h3 className="font-semibold mb-3">Detalhes da Reserva</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-zinc-400">Data</label>
                      <p className="font-medium">
                        {new Date(selectedReservation.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Horário</label>
                      <p className="font-medium">{selectedReservation.horario}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Número de Pessoas</label>
                      <p className="font-medium">{selectedReservation.numeroPessoas}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Mesas Selecionadas</label>
                      <p className="font-medium">
                        {selectedReservation.mesasSelecionadas
                          ? JSON.parse(selectedReservation.mesasSelecionadas).join(', ')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Valor</label>
                      <p className="font-medium">R$ {selectedReservation.valor.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Criada em</label>
                      <p className="font-medium">
                        {new Date(selectedReservation.createdAt).toLocaleDateString('pt-BR')} às {new Date(selectedReservation.createdAt).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Voucher */}
                {selectedReservation.voucher && (
                  <div className="border-t border-zinc-800 pt-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#E53935]" />
                      Voucher
                    </h3>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-zinc-400">Código</label>
                          <p className="font-mono font-bold text-lg">{selectedReservation.voucher.codigo}</p>
                        </div>
                        <div>
                          <label className="text-sm text-zinc-400">Status</label>
                          <p className="font-medium">
                            {selectedReservation.voucher.utilizado ? (
                              <span className="inline-flex items-center gap-1 text-yellow-400">
                                <CheckCircle className="w-4 h-4" />
                                Utilizado
                                {selectedReservation.voucher.dataUtilizacao && (
                                  <span className="text-xs text-zinc-500 ml-1">
                                    ({new Date(selectedReservation.voucher.dataUtilizacao).toLocaleDateString('pt-BR')})
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-green-400">
                                <Clock className="w-4 h-4" />
                                Disponível
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-zinc-400">Valor</label>
                          <p className="font-medium text-[#E53935]">R$ {selectedReservation.voucher.valor.toFixed(2)}</p>
                        </div>
                        <div>
                          <label className="text-sm text-zinc-400">Validade</label>
                          <p className="font-medium">
                            {new Date(selectedReservation.voucher.dataValidade).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                {selectedReservation.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => {
                        updateStatus(selectedReservation.id, 'approved');
                        setSelectedReservation(null);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                    >
                      Aprovar Reserva
                    </button>
                    <button
                      onClick={() => {
                        updateStatus(selectedReservation.id, 'rejected');
                        setSelectedReservation(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                    >
                      Rejeitar Reserva
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
