'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Check, Copy, Clock, CheckCircle } from 'lucide-react';

type ReservationData = {
  nome: string;
  email: string;
  telefone: string;
  data: string;
  horario: string;
  numeroPessoas: number;
};

type PaymentData = {
  success: boolean;
  reservationId: string;
  paymentId: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  pixEncodedImage?: string;
  expirationDate?: string;
  reservationData?: ReservationData;
};

function PagamentoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600); // fallback: 10 minutos
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Função para verificar status do pagamento
  const checkPaymentStatus = useCallback(async () => {
    if (!paymentData?.paymentId || paymentConfirmed) return;

    try {
      setCheckingPayment(true);
      const response = await fetch('/api/check-payment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: paymentData.paymentId }),
      });

      const result = await response.json();

      if (result.success && result.confirmed) {
        setPaymentConfirmed(true);
        // Redireciona para página de sucesso após 2 segundos
        setTimeout(() => {
          router.push(`/sucesso?reservationId=${paymentData.reservationId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
    } finally {
      setCheckingPayment(false);
    }
  }, [paymentData, paymentConfirmed, router]);

  // Polling para verificar pagamento a cada 3 segundos
  useEffect(() => {
    if (!paymentData?.paymentId || paymentConfirmed) return;

    const interval = setInterval(checkPaymentStatus, 3000);
    return () => clearInterval(interval);
  }, [paymentData, paymentConfirmed, checkPaymentStatus]);

  // Lê os dados da URL (?data=...)
  useEffect(() => {
    const raw = searchParams.get('data');
    if (!raw) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(raw)) as PaymentData;
      setPaymentData(parsed);

      // Timer baseado na data de expiração, se vier do Asaas
      if (parsed.expirationDate) {
        const exp = new Date(parsed.expirationDate).getTime();
        const now = Date.now();
        const diffSeconds = Math.floor((exp - now) / 1000);

        if (diffSeconds > 0 && diffSeconds < 3600) {
          setTimeLeft(diffSeconds);
        }
      }

      // Usa imagem do Asaas, se veio, senão gera o QR Code localmente
      if (parsed.pixEncodedImage) {
        const img = parsed.pixEncodedImage.startsWith('data:')
          ? parsed.pixEncodedImage
          : `data:image/png;base64,${parsed.pixEncodedImage}`;
        setQrCodeImage(img);
      } else if (parsed.pixQrCode || parsed.pixCopyPaste) {
        const value = parsed.pixQrCode || parsed.pixCopyPaste!;
        QRCode.toDataURL(value, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
        }).then(setQrCodeImage);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro ao processar dados de pagamento:', error);
      setLoading(false);
    }
  }, [searchParams]);

  // Countdown e cancelamento por expiração
  useEffect(() => {
    if (timeLeft === 0 && paymentData?.paymentId && !paymentConfirmed) {
      // Timer zerou - cancelar reserva
      fetch('/api/cancel-expired-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: paymentData.paymentId }),
      }).catch(err => console.error('Erro ao cancelar reserva expirada:', err));
    }

    if (!timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, paymentData, paymentConfirmed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const copyPixCode = () => {
    if (paymentData?.pixCopyPaste || paymentData?.pixQrCode) {
      const value = paymentData.pixCopyPaste || paymentData.pixQrCode!;
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E53935] mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando dados de pagamento...</p>
        </div>
      </div>
    );
  }

  if (!paymentData || !paymentData.success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-xl text-zinc-200 mb-2">Não foi possível carregar os dados de pagamento.</p>
          <p className="text-sm text-zinc-500">
            Volte à página anterior e tente gerar a reserva novamente.
          </p>
        </div>
      </div>
    );
  }

  // Tela de pagamento confirmado
  if (paymentConfirmed) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center px-4">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-green-500 mb-2">Pagamento Confirmado!</h2>
          <p className="text-zinc-400">Redirecionando para a confirmação...</p>
        </div>
      </div>
    );
  }

  // Tela de tempo expirado
  if (timeLeft === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center px-4">
          <Clock className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-500 mb-2">Tempo Expirado!</h2>
          <p className="text-zinc-400 mb-6">O tempo para pagamento expirou e a reserva foi cancelada.</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#E53935] hover:bg-[#B71C1C] rounded-lg transition"
          >
            Fazer Nova Reserva
          </a>
        </div>
      </div>
    );
  }

  const valor = 'R$ 50,00'; // mesmo valor usado na API (value: 50.00)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-[#B71C1C] shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <Image
              src="/images/logo-rosa-mexicano.png"
              alt="Rosa Mexicano"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Coluna 1 - Pagamento PIX */}
            <div className="space-y-4">
              <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
                {/* Timer */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    {checkingPayment ? (
                      <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium">
                      {checkingPayment ? 'Verificando pagamento...' : 'Aguardando pagamento'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">Expira em</p>
                    <p className="text-lg font-bold text-[#E53935]">
                      {formatTime(timeLeft)}
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-4 text-center">Pague com PIX</h3>

                {/* QR Code */}
                {qrCodeImage && (
                  <div className="bg-white rounded-lg p-3 mb-4 flex justify-center">
                    <Image
                      src={qrCodeImage}
                      alt="QR Code PIX"
                      width={260}
                      height={260}
                      className="h-auto w-auto"
                    />
                  </div>
                )}

                {/* Valor */}
                <div className="text-center mb-4">
                  <p className="text-xs text-zinc-400 mb-1">Valor a pagar</p>
                  <p className="text-2xl font-bold text-[#E53935]">{valor}</p>
                </div>

                {/* Código PIX copia e cola */}
                {(paymentData.pixCopyPaste || paymentData.pixQrCode) && (
                  <div>
                    <label className="block text-xs font-medium mb-2">
                      Código PIX copia e cola
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={paymentData.pixCopyPaste || paymentData.pixQrCode || ''}
                        readOnly
                        className="flex-1 px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white text-xs font-mono"
                      />
                      <button
                        onClick={copyPixCode}
                        className="px-3 py-2 bg-[#E53935] hover:bg-[#B71C1C] rounded-lg transition flex items-center gap-2 text-sm"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-zinc-400">
                      Você também pode pagar copiando e colando esse código no app do seu banco.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna 2 - Instruções + detalhes */}
            <div className="space-y-4">
              {/* Instruções */}
              <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
                <h3 className="text-base font-semibold mb-3">Como pagar com PIX</h3>
                <ol className="space-y-2.5 text-sm text-zinc-300">
                  <li className="flex gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 bg-[#E53935] rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <span>Abra o app do seu banco.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 bg-[#E53935] rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <span>Escolha a opção de pagamento via PIX.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 bg-[#E53935] rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <span>Escaneie o QR Code ou use o código copia e cola.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 bg-[#E53935] rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <span>Confirme o valor e finalize o pagamento.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 bg-[#E53935] rounded-full flex items-center justify-center text-xs font-bold">
                      5
                    </span>
                    <span>Aguarde a confirmação (geralmente instantânea).</span>
                  </li>
                </ol>
              </div>

              {/* Detalhes da reserva */}
              {paymentData.reservationData && (
                <div className="bg-black/90 rounded-lg p-5 border border-zinc-900">
                  <h3 className="text-base font-semibold mb-3">Detalhes da reserva</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Nome:</span>
                      <span className="font-medium">
                        {paymentData.reservationData.nome}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Data:</span>
                      <span className="font-medium">
                        {paymentData.reservationData.data}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Horário:</span>
                      <span className="font-medium">
                        {paymentData.reservationData.horario}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Pessoas:</span>
                      <span className="font-medium">
                        {paymentData.reservationData.numeroPessoas}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PagamentoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E53935] mx-auto mb-4"></div>
            <p className="text-zinc-400">Carregando...</p>
          </div>
        </div>
      }
    >
      <PagamentoContent />
    </Suspense>
  );
}
