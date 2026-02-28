'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import { appointments } from '@/data/appointments';

const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

export default function CalendarPreview() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = getDay(monthStart);
  const blanks = startDay === 0 ? 6 : startDay - 1;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 rounded hover:bg-gray-100"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 rounded hover:bg-gray-100"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DAYS.map((d) => (
          <div key={d} className="text-xs font-medium text-gray-500 py-1">{d}</div>
        ))}
        {Array.from({ length: blanks }).map((_, i) => (
          <div key={`b-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayAppts = appointments.filter((a) => a.fecha === dateStr);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={dateStr}
              className={`relative py-1 text-sm rounded-lg ${
                isToday ? 'bg-primary text-white font-bold' : 'text-gray-700'
              }`}
            >
              {format(day, 'd')}
              {dayAppts.length > 0 && (
                <div className="flex justify-center gap-0.5 mt-0.5">
                  {dayAppts.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      className={`w-1 h-1 rounded-full ${
                        a.estado === 'completada'
                          ? 'bg-green-500'
                          : a.estado === 'cancelada'
                          ? 'bg-red-500'
                          : isToday ? 'bg-white' : 'bg-blue-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
