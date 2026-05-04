'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Clock, Plus, FileText } from 'lucide-react';
import { Appointment } from '@/types/api';
import { APPOINTMENT_STATUS } from '@/lib/constants';

interface TodayAppointmentsProps {
  appointments: Appointment[];
}

export default function TodayAppointments({ appointments }: TodayAppointmentsProps) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const todayAppointments = appointments
    .filter((a) => a.fecha === today)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Citas de Hoy</h3>
        <Link href="/citas">
          <Button variant="secondary" size="sm"><Plus size={16} /> Nueva Cita</Button>
        </Link>
      </div>

      {todayAppointments.length === 0 ? (
        <p className="text-sm text-gray-500">No hay citas programadas para hoy.</p>
      ) : (
        <div className="space-y-3">
          {todayAppointments.map((apt) => {
            const params = new URLSearchParams({
              pacienteId: apt.pacienteId,
              motivo: apt.motivo ?? '',
              appointmentId: apt.id,
            });

            return (
              <Link
                key={apt.id}
                href={`/consultas/nueva?${params.toString()}`}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-primary-50 hover:ring-1 hover:ring-primary/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Clock size={14} />
                    <span className="font-medium">{apt.hora}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {apt.patient ? `${apt.patient.nombre} ${apt.patient.apellido}` : 'Paciente'}
                    </p>
                    <p className="text-xs text-gray-500">{apt.motivo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={APPOINTMENT_STATUS[apt.estado].badge}>
                    {APPOINTMENT_STATUS[apt.estado].label}
                  </Badge>
                  {/* Ícono que aparece al hacer hover — indica que abre consulta */}
                  <FileText
                    size={15}
                    className="text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}