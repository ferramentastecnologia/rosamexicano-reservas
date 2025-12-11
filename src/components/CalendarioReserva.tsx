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
    if (day?.isAvailable) {
      const dateStr = day.fullDate.toISOString().split('T')[0];
      onSelectDate(dateStr);
    }
  };

  const days = getDaysInMonth();
  const isTodayMonth = today && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100">
        {/* Header do mês */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            style={{color: 'var(--rosa-red)'}}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h3 style={{fontFamily: 'var(--font-playfair)', color: 'var(--rosa-red)'}} className="text-xl font-bold">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={handleNextMonth}
            style={{color: 'var(--rosa-red)'}}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day) => (
            <div key={day} style={{color: 'var(--rosa-red)'}} className="text-center text-xs font-bold">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {days.map((day, index) => {
            const isSelected = day && selectedDate === day.fullDate.toISOString().split('T')[0];
            const isClosed = day ? !day.isAvailable : false;
            const isCurrentDate = isTodayMonth && day && day.date === today?.getDate();

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                disabled={isClosed}
                style={isSelected ? {background: 'linear-gradient(135deg, var(--rosa-red), var(--rosa-orange))'} : {}}
                className={`p-2 text-sm rounded font-medium transition-all ${
                  !day
                    ? 'invisible'
                    : isClosed
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isSelected
                    ? 'text-white shadow-lg'
                    : isCurrentDate
                    ? 'bg-red-100 text-red-600 border-2 border-red-600 font-bold'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {day?.date}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>🔴 Cinza = Data fechada</p>
          <p style={{color: 'var(--rosa-red)'}} className="font-semibold">❤️ Gradiente = Data selecionada</p>
        </div>
      </div>
    </div>
  );
}
