'use client';

import { useState, useMemo, createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

interface PatientContextType {
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
}

export const PatientContext = createContext<PatientContextType>({
  selectedPatientId: null,
  setSelectedPatientId: () => {},
});

export function usePatientContext() {
  return useContext(PatientContext);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const { status } = useSession();
  const router = useRouter();
  const contextValue = useMemo(() => ({ selectedPatientId, setSelectedPatientId }), [selectedPatientId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-primary text-lg">Cargando...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <PatientContext.Provider value={contextValue}>
      <div className="min-h-screen bg-cream">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <div className="md:ml-[260px] overflow-x-hidden">
          {!isBannerDismissed && (
            <div className="md:hidden flex items-center justify-between gap-2 bg-warning/10 border-b border-warning/20 px-4 py-2.5 text-xs text-amber-700">
              <span>Esta aplicación está optimizada para escritorio. Algunas funciones pueden verse limitadas en pantallas pequeñas.</span>
              <button
                onClick={() => setIsBannerDismissed(true)}
                className="shrink-0 p-1 rounded hover:bg-warning/20 font-bold leading-none"
                aria-label="Cerrar aviso"
              >
                ✕
              </button>
            </div>
          )}
          <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </PatientContext.Provider>
  );
}
