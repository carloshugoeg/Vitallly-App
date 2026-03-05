'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import MeasurementsTab from '@/components/consultation/MeasurementsTab';
import ClinicalNotesTab from '@/components/consultation/ClinicalNotesTab';
import NutritionalPlanTab from '@/components/consultation/NutritionalPlanTab';
import { patients } from '@/data/patients';
import { calculateAge } from '@/lib/utils';
import { NutritionalPlan } from '@/data/types';

const tabNames = ['1. Mediciones', '2. Notas Clinicas', '3. Plan Nutricional'];

export default function NuevaConsultaPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [pacienteId, setPacienteId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const patient = patients.find((p) => p.id === pacienteId);
  const talla = patient?.perfilClinico.estatura || 0;
  const genero = patient?.genero || 'F';
  const edad = patient ? calculateAge(patient.fechaNacimiento) : 30;

  const [measurements, setMeasurements] = useState({
    peso: '',
    porcentajeGrasa: '',
    porcentajeAgua: '',
    masaMusculo: '',
    valoracionFisica: '',
    masaOsea: '',
    dci: '',
    edadMetabolica: '',
    grasaVisceral: '',
    circunferenciaCintura: '',
    circunferenciaCadera: '',
    notasAntropometria: '',
  });

  const [notes, setNotes] = useState({
    motivo: '',
    notasClinicas: '',
    diagnostico: '',
    recomendaciones: '',
  });

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotesChange = (field: string, value: string) => {
    setNotes((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePlan = (plan: NutritionalPlan) => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSubmit = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const patientOptions = [
    { value: '', label: 'Seleccionar paciente...' },
    ...patients.map((p) => ({ value: p.id, label: `${p.nombre} ${p.apellido}` })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/consultas" className="p-2 rounded-lg hover:bg-white transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Consulta</h1>
          <p className="text-sm text-gray-500">Registrar una nueva consulta nutricional</p>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
          Consulta registrada exitosamente (demo).
        </div>
      )}

      {/* Patient selector & date */}
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <Select id="c-patient" label="Paciente" options={patientOptions} value={pacienteId} onChange={(e) => setPacienteId(e.target.value)} required />
          <Input id="c-fecha" label="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>
        {patient && (
          <div className="mt-3 flex gap-4 text-sm text-gray-500">
            <span>Estatura: <strong>{talla} cm</strong></span>
            <span>Genero: <strong>{genero === 'F' ? 'Femenino' : 'Masculino'}</strong></span>
            <span>Edad: <strong>{edad} anios</strong></span>
          </div>
        )}
      </Card>

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
      {activeTab === 0 && (
        <MeasurementsTab
          talla={talla}
          genero={genero}
          edad={edad}
          values={measurements}
          onChange={handleMeasurementChange}
        />
      )}

      {activeTab === 1 && (
        <ClinicalNotesTab
          values={notes}
          onChange={handleNotesChange}
          patient={patient}
        />
      )}

      {activeTab === 2 && pacienteId && (
        <NutritionalPlanTab
          pacienteId={pacienteId}
          onSave={handleSavePlan}
          skipLabel="Registrar sin plan"
          onSkip={handleSubmit}
        />
      )}

      {activeTab === 2 && !pacienteId && (
        <Card>
          <p className="text-center text-gray-500 py-8">Seleccione un paciente primero.</p>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <div>
          {activeTab > 0 && (
            <Button type="button" variant="ghost" onClick={() => setActiveTab(activeTab - 1)}>
              Anterior
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
          {activeTab < 2 ? (
            <Button type="button" onClick={() => setActiveTab(activeTab + 1)}>
              Siguiente
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit}>
              Registrar Consulta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
