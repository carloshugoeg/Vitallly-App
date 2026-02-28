'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, Stethoscope } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { consultations } from '@/data/consultations';
import { patients } from '@/data/patients';
import { anthropometryData } from '@/data/anthropometry';
import { formatDateLong } from '@/lib/utils';
import { getIMCClassification } from '@/lib/calculations';

export default function ConsultaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const consultation = consultations.find((c) => c.id === id);
  if (!consultation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Consulta no encontrada.</p>
        <Link href="/consultas" className="text-primary underline text-sm mt-2 inline-block">Volver a consultas</Link>
      </div>
    );
  }

  const patient = patients.find((p) => p.id === consultation.pacienteId);
  const anthropometry = anthropometryData.find((a) => a.id === consultation.antropometriaId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/consultas" className="p-2 rounded-lg hover:bg-white transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalle de Consulta</h1>
          <p className="text-sm text-gray-500">{formatDateLong(consultation.fecha)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Patient info */}
        {patient && (
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                {patient.nombre.charAt(0)}{patient.apellido.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{patient.nombre} {patient.apellido}</p>
                <p className="text-xs text-gray-500">{patient.telefono}</p>
              </div>
            </div>
            <Link href={`/pacientes/${patient.id}`} className="text-sm text-primary hover:underline">
              Ver ficha completa →
            </Link>
          </Card>
        )}

        <Card className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500">Fecha:</span>
            <span className="text-sm font-medium">{formatDateLong(consultation.fecha)}</span>
          </div>
          <p className="text-sm"><strong>Motivo:</strong> {consultation.motivo}</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Stethoscope size={16} /> Notas Clínicas
        </h3>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{consultation.notasClinicas}</p>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Diagnóstico</h3>
          <p className="text-sm text-gray-600">{consultation.diagnostico}</p>
        </Card>
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Recomendaciones</h3>
          <p className="text-sm text-gray-600">{consultation.recomendaciones}</p>
        </Card>
      </div>

      {anthropometry && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Medidas Antropométricas</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Peso</p>
              <p className="text-lg font-bold text-gray-900">{anthropometry.peso} kg</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Talla</p>
              <p className="text-lg font-bold text-gray-900">{anthropometry.talla} cm</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">IMC</p>
              <p className="text-lg font-bold" style={{ color: getIMCClassification(anthropometry.imc).color }}>
                {anthropometry.imc}
              </p>
              <p className="text-xs" style={{ color: getIMCClassification(anthropometry.imc).color }}>
                {getIMCClassification(anthropometry.imc).label}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">% Grasa</p>
              <p className="text-lg font-bold text-gray-900">{anthropometry.porcentajeGrasa}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Cintura</p>
              <p className="text-lg font-bold text-gray-900">{anthropometry.circunferenciaCintura} cm</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Cadera</p>
              <p className="text-lg font-bold text-gray-900">{anthropometry.circunferenciaCadera} cm</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Brazo</p>
              <p className="text-lg font-bold text-gray-900">{anthropometry.circunferenciaBrazo} cm</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">% Músculo</p>
              <p className="text-lg font-bold text-gray-900">{anthropometry.porcentajeMusculo}%</p>
            </div>
          </div>
          {anthropometry.notas && (
            <p className="text-sm text-gray-500 mt-3">{anthropometry.notas}</p>
          )}
        </Card>
      )}

      {consultation.proximaCita && (
        <Card>
          <p className="text-sm text-gray-600">
            <strong>Próxima cita sugerida:</strong> {formatDateLong(consultation.proximaCita)}
          </p>
        </Card>
      )}
    </div>
  );
}
