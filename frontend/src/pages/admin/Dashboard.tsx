import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { BarChart3, Users, Calendar, DollarSign, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.stats();
        setStats(response.data.stats);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Bem-vindo, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        {!loading && stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total de Reservas */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total de Reservas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.total_reservations}
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>

            {/* Confirmadas */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Confirmadas</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {stats.confirmed_count}
                  </p>
                </div>
                <Users className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </div>

            {/* Pendentes */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">
                    {stats.pending_count}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
              </div>
            </div>

            {/* Receita Total */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Receita Total</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    R$ {stats.total_revenue.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-red-500 opacity-20" />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando estatísticas...</p>
          </div>
        )}

        {/* Menu Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6">
            <div className="flex items-center gap-4">
              <Calendar className="w-10 h-10 text-blue-500" />
              <div>
                <h3 className="font-bold text-gray-900">Reservas</h3>
                <p className="text-gray-600 text-sm">Gerenciar reservas</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-10 h-10 text-green-500" />
              <div>
                <h3 className="font-bold text-gray-900">Vouchers</h3>
                <p className="text-gray-600 text-sm">Validar vouchers</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6">
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-purple-500" />
              <div>
                <h3 className="font-bold text-gray-900">Usuários</h3>
                <p className="text-gray-600 text-sm">Gerenciar admins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">Informações Importantes</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• O sistema está funcionando normalmente</li>
            <li>• As reservas estão sendo processadas em tempo real</li>
            <li>• Para mais funcionalidades, consulte a documentação da API</li>
            <li>• Entre em contato com o suporte em caso de dúvidas</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
