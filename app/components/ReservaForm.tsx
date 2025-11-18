'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Users, Clock, User, Mail, Phone, CreditCard } from 'lucide-react';
import CalendarioReserva from './CalendarioReserva';

type ReservaFormData = {
  nome: string;
  email: string;
  telefone: string;
  data: string;
  horario: string;
  numeroPessoas: number;
};

const horarios = [
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

export default function ReservaForm() {
  const [loading, setLoading] = useState(false);
  const [etapa, setEtapa] = useState<'formulario' | 'pagamento'>('formulario');
  const [dadosReserva, setDadosReserva] = useState<ReservaFormData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ReservaFormData>();

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setValue('data', date);
  };

  const onSubmit = async (data: ReservaFormData) => {
    setLoading(true);
    setDadosReserva(data);

    try {
      // Chamar API de criação de pagamento (DEMO)
      const response = await fetch('/api/create-payment-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.invoiceUrl) {
        // Redirecionar para página de pagamento do Asaas
        window.location.href = result.invoiceUrl;
      } else {
        alert('Erro ao processar reserva. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar reserva. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Coluna 1: Dados Pessoais */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-xl font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-[#E53935]" />
                Seus Dados
              </h4>

              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                <input
                  {...register('nome', { required: 'Nome é obrigatório' })}
                  type="text"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
                  placeholder="Seu nome completo"
                />
                {errors.nome && (
                  <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-mail *</label>
                <input
                  {...register('email', {
                    required: 'E-mail é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'E-mail inválido',
                    },
                  })}
                  type="email"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefone/WhatsApp *</label>
                <input
                  {...register('telefone', {
                    required: 'Telefone é obrigatório',
                    pattern: {
                      value: /^[\d\s()+-]+$/,
                      message: 'Telefone inválido',
                    },
                  })}
                  type="tel"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
                  placeholder="(00) 00000-0000"
                />
                {errors.telefone && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>
                )}
              </div>
            </div>

            {/* Resumo e Pagamento (embaixo do formulário de dados pessoais) */}
            <div className="border-t border-zinc-800 pt-6">
              <h4 className="text-xl font-semibold mb-4">Resumo da Reserva</h4>

              <div className="bg-black rounded-lg p-6 border border-zinc-700">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-700 mb-4">
                  <span className="text-lg text-zinc-400">Valor da Reserva:</span>
                  <span className="text-3xl font-bold text-[#E53935]">R$ 50,00</span>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-zinc-300 mb-2">
                    <strong className="text-[#E53935]">100% conversível</strong> em consumação
                  </p>
                  <p className="text-xs text-zinc-400">
                    Este valor retorna integralmente no dia da sua reserva
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#E53935] hover:bg-[#B71C1C] text-white font-bold text-lg py-5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    'Processando...'
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      Continuar para Pagamento
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-zinc-500 mt-3">
                  Pagamento seguro via Asaas
                </p>
              </div>
            </div>
          </div>

          {/* Coluna 2: Detalhes da Reserva */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#E53935]" />
              Detalhes da Reserva
            </h4>

            <div>
              <label className="block text-sm font-medium mb-4">Data *</label>
              <input
                type="hidden"
                {...register('data', { required: 'Selecione uma data' })}
              />
              <CalendarioReserva
                onSelectDate={handleDateSelect}
                selectedDate={selectedDate}
              />
              {errors.data && (
                <p className="text-red-500 text-sm mt-2">{errors.data.message}</p>
              )}
              {selectedDate && (
                <p className="text-[#E53935] text-sm mt-2">
                  Data selecionada: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Horário *</label>
              <select
                {...register('horario', { required: 'Horário é obrigatório' })}
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#0e9a20] text-white"
              >
                <option value="">Selecione um horário</option>
                {horarios.map((horario) => (
                  <option key={horario} value={horario}>
                    {horario}
                  </option>
                ))}
              </select>
              {errors.horario && (
                <p className="text-red-500 text-sm mt-1">{errors.horario.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Número de Pessoas *</label>
              <input
                {...register('numeroPessoas', {
                  required: 'Número de pessoas é obrigatório',
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: 'Mínimo 1 pessoa'
                  },
                  max: {
                    value: 100,
                    message: 'Para grupos acima de 100 pessoas, entre em contato diretamente'
                  }
                })}
                type="number"
                min="1"
                max="100"
                placeholder="Digite o número de pessoas"
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#0e9a20] text-white"
              />
              {errors.numeroPessoas && (
                <p className="text-red-500 text-sm mt-1">{errors.numeroPessoas.message}</p>
              )}
              <p className="text-xs text-zinc-500 mt-1">
                Para grupos grandes, reserve com antecedência
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
