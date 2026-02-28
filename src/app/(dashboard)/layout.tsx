'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/lib/auth';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('vitally_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const login = useCallback((username: string, password: string) => {
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('vitally_auth', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vitally_auth');
    setIsAuthenticated(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-primary text-lg">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <PatientContext.Provider value={{ selectedPatientId, setSelectedPatientId }}>
        <div className="min-h-screen bg-cream">
          <Sidebar />
          <div className="ml-[260px]">
            <TopBar />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </PatientContext.Provider>
    </AuthContext.Provider>
  );
}
