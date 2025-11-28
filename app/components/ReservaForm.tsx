'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Calendar, Users, Clock, User, Mail, Phone, CreditCard } from 'lucide-react';
import CalendarioReserva from './CalendarioReserva';
import MapaMesas from './MapaMesas';

type ReservaFormData = {
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  data: string;
  horario: string;
  numeroPessoas: number;
};

const horarios = [
  '18:00', '18:30', '19:00', '19:30'
];

export default function ReservaForm() {
  const [loading, setLoading] = useState(false);
  const [etapa, setEtapa] = useState<'formulario' | 'pagamento'>('formulario');
  const [dadosReserva, setDadosReserva] = useState<ReservaFormData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTables, setSelectedTables] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<ReservaFormData>();

  // Watch para atualizar o mapa de mesas em tempo real
  const watchedData = useWatch({ control, name: 'data' });
  const watchedHorario = useWatch({ control, name: 'horario' });
  const watchedNumeroPessoas = useWatch({ control, name: 'numeroPessoas' });

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setValue('data', date);
  };

  const handleMesasSelect = (mesas: number[]) => {
    setSelectedTables(mesas);
  };

  const onSubmit = async (data: ReservaFormData) => {
    // Validar seleção de mesas
    const mesasNecessarias = Math.ceil(data.numeroPessoas / 4);
    if (selectedTables.length !== mesasNecessarias) {
      alert(`Por favor, selecione exatamente ${mesasNecessarias} mesa(s) para ${data.numeroPessoas} pessoas.`);
      return;
    }

    setLoading(true);
    setDadosReserva(data);

    try {
      // Primeiro, verificar disponibilidade
      const availabilityResponse = await fetch('api/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: data.data,
          horario: data.horario,
          numeroPessoas: data.numeroPessoas,
        }),
      });

      const availabilityData = await availabilityResponse.json();

      if (!availabilityData.available) {
        alert(
          `❌ Infelizmente não temos disponibilidade para ${data.numeroPessoas} pessoas neste horário.\n\n` +
          `Capacidade disponível: ${availabilityData.capacity?.available || 0} pessoas\n\n` +
          `Por favor, escolha outro horário ou reduza o número de pessoas.`
        );
        setLoading(false);
        return;
      }

      // Se houver disponibilidade, prosseguir com o pagamento
      const response = await fetch('api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          mesasSelecionadas: JSON.stringify(selectedTables),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na resposta:', errorData);
        alert(`Erro ao processar reserva: ${errorData.error || 'Tente novamente.'}`);
        setLoading(false);
        return;
      }

      const result = await response.json();

      if (result.success && result.pixQrCode) {
        // Redirecionar para nossa página de pagamento transparente
        const paymentData = encodeURIComponent(JSON.stringify(result));
        window.location.href = `/pagamento?data=${paymentData}`;
      } else {
        alert('Erro ao processar reserva. Tente novamente.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar reserva. Verifique sua conexão e tente novamente.');
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

              <div>
                <label className="block text-sm font-medium mb-2">CPF ou CNPJ *</label>
                <input
                  {...register('cpfCnpj', {
                    required: 'CPF ou CNPJ é obrigatório',
                    pattern: {
                      value: /^[\d.-]+$/,
                      message: 'CPF/CNPJ inválido',
                    },
                  })}
                  type="text"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                />
                {errors.cpfCnpj && (
                  <p className="text-red-500 text-sm mt-1">{errors.cpfCnpj.message}</p>
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
                  <p className="text-xs text-zinc-400 mb-2">
                    Este valor retorna integralmente no dia da sua reserva
                  </p>
                  <p className="text-xs text-yellow-400 border-t border-zinc-700 pt-2 mt-2">
                    ⚠️ <strong>Importante:</strong> Em caso de não comparecimento, o valor de R$ 50,00 ficará retido
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
                    value: 2,
                    message: 'Mínimo 2 pessoas'
                  },
                  max: {
                    value: 60,
                    message: 'Máximo 60 pessoas por reserva'
                  },
                  validate: (value) => {
                    if (value % 2 !== 0) {
                      return 'Apenas múltiplos de 2 são permitidos';
                    }
                    return true;
                  }
                })}
                type="number"
                min="2"
                max="60"
                step="2"
                placeholder="Digite o número de pessoas (múltiplos de 2)"
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg focus:outline-none focus:border-[#E53935] text-white"
              />
              {errors.numeroPessoas && (
                <p className="text-red-500 text-sm mt-1">{errors.numeroPessoas.message}</p>
              )}
              <p className="text-xs text-zinc-500 mt-1">
                Múltiplos de 2 • Mínimo: 2 pessoas • Máximo: 60 pessoas
              </p>
            </div>

            {/* Mapa de Mesas */}
            <div className="md:col-span-2">
              <MapaMesas
                data={watchedData || ''}
                horario={watchedHorario || ''}
                numeroPessoas={watchedNumeroPessoas || 0}
                onMesasSelect={handleMesasSelect}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
