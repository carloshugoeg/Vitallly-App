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
        <Sidebar />
        <div className="ml-[260px]">
          <TopBar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </PatientContext.Provider>
  );
}
