import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendApprovalEmail, sendRejectionEmail, sendVoucherEmail } from '@/lib/email-sender';
import { generateVoucherCode, generateQRCodeData, getExpiryDate } from '@/lib/voucher-helpers';
import { generateVoucherPDF } from '@/lib/pdf-generator';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status }
    });

    // Se aprovado, criar voucher
    if (status === 'approved') {
      // Verificar se já existe voucher
      const existingVoucher = await prisma.voucher.findUnique({
        where: { reservationId: reservation.id },
      });

      if (!existingVoucher) {
        // Criar voucher
        const voucherCode = generateVoucherCode();
        const qrCodeData = await generateQRCodeData(voucherCode, reservation);

        const voucher = await prisma.voucher.create({
          data: {
            reservationId: reservation.id,
            codigo: voucherCode,
            valor: reservation.valor,
            qrCodeData: qrCodeData,
            dataValidade: getExpiryDate(),
          },
          include: {
            reservation: true,
          },
        });

        console.log('Voucher criado na aprovação:', voucher.codigo);

        // Enviar email com voucher (não bloqueia)
        try {
          const pdfBuffer = await generateVoucherPDF(voucher);
          await sendVoucherEmail(reservation.email, voucher, pdfBuffer);
          console.log('Email com voucher enviado para:', reservation.email);
        } catch (emailError) {
          console.error('Erro ao enviar email com voucher:', emailError);
        }
      }

      // Não enviar email de aprovação separado - o voucher já é o email principal
    } else if (status === 'rejected') {
      sendRejectionEmail(reservation).catch(err =>
        console.error('Erro ao enviar email de rejeição:', err)
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar reserva' },
      { status: 500 }
    );
  }
}
