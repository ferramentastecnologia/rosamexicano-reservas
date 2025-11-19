'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  LayoutDashboard,
  List,
  BarChart3,
  Table as TableIcon
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Stats = {
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  cancelledReservations: number;
  totalRevenue: number;
  totalPeople: number;
  todayReservations: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }

    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E53935]"></div>
      </div>
    );
  }

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
          <div className="flex gap-6">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 px-4 py-3 border-b-2 border-[#E53935] text-white"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/reservations"
              className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition"
            >
              <List className="w-4 h-4" />
              Reservas
            </Link>
            <Link
              href="/admin/tables"
              className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition"
            >
              <TableIcon className="w-4 h-4" />
              Mesas
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition"
            >
              <BarChart3 className="w-4 h-4" />
              Relatórios
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Reservas */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-2xl font-bold">{stats?.totalReservations || 0}</span>
            </div>
            <h3 className="text-zinc-400 text-sm">Total de Reservas</h3>
          </div>

          {/* Confirmadas */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold">{stats?.confirmedReservations || 0}</span>
            </div>
            <h3 className="text-zinc-400 text-sm">Confirmadas</h3>
          </div>

          {/* Pendentes */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-2xl font-bold">{stats?.pendingReservations || 0}</span>
            </div>
            <h3 className="text-zinc-400 text-sm">Pendentes</h3>
          </div>

          {/* Receita Total */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#E53935]/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-[#E53935]" />
              </div>
              <span className="text-2xl font-bold">
                R$ {((stats?.totalRevenue || 0) / 100).toFixed(2)}
              </span>
            </div>
            <h3 className="text-zinc-400 text-sm">Receita Total</h3>
          </div>

          {/* Total de Pessoas */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-900/30 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold">{stats?.totalPeople || 0}</span>
            </div>
            <h3 className="text-zinc-400 text-sm">Total de Pessoas</h3>
          </div>

          {/* Hoje */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-2xl font-bold">{stats?.todayReservations || 0}</span>
            </div>
            <h3 className="text-zinc-400 text-sm">Reservas Hoje</h3>
          </div>

          {/* Canceladas */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-900/30 rounded-lg">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-2xl font-bold">{stats?.cancelledReservations || 0}</span>
            </div>
            <h3 className="text-zinc-400 text-sm">Canceladas</h3>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/admin/reservations"
            className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 hover:border-[#E53935] transition"
          >
            <List className="w-8 h-8 text-[#E53935] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ver Todas as Reservas</h3>
            <p className="text-sm text-zinc-400">
              Gerencie e visualize todas as reservas do sistema
            </p>
          </Link>

          <Link
            href="/admin/tables"
            className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 hover:border-[#E53935] transition"
          >
            <TableIcon className="w-8 h-8 text-[#E53935] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Mapa de Mesas</h3>
            <p className="text-sm text-zinc-400">
              Visualize a ocupação das mesas por horário
            </p>
          </Link>

          <Link
            href="/admin/reports"
            className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 hover:border-[#E53935] transition"
          >
            <BarChart3 className="w-8 h-8 text-[#E53935] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Relatórios</h3>
            <p className="text-sm text-zinc-400">
              Analise estatísticas e gere relatórios
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
