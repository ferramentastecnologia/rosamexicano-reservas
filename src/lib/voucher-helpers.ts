import QRCode from 'qrcode';

/**
 * Gera um código único de voucher no formato: RM-XXXXXXXX-XXXXXXXX
 * Exemplo: RM-K7X9M2Q5-M7XQ9Z8W
 */
export function generateVoucherCode(): string {
  const chars = 'ABCDEFGH JKLMNPQRSTUVWXYZ23456789'; // Sem I, O, 0, 1 para evitar confusão
  const randomPart = Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');

  const timestamp = Date.now().toString(36).toUpperCase().padStart(8, '0');

  return `RM-${randomPart}-${timestamp}`;
}

/**
 * Gera dados para QR Code do voucher
 */
export async function generateQRCodeData(voucherCode: string, reservationData: any): Promise<string> {
  const qrData = {
    codigo: voucherCode,
    restaurante: 'Rosa Mexicano',
    valor: 50.00,
    data: reservationData.data,
    horario: reservationData.horario,
    pessoas: reservationData.numeroPessoas,
    nome: reservationData.nome,
    validade: '2025-12-31'
  };

  return JSON.stringify(qrData);
}

/**
 * Gera QR Code em base64
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw new Error('Falha ao gerar QR Code');
  }
}

/**
 * Calcula data de validade (31/12/2025)
 */
export function getExpiryDate(): Date {
  return new Date('2025-12-31T23:59:59');
}
