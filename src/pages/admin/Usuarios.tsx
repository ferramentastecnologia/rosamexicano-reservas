
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Image removido - usar img tag
import { Link } from 'react-router-dom';
import {
  LogOut,
  LayoutDashboard,
  List,
  BarChart3,
  QrCode,
  Users,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Shield
} from 'lucide-react';

type Admin = {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string;
  active: boolean;
  createdAt: string;
};

const PERMISSIONS_LIST = [
  { id: 'dashboard', label: 'Dashboard', description: 'Visualizar dashboard' },
  { id: 'reservations', label: 'Reservas', description: 'Gerenciar reservas' },
  { id: 'voucher', label: 'Voucher', description: 'Validar vouchers' },
  { id: 'reports', label: 'Relatórios', description: 'Ver relatórios' },
  { id: 'users', label: 'Usuários', description: 'Gerenciar usuários' },
];

export default function AdminUsuarios() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Admin | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    permissions: [] as string[],
    active: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      permissions: ['dashboard'],
      active: true,
    });
    setShowModal(true);
    setError('');
  };

  const openEditModal = (user: Admin) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      permissions: JSON.parse(user.permissions || '[]'),
      active: user.active,
    });
    setShowModal(true);
    setError('');
  };

  const handlePermissionToggle = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users';

      const method = editingUser ? 'PUT' : 'POST';

      const body = {
        ...formData,
        permissions: JSON.stringify(formData.permissions),
      };

      // Se editando e senha vazia, não envia
      if (editingUser && !formData.password) {
        delete (body as any).password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao salvar usuário');
        return;
      }

      setSuccess(editingUser ? 'Usuário atualizado!' : 'Usuário criado!');
      setShowModal(false);
      loadUsers();
    } catch (err) {
      setError('Erro ao salvar usuário');
    }
  };

  const handleDelete = async (user: Admin) => {
    if (!confirm(`Deseja realmente excluir o usuário ${user.name}?`)) return;

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Erro ao excluir usuário');
        return;
      }

      setSuccess('Usuário excluído!');
      loadUsers();
    } catch (err) {
      setError('Erro ao excluir usuário');
    }
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
            <Link to="/admin/validar-voucher" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <QrCode className="w-4 h-4" />Voucher
            </Link>
            <Link to="/admin/reports" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <BarChart3 className="w-4 h-4" />Relatórios
            </Link>
            <Link to="/admin/usuarios" className="flex items-center gap-2 px-4 py-3 border-b-2 border-[#E53935] text-white whitespace-nowrap">
              <Users className="w-4 h-4" />Usuários
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#E53935] hover:bg-[#B71C1C] rounded-lg transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-6">
            <span className="text-red-400">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-900/30 border border-green-800 rounded-lg p-4 mb-6">
            <span className="text-green-400">{success}</span>
          </div>
        )}

        {/* Tabela */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E53935]"></div>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Permissões</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map((user) => {
                  const perms = JSON.parse(user.permissions || '[]');
                  return (
                    <tr key={user.id} className="hover:bg-zinc-800/50">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-zinc-400">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-900/30 text-purple-400 border border-purple-800' : 'bg-zinc-800 text-zinc-400'}`}>
                          {user.role === 'admin' ? 'Admin' : 'Usuário'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {perms.map((p: string) => (
                            <span key={p} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${user.active ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                          {user.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 bg-blue-900/30 hover:bg-blue-900/50 rounded transition"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 bg-red-900/30 hover:bg-red-900/50 rounded transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg max-w-lg w-full border border-zinc-800">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Senha {editingUser && <span className="text-zinc-500">(deixe vazio para manter)</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935]"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Permissões</label>
                  <div className="space-y-2">
                    {PERMISSIONS_LIST.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-3 p-3 bg-black border border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="w-4 h-4 accent-[#E53935]"
                        />
                        <div>
                          <p className="font-medium">{perm.label}</p>
                          <p className="text-xs text-zinc-500">{perm.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 accent-[#E53935]"
                    />
                    <span>Usuário ativo</span>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-800 rounded-lg p-3">
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#E53935] hover:bg-[#B71C1C] rounded-lg transition"
                  >
                    {editingUser ? 'Salvar' : 'Criar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
