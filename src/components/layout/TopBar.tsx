'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePatients } from '@/hooks/usePatients';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export default function TopBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  const { patients } = usePatients({
    search: debouncedQuery,
    pageSize: 6,
  });

  // Abrir dropdown solo cuando hay texto y resultados
  useEffect(() => {
    setIsOpen(debouncedQuery.trim().length > 0);
  }, [debouncedQuery, patients]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/pacientes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const handleSelectPatient = (id: string) => {
    router.push(`/pacientes/${id}`);
    setSearchQuery('');
    setIsOpen(false);
  };

  const userName = session?.user
    ? `${session.user.nombre} ${session.user.apellido}`
    : '';

  const userRole =
    session?.user?.role === 'OWNER' || session?.user?.role === 'ADMIN'
      ? 'Administradora'
      : 'Nutricionista';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      
      {/* Barra de búsqueda con dropdown */}
      <div ref={containerRef} className="relative w-80">
        <form onSubmit={handleSearch}>
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
          <input
            type="text"
            placeholder="Buscar pacientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (debouncedQuery.trim().length > 0) setIsOpen(true);
            }}
            className="w-full rounded-lg bg-gray-50 pl-10 pr-4 py-2 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </form>

        {/* Dropdown de sugerencias */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
            {patients.length > 0 ? (
              <>
                <ul>
                  {patients.map((patient) => (
                    <li key={patient.id}>
                      <button
                        onMouseDown={() => handleSelectPatient(patient.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {patient.nombre.charAt(0)}{patient.apellido.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {patient.nombre} {patient.apellido}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{patient.telefono}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                {/* Ver todos los resultados */}
                <button
                  onMouseDown={handleSearch as unknown as React.MouseEventHandler}
                  className="w-full px-4 py-2.5 text-xs text-primary font-medium hover:bg-primary-50 border-t border-gray-50 transition-colors text-center"
                >
                  Ver todos los resultados para &quot;{searchQuery}&quot;
                </button>
              </>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                Sin resultados para &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notificaciones y perfil — sin cambios */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-default" disabled title="Próximamente">
          <Bell size={20} className="text-gray-300" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}