
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Image removido - usar img tag
import { Link } from 'react-router-dom';
import {
  Search,
  CheckCircle,
  XCircle,
  LogOut,
  LayoutDashboard,
  List,
  BarChart3,
  QrCode,
  User,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  Phone,
  Mail,
  Loader2,
  Eye,
  X,
  Table as TableIcon
} from 'lucide-react';
import { TableSkeleton } from '@/components/Skeleton';

type VoucherData = {
  id: string;
  codigo: string;
  valor: number;
  utilizado: boolean;
  dataUtilizacao: string | null;
  dataValidade: string;
  createdAt: string;
  reservation: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    data: string;
    horario: string;
    numeroPessoas: number;
    mesasSelecionadas: string | null;
    status: string;
  };
};

export default function VouchersPage() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<VoucherData[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<VoucherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherData | null>(null);
  const [validating, setValidating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
    } else {
      loadVouchers();
    }
  }, [navigate]);

  useEffect(() => {
    filterVouchers();
  }, [searchTerm, statusFilter, vouchers]);

  const loadVouchers = async () => {
    try {
      const response = await fetch('/api/admin/vouchers');
      const data = await response.json();
      if (data.vouchers) {
        setVouchers(data.vouchers);
      }
    } catch (error) {
      console.error('Erro ao carregar vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVouchers = () => {
    let filtered = [...vouchers];

    // Filtro por status
    if (statusFilter === 'used') {
      filtered = filtered.filter(v => getVoucherStatus(v) === 'used');
    } else if (statusFilter === 'available') {
      filtered = filtered.filter(v => getVoucherStatus(v) === 'available');
    } else if (statusFilter === 'expired') {
      filtered = filtered.filter(v => getVoucherStatus(v) === 'expired');
    }

    // Filtro por busca (código, email ou telefone)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(v =>
        v.codigo.toLowerCase().includes(term) ||
        v.reservation?.email?.toLowerCase().includes(term) ||
        v.reservation?.telefone?.includes(term) ||
        v.reservation?.nome?.toLowerCase().includes(term)
      );
    }

    setFilteredVouchers(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  const validarVoucher = async (voucher: VoucherData) => {
    setValidating(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/voucher/${voucher.codigo}/validar`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Erro ao validar voucher' });
        return;
      }

      setMessage({ type: 'success', text: 'Voucher validado com sucesso!' });

      // Atualizar lista
      setVouchers(prev => prev.map(v =>
        v.codigo === voucher.codigo
          ? { ...v, utilizado: true, dataUtilizacao: new Date().toISOString() }
          : v
      ));

      // Atualizar voucher selecionado
      setSelectedVoucher(prev => prev ? { ...prev, utilizado: true, dataUtilizacao: new Date().toISOString() } : null);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao validar voucher' });
    } finally {
      setValidating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const isExpired = (voucher: VoucherData) => {
    if (!voucher.reservation?.data || !voucher.reservation?.horario) return false;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const reservationDateStr = voucher.reservation.data; // YYYY-MM-DD

    // Se a data da reserva é anterior a hoje, está expirado
    if (reservationDateStr < todayStr) {
      return true;
    }

    // Se é o mesmo dia, verificar horário (com margem de 3h)
    if (reservationDateStr === todayStr) {
      const [hours, minutes] = voucher.reservation.horario.split(':').map(Number);
      const reservationTime = hours * 60 + minutes; // minutos desde meia-noite
      const currentTime = today.getHours() * 60 + today.getMinutes();
      const marginMinutes = 3 * 60; // 3 horas em minutos

      // Expirado se passou 3h do horário da reserva
      if (currentTime > reservationTime + marginMinutes) {
        return true;
      }
    }

    return false;
  };

  const getVoucherStatus = (voucher: VoucherData): 'used' | 'expired' | 'available' => {
    if (voucher.utilizado) return 'used';
    if (isExpired(voucher)) return 'expired';
    return 'available';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/images/logo-rosa-mexicano.png"
                alt="Rosa Mexicano"
                
                
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
            <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <LayoutDashboard className="w-4 h-4" />Dashboard
            </Link>
            <Link to="/admin/reservations" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <List className="w-4 h-4" />Reservas
            </Link>
            <Link to="/admin/validar-voucher" className="flex items-center gap-2 px-4 py-3 border-b-2 border-[#E53935] text-white whitespace-nowrap">
              <QrCode className="w-4 h-4" />Voucher
            </Link>
            <Link to="/admin/reports" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <BarChart3 className="w-4 h-4" />Relatórios
            </Link>
            <Link to="/admin/usuarios" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <Users className="w-4 h-4" />Usuários
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Vouchers</h1>
          <span className="text-zinc-400">{filteredVouchers.length} voucher(s)</span>
        </div>

        {/* Filtros */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código, nome, email ou telefone..."
                className="w-full pl-10 pr-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
            >
              <option value="all">Todos</option>
              <option value="available">Disponíveis</option>
              <option value="used">Utilizados</option>
              <option value="expired">Expirados</option>
            </select>
          </div>
        </div>

        {/* Lista de Vouchers */}
        {loading ? (
          <TableSkeleton rows={8} cols={8} />
        ) : filteredVouchers.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Nenhum voucher encontrado</p>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Cliente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Contato</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Reserva</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Mesa</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Valor</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredVouchers.map((voucher) => (
                    <tr key={voucher.codigo} className="hover:bg-zinc-800/50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm bg-zinc-800 px-2 py-1 rounded">
                          {voucher.codigo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{voucher.reservation?.nome || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-zinc-400">{voucher.reservation?.email || '-'}</p>
                        <p className="text-sm text-zinc-500">{voucher.reservation?.telefone || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{voucher.reservation?.data ? formatDate(voucher.reservation.data) : '-'}</p>
                        <p className="text-sm text-zinc-500">{voucher.reservation?.horario || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">
                          {voucher.reservation?.mesasSelecionadas
                            ? JSON.parse(voucher.reservation.mesasSelecionadas).join(', ')
                            : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#E53935] font-semibold">R$ {voucher.valor?.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const status = getVoucherStatus(voucher);
                          if (status === 'used') {
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs">
                                <CheckCircle className="w-3 h-3" />
                                Utilizado
                              </span>
                            );
                          } else if (status === 'expired') {
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">
                                <XCircle className="w-3 h-3" />
                                Expirado
                              </span>
                            );
                          } else {
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">
                                <AlertCircle className="w-3 h-3" />
                                Disponível
                              </span>
                            );
                          }
                        })()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedVoucher(voucher)}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Detalhes */}
      {selectedVoucher && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className={`p-4 ${
              getVoucherStatus(selectedVoucher) === 'used' ? 'bg-yellow-900/30' :
              getVoucherStatus(selectedVoucher) === 'expired' ? 'bg-red-900/30' :
              'bg-green-900/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getVoucherStatus(selectedVoucher) === 'used' ? (
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                  ) : getVoucherStatus(selectedVoucher) === 'expired' ? (
                    <XCircle className="w-6 h-6 text-red-400" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                  <div>
                    <p className={`font-bold ${
                      getVoucherStatus(selectedVoucher) === 'used' ? 'text-yellow-400' :
                      getVoucherStatus(selectedVoucher) === 'expired' ? 'text-red-400' :
                      'text-green-400'
                    }`}>
                      {getVoucherStatus(selectedVoucher) === 'used' ? 'VOUCHER UTILIZADO' :
                       getVoucherStatus(selectedVoucher) === 'expired' ? 'VOUCHER EXPIRADO' :
                       'VOUCHER DISPONÍVEL'}
                    </p>
                    {selectedVoucher.utilizado && selectedVoucher.dataUtilizacao && (
                      <p className="text-sm text-yellow-400/70">
                        Utilizado em: {formatDateTime(selectedVoucher.dataUtilizacao)}
                      </p>
                    )}
                    {getVoucherStatus(selectedVoucher) === 'expired' && (
                      <p className="text-sm text-red-400/70">
                        Data da reserva já passou
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedVoucher(null);
                    setMessage(null);
                  }}
                  className="p-1 hover:bg-zinc-800 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-zinc-400 mb-1">Código do Voucher</p>
                <p className="text-2xl font-mono font-bold">{selectedVoucher.codigo}</p>
              </div>

              {/* Mensagens */}
              {message && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                }`}>
                  {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {message.text}
                </div>
              )}

              <h3 className="text-lg font-semibold mb-4">Dados da Reserva</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-400">Cliente</p>
                    <p className="font-medium">{selectedVoucher.reservation?.nome || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-400">Email</p>
                    <p className="font-medium">{selectedVoucher.reservation?.email || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-400">Telefone</p>
                    <p className="font-medium">{selectedVoucher.reservation?.telefone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-400">Data</p>
                    <p className="font-medium">{selectedVoucher.reservation?.data ? formatDate(selectedVoucher.reservation.data) : '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-400">Horário</p>
                    <p className="font-medium">{selectedVoucher.reservation?.horario || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-400">Pessoas</p>
                    <p className="font-medium">{selectedVoucher.reservation?.numeroPessoas || '-'} pessoas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <TableIcon className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-400">Mesa(s)</p>
                    <p className="font-medium">
                      {selectedVoucher.reservation?.mesasSelecionadas
                        ? JSON.parse(selectedVoucher.reservation.mesasSelecionadas).join(', ')
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">Valor do Voucher</p>
                    <p className="text-2xl font-bold text-[#E53935]">R$ {selectedVoucher.valor?.toFixed(2)}</p>
                  </div>

                  {getVoucherStatus(selectedVoucher) === 'available' && (
                    <button
                      onClick={() => validarVoucher(selectedVoucher)}
                      disabled={validating}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50 font-semibold"
                    >
                      {validating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      Validar Voucher
                    </button>
                  )}
                  {getVoucherStatus(selectedVoucher) === 'expired' && (
                    <span className="text-red-400 text-sm">
                      Voucher não pode ser utilizado
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
