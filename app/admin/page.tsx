'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // Salvar token no localStorage
        localStorage.setItem('admin_token', data.token);
        router.push('/admin/dashboard');
      } else {
        setError('Senha incorreta');
      }
    } catch (error) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/images/logo-rosa-mexicano.png"
              alt="Rosa Mexicano"
              width={150}
              height={50}
              className="h-12 w-auto"
            />
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Painel Administrativo</h1>
          <p className="text-zinc-400 text-center mb-8">Acesso restrito</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
                  placeholder="Digite a senha"
                  required
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E53935] hover:bg-[#B71C1C] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Acessar Painel'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              ← Voltar para o site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
