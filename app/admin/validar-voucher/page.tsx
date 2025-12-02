'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
  AlertCircle
} from 'lucide-react';

type VoucherData = {
  id: string;
  codigo: string;
  valor: number;
  utilizado: boolean;
  dataUtilizacao: string | null;
  dataValidade: string;
  reservation: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    data: string;
    horario: string;
    numeroPessoas: number;
    status: string;
  };
};

export default function ValidarVoucher() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState<VoucherData | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  const buscarVoucher = async () => {
    if (!codigo.trim()) {
      setError('Digite o código do voucher');
      return;
    }

    setLoading(true);
    setError('');
    setVoucher(null);
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/voucher/${codigo.trim().toUpperCase()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Voucher não encontrado');
        return;
      }

      setVoucher(data);
    } catch (err) {
      setError('Erro ao buscar voucher');
    } finally {
      setLoading(false);
    }
  };

  const validarVoucher = async () => {
    if (!voucher) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/voucher/${voucher.codigo}/validar`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao validar voucher');
        return;
      }

      setSuccess('Voucher validado com sucesso!');
      setVoucher({ ...voucher, utilizado: true, dataUtilizacao: new Date().toISOString() });
    } catch (err) {
      setError('Erro ao validar voucher');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
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
            <Link href="/admin/reservations" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <List className="w-4 h-4" />Reservas
            </Link>
            <Link href="/admin/validar-voucher" className="flex items-center gap-2 px-4 py-3 border-b-2 border-[#E53935] text-white whitespace-nowrap">
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
        <h1 className="text-3xl font-bold mb-8">Validar Voucher</h1>

        {/* Busca */}
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mb-6">
          <label className="block text-sm font-medium mb-2">Código do Voucher</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && buscarVoucher()}
                placeholder="Ex: MOR-K7X9M2Q5-M7XQ9Z8W"
                className="w-full pl-10 pr-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white font-mono text-lg"
              />
            </div>
            <button
              onClick={buscarVoucher}
              disabled={loading}
              className="px-6 py-3 bg-[#E53935] hover:bg-[#B71C1C] rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              Buscar
            </button>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-6 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Sucesso */}
        {success && (
          <div className="bg-green-900/30 border border-green-800 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400">{success}</span>
          </div>
        )}

        {/* Resultado */}
        {voucher && (
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
            {/* Status do Voucher */}
            <div className={`p-4 ${voucher.utilizado ? 'bg-yellow-900/30' : 'bg-green-900/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {voucher.utilizado ? (
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                  <div>
                    <p className={`font-bold ${voucher.utilizado ? 'text-yellow-400' : 'text-green-400'}`}>
                      {voucher.utilizado ? 'VOUCHER JÁ UTILIZADO' : 'VOUCHER VÁLIDO'}
                    </p>
                    {voucher.utilizado && voucher.dataUtilizacao && (
                      <p className="text-sm text-yellow-400/70">
                        Utilizado em: {new Date(voucher.dataUtilizacao).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-2xl font-mono font-bold">{voucher.codigo}</span>
              </div>
            </div>

            {/* Dados da Reserva */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Dados da Reserva</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-400">Cliente</p>
                    <p className="font-medium">{voucher.reservation.nome}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-400">Data</p>
                    <p className="font-medium">{formatDate(voucher.reservation.data)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-400">Horário</p>
                    <p className="font-medium">{voucher.reservation.horario}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-400">Pessoas</p>
                    <p className="font-medium">{voucher.reservation.numeroPessoas} pessoas</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">Valor do Voucher</p>
                    <p className="text-2xl font-bold text-[#E53935]">R$ {voucher.valor.toFixed(2)}</p>
                  </div>

                  {!voucher.utilizado && (
                    <button
                      onClick={validarVoucher}
                      disabled={loading}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50 text-lg font-semibold"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Validar Voucher
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
