'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarioReservaProps {
  onSelectDate: (date: string) => void;
  selectedDate?: string;
}

export default function CalendarioReserva({ onSelectDate, selectedDate }: CalendarioReservaProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // Mês atual
  const [currentYear] = useState(2025);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Gerar datas disponíveis (todos os dias desde hoje até 31 de dezembro)
  const isDateAvailable = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(2025, 11, 31); // 31 de dezembro de 2025
    endDate.setHours(23, 59, 59, 999);

    // Normalizar a data para comparação
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Verificar se está entre hoje e 31 de dezembro de 2025
    return checkDate >= today && checkDate <= endDate;
  };

  // Gerar dias do mês
  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Adicionar dias vazios do início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({
        date: day,
        fullDate: date,
        available: isDateAvailable(date),
        isToday: false,
      });
    }

    return days;
  };

  const handleDateClick = (day: any) => {
    if (day && day.available) {
      const dateStr = day.fullDate.toISOString().split('T')[0];
      onSelectDate(dateStr);
    }
  };

  const nextMonth = () => {
    if (currentMonth < 11) {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevMonth = () => {
    const minMonth = today.getMonth(); // Não pode voltar antes do mês atual
    if (currentMonth > minMonth) {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const days = getDaysInMonth();

  return (
    <div className="bg-black rounded-lg border border-zinc-700 p-6">
      {/* Header do calendário */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={prevMonth}
          disabled={currentMonth === today.getMonth()}
          className="p-2 hover:bg-zinc-800 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </h3>

        <button
          type="button"
          onClick={nextMonth}
          disabled={currentMonth === 11}
          className="p-2 hover:bg-zinc-800 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-zinc-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Dias do mês */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = day.fullDate.toISOString().split('T')[0];
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={!day.available}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition
                ${day.available
                  ? isSelected
                    ? 'bg-[#E53935] text-white hover:bg-[#B71C1C]'
                    : 'bg-zinc-800 text-white hover:bg-[#E53935] hover:text-white'
                  : 'text-zinc-600 cursor-not-allowed'
                }
              `}
            >
              {day.date}
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-6 pt-4 border-t border-zinc-800">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#E53935]"></div>
            <span className="text-zinc-400">Data selecionada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-zinc-800"></div>
            <span className="text-zinc-400">Datas disponíveis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-transparent border border-zinc-700"></div>
            <span className="text-zinc-400">Indisponíveis</span>
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          Todos os dias disponíveis até 31 de dezembro de 2025
        </p>
      </div>
    </div>
  );
}
