'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { UserPlus, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { usePatients, deletePatient } from '@/hooks/usePatients';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { calculateAge } from '@/lib/utils';

const PAGE_SIZE = 20;

export default function PacientesPage() {
  const urlSearchParams = useSearchParams();
  const [search, setSearch] = useState(urlSearchParams.get('search') ?? '');
  const [page, setPage] = useState(1);
  useEffect(() => {
  const paramValue = urlSearchParams.get('search') ?? '';
  setSearch(paramValue);
  setPage(1);
  }, [urlSearchParams]);


  const debouncedSearch = useDebouncedValue(search);
  const { patients, meta, isLoading, error, mutate } = usePatients({
    search: debouncedSearch,
    page,
    pageSize: PAGE_SIZE,
  });

  // Reset page when search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este paciente? Esta acción no se puede deshacer.')) return;
    try {
      await deletePatient(id);
      mutate();
    } catch {
      alert('Error al eliminar paciente');
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorDisplay message="No se pudieron cargar los pacientes." onRetry={() => mutate()} />;

  const totalPages = meta ? Math.ceil(meta.total / meta.pageSize) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-sm text-gray-500">{meta?.total ?? patients.length} pacientes registrados</p>
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
            onChange={handleSearchChange}
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
                <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
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
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {patients.length === 0 && (
          <p className="text-center text-gray-500 py-8">No se encontraron pacientes.</p>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
            <p className="text-sm text-gray-500">
              Página {page} de {totalPages}
            </p>
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
        )}
      </Card>
    </div>
  );
}
