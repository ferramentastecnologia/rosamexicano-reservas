import PDFDocument from 'pdfkit';
import { generateQRCode } from './voucher-helpers';

export async function generateVoucherPDF(voucherData: any): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header com gradiente verde
      doc.rect(0, 0, 595, 150).fill('#0e9a20');

      // Logo e título
      doc.fillColor('#FFFFFF')
         .fontSize(32)
         .font('Helvetica-Bold')
         .text('MORTADELLA RISTORANTE', 50, 40, { align: 'center' });

      doc.fontSize(16)
         .font('Helvetica')
         .text('Voucher de Reserva', 50, 85, { align: 'center' });

      // Código do voucher (grande e destacado)
      doc.fillColor('#000000')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('CÓDIGO DO VOUCHER', 50, 180);

      doc.fontSize(32)
         .fillColor('#0e9a20')
         .font('Courier-Bold')
         .text(voucherData.codigo, 50, 215);

      // QR Code
      const qrCodeDataUrl = await generateQRCode(voucherData.qrCodeData);
      const qrCodeBase64 = qrCodeDataUrl.split(',')[1];
      const qrCodeBuffer = Buffer.from(qrCodeBase64, 'base64');

      doc.image(qrCodeBuffer, 400, 170, { width: 150, height: 150 });

      // Linha separadora
      doc.moveTo(50, 350).lineTo(545, 350).stroke();

      // Detalhes da reserva
      doc.fillColor('#000000')
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('Detalhes da Reserva', 50, 380);

      const detalhes = [
        { label: 'Nome:', valor: voucherData.reservation.nome },
        { label: 'Data:', valor: new Date(voucherData.reservation.data + 'T00:00:00').toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })},
        { label: 'Horário:', valor: voucherData.reservation.horario },
        { label: 'Número de Pessoas:', valor: `${voucherData.reservation.numeroPessoas} pessoas` },
        { label: 'Valor:', valor: `R$ ${voucherData.valor.toFixed(2)}` },
      ];

      let yPos = 420;
      doc.fontSize(12).font('Helvetica');

      detalhes.forEach(item => {
        doc.fillColor('#666666').text(item.label, 50, yPos, { continued: true, width: 150 });
        doc.fillColor('#000000').font('Helvetica-Bold').text(item.valor);
        yPos += 25;
      });

      // Informações importantes
      doc.moveTo(50, yPos + 10).lineTo(545, yPos + 10).stroke();

      doc.fillColor('#0e9a20')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('IMPORTANTE', 50, yPos + 30);

      doc.fillColor('#000000')
         .fontSize(11)
         .font('Helvetica');

      const instrucoes = [
        '• Este voucher é 100% conversível em consumação',
        '• Apresente este código na chegada ao restaurante',
        `• Válido até: ${new Date(voucherData.dataValidade).toLocaleDateString('pt-BR')}`,
        '• Em caso de dúvidas, entre em contato: (47) 3037-6060',
      ];

      yPos += 60;
      instrucoes.forEach(instrucao => {
        doc.text(instrucao, 70, yPos);
        yPos += 20;
      });

      // Footer
      doc.fontSize(9)
         .fillColor('#999999')
         .text(
           'Av. Martin Luther, 1001 - Victor Konder, Blumenau/SC | Tel: (47) 3037-6060',
           50,
           750,
           { align: 'center' }
         );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
