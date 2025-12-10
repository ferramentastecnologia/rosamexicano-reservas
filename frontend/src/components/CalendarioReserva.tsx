import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CLOSED_DATES } from '../lib/tables-config';

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
    if (CLOSED_DATES.includes(dateStr)) {
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
        isAvailable: isDateAvailable(date),
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: any) => {
    if (day && day.isAvailable) {
      const dateStr = day.fullDate.toISOString().split('T')[0];
      onSelectDate(dateStr);
    }
  };

  const days = getDaysInMonth();
  const isTodayMonth = today && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-lg shadow-lg p-4">
        {/* Header do mês */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const isSelected = day && selectedDate === day.fullDate.toISOString().split('T')[0];
            const isClosed = day && !day.isAvailable;
            const isCurrentDate = isTodayMonth && day && day.date === today?.getDate();

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                disabled={isClosed}
                className={`p-2 text-sm rounded font-medium transition-colors ${
                  !day
                    ? 'invisible'
                    : isClosed
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isSelected
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                    : isCurrentDate
                    ? 'bg-red-100 text-red-600 border border-red-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {day?.date}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>🔴 Cinza = Data fechada</p>
          <p>🔵 Azul = Data selecionada</p>
        </div>
      </div>
    </div>
  );
}
