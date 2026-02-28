'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import { consultations } from '@/data/consultations';
import { patients } from '@/data/patients';
import { formatDate } from '@/lib/utils';

export default function ConsultasPage() {
  const [search, setSearch] = useState('');

  const filtered = consultations
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .filter((c) => {
      const patient = patients.find((p) => p.id === c.pacienteId);
      const term = search.toLowerCase();
      return (
        patient?.nombre.toLowerCase().includes(term) ||
        patient?.apellido.toLowerCase().includes(term) ||
        c.diagnostico.toLowerCase().includes(term) ||
        c.motivo.toLowerCase().includes(term)
      );
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultas</h1>
          <p className="text-sm text-gray-500">{consultations.length} consultas registradas</p>
        </div>
        <Link href="/consultas/nueva">
          <Button><Plus size={18} /> Nueva Consulta</Button>
        </Link>
      </div>

      <Card>
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por paciente o diagnóstico..." />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Fecha</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Paciente</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Motivo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Diagnóstico</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const patient = patients.find((p) => p.id === c.pacienteId);
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-600">{formatDate(c.fecha)}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {patient ? `${patient.nombre} ${patient.apellido}` : 'Desconocido'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{c.motivo}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{c.diagnostico}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/consultas/${c.id}`}>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors">
                          <Eye size={16} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No se encontraron consultas.</p>
        )}
      </Card>
    </div>
  );
}
