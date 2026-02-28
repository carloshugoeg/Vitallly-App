'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Clock, Plus } from 'lucide-react';
import { appointments } from '@/data/appointments';
import { patients } from '@/data/patients';

const statusBadge = {
  programada: 'blue' as const,
  completada: 'green' as const,
  cancelada: 'red' as const,
};

const statusLabel = {
  programada: 'Programada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export default function TodayAppointments() {
  const today = new Date().toISOString().split('T')[0];
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
            const patient = patients.find((p) => p.id === apt.pacienteId);
            return (
              <div
                key={apt.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Clock size={14} />
                    <span className="font-medium">{apt.hora}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {patient ? `${patient.nombre} ${patient.apellido}` : 'Paciente'}
                    </p>
                    <p className="text-xs text-gray-500">{apt.motivo}</p>
                  </div>
                </div>
                <Badge variant={statusBadge[apt.estado]}>{statusLabel[apt.estado]}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
