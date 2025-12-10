'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LogOut,
  LayoutDashboard,
  List,
  BarChart3,
  QrCode,
  Users,
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Ticket,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Printer,
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react';

type ReservaDetalhe = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  horario: string;
  numeroPessoas: number;
  valor: number;
  status: string;
  mesasSelecionadas: string | null;
  voucher: { codigo: string; utilizado: boolean } | null;
};

type VoucherDetalhe = {
  codigo: string;
  valor: number;
  utilizado: boolean;
  expirado: boolean;
  dataUtilizacao: string | null;
  cliente: string;
};

type ReportData = {
  periodo: number;
  dataEspecifica: string | null;
  faturamento: {
    total: number;
    porDia: { [key: string]: number };
    crescimento: number;
    ticketMedio: number;
  };
  reservas: {
    total: number;
    pendentes: number;
    confirmadas: number;
    aprovadas: number;
    rejeitadas: number;
    canceladas: number;
    porDia: { [key: string]: number };
    crescimento: number;
    horariosMaisProcurados: [string, number][];
    totalPessoas: number;
    mediaPessoas: number;
  };
  vouchers: {
    total: number;
    utilizados: number;
    naoUtilizados: number;
    expirados: number;
    valorTotal: number;
    valorUtilizado: number;
    taxaUtilizacao: string;
  };
  listaReservas: ReservaDetalhe[] | null;
  listaVouchers: VoucherDetalhe[] | null;
};

export default function AdminReports() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tipoRelatorio, setTipoRelatorio] = useState<'periodo' | 'diario'>('periodo');
  const [periodo, setPeriodo] = useState('30');
  const [dataEspecifica, setDataEspecifica] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
    }
  }, [router]);

  useEffect(() => {
    fetchReports();
  }, [periodo, tipoRelatorio, dataEspecifica]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const url = tipoRelatorio === 'diario'
        ? `/api/admin/reports?data=${dataEspecifica}`
        : `/api/admin/reports?periodo=${periodo}`;
      const response = await fetch(url);
      const result = await response.json();
      if (response.ok) {
        setData(result);
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToExcel = () => {
    if (!data) return;

    let csvContent = '';

    // Se for relatório diário com lista de reservas
    if (data.listaReservas && data.listaReservas.length > 0) {
      csvContent += 'RESERVAS\n';
      csvContent += 'Horário;Cliente;Telefone;Email;Pessoas;Mesa;Valor;Status;Voucher\n';

      data.listaReservas
        .sort((a, b) => a.horario.localeCompare(b.horario))
        .forEach(r => {
          const mesa = r.mesasSelecionadas ? JSON.parse(r.mesasSelecionadas).join(', ') : '-';
          const voucher = r.voucher ? r.voucher.codigo : '-';
          csvContent += `${r.horario};${r.nome};${r.telefone};${r.email};${r.numeroPessoas};${mesa};${r.valor.toFixed(2)};${getStatusLabel(r.status)};${voucher}\n`;
        });

      csvContent += '\n';
    }

    // Se tiver lista de vouchers
    if (data.listaVouchers && data.listaVouchers.length > 0) {
      csvContent += 'VOUCHERS\n';
      csvContent += 'Código;Cliente;Valor;Status\n';

      data.listaVouchers.forEach(v => {
        const status = v.utilizado ? 'Utilizado' : v.expirado ? 'Expirado' : 'Disponível';
        csvContent += `${v.codigo};${v.cliente};${v.valor.toFixed(2)};${status}\n`;
      });
    }

    // Criar e baixar arquivo
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileName = tipoRelatorio === 'diario'
      ? `relatorio-${dataEspecifica}.csv`
      : `relatorio-${periodo}dias.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'Pendente',
      confirmed: 'Confirmada',
      approved: 'Aprovada',
      rejected: 'Rejeitada',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'text-yellow-400',
      confirmed: 'text-blue-400',
      approved: 'text-green-400',
      rejected: 'text-red-400',
      cancelled: 'text-zinc-400',
    };
    return colors[status] || 'text-zinc-400';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  // Calcular max value para o gráfico de barras
  const getMaxValue = (obj: { [key: string]: number }) => {
    const values = Object.values(obj);
    return values.length > 0 ? Math.max(...values) : 1;
  };

  return (
    <div className="min-h-screen bg-black text-white print:bg-white print:text-black">
      <header className="bg-zinc-900 border-b border-zinc-800 print:hidden">
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

      <nav className="bg-zinc-900 border-b border-zinc-800 print:hidden">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto">
            <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <LayoutDashboard className="w-4 h-4" />Dashboard
            </Link>
            <Link href="/admin/reservations" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <List className="w-4 h-4" />Reservas
            </Link>
            <Link href="/admin/validar-voucher" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <QrCode className="w-4 h-4" />Voucher
            </Link>
            <Link href="/admin/reports" className="flex items-center gap-2 px-4 py-3 border-b-2 border-[#E53935] text-white whitespace-nowrap">
              <BarChart3 className="w-4 h-4" />Relatórios
            </Link>
            <Link href="/admin/usuarios" className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-zinc-400 hover:text-white transition whitespace-nowrap">
              <Users className="w-4 h-4" />Usuários
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Controles - Escondidos na impressão */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 print:hidden">
          <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
          <div className="flex flex-wrap items-center gap-3">
            {/* Tipo de Relatório */}
            <div className="flex bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setTipoRelatorio('periodo')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  tipoRelatorio === 'periodo'
                    ? 'bg-[#E53935] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Período
              </button>
              <button
                onClick={() => setTipoRelatorio('diario')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  tipoRelatorio === 'diario'
                    ? 'bg-[#E53935] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CalendarDays className="w-4 h-4 inline mr-2" />
                Diário
              </button>
            </div>

            {/* Seletor de período ou data */}
            {tipoRelatorio === 'periodo' ? (
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="60">Últimos 60 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
            ) : (
              <input
                type="date"
                value={dataEspecifica}
                onChange={(e) => setDataEspecifica(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            )}

            {/* Botão Imprimir */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-4 py-2 text-white transition"
            >
              <Printer className="w-4 h-4" />
              PDF
            </button>

            {/* Botão Excel */}
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-green-800 hover:bg-green-700 border border-green-700 rounded-lg px-4 py-2 text-white transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>

        {/* Cabeçalho para Impressão */}
        <div className="hidden print:block mb-8">
          <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-black">Rosa Mexicano</h1>
              <p className="text-gray-600">Relatório {tipoRelatorio === 'diario' ? 'Diário' : 'de Período'}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-black">
                {tipoRelatorio === 'diario'
                  ? new Date(dataEspecifica + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                  : `Últimos ${periodo} dias`}
              </p>
              <p className="text-sm text-gray-500">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#E53935]" />
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Cards de Resumo - Oculto na impressão */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
              {/* Faturamento */}
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 print:bg-white print:border-gray-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-900/30 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  {data.faturamento.crescimento !== 0 && (
                    <div className={`flex items-center gap-1 text-sm ${data.faturamento.crescimento > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {data.faturamento.crescimento > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(data.faturamento.crescimento)}%
                    </div>
                  )}
                </div>
                <p className="text-zinc-400 text-sm print:text-gray-600">Faturamento Total</p>
                <p className="text-2xl font-bold text-green-400 print:text-green-600">{formatCurrency(data.faturamento.total)}</p>
                <p className="text-xs text-zinc-500 mt-1 print:text-gray-500">Ticket médio: {formatCurrency(data.faturamento.ticketMedio)}</p>
              </div>

              {/* Reservas */}
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 print:bg-white print:border-gray-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-900/30 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  {data.reservas.crescimento !== 0 && (
                    <div className={`flex items-center gap-1 text-sm ${data.reservas.crescimento > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {data.reservas.crescimento > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(data.reservas.crescimento)}%
                    </div>
                  )}
                </div>
                <p className="text-zinc-400 text-sm print:text-gray-600">Total de Reservas</p>
                <p className="text-2xl font-bold text-blue-400 print:text-blue-600">{data.reservas.total}</p>
                <p className="text-xs text-zinc-500 mt-1 print:text-gray-500">{data.reservas.totalPessoas} pessoas (média: {data.reservas.mediaPessoas})</p>
              </div>

              {/* Vouchers */}
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 print:bg-white print:border-gray-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-900/30 rounded-lg">
                    <Ticket className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-sm text-purple-400">{data.vouchers.taxaUtilizacao}% usado</span>
                </div>
                <p className="text-zinc-400 text-sm print:text-gray-600">Vouchers Emitidos</p>
                <p className="text-2xl font-bold text-purple-400 print:text-purple-600">{data.vouchers.total}</p>
                <p className="text-xs text-zinc-500 mt-1 print:text-gray-500">{data.vouchers.utilizados} utilizados</p>
              </div>

              {/* Taxa de Conversão */}
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 print:bg-white print:border-gray-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-900/30 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <p className="text-zinc-400 text-sm print:text-gray-600">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-yellow-400 print:text-yellow-600">
                  {data.reservas.total > 0
                    ? (((data.reservas.confirmadas + data.reservas.aprovadas) / data.reservas.total) * 100).toFixed(1)
                    : '0'}%
                </p>
                <p className="text-xs text-zinc-500 mt-1 print:text-gray-500">{data.reservas.confirmadas + data.reservas.aprovadas} confirmadas/aprovadas</p>
              </div>
            </div>

            {/* Status das Reservas - Oculto na impressão */}
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 print:hidden">
              <h2 className="text-xl font-semibold mb-6">Status das Reservas</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-yellow-900/20 rounded-lg print:bg-yellow-50 print:border print:border-yellow-200">
                  <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2 print:text-yellow-600" />
                  <p className="text-2xl font-bold text-yellow-400 print:text-yellow-600">{data.reservas.pendentes}</p>
                  <p className="text-sm text-zinc-400 print:text-gray-600">Pendentes</p>
                </div>
                <div className="text-center p-4 bg-blue-900/20 rounded-lg print:bg-blue-50 print:border print:border-blue-200">
                  <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-2 print:text-blue-600" />
                  <p className="text-2xl font-bold text-blue-400 print:text-blue-600">{data.reservas.confirmadas}</p>
                  <p className="text-sm text-zinc-400 print:text-gray-600">Confirmadas</p>
                </div>
                <div className="text-center p-4 bg-green-900/20 rounded-lg print:bg-green-50 print:border print:border-green-200">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2 print:text-green-600" />
                  <p className="text-2xl font-bold text-green-400 print:text-green-600">{data.reservas.aprovadas}</p>
                  <p className="text-sm text-zinc-400 print:text-gray-600">Aprovadas</p>
                </div>
                <div className="text-center p-4 bg-red-900/20 rounded-lg print:bg-red-50 print:border print:border-red-200">
                  <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2 print:text-red-600" />
                  <p className="text-2xl font-bold text-red-400 print:text-red-600">{data.reservas.rejeitadas}</p>
                  <p className="text-sm text-zinc-400 print:text-gray-600">Rejeitadas</p>
                </div>
                <div className="text-center p-4 bg-zinc-800 rounded-lg print:bg-gray-100 print:border print:border-gray-200">
                  <XCircle className="w-8 h-8 text-zinc-400 mx-auto mb-2 print:text-gray-600" />
                  <p className="text-2xl font-bold text-zinc-400 print:text-gray-600">{data.reservas.canceladas}</p>
                  <p className="text-sm text-zinc-400 print:text-gray-600">Canceladas</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 print:hidden">
              {/* Faturamento por Dia */}
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                <h2 className="text-xl font-semibold mb-6">Faturamento por Dia</h2>
                {Object.keys(data.faturamento.porDia).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(data.faturamento.porDia)
                      .sort((a, b) => a[0].localeCompare(b[0]))
                      .slice(-10)
                      .map(([date, value]) => (
                        <div key={date} className="flex items-center gap-3">
                          <span className="text-sm text-zinc-400 w-16">{formatDate(date)}</span>
                          <div className="flex-1 h-6 bg-zinc-800 rounded overflow-hidden">
                            <div
                              className="h-full bg-green-600 rounded"
                              style={{
                                width: `${(value / getMaxValue(data.faturamento.porDia)) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-24 text-right">{formatCurrency(value)}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-center py-8">Nenhum dado no período</p>
                )}
              </div>

              {/* Horários Mais Procurados */}
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 print:bg-white print:border-gray-300">
                <h2 className="text-xl font-semibold mb-6 print:text-black">Horários Mais Procurados</h2>
                {data.reservas.horariosMaisProcurados.length > 0 ? (
                  <div className="space-y-3">
                    {data.reservas.horariosMaisProcurados.map(([horario, quantidade], index) => (
                      <div key={horario} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 w-20">
                          <Clock className="w-4 h-4 text-zinc-500" />
                          <span className="text-sm font-medium">{horario}</span>
                        </div>
                        <div className="flex-1 h-6 bg-zinc-800 rounded overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded"
                            style={{
                              width: `${(quantidade / data.reservas.horariosMaisProcurados[0][1]) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-zinc-400 w-20 text-right">{quantidade} reservas</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-center py-8">Nenhum dado no período</p>
                )}
              </div>
            </div>

            {/* Vouchers - Oculto na impressão */}
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 print:hidden">
              <h2 className="text-xl font-semibold mb-6">Vouchers</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-zinc-400 mb-2">Distribuição</p>
                  <div className="flex h-4 rounded overflow-hidden bg-zinc-800">
                    {data.vouchers.total > 0 && (
                      <>
                        <div
                          className="bg-green-600"
                          style={{ width: `${(data.vouchers.utilizados / data.vouchers.total) * 100}%` }}
                          title={`Utilizados: ${data.vouchers.utilizados}`}
                        />
                        <div
                          className="bg-blue-600"
                          style={{ width: `${(data.vouchers.naoUtilizados / data.vouchers.total) * 100}%` }}
                          title={`Não utilizados: ${data.vouchers.naoUtilizados}`}
                        />
                        <div
                          className="bg-red-600"
                          style={{ width: `${(data.vouchers.expirados / data.vouchers.total) * 100}%` }}
                          title={`Expirados: ${data.vouchers.expirados}`}
                        />
                      </>
                    )}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-600 rounded" /> Utilizados ({data.vouchers.utilizados})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-600 rounded" /> Pendentes ({data.vouchers.naoUtilizados})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-600 rounded" /> Expirados ({data.vouchers.expirados})
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-zinc-400 mb-2">Valor Total Emitido</p>
                  <p className="text-2xl font-bold text-purple-400">{formatCurrency(data.vouchers.valorTotal)}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-zinc-400 mb-2">Valor Utilizado</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(data.vouchers.valorUtilizado)}</p>
                </div>
              </div>
            </div>

            {/* Reservas por Dia - Oculto na impressão */}
            {!data.dataEspecifica && (
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 print:hidden">
                <h2 className="text-xl font-semibold mb-6">Reservas por Dia</h2>
                {Object.keys(data.reservas.porDia).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(data.reservas.porDia)
                      .sort((a, b) => a[0].localeCompare(b[0]))
                      .slice(-14)
                      .map(([date, value]) => (
                        <div key={date} className="flex items-center gap-3">
                          <span className="text-sm text-zinc-400 w-16 print:text-gray-600">{formatDate(date)}</span>
                          <div className="flex-1 h-6 bg-zinc-800 rounded overflow-hidden print:bg-gray-200">
                            <div
                              className="h-full bg-blue-600 rounded print:bg-blue-500"
                              style={{
                                width: `${(value / getMaxValue(data.reservas.porDia)) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-20 text-right print:text-black">{value} reservas</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-center py-8">Nenhum dado no período</p>
                )}
              </div>
            )}

            {/* Lista Detalhada de Reservas - Apenas para relatório diário */}
            {data.listaReservas && data.listaReservas.length > 0 && (
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 print:bg-white print:border-gray-300 print:p-2 print:break-inside-avoid">
                <h2 className="text-xl font-semibold mb-6 print:text-black print:text-base print:mb-2">Lista de Reservas ({data.listaReservas.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm print:text-xs">
                    <thead className="bg-zinc-800 print:bg-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-zinc-400 print:text-black print:px-1 print:py-1">Hora</th>
                        <th className="px-3 py-2 text-left text-zinc-400 print:text-black print:px-1 print:py-1">Cliente</th>
                        <th className="px-3 py-2 text-left text-zinc-400 print:text-black print:px-1 print:py-1">Telefone</th>
                        <th className="px-3 py-2 text-center text-zinc-400 print:text-black print:px-1 print:py-1">Pax</th>
                        <th className="px-3 py-2 text-left text-zinc-400 print:text-black print:px-1 print:py-1">Mesa</th>
                        <th className="px-3 py-2 text-right text-zinc-400 print:text-black print:px-1 print:py-1">Valor</th>
                        <th className="px-3 py-2 text-center text-zinc-400 print:text-black print:px-1 print:py-1">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 print:divide-gray-300">
                      {data.listaReservas
                        .sort((a, b) => a.horario.localeCompare(b.horario))
                        .map((reserva) => (
                          <tr key={reserva.id} className="print:text-black">
                            <td className="px-3 py-2 font-medium print:px-1 print:py-1">{reserva.horario}</td>
                            <td className="px-3 py-2 print:px-1 print:py-1 print:max-w-[120px] print:truncate">{reserva.nome}</td>
                            <td className="px-3 py-2 print:px-1 print:py-1">{reserva.telefone}</td>
                            <td className="px-3 py-2 text-center print:px-1 print:py-1">{reserva.numeroPessoas}</td>
                            <td className="px-3 py-2 print:px-1 print:py-1">
                              {reserva.mesasSelecionadas
                                ? JSON.parse(reserva.mesasSelecionadas).join(', ')
                                : '-'}
                            </td>
                            <td className="px-3 py-2 text-right font-medium print:px-1 print:py-1">{formatCurrency(reserva.valor)}</td>
                            <td className={`px-3 py-2 text-center font-medium ${getStatusColor(reserva.status)} print:text-black print:px-1 print:py-1`}>
                              {getStatusLabel(reserva.status)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Lista Detalhada de Vouchers - Apenas para relatório diário */}
            {data.listaVouchers && data.listaVouchers.length > 0 && (
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 print:bg-white print:border-gray-300 print:p-2 print:mt-4 print:break-inside-avoid">
                <h2 className="text-xl font-semibold mb-6 print:text-black print:text-base print:mb-2">Lista de Vouchers ({data.listaVouchers.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm print:text-xs">
                    <thead className="bg-zinc-800 print:bg-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-zinc-400 print:text-black print:px-1 print:py-1">Código</th>
                        <th className="px-3 py-2 text-left text-zinc-400 print:text-black print:px-1 print:py-1">Cliente</th>
                        <th className="px-3 py-2 text-right text-zinc-400 print:text-black print:px-1 print:py-1">Valor</th>
                        <th className="px-3 py-2 text-center text-zinc-400 print:text-black print:px-1 print:py-1">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 print:divide-gray-300">
                      {data.listaVouchers.map((voucher) => (
                        <tr key={voucher.codigo} className="print:text-black">
                          <td className="px-3 py-2 font-mono font-medium print:px-1 print:py-1">{voucher.codigo}</td>
                          <td className="px-3 py-2 print:px-1 print:py-1">{voucher.cliente}</td>
                          <td className="px-3 py-2 text-right font-medium text-[#E53935] print:text-black print:px-1 print:py-1">
                            {formatCurrency(voucher.valor)}
                          </td>
                          <td className="px-3 py-2 text-center print:px-1 print:py-1">
                            {voucher.utilizado ? (
                              <span className="text-yellow-400 print:text-black">Utilizado</span>
                            ) : voucher.expirado ? (
                              <span className="text-red-400 print:text-black">Expirado</span>
                            ) : (
                              <span className="text-green-400 print:text-black">Disponível</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-zinc-500 text-center py-20">Erro ao carregar relatórios</p>
        )}
      </main>
    </div>
  );
}
