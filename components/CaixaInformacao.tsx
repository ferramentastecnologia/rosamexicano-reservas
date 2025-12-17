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
    <div className="bg-[#C2185B]/15 backdrop-blur-sm rounded-2xl p-5 border border-[#C2185B]/30 shadow-lg">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-[#C2185B] flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-base font-semibold text-white mb-2">Lembrete importante</h4>
          <p className="text-sm text-white/80">
            Ao chegar no restaurante, informe ao caixa que você possui uma reserva em nome de <span className="font-semibold text-[#FFD700]">{customerName}</span>.
          </p>
          <p className="text-sm text-white/60 mt-2">
            O valor de <span className="text-[#FFD700] font-medium">R$ 50,00</span> já foi pago antecipadamente e será descontado da sua conta.
          </p>
        </div>
      </div>
    </div>
  );
}

// Manter export antigo para compatibilidade
export const CaixaInformacao = LembreteReserva;
