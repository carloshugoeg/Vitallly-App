'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import Spinner from '@/components/ui/Spinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { useConsultations } from '@/hooks/useConsultations';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatDate } from '@/lib/utils';
import { getIMCClassification } from '@/lib/calculations';

const PAGE_SIZES = [25, 50];

export default function ConsultasPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const debouncedSearch = useDebouncedValue(search);
  const { consultations, meta, isLoading, error, mutate } = useConsultations({
    search: debouncedSearch,
    page,
    pageSize,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorDisplay message="No se pudieron cargar las consultas." onRetry={() => mutate()} />;

  const totalPages = meta ? Math.ceil(meta.total / meta.pageSize) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultas</h1>
          <p className="text-sm text-gray-500">{meta?.total ?? consultations.length} consultas registradas</p>
        </div>
        <Link href="/consultas/nueva">
          <Button><Plus size={18} /> Nueva Consulta</Button>
        </Link>
      </div>

      <Card>
        <div className="mb-4">
          <SearchBar value={search} onChange={handleSearchChange} placeholder="Buscar por paciente o diagnostico..." />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Fecha</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Paciente</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Motivo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Diagnostico</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Peso</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">IMC</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">% Grasa</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => {
                const anthro = c.anthropometry;
                const imcClass = anthro ? getIMCClassification(anthro.imc) : null;
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-600">{formatDate(c.fecha)}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {c.patient ? `${c.patient.nombre} ${c.patient.apellido}` : 'Desconocido'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{c.motivo}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{c.diagnostico}</td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {anthro ? `${anthro.peso} kg` : '--'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {anthro && imcClass ? (
                        <span className="font-medium" style={{ color: imcClass.color }}>{anthro.imc}</span>
                      ) : '--'}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {anthro ? `${anthro.porcentajeGrasa}%` : '--'}
                    </td>
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

        {consultations.length === 0 && (
          <p className="text-center text-gray-500 py-8">No se encontraron consultas.</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Mostrar</span>
            {PAGE_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => { setPageSize(s); setPage(1); }}
                className={`px-2.5 py-1 rounded text-sm font-medium transition-colors ${
                  pageSize === s ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={16} />
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Siguiente
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
