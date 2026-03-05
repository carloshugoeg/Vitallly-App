'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, Stethoscope } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MeasurementsTab from '@/components/consultation/MeasurementsTab';
import ClinicalNotesTab from '@/components/consultation/ClinicalNotesTab';
import { consultations } from '@/data/consultations';
import { patients } from '@/data/patients';
import { anthropometryData } from '@/data/anthropometry';
import { formatDateLong, calculateAge } from '@/lib/utils';

const tabNames = ['Mediciones', 'Notas Clinicas'];

export default function ConsultaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState(0);

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
  const talla = patient?.perfilClinico?.estatura || anthropometry?.talla || 0;
  const genero = patient?.genero || 'F';
  const edad = patient ? calculateAge(patient.fechaNacimiento) : 30;

  const measurementValues = anthropometry ? {
    peso: anthropometry.peso.toString(),
    porcentajeGrasa: anthropometry.porcentajeGrasa.toString(),
    porcentajeAgua: anthropometry.porcentajeAgua.toString(),
    masaMusculo: anthropometry.masaMusculo.toString(),
    valoracionFisica: anthropometry.valoracionFisica.toString(),
    masaOsea: anthropometry.masaOsea.toString(),
    dci: anthropometry.dci.toString(),
    edadMetabolica: anthropometry.edadMetabolica.toString(),
    grasaVisceral: anthropometry.grasaVisceral.toString(),
    circunferenciaCintura: anthropometry.circunferenciaCintura.toString(),
    circunferenciaCadera: anthropometry.circunferenciaCadera.toString(),
    notasAntropometria: anthropometry.notas,
  } : {
    peso: '', porcentajeGrasa: '', porcentajeAgua: '', masaMusculo: '',
    valoracionFisica: '', masaOsea: '', dci: '', edadMetabolica: '',
    grasaVisceral: '', circunferenciaCintura: '', circunferenciaCadera: '',
    notasAntropometria: '',
  };

  const notesValues = {
    motivo: consultation.motivo,
    notasClinicas: consultation.notasClinicas,
    diagnostico: consultation.diagnostico,
    recomendaciones: consultation.recomendaciones,
  };

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

      {/* Patient info */}
      <div className="grid grid-cols-3 gap-6">
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
          {consultation.proximaCita && (
            <p className="text-sm text-gray-500 mt-2">
              <strong>Proxima cita:</strong> {formatDateLong(consultation.proximaCita)}
            </p>
          )}
        </Card>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabNames.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === i
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 0 && anthropometry && (
        <MeasurementsTab
          talla={talla}
          genero={genero}
          edad={edad}
          values={measurementValues}
          onChange={() => {}}
          readOnly
        />
      )}

      {activeTab === 0 && !anthropometry && (
        <Card>
          <p className="text-center text-gray-500 py-8">No hay mediciones registradas para esta consulta.</p>
        </Card>
      )}

      {activeTab === 1 && (
        <ClinicalNotesTab
          values={notesValues}
          onChange={() => {}}
          patient={patient}
          readOnly
        />
      )}
    </div>
  );
}
