'use client';

import { Users, CalendarDays, ClipboardList, Clock } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import TodayAppointments from '@/components/dashboard/TodayAppointments';
import CalendarPreview from '@/components/dashboard/CalendarPreview';
import QuickActions from '@/components/dashboard/QuickActions';
import { patients } from '@/data/patients';
import { appointments } from '@/data/appointments';
import { consultations } from '@/data/consultations';

export default function DashboardPage() {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7);

  const citasHoy = appointments.filter((a) => a.fecha === today).length;
  const consultasMes = consultations.filter((c) => c.fecha.startsWith(currentMonth)).length;
  const citasPendientes = appointments.filter((a) => a.estado === 'programada').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Bienvenida de vuelta, Dra. Nutricionista</p>
        </div>
        <QuickActions />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Pacientes" value={patients.length} icon={Users} />
        <StatCard title="Citas Hoy" value={citasHoy} icon={CalendarDays} />
        <StatCard title="Consultas Este Mes" value={consultasMes} icon={ClipboardList} />
        <StatCard title="Citas Pendientes" value={citasPendientes} icon={Clock} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <TodayAppointments />
        <CalendarPreview />
      </div>
    </div>
  );
}
