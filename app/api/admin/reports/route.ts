import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || '30'; // dias
    const dataEspecifica = searchParams.get('data'); // data específica YYYY-MM-DD

    let dataInicioStr: string;
    let dataFimStr: string | null = null;
    let diasAtras = 0;

    if (dataEspecifica) {
      // Relatório de um dia específico
      dataInicioStr = dataEspecifica;
      dataFimStr = dataEspecifica;
      diasAtras = 1;
    } else {
      // Relatório de período
      diasAtras = parseInt(periodo);
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - diasAtras);
      dataInicioStr = dataInicio.toISOString().split('T')[0];
    }

    // Buscar todas as reservas do período
    const reservas = await prisma.reservation.findMany({
      where: dataFimStr
        ? { data: dataEspecifica! }
        : { data: { gte: dataInicioStr } },
      include: {
        voucher: true,
      },
      orderBy: {
        data: 'asc',
      },
    });

    // Buscar todos os vouchers do período
    const voucherWhereClause = dataFimStr
      ? {
          reservation: {
            data: dataEspecifica!,
          },
        }
      : {
          createdAt: {
            gte: new Date(dataInicioStr + 'T00:00:00'),
          },
        };

    const vouchers = await prisma.voucher.findMany({
      where: voucherWhereClause,
      include: {
        reservation: true,
      },
    });

    // === FATURAMENTO ===
    const reservasConfirmadas = reservas.filter(r =>
      r.status === 'confirmed' || r.status === 'approved'
    );

    const faturamentoTotal = reservasConfirmadas.reduce((acc, r) => acc + r.valor, 0);

    // Faturamento por dia
    const faturamentoPorDia: { [key: string]: number } = {};
    reservasConfirmadas.forEach(r => {
      if (!faturamentoPorDia[r.data]) {
        faturamentoPorDia[r.data] = 0;
      }
      faturamentoPorDia[r.data] += r.valor;
    });

    // === RESERVAS ===
    const totalReservas = reservas.length;
    const reservasPendentes = reservas.filter(r => r.status === 'pending').length;
    const reservasConfirmadasCount = reservas.filter(r => r.status === 'confirmed').length;
    const reservasAprovadas = reservas.filter(r => r.status === 'approved').length;
    const reservasRejeitadas = reservas.filter(r => r.status === 'rejected').length;
    const reservasCanceladas = reservas.filter(r => r.status === 'cancelled').length;

    // Reservas por dia
    const reservasPorDia: { [key: string]: number } = {};
    reservas.forEach(r => {
      if (!reservasPorDia[r.data]) {
        reservasPorDia[r.data] = 0;
      }
      reservasPorDia[r.data]++;
    });

    // Horários mais procurados
    const horariosProcurados: { [key: string]: number } = {};
    reservas.forEach(r => {
      if (!horariosProcurados[r.horario]) {
        horariosProcurados[r.horario] = 0;
      }
      horariosProcurados[r.horario]++;
    });

    // Ordenar horários por quantidade
    const horariosOrdenados = Object.entries(horariosProcurados)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Total de pessoas
    const totalPessoas = reservasConfirmadas.reduce((acc, r) => acc + r.numeroPessoas, 0);
    const mediaPessoas = reservasConfirmadas.length > 0
      ? (totalPessoas / reservasConfirmadas.length).toFixed(1)
      : '0';

    // === VOUCHERS ===
    const totalVouchers = vouchers.length;
    const vouchersUtilizados = vouchers.filter(v => v.utilizado).length;
    const vouchersNaoUtilizados = vouchers.filter(v => !v.utilizado).length;
    const vouchersExpirados = vouchers.filter(v =>
      !v.utilizado && new Date(v.dataValidade) < new Date()
    ).length;

    // Valor total em vouchers
    const valorTotalVouchers = vouchers.reduce((acc, v) => acc + v.valor, 0);
    const valorVouchersUtilizados = vouchers
      .filter(v => v.utilizado)
      .reduce((acc, v) => acc + v.valor, 0);

    // === TENDÊNCIAS ===
    let crescimentoFaturamento = '0';
    let crescimentoReservas = '0';

    // Só calcular tendências para relatórios de período (não diários)
    if (!dataEspecifica) {
      const dataAnteriorInicio = new Date(dataInicioStr + 'T00:00:00');
      dataAnteriorInicio.setDate(dataAnteriorInicio.getDate() - diasAtras);
      const dataAnteriorInicioStr = dataAnteriorInicio.toISOString().split('T')[0];

      const reservasAnteriores = await prisma.reservation.findMany({
        where: {
          data: {
            gte: dataAnteriorInicioStr,
            lt: dataInicioStr,
          },
          status: {
            in: ['confirmed', 'approved'],
          },
        },
      });

      const faturamentoAnterior = reservasAnteriores.reduce((acc, r) => acc + r.valor, 0);
      crescimentoFaturamento = faturamentoAnterior > 0
        ? (((faturamentoTotal - faturamentoAnterior) / faturamentoAnterior) * 100).toFixed(1)
        : '0';

      crescimentoReservas = reservasAnteriores.length > 0
        ? (((reservasConfirmadas.length - reservasAnteriores.length) / reservasAnteriores.length) * 100).toFixed(1)
        : '0';
    }

    return NextResponse.json({
      periodo: diasAtras,
      dataEspecifica: dataEspecifica || null,
      faturamento: {
        total: faturamentoTotal,
        porDia: faturamentoPorDia,
        crescimento: parseFloat(crescimentoFaturamento),
        ticketMedio: reservasConfirmadas.length > 0
          ? faturamentoTotal / reservasConfirmadas.length
          : 0,
      },
      reservas: {
        total: totalReservas,
        pendentes: reservasPendentes,
        confirmadas: reservasConfirmadasCount,
        aprovadas: reservasAprovadas,
        rejeitadas: reservasRejeitadas,
        canceladas: reservasCanceladas,
        porDia: reservasPorDia,
        crescimento: parseFloat(crescimentoReservas),
        horariosMaisProcurados: horariosOrdenados,
        totalPessoas,
        mediaPessoas: parseFloat(mediaPessoas),
      },
      vouchers: {
        total: totalVouchers,
        utilizados: vouchersUtilizados,
        naoUtilizados: vouchersNaoUtilizados,
        expirados: vouchersExpirados,
        valorTotal: valorTotalVouchers,
        valorUtilizado: valorVouchersUtilizados,
        taxaUtilizacao: totalVouchers > 0
          ? ((vouchersUtilizados / totalVouchers) * 100).toFixed(1)
          : '0',
      },
      // Lista detalhada para relatório diário
      listaReservas: dataEspecifica ? reservas.map(r => ({
        id: r.id,
        nome: r.nome,
        email: r.email,
        telefone: r.telefone,
        horario: r.horario,
        numeroPessoas: r.numeroPessoas,
        valor: r.valor,
        status: r.status,
        mesasSelecionadas: r.mesasSelecionadas,
        voucher: r.voucher ? {
          codigo: r.voucher.codigo,
          utilizado: r.voucher.utilizado,
        } : null,
      })) : null,
      listaVouchers: dataEspecifica ? vouchers.map(v => {
        // Calcular se está expirado baseado na reserva
        let expirado = false;
        if (!v.utilizado && v.reservation) {
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          const reservationDateStr = v.reservation.data;

          if (reservationDateStr < todayStr) {
            expirado = true;
          } else if (reservationDateStr === todayStr && v.reservation.horario) {
            const [hours, minutes] = v.reservation.horario.split(':').map(Number);
            const reservationTime = hours * 60 + minutes;
            const currentTime = today.getHours() * 60 + today.getMinutes();
            const marginMinutes = 3 * 60;
            if (currentTime > reservationTime + marginMinutes) {
              expirado = true;
            }
          }
        } else if (!v.utilizado && new Date(v.dataValidade) < new Date()) {
          expirado = true;
        }

        return {
          codigo: v.codigo,
          valor: v.valor,
          utilizado: v.utilizado,
          expirado,
          dataUtilizacao: v.dataUtilizacao,
          cliente: v.reservation?.nome || '-',
        };
      }) : null,
    });
  } catch (error) {
    console.error('Erro ao gerar relatórios:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatórios' },
      { status: 500 }
    );
  }
}
