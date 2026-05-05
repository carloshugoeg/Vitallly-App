'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Clock, FileText, Pencil, Trash2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DayPopover from '@/components/ui/DayPopover';
import Spinner from '@/components/ui/Spinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { useAppointments, createAppointment, updateAppointment, deleteAppointment } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { useToast } from '@/hooks/useToast';
import { APPOINTMENT_TYPES, APPOINTMENT_STATUS } from '@/lib/constants';
import type { Appointment } from '@/types/api';

const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

export default function CitasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { appointments: appointmentsList, isLoading, error, mutate } = useAppointments({ pageSize: 500 });
  const { patients } = usePatients({ pageSize: 500 });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [clickedRect, setClickedRect] = useState<DOMRect | null>(null);

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
  const { toast, show: showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const dateParam = searchParams.get('date');
    const actionParam = searchParams.get('action');
    if (dateParam) {
      try {
        const parsed = parseISO(dateParam);
        setSelectedDate(parsed);
        setCurrentMonth(startOfMonth(parsed));
        setNewAppt((prev) => ({ ...prev, fecha: dateParam }));
        if (actionParam === 'new') {
          setShowModal(true);
        }
        router.replace('/citas');
      } catch {
        // ignore invalid date
      }
    }
  }, [searchParams, router]);

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const appointmentData = {
        pacienteId: newAppt.pacienteId,
        fecha: newAppt.fecha,
        hora: newAppt.hora,
        tipo: newAppt.tipo as 'primera_vez' | 'seguimiento' | 'control' | 'emergencia',
        motivo: newAppt.motivo,
        estado: newAppt.estado as 'programada' | 'completada' | 'cancelada',
        notas: newAppt.notas,
      };

      if (editingAppointmentId) {
        await updateAppointment(editingAppointmentId, appointmentData);
      } else {
        await createAppointment(appointmentData);
      }

      mutate();
      setShowModal(false);
      setEditingAppointmentId(null);
      setNewAppt({ pacienteId: '', fecha: selectedDateStr, hora: '09:00', tipo: 'seguimiento', motivo: '', estado: 'programada', notas: '' });
      showToast(editingAppointmentId ? 'Cita actualizada exitosamente.' : 'Cita guardada exitosamente.');
    } catch {
      showToast('Error al guardar cita.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAppointment = (appointment: Appointment, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingAppointmentId(appointment.id);
    setNewAppt({
      pacienteId: appointment.pacienteId,
      fecha: appointment.fecha,
      hora: appointment.hora,
      tipo: appointment.tipo,
      motivo: appointment.motivo,
      estado: appointment.estado,
      notas: appointment.notas,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (appointment: Appointment, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAppointmentToDelete(appointment);
  };

  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return;
    setDeleting(true);
    try {
      await deleteAppointment(appointmentToDelete.id);
      mutate();
      setAppointmentToDelete(null);
      showToast('Cita eliminada exitosamente.');
    } catch {
      showToast('Error al eliminar cita.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const closeAppointmentModal = () => {
    setShowModal(false);
    setEditingAppointmentId(null);
    setNewAppt({ pacienteId: '', fecha: selectedDateStr, hora: '09:00', tipo: 'seguimiento', motivo: '', estado: 'programada', notas: '' });
  };

  const handleMouseEnter = useCallback((day: Date, e: React.MouseEvent<HTMLButtonElement>) => {
    if (clickedDate) return;
    setHoveredDate(day);
    setHoveredRect(e.currentTarget.getBoundingClientRect());
  }, [clickedDate]);

  const handleMouseLeave = useCallback(() => {
    setHoveredDate(null);
    setHoveredRect(null);
  }, []);

  const handleDayClick = useCallback((day: Date, e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedDate(day);
    setHoveredDate(null);
    setHoveredRect(null);
    setClickedDate(day);
    setClickedRect(e.currentTarget.getBoundingClientRect());
  }, []);

  const handleCloseClick = useCallback(() => {
    setClickedDate(null);
    setClickedRect(null);
  }, []);

  const handleNewAppointment = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(date);
    setEditingAppointmentId(null);
    setNewAppt((prev) => ({ ...prev, fecha: dateStr }));
    setShowModal(true);
  }, []);

  const handleViewAppointments = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorDisplay message="No se pudieron cargar las citas." onRetry={() => mutate()} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Citas</h1>
          <p className="text-sm text-gray-500">Gestión de citas y agenda</p>
        </div>
        <Button onClick={() => {
          setEditingAppointmentId(null);
          setNewAppt({ pacienteId: '', fecha: selectedDateStr, hora: '09:00', tipo: 'seguimiento', motivo: '', estado: 'programada', notas: '' });
          setShowModal(true);
        }}>
          <Plus size={18} /> Nueva Cita
        </Button>
      </div>

      {toast && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {toast.message}
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
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 rounded hover:bg-gray-100" aria-label="Mes anterior">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 rounded hover:bg-gray-100" aria-label="Mes siguiente">
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
                  onMouseEnter={(e) => handleMouseEnter(day, e)}
                  onMouseLeave={handleMouseLeave}
                  onClick={(e) => handleDayClick(day, e)}
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
                            isSelected && a.estado === 'programada' ? 'bg-white' : APPOINTMENT_STATUS[a.estado].dot
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {hoveredDate && !clickedDate && (
            <DayPopover
              date={hoveredDate}
              anchorRect={hoveredRect}
              appointments={appointmentsList.filter((a) => a.fecha === format(hoveredDate, 'yyyy-MM-dd'))}
              mode="hover"
              onClose={() => {}}
              onNewAppointment={handleNewAppointment}
              onViewAppointments={handleViewAppointments}
            />
          )}

          {clickedDate && (
            <DayPopover
              date={clickedDate}
              anchorRect={clickedRect}
              appointments={appointmentsList.filter((a) => a.fecha === format(clickedDate, 'yyyy-MM-dd'))}
              mode="click"
              onClose={handleCloseClick}
              onNewAppointment={handleNewAppointment}
              onViewAppointments={handleViewAppointments}
            />
          )}
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
                const params = new URLSearchParams({
                  pacienteId: apt.pacienteId,
                  motivo: apt.motivo ?? '',
                  appointmentId: apt.id,
                });
                return (
                  <div
                    key={apt.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 hover:border-primary/30 hover:bg-primary-50 transition-all group"
                  >
                    <Link
                      href={`/consultas/nueva?${params.toString()}`}
                      className="flex min-w-0 flex-1 items-start gap-4 p-4"
                    >
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 min-w-[60px]">
                      <Clock size={14} />
                      <span className="font-medium">{apt.hora}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          {apt.patient ? `${apt.patient.nombre} ${apt.patient.apellido}` : 'Paciente'}
                        </p>
                        <Badge variant={APPOINTMENT_STATUS[apt.estado].badge}>{APPOINTMENT_STATUS[apt.estado].label}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{APPOINTMENT_TYPES[apt.tipo]} · {apt.motivo}</p>
                      {apt.notas && <p className="text-xs text-gray-400 mt-1">{apt.notas}</p>}
                    </div>
                      <FileText size={15} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    </Link>
                    <div className="flex items-center gap-1 pr-3 pt-3">
                      <button
                        type="button"
                        onClick={(e) => handleEditAppointment(apt, e)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-primary transition-colors"
                        aria-label="Editar cita"
                        title="Editar cita"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(apt, e)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-danger transition-colors"
                        aria-label="Eliminar cita"
                        title="Eliminar cita"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Appointment modal */}
      <Modal isOpen={showModal} onClose={closeAppointmentModal} title={editingAppointmentId ? 'Editar Cita' : 'Nueva Cita'}>
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
            <Button type="button" variant="ghost" onClick={closeAppointmentModal}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : editingAppointmentId ? 'Actualizar Cita' : 'Guardar Cita'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(appointmentToDelete)} onClose={() => setAppointmentToDelete(null)} title="Eliminar cita">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">¿Eliminar esta cita?</p>
          {appointmentToDelete && (
            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {appointmentToDelete.patient ? `${appointmentToDelete.patient.nombre} ${appointmentToDelete.patient.apellido}` : 'Paciente'}
              </p>
              <p>{appointmentToDelete.fecha} · {appointmentToDelete.hora}</p>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setAppointmentToDelete(null)} disabled={deleting}>Cancelar</Button>
            <Button type="button" variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
