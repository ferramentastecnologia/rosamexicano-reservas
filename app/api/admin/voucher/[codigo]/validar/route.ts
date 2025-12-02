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
      const [hours, minutes] = voucher.reservation.horario.split(':').map(Number);
      const reservationDate = new Date(voucher.reservation.data + 'T00:00:00');
      reservationDate.setHours(hours, minutes, 0, 0);

      // Margem de 3 horas após o horário da reserva
      const expirationDate = new Date(reservationDate.getTime() + 3 * 60 * 60 * 1000);

      if (new Date() > expirationDate) {
        return NextResponse.json(
          { error: 'Voucher expirado - data da reserva já passou' },
          { status: 400 }
        );
      }
    } else if (new Date() > new Date(voucher.dataValidade)) {
      // Fallback para dataValidade caso não tenha reserva
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
