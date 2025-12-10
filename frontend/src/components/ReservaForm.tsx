import { useState, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Phone, Mail, Clock, Users, MapPin, ChevronDown } from 'lucide-react';
import CalendarioReserva from './CalendarioReserva';
import MapaMesas from './MapaMesas';
import { paymentAPI } from '../services/api';
import { AREA_NAMES, AREA_DESCRIPTIONS, HORARIOS, TableArea } from '../lib/tables-config';

interface ReservaFormData {
  nome: string;
  email: string;
  telefone: string;
  data: string;
  horario: string;
  numeroPessoas: number;
}

export default function ReservaForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [horarioDropdownOpen, setHorarioDropdownOpen] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<TableArea | null>(null);
  const horarioDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (horarioDropdownRef.current && !horarioDropdownRef.current.contains(event.target as Node)) {
        setHorarioDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<ReservaFormData>();

  const watchedNumeroPessoas = useWatch({ control, name: 'numeroPessoas' });

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setValue('data', date);
  };

  const handleHorarioSelect = (horario: string) => {
    setSelectedHorario(horario);
    setValue('horario', horario);
    setHorarioDropdownOpen(false);
  };

  const handleMesasSelect = (mesas: number[]) => {
    setSelectedTables(mesas);
  };

  const handleAreaSelect = (area: TableArea) => {
    setSelectedArea(area);
    setSelectedTables([]);
  };

  const onSubmit = async (data: ReservaFormData) => {
    if (!selectedArea) {
      setError('Por favor, selecione uma área');
      return;
    }

    if (selectedTables.length === 0) {
      setError('Por favor, selecione as mesas');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verificar disponibilidade
      const availabilityResponse = await paymentAPI.checkAvailability({
        data: data.data,
        horario: data.horario,
        numero_pessoas: data.numeroPessoas,
      });

      if (!availabilityResponse.data.available) {
        setError(
          `Infelizmente não temos disponibilidade para ${data.numeroPessoas} pessoas neste horário.\n\n` +
          `Capacidade disponível: ${availabilityResponse.data.capacity?.available || 0} pessoas\n\n` +
          `Por favor, escolha outro horário ou reduza o número de pessoas.`
        );
        setLoading(false);
        return;
      }

      // Criar pagamento
      const response = await paymentAPI.create({
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        data: data.data,
        horario: data.horario,
        numero_pessoas: data.numeroPessoas,
        mesas_selecionadas: JSON.stringify(selectedTables),
      });

      if (response.data.success) {
        // Guardar info no localStorage para depois recuperar
        localStorage.setItem(
          'reservaAtual',
          JSON.stringify({
            reservationId: response.data.reservation_id,
            paymentId: response.data.payment_id,
            pixQrCode: response.data.pix_qr_code,
            pixCopyPaste: response.data.pix_copy_paste,
            expirationDate: response.data.expiration_date,
            amount: response.data.amount,
          })
        );

        // Redirecionar para página de pagamento
        navigate('/pagamento', { state: { paymentData: response.data } });
      }
    } catch (err: any) {
      console.error('Erro ao criar reserva:', err);
      setError(err.response?.data?.error || 'Erro ao criar reserva. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Grid principal com 3 colunas em desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna 1: Dados Pessoais + Horário */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold">Dados da Reserva</h2>

            {/* Nome */}
            <div>
              <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                <User className="w-4 h-4 mr-2 text-red-500" />
                Nome
              </label>
              <input
                type="text"
                placeholder="Seu nome completo"
                {...register('nome', {
                  required: 'Nome é obrigatório',
                  minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                <Mail className="w-4 h-4 mr-2 text-red-500" />
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido',
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Telefone */}
            <div>
              <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                <Phone className="w-4 h-4 mr-2 text-red-500" />
                Telefone
              </label>
              <input
                type="tel"
                placeholder="(11) 98765-4321"
                {...register('telefone', {
                  required: 'Telefone é obrigatório',
                  minLength: { value: 10, message: 'Telefone inválido' },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>}
            </div>

            {/* Número de Pessoas */}
            <div>
              <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                <Users className="w-4 h-4 mr-2 text-red-500" />
                Número de Pessoas
              </label>
              <input
                type="number"
                min="2"
                max="60"
                step="2"
                placeholder="2, 4, 6..."
                {...register('numeroPessoas', {
                  required: 'Número de pessoas é obrigatório',
                  min: { value: 2, message: 'Mínimo 2 pessoas' },
                  max: { value: 60, message: 'Máximo 60 pessoas' },
                  validate: (value) =>
                    value % 2 === 0 || 'Deve ser um número par',
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {errors.numeroPessoas && (
                <p className="text-red-500 text-sm mt-1">{errors.numeroPessoas.message}</p>
              )}
            </div>

            {/* Horário */}
            <div>
              <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                <Clock className="w-4 h-4 mr-2 text-red-500" />
                Horário
              </label>
              <div ref={horarioDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setHorarioDropdownOpen(!horarioDropdownOpen)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-between bg-white hover:bg-gray-50"
                >
                  {selectedHorario || 'Selecione um horário'}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {horarioDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {HORARIOS.map((horario) => (
                      <button
                        key={horario}
                        type="button"
                        onClick={() => handleHorarioSelect(horario)}
                        className="w-full text-left px-4 py-2 hover:bg-red-100 text-gray-800"
                      >
                        {horario}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.horario && <p className="text-red-500 text-sm mt-1">{errors.horario.message}</p>}
            </div>
          </div>

          {/* Coluna 2: Calendário */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-red-500" />
              Selecione a Data
            </h3>
            <CalendarioReserva onSelectDate={handleDateSelect} selectedDate={selectedDate} />
            {errors.data && <p className="text-red-500 text-sm mt-2">{errors.data.message}</p>}
            {selectedDate && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                <strong>Data selecionada:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>

          {/* Coluna 3: Seleção de Área */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-red-500" />
              Selecione a Área
            </h3>
            <div className="space-y-3">
              {(['interno', 'semi-externo', 'externo'] as TableArea[]).map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleAreaSelect(area)}
                  className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                    selectedArea === area
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white hover:border-red-300'
                  }`}
                >
                  <h4 className="font-bold text-gray-800">{AREA_NAMES[area]}</h4>
                  <p className="text-sm text-gray-600">{AREA_DESCRIPTIONS[area]}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mapa de Mesas (full width) */}
        {selectedArea && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Mapa de Mesas</h3>
            <MapaMesas
              data={selectedDate}
              horario={selectedHorario}
              numeroPessoas={watchedNumeroPessoas || 2}
              selectedArea={selectedArea}
              onMesasSelect={handleMesasSelect}
            />
          </div>
        )}

        {/* Mensagens de erro */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold">Erro:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Botão de Submissão */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? 'Processando...' : 'Continuar para Pagamento'}
        </button>
      </form>
    </div>
  );
}
