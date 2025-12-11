
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
// Image removido - usar img tag
import {
  LogOut,
  LayoutDashboard,
  List,
  BarChart3,
  Table as TableIcon,
  Save,
  X,
  Calendar,
  Clock,
  Users,
  Mail,
  Phone,
  CheckCircle
} from 'lucide-react';

const horarios = ['18:00', '18:30', '19:00', '19:30'];

export default function AdminCreateReservation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    data: '',
    horario: '18:00',
    numeroPessoas: 2,
    mesasSelecionadas: [] as number[],
    observacoes: '',
    status: 'confirmed', // Manual = já confirmada
  });

  const [availableTables, setAvailableTables] = useState<number[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }

    // Definir data de hoje como padrão
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, data: today }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formData.data) {
      loadAvailableTables();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.data]);

  const loadAvailableTables = async () => {
    setLoadingTables(true);
    try {
      const response = await fetch('/api/get-available-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData.data }),
      });

      const result = await response.json();
      if (result.tables) {
        const available = result.tables
          .filter((t: any) => t.available)
          .map((t: any) => t.number);
        setAvailableTables(available);
      }
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
    } finally {
      setLoadingTables(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  const toggleTable = (tableNumber: number) => {
    setFormData(prev => {
      const isSelected = prev.mesasSelecionadas.includes(tableNumber);
      const newSelection = isSelected
        ? prev.mesasSelecionadas.filter(n => n !== tableNumber)
        : [...prev.mesasSelecionadas, tableNumber].sort((a, b) => a - b);

      return { ...prev, mesasSelecionadas: newSelection };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/create-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          mesasSelecionadas: JSON.stringify(formData.mesasSelecionadas),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/reservations');
        }, 2000);
      } else {
        alert(result.error || 'Erro ao criar reserva');
      }
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      alert('Erro ao criar reserva');
    } finally {
      setLoading(false);
    }
  };

  const mesasNecessarias = Math.ceil(formData.numeroPessoas / 4);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/images/logo-rosa-mexicano.png" alt="Rosa Mexicano" className="h-10 w-auto" />
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
            <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition">
              <LayoutDashboard className="w-4 h-4" />Dashboard
            </Link>
            <Link to="/admin/reservations" className="flex items-center gap-2 px-4 py-3 border-b-2 border-[#E53935] text-white">
              <List className="w-4 h-4" />Reservas
            </Link>
            <Link to="/admin/tables" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition">
              <TableIcon className="w-4 h-4" />Mesas
            </Link>
            <Link to="/admin/reports" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition">
              <BarChart3 className="w-4 h-4" />Relatórios
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Nova Reserva Manual</h1>
            <p className="text-zinc-400">Crie reservas manualmente para clientes que ligaram ou VIPs</p>
          </div>
          <Link
            to="/admin/reservations"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Link>
        </div>

        {success && (
          <div className="mb-6 bg-green-900/30 border border-green-800 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="font-semibold text-green-400">Reserva criada com sucesso!</p>
              <p className="text-sm text-zinc-400">Redirecionando...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Cliente */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">Dados do Cliente</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#E53935]" />
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
                  placeholder="Nome do cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#E53935]" />
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#E53935]" />
                  Telefone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Dados da Reserva */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">Dados da Reserva</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#E53935]" />
                  Data *
                </label>
                <input
                  type="date"
                  required
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#E53935]" />
                  Horário *
                </label>
                <select
                  required
                  value={formData.horario}
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
                >
                  {horarios.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#E53935]" />
                  Número de Pessoas *
                </label>
                <input
                  type="number"
                  required
                  min="2"
                  max="60"
                  step="2"
                  value={formData.numeroPessoas}
                  onChange={(e) => setFormData({ ...formData, numeroPessoas: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white resize-none"
                placeholder="Informações adicionais sobre a reserva..."
              />
            </div>
          </div>

          {/* Seleção de Mesas */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">Seleção de Mesas</h2>

            <div className="mb-4 bg-black rounded-lg p-4 border border-zinc-700">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="text-zinc-400 mb-1">Pessoas</p>
                  <p className="text-xl font-bold text-[#E53935]">{formData.numeroPessoas}</p>
                </div>
                <div>
                  <p className="text-zinc-400 mb-1">Mesas Necessárias</p>
                  <p className="text-xl font-bold">{mesasNecessarias}</p>
                </div>
                <div>
                  <p className="text-zinc-400 mb-1">Selecionadas</p>
                  <p className={`text-xl font-bold ${formData.mesasSelecionadas.length === mesasNecessarias ? 'text-green-500' : 'text-yellow-500'}`}>
                    {formData.mesasSelecionadas.length}/{mesasNecessarias}
                  </p>
                </div>
              </div>
            </div>

            {loadingTables ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E53935] mx-auto"></div>
                <p className="text-zinc-400 mt-2 text-sm">Carregando mesas...</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-zinc-400 mb-3">
                  {availableTables.length} mesas disponíveis • Selecione {mesasNecessarias} mesa(s)
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 15 }, (_, i) => i + 1).map(tableNum => {
                    const isAvailable = availableTables.includes(tableNum);
                    const isSelected = formData.mesasSelecionadas.includes(tableNum);

                    return (
                      <button
                        key={tableNum}
                        type="button"
                        onClick={() => isAvailable && toggleTable(tableNum)}
                        disabled={!isAvailable}
                        className={`
                          aspect-square rounded-lg border-2 flex flex-col items-center justify-center
                          transition-all duration-200
                          ${isSelected
                            ? 'bg-[#E53935] border-[#E53935] text-white scale-105 shadow-lg shadow-[#E53935]/50'
                            : isAvailable
                              ? 'bg-zinc-800 border-zinc-700 text-white hover:border-[#E53935] hover:scale-105'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                          }
                        `}
                      >
                        <span className="text-lg font-bold">{tableNum}</span>
                        <span className="text-xs">4p</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Link
              to="/admin/reservations"
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || formData.mesasSelecionadas.length !== mesasNecessarias}
              className="px-6 py-3 bg-[#E53935] hover:bg-[#B71C1C] rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Criar Reserva'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
