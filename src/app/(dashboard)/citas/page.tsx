'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { appointments as initialAppointments } from '@/data/appointments';
import { patients } from '@/data/patients';
import { APPOINTMENT_TYPES } from '@/lib/constants';

const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const statusBadge = { programada: 'blue' as const, completada: 'green' as const, cancelada: 'red' as const };
const statusLabel = { programada: 'Programada', completada: 'Completada', cancelada: 'Cancelada' };

export default function CitasPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [appointmentsList] = useState(initialAppointments);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  const blanks = startDay === 0 ? 6 : startDay - 1;

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayAppointments = appointmentsList
    .filter((a) => a.fecha === selectedDateStr)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const patientOptions = [
    { value: '', label: 'Seleccionar paciente...' },
    ...patients.map((p) => ({ value: p.id, label: `${p.nombre} ${p.apellido}` })),
  ];

  const typeOptions = Object.entries(APPOINTMENT_TYPES).map(([k, v]) => ({ value: k, label: v }));
  const statusOptions = [
    { value: 'programada', label: 'Programada' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  const [newAppt, setNewAppt] = useState({ pacienteId: '', fecha: selectedDateStr, hora: '09:00', tipo: 'seguimiento', motivo: '', estado: 'programada', notas: '' });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Citas</h1>
          <p className="text-sm text-gray-500">Gestión de citas y agenda</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} /> Nueva Cita
        </Button>
      </div>

      {showSuccess && (
        <div className="bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
          Cita guardada exitosamente (demo).
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h3>
            <div className="flex gap-1">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 rounded hover:bg-gray-100">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 rounded hover:bg-gray-100">
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
              const dayAppts = appointmentsList.filter((a) => a.fecha === dateStr);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(day)}
                  className={`relative py-1.5 text-sm rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-primary text-white font-bold'
                      : isToday
                      ? 'bg-primary-50 text-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {format(day, 'd')}
                  {dayAppts.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {dayAppts.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            a.estado === 'completada' ? 'bg-green-500' : a.estado === 'cancelada' ? 'bg-red-500' : isSelected ? 'bg-white' : 'bg-blue-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Day agenda */}
        <Card className="col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4 capitalize">
            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </h3>

          {dayAppointments.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No hay citas para este día.</p>
          ) : (
            <div className="space-y-3">
              {dayAppointments.map((apt) => {
                const patient = patients.find((p) => p.id === apt.pacienteId);
                return (
                  <div key={apt.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 min-w-[60px]">
                      <Clock size={14} />
                      <span className="font-medium">{apt.hora}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          {patient ? `${patient.nombre} ${patient.apellido}` : 'Paciente'}
                        </p>
                        <Badge variant={statusBadge[apt.estado]}>{statusLabel[apt.estado]}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{APPOINTMENT_TYPES[apt.tipo]} · {apt.motivo}</p>
                      {apt.notas && <p className="text-xs text-gray-400 mt-1">{apt.notas}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* New appointment modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Cita">
        <form onSubmit={handleSaveAppointment} className="space-y-4">
          <Select id="appt-patient" label="Paciente" options={patientOptions} value={newAppt.pacienteId} onChange={(e) => setNewAppt({ ...newAppt, pacienteId: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input id="appt-date" label="Fecha" type="date" value={newAppt.fecha} onChange={(e) => setNewAppt({ ...newAppt, fecha: e.target.value })} required />
            <Input id="appt-time" label="Hora" type="time" value={newAppt.hora} onChange={(e) => setNewAppt({ ...newAppt, hora: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select id="appt-type" label="Tipo" options={typeOptions} value={newAppt.tipo} onChange={(e) => setNewAppt({ ...newAppt, tipo: e.target.value })} />
            <Select id="appt-status" label="Estado" options={statusOptions} value={newAppt.estado} onChange={(e) => setNewAppt({ ...newAppt, estado: e.target.value })} />
          </div>
          <Input id="appt-motivo" label="Motivo" value={newAppt.motivo} onChange={(e) => setNewAppt({ ...newAppt, motivo: e.target.value })} required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Notas</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              rows={2}
              value={newAppt.notas}
              onChange={(e) => setNewAppt({ ...newAppt, notas: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit">Guardar Cita</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
