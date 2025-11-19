'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, LayoutDashboard, List, BarChart3, Table as TableIcon } from 'lucide-react';

export default function AdminTables() {
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-black text-white">
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

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Mapa de Mesas</h1>
        <p className="text-zinc-400">Em desenvolvimento...</p>
      </main>
    </div>
  );
}
