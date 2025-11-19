'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Check, Copy, Clock } from 'lucide-react';

function PagamentoContent() {
  const searchParams = useSearchParams();
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        setPaymentData(parsed);

        // Gerar QR Code
        if (parsed.pixQrCode) {
          QRCode.toDataURL(parsed.pixQrCode, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          }).then(setQrCodeImage);
        }

        setLoading(false);
      } catch (error) {
        console.error('Erro ao processar dados:', error);
        setLoading(false);
      }
    }
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyPixCode = () => {
    if (paymentData?.pixCopyPaste) {
      navigator.clipboard.writeText(paymentData.pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E53935] mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-zinc-400">Dados de pagamento não encontrados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Compacto */}
      <header className="bg-gradient-to-r from-[#B71C1C] to-[#8B0000] shadow-lg">
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

            {/* Coluna 1: QR Code e Pagamento */}
            <div className="space-y-4">
              {/* QR Code e Pagamento Unificado */}
              <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
                {/* Timer no topo */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Aguardando Pagamento</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">Expira em</p>
                    <p className="text-lg font-bold text-[#E53935]">{formatTime(timeLeft)}</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-4 text-center">Pague com PIX</h3>

                {/* QR Code Image */}
                {qrCodeImage && (
                  <div className="bg-white rounded-lg p-3 mb-4 flex justify-center">
                    <Image
                      src={qrCodeImage}
                      alt="QR Code PIX"
                      width={220}
                      height={220}
                      className="rounded-lg"
                    />
                  </div>
                )}

                {/* Valor */}
                <div className="text-center mb-4">
                  <p className="text-xs text-zinc-400 mb-1">Valor a pagar</p>
                  <p className="text-2xl font-bold text-[#E53935]">R$ 50,00</p>
                </div>

                {/* Código PIX */}
                {paymentData.pixCopyPaste && (
                  <div>
                    <label className="block text-xs font-medium mb-2">Código PIX Copia e Cola</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={paymentData.pixCopyPaste}
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
                  </div>
                )}
              </div>
            </div>

            {/* Coluna 2: Instruções e Detalhes */}
            <div className="space-y-4">

          {/* Instruções */}
          <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
            <h3 className="text-base font-semibold mb-3">Como pagar com PIX</h3>
            <ol className="space-y-2.5 text-sm text-zinc-300">
              <li className="flex gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 bg-[#E53935] rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Abra o app do seu banco</span>
              </li>
              <li className="flex gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 bg-[#E53935] rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Escolha PIX QR Code ou PIX Copia e Cola</span>
              </li>
              <li className="flex gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 bg-[#E53935] rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Escaneie o QR Code ou cole o código PIX</span>
              </li>
              <li className="flex gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 bg-[#E53935] rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Confirme o pagamento de R$ 50,00</span>
              </li>
              <li className="flex gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 bg-[#E53935] rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <span>Aguarde a confirmação (geralmente instantânea)</span>
              </li>
            </ol>
          </div>

          {/* Detalhes da Reserva */}
          {paymentData.reservationData && (
            <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
              <h3 className="text-base font-semibold mb-3">Detalhes da Reserva</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Nome:</span>
                  <span className="font-medium">{paymentData.reservationData.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Data:</span>
                  <span className="font-medium">{paymentData.reservationData.data}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Horário:</span>
                  <span className="font-medium">{paymentData.reservationData.horario}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Pessoas:</span>
                  <span className="font-medium">{paymentData.reservationData.numeroPessoas}</span>
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
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E53935] mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando...</p>
        </div>
      </div>
    }>
      <PagamentoContent />
    </Suspense>
  );
}
