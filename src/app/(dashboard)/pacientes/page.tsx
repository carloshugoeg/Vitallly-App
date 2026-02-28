'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserPlus, Eye, Edit, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import Badge from '@/components/ui/Badge';
import { patients as initialPatients } from '@/data/patients';
import { consultations } from '@/data/consultations';
import { calculateAge, formatDate } from '@/lib/utils';

export default function PacientesPage() {
  const [search, setSearch] = useState('');
  const [patientList] = useState(initialPatients);

  const filtered = patientList.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(term) ||
      p.apellido.toLowerCase().includes(term) ||
      p.dpi.includes(term) ||
      p.telefono.includes(term)
    );
  });

  const getLastConsultation = (patientId: string) => {
    const patientConsultations = consultations
      .filter((c) => c.pacienteId === patientId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    return patientConsultations[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-sm text-gray-500">{patientList.length} pacientes registrados</p>
        </div>
        <Link href="/pacientes/nuevo">
          <Button>
            <UserPlus size={18} />
            Nuevo Paciente
          </Button>
        </Link>
      </div>

      <Card>
        <div className="mb-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre, DPI o teléfono..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Paciente</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">DPI</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Teléfono</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Edad</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Última Consulta</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient) => {
                const lastConsult = getLastConsultation(patient.id);
                return (
                  <tr key={patient.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary text-xs font-bold">
                          {patient.nombre.charAt(0)}{patient.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.nombre} {patient.apellido}</p>
                          <p className="text-xs text-gray-500">{patient.ocupacion}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">{patient.dpi}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.telefono}</td>
                    <td className="py-3 px-4">
                      <Badge variant="gray">{calculateAge(patient.fechaNacimiento)} años</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {lastConsult ? formatDate(lastConsult.fecha) : 'Sin consultas'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/pacientes/${patient.id}`}>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors">
                            <Eye size={16} />
                          </button>
                        </Link>
                        <Link href={`/pacientes/${patient.id}/editar`}>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
                            <Edit size={16} />
                          </button>
                        </Link>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No se encontraron pacientes.</p>
        )}
      </Card>
    </div>
  );
}
