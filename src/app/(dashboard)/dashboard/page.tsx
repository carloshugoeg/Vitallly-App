'use client';

import { Users, CalendarDays, ClipboardList, Clock } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import TodayAppointments from '@/components/dashboard/TodayAppointments';
import CalendarPreview from '@/components/dashboard/CalendarPreview';
import QuickActions from '@/components/dashboard/QuickActions';
import Spinner from '@/components/ui/Spinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAppointments } from '@/hooks/useAppointments';
import { useSession } from 'next-auth/react';
import UserManualButton from '@/components/dashboard/UserManualButton';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { stats, isLoading: statsLoading, error: statsError, mutate: mutateStats } = useDashboardStats();
  const { appointments, isLoading: apptsLoading, error: apptsError, mutate: mutateAppts } = useAppointments({ pageSize: 200 });

  if (statsLoading || apptsLoading) return <Spinner />;
  if (statsError || apptsError) return <ErrorDisplay message="No se pudieron cargar los datos del dashboard." onRetry={() => { mutateStats(); mutateAppts(); }} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Bienvenida de vuelta, {session?.user?.nombre ?? 'Nutricionista'}</p>
        </div>
        <QuickActions />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Pacientes" value={stats?.totalPatients ?? 0} icon={Users} />
        <StatCard title="Citas Hoy" value={stats?.todayAppointments ?? 0} icon={CalendarDays} />
        <StatCard title="Total Consultas" value={stats?.totalConsultations ?? 0} icon={ClipboardList} />
        <StatCard title="Citas Pendientes" value={stats?.upcomingAppointments ?? 0} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayAppointments appointments={appointments} />
        <CalendarPreview appointments={appointments} />
      </div>

      {/* Botón de manual de usuario - exclusivo del dashboard */}
      <UserManualButton />
    </div>
  );
}
