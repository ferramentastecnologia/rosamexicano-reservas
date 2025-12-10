import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Validar (marcar como utilizado) voucher
export async function POST(
  request: Request,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;

    // Buscar voucher com reserva
    const voucher = await prisma.voucher.findUnique({
      where: { codigo: codigo.toUpperCase() },
      include: { reservation: true },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: 'Voucher não encontrado' },
        { status: 404 }
      );
    }

    if (voucher.utilizado) {
      return NextResponse.json(
        { error: 'Voucher já foi utilizado' },
        { status: 400 }
      );
    }

    // Verificar expiração baseada na data/horário da reserva
    if (voucher.reservation) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const reservationDateStr = voucher.reservation.data;

      // Se a data da reserva é anterior a hoje, está expirado
      if (reservationDateStr < todayStr) {
        return NextResponse.json(
          { error: 'Voucher expirado - data da reserva já passou' },
          { status: 400 }
        );
      }

      // Verificar se já passou do horário da reserva + 10 horas de margem
      const [hours, minutes] = voucher.reservation.horario.split(':').map(Number);
      const reservationDateTime = new Date(reservationDateStr + 'T00:00:00');
      reservationDateTime.setHours(hours, minutes, 0, 0);

      // Adicionar 10 horas de margem
      const expirationTime = new Date(reservationDateTime.getTime() + (10 * 60 * 60 * 1000));

      if (today > expirationTime) {
        return NextResponse.json(
          { error: 'Voucher expirado - prazo de 10 horas após a reserva já passou' },
          { status: 400 }
        );
      }
    } else if (new Date() > new Date(voucher.dataValidade)) {
      return NextResponse.json(
        { error: 'Voucher expirado' },
        { status: 400 }
      );
    }

    // Marcar como utilizado
    const updatedVoucher = await prisma.voucher.update({
      where: { codigo: codigo.toUpperCase() },
      data: {
        utilizado: true,
        dataUtilizacao: new Date(),
      },
      include: {
        reservation: true,
      }
    });

    console.log(`Voucher ${codigo} validado com sucesso!`);

    return NextResponse.json({
      success: true,
      message: 'Voucher validado com sucesso',
      voucher: updatedVoucher,
    });
  } catch (error) {
    console.error('Erro ao validar voucher:', error);
    return NextResponse.json(
      { error: 'Erro ao validar voucher' },
      { status: 500 }
    );
  }
}
