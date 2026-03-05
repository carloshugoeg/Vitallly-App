'use client';

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Eye } from 'lucide-react';
import { appointments } from '@/data/appointments';
import { patients } from '@/data/patients';

interface DayPopoverProps {
  date: Date;
  anchorRect: DOMRect | null;
  mode: 'hover' | 'click';
  onClose: () => void;
  onNewAppointment: (date: Date) => void;
  onViewAppointments: (date: Date) => void;
}

const statusColor: Record<string, string> = {
  programada: 'bg-blue-500',
  completada: 'bg-green-500',
  cancelada: 'bg-red-500',
};

export default function DayPopover({ date, anchorRect, mode, onClose, onNewAppointment, onViewAppointments }: DayPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayAppts = appointments.filter((a) => a.fecha === dateStr);

  useEffect(() => {
    if (mode !== 'click') return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mode, onClose]);

  if (!anchorRect) return null;

  const top = anchorRect.bottom + 4;
  const left = anchorRect.left + anchorRect.width / 2;

  if (mode === 'hover') {
    return (
      <div
        ref={ref}
        className="fixed z-50 w-52 bg-white rounded-lg shadow-lg border border-gray-200 p-3 pointer-events-none"
        style={{ top, left, transform: 'translateX(-50%)' }}
      >
        <p className="text-xs font-semibold text-gray-700 mb-2 capitalize">
          {format(date, "EEEE d 'de' MMM", { locale: es })}
        </p>
        {dayAppts.length === 0 ? (
          <p className="text-xs text-gray-400">Sin citas programadas</p>
        ) : (
          <ul className="space-y-1.5">
            {dayAppts.slice(0, 4).map((a) => {
              const patient = patients.find((p) => p.id === a.pacienteId);
              return (
                <li key={a.id} className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColor[a.estado]}`} />
                  <span className="text-gray-500 font-medium">{a.hora}</span>
                  <span className="text-gray-700 truncate">
                    {patient ? `${patient.nombre} ${patient.apellido}` : 'Paciente'}
                  </span>
                </li>
              );
            })}
            {dayAppts.length > 4 && (
              <li className="text-xs text-gray-400">+{dayAppts.length - 4} más</li>
            )}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="fixed z-50 w-44 bg-white rounded-lg shadow-lg border border-gray-200 p-1.5"
      style={{ top, left, transform: 'translateX(-50%)' }}
    >
      <p className="text-xs font-semibold text-gray-700 px-2 pt-1 pb-2 capitalize">
        {format(date, "d 'de' MMM", { locale: es })}
      </p>
      <button
        onClick={() => { onNewAppointment(date); onClose(); }}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-primary-50 hover:text-primary transition-colors"
      >
        <Plus size={15} /> Nueva Cita
      </button>
      <button
        onClick={() => { onViewAppointments(date); onClose(); }}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 rounded-md hover:bg-primary-50 hover:text-primary transition-colors"
      >
        <Eye size={15} /> Ver Citas
      </button>
    </div>
  );
}
