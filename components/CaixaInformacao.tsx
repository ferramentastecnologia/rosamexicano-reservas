'use client';

import { Info } from 'lucide-react';

interface LembreteReservaProps {
  customerName: string;
}

/**
 * Componente de lembrete para o cliente informar ao caixa sobre a reserva
 * Exibe: Lembrete para apresentar a reserva + valor já pago
 */
export function LembreteReserva({ customerName }: LembreteReservaProps) {
  return (
    <div className="bg-[#00897B]/10 rounded-2xl p-5 border-2 border-[#00897B]/30 shadow-lg">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-[#00897B] flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-base font-semibold text-gray-800 mb-2">Lembrete importante</h4>
          <p className="text-sm text-gray-600">
            Ao chegar no restaurante, informe ao caixa que você possui uma reserva em nome de <span className="font-semibold text-[#C2185B]">{customerName}</span>.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            O valor de <span className="text-[#E65100] font-medium">R$ 50,00</span> já foi pago antecipadamente e será descontado da sua conta.
          </p>
        </div>
      </div>
    </div>
  );
}

// Manter export antigo para compatibilidade
export const CaixaInformacao = LembreteReserva;
