'use client';

import Link from 'next/link';
import { UserPlus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function QuickActions() {
  return (
    <div className="flex gap-3">
      <Link href="/pacientes/nuevo">
        <Button>
          <UserPlus size={18} />
          Nuevo Paciente
        </Button>
      </Link>
      <Link href="/pacientes">
        <Button variant="secondary">
          <Search size={18} />
          Buscar Paciente
        </Button>
      </Link>
    </div>
  );
}
