'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CreditCard, Smartphone, Check } from 'lucide-react';

export default function PagamentoDemoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reservationId = searchParams.get('reservation');
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const handlePayment = async (method: string) => {
    setLoading(true);
    setSelectedMethod(method);

    // Simular processamento de pagamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Redirecionar para página de sucesso
    router.push(`/sucesso?payment_id=demo_${reservationId}`);
  };

  return (
    <div className="flex items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-zinc-900 rounded-lg p-8 md:p-12 border border-zinc-800">
          {/* Badge DEMO */}
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-8">
            <p className="text-yellow-500 text-center font-semibold">
              🎭 MODO DEMONSTRAÇÃO - Pagamento Simulado
            </p>
            <p className="text-yellow-400/80 text-center text-sm mt-2">
              Este é um checkout de demonstração. Nenhuma cobrança real será feita.
            </p>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Finalizar Reserva
          </h1>

          <p className="text-zinc-300 mb-8 text-center">
            Escolha a forma de pagamento
          </p>

          {/* Resumo do Pagamento */}
          <div className="bg-black rounded-lg p-6 mb-8 border border-zinc-700">
            <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Reserva de Mesa</span>
              <span className="text-2xl font-bold text-[#E53935]">R$ 5,00</span>
            </div>
            <p className="text-sm text-zinc-500 mt-2">
              * Valor 100% conversível em consumação
            </p>
          </div>

          {/* Métodos de Pagamento */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold mb-4">Formas de Pagamento</h3>

            {/* PIX */}
            <button
              onClick={() => handlePayment('pix')}
              disabled={loading}
              className="w-full bg-zinc-800 hover:bg-zinc-700 border-2 border-transparent hover:border-[#E53935] rounded-lg p-6 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E53935]/20 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-[#E53935]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">PIX</h4>
                  <p className="text-sm text-zinc-400">Aprovação imediata</p>
                </div>
                {loading && selectedMethod === 'pix' && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E53935]"></div>
                )}
              </div>
            </button>

            {/* Cartão de Crédito */}
            <button
              onClick={() => handlePayment('credit_card')}
              disabled={loading}
              className="w-full bg-zinc-800 hover:bg-zinc-700 border-2 border-transparent hover:border-[#E53935] rounded-lg p-6 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E53935]/20 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-[#E53935]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">Cartão de Crédito</h4>
                  <p className="text-sm text-zinc-400">Em até 12x sem juros</p>
                </div>
                {loading && selectedMethod === 'credit_card' && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E53935]"></div>
                )}
              </div>
            </button>
          </div>

          {/* Segurança */}
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-[#E53935]" />
              <div>
                <p className="text-sm font-semibold">Pagamento 100% Seguro</p>
                <p className="text-xs text-zinc-400">Seus dados estão protegidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
