import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-black flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C2185B]/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#BA68C8]/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-md w-full">
        {/* Card */}
        <div className="relative bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
          {/* Gradient overlay */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#C2185B]/20 to-transparent rounded-tr-3xl -z-10" />

          {/* Logo & Title */}
          <div className="text-center mb-10">
            <img
              src="/images/logo-rosa-mexicano.png"
              alt="Rosa Mexicano"
              className="h-16 w-auto mx-auto mb-4 drop-shadow-lg"
            />
            <h1 className="text-3xl font-bold text-white mb-2">Rosa Mexicano</h1>
            <p className="text-[#FFD700] text-sm font-medium">Painel Administrativo</p>
            <div className="w-12 h-1 bg-gradient-to-r from-[#C2185B] to-[#BA68C8] rounded-full mx-auto mt-3" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-3">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rosamexicano.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C2185B] focus:border-transparent transition backdrop-blur-sm"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-3">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C2185B] focus:border-transparent transition backdrop-blur-sm"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-sm backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#C2185B] to-[#E53935] text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-[#C2185B]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/50 text-xs">ADMINISTRADOR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-white/60">
            <p>Acesso restrito a administradores</p>
            <p className="text-xs text-white/40 mt-2">Credenciais seguras do sistema Rosa Mexicano</p>
          </div>
        </div>
      </div>
    </div>
  );
}
