'use client';

import { LayoutDashboard, Users, CalendarDays, ClipboardList, Calculator, LogOut } from 'lucide-react';
import SidebarLink from './SidebarLink';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-primary flex flex-col z-40">
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-wide">Vitally</h1>
        <p className="text-white/50 text-xs mt-1">Clínica de Nutrición</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider px-4 mb-2">
          Menú
        </p>
        <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <SidebarLink href="/pacientes" icon={Users} label="Pacientes" />
        <SidebarLink href="/citas" icon={CalendarDays} label="Citas" />
        <SidebarLink href="/consultas" icon={ClipboardList} label="Consultas" />

        <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider px-4 mt-6 mb-2">
          Herramientas
        </p>
        <SidebarLink href="/calculadora" icon={Calculator} label="Calculadora" />
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
