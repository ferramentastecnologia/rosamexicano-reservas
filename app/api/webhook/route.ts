import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVoucherCode, generateQRCodeData, getExpiryDate } from '@/lib/voucher-helpers';
import { generateVoucherPDF } from '@/lib/pdf-generator';
import { sendVoucherEmail } from '@/lib/email-sender';

export async function POST(request: Request) {
  try {
    const webhook = await request.json();
    console.log('Webhook recebido:', JSON.stringify(webhook, null, 2));

    const { event, payment } = webhook;

    // Processar apenas eventos de pagamento confirmado
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      console.log(`Pagamento confirmado: ${payment.id}`);

      // Buscar reserva no banco de dados
      const reservation = await prisma.reservation.findUnique({
        where: { paymentId: payment.id },
      });

      if (!reservation) {
        console.error('Reserva não encontrada para payment ID:', payment.id);
        return NextResponse.json({ received: true });
      }

      // Verificar se já existe voucher
      const existingVoucher = await prisma.voucher.findUnique({
        where: { reservationId: reservation.id },
      });

      if (existingVoucher) {
        console.log('Voucher já existe para esta reserva');
        return NextResponse.json({ received: true, voucher: existingVoucher.codigo });
      }

      // 1. Gerar código do voucher
      const voucherCode = generateVoucherCode();
      console.log('Código gerado:', voucherCode);

      // 2. Gerar dados do QR Code
      const qrCodeData = await generateQRCodeData(voucherCode, reservation);

      // 3. Criar voucher no banco de dados
      const voucher = await prisma.voucher.create({
        data: {
          reservationId: reservation.id,
          codigo: voucherCode,
          valor: 5.00,
          qrCodeData: qrCodeData,
          dataValidade: getExpiryDate(),
        },
        include: {
          reservation: true,
        },
      });

      console.log('Voucher criado:', voucher.id);

      // 4. Atualizar status da reserva
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'confirmed' },
      });

      // 5. Gerar PDF
      const pdfBuffer = await generateVoucherPDF(voucher);
      console.log('PDF gerado, tamanho:', pdfBuffer.length);

      // 6. Enviar email
      const emailSent = await sendVoucherEmail(
        reservation.email,
        voucher,
        pdfBuffer
      );

      if (emailSent) {
        console.log('Email enviado com sucesso para:', reservation.email);
      } else {
        console.error('Falha ao enviar email');
      }

      return NextResponse.json({
        received: true,
        voucherCode: voucher.codigo,
        reservationId: reservation.id,
        emailSent: emailSent,
      });
    }

    // Outros eventos
    if (event === 'PAYMENT_OVERDUE') {
      console.log('Pagamento vencido:', payment.id);

      const reservation = await prisma.reservation.findUnique({
        where: { paymentId: payment.id },
      });

      if (reservation) {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: 'cancelled' },
        });
      }
    }

    if (event === 'PAYMENT_DELETED') {
      console.log('Pagamento cancelado:', payment.id);

      const reservation = await prisma.reservation.findUnique({
        where: { paymentId: payment.id },
      });

      if (reservation) {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: 'cancelled' },
        });
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}
