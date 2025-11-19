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
      {/* Header */}
      <header className="bg-gradient-to-r from-[#B71C1C] to-[#8B0000] shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-serif text-white font-bold">
              Rosa Mexicano
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Status */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Aguardando Pagamento</h2>
                <p className="text-sm text-zinc-400">Escaneie o QR Code ou copie o código PIX</p>
              </div>
            </div>

            {/* Timer */}
            <div className="bg-black rounded-lg p-4 text-center">
              <p className="text-sm text-zinc-400 mb-1">Tempo restante para pagamento</p>
              <p className="text-3xl font-bold text-[#E53935]">{formatTime(timeLeft)}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800 mb-6">
            <h3 className="text-xl font-semibold mb-6 text-center">Pague com PIX</h3>

            {/* QR Code Image */}
            {qrCodeImage && (
              <div className="bg-white rounded-lg p-6 mb-6 flex justify-center">
                <Image
                  src={qrCodeImage}
                  alt="QR Code PIX"
                  width={300}
                  height={300}
                  className="rounded-lg"
                />
              </div>
            )}

            {/* Valor */}
            <div className="text-center mb-6">
              <p className="text-sm text-zinc-400 mb-1">Valor a pagar</p>
              <p className="text-4xl font-bold text-[#E53935]">R$ 50,00</p>
            </div>

            {/* Código PIX */}
            {paymentData.pixCopyPaste && (
              <div>
                <label className="block text-sm font-medium mb-2">Código PIX Copia e Cola</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentData.pixCopyPaste}
                    readOnly
                    className="flex-1 px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white text-sm font-mono"
                  />
                  <button
                    onClick={copyPixCode}
                    className="px-6 py-3 bg-[#E53935] hover:bg-[#B71C1C] rounded-lg transition flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Instruções */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold mb-4">Como pagar com PIX</h3>
            <ol className="space-y-3 text-zinc-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#E53935] rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span>Abra o app do seu banco</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#E53935] rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span>Escolha pagar com PIX QR Code ou PIX Copia e Cola</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#E53935] rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span>Escaneie o QR Code acima ou cole o código PIX</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#E53935] rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span>Confirme o pagamento de R$ 50,00</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#E53935] rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <span>Aguarde a confirmação automática (geralmente instantânea)</span>
              </li>
            </ol>
          </div>

          {/* Detalhes da Reserva */}
          {paymentData.reservationData && (
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mt-6">
              <h3 className="text-lg font-semibold mb-4">Detalhes da Reserva</h3>
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
