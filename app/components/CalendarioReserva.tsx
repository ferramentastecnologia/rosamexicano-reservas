'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarioReservaProps {
  onSelectDate: (date: string) => void;
  selectedDate?: string;
}

export default function CalendarioReserva({ onSelectDate, selectedDate }: CalendarioReservaProps) {
  const [today, setToday] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  }, []);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Dias em que o restaurante estará fechado
  const closedDates = [
    '2024-12-24', // Véspera de Natal
    '2024-12-25', // Natal
    '2024-12-31', // Réveillon
    '2025-12-24', // Véspera de Natal 2025
    '2025-12-25', // Natal 2025
    '2025-12-31', // Réveillon 2025
  ];

  const isDateAvailable = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(2025, 11, 31);
    endDate.setHours(23, 59, 59, 999);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Verificar se está no período válido
    if (checkDate < today || checkDate > endDate) {
      return false;
    }

    // Verificar se é um dia fechado
    const dateStr = checkDate.toISOString().split('T')[0];
    if (closedDates.includes(dateStr)) {
      return false;
    }

    return true;
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

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
    if (!today) return;
    const minMonth = today.getMonth();
    if (currentMonth > minMonth) {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const days = getDaysInMonth();

  if (!today) {
    return (
      <div className="bg-black/30 rounded-xl border border-white/5 p-5 flex items-center justify-center min-h-[280px]">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#f98f21]"></div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 rounded-xl border border-white/5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={currentMonth === today.getMonth()}
          className="p-1.5 hover:bg-white/5 rounded-lg transition disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 text-white/70" />
        </button>

        <h3 className="text-sm font-medium text-white/90">
          {monthNames[currentMonth]} {currentYear}
        </h3>

        <button
          type="button"
          onClick={nextMonth}
          disabled={currentMonth === 11}
          className="p-1.5 hover:bg-white/5 rounded-lg transition disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-light text-white/40 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Dias do mês */}
      <div className="grid grid-cols-7 gap-1">
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
                aspect-square rounded-lg flex items-center justify-center text-xs font-light transition-all
                ${day.available
                  ? isSelected
                    ? 'btn-mexican text-white'
                    : 'bg-white/5 text-white/70 hover:bg-[#f98f21]/20 hover:text-white'
                  : 'text-white/20 cursor-not-allowed'
                }
              `}
            >
              {day.date}
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded btn-mexican"></div>
            <span className="text-white/40">Selecionada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-white/5"></div>
            <span className="text-white/40">Disponível</span>
          </div>
        </div>
        <p className="text-[10px] text-white/30 mt-2">
          Fechado: 24/12, 25/12 e 31/12
        </p>
      </div>
    </div>
  );
}
