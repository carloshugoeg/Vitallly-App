'use client';

import { useState } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const userName = session?.user
    ? `${session.user.nombre} ${session.user.apellido}`
    : '';

  const userRole = session?.user?.role === 'OWNER' || session?.user?.role === 'ADMIN'
    ? 'Administradora'
    : 'Nutricionista';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/pacientes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <form onSubmit={handleSearch} className="relative w-80">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar pacientes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg bg-gray-50 pl-10 pr-4 py-2 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </form>

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
