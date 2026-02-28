'use client';

import { use } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PatientForm from '@/components/patients/PatientForm';
import { patients } from '@/data/patients';

export default function EditarPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = patients.find((p) => p.id === id);

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Paciente no encontrado.</p>
        <Link href="/pacientes" className="text-primary underline text-sm mt-2 inline-block">
          Volver a pacientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/pacientes/${id}`} className="p-2 rounded-lg hover:bg-white transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Paciente</h1>
          <p className="text-sm text-gray-500">{patient.nombre} {patient.apellido}</p>
        </div>
      </div>
      <PatientForm initialData={patient} isEditing />
    </div>
  );
}
