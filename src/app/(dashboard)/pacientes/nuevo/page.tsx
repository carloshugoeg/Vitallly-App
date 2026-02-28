'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PatientForm from '@/components/patients/PatientForm';

export default function NuevoPacientePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pacientes" className="p-2 rounded-lg hover:bg-white transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Paciente</h1>
          <p className="text-sm text-gray-500">Registrar un nuevo paciente en el sistema</p>
        </div>
      </div>
      <PatientForm />
    </div>
  );
}
