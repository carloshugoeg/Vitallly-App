'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import TabNavigation from '@/components/ui/TabNavigation';
import MeasurementsTab from '@/components/consultation/MeasurementsTab';
import ClinicalNotesTab from '@/components/consultation/ClinicalNotesTab';
import NutritionalPlanTab from '@/components/consultation/NutritionalPlanTab';
import { useToast } from '@/hooks/useToast';
import { usePatients, usePatient } from '@/hooks/usePatients';
import { createConsultation } from '@/hooks/useConsultations';
import { NutritionalPlan } from '@/types/api';
import { calculateAge } from '@/lib/utils';

const tabNames = ['1. Mediciones', '2. Notas Clinicas', '3. Plan Nutricional'];

export default function NuevaConsultaPage() {
  const router = useRouter();
  const { toast, show: showToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const searchParams = useSearchParams();

  const [pacienteId, setPacienteId] = useState(searchParams.get('pacienteId') ?? '');
  const [fecha, setFecha] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const { patients } = usePatients({ pageSize: 500 });
  const { patient } = usePatient(pacienteId || null);

  const talla = patient?.perfilClinico?.estatura || 0;
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
    motivo: searchParams.get('motivo') ?? '',
    notasClinicas: '',
    diagnostico: '',
    recomendaciones: '',
  });

  const [savedPlan, setSavedPlan] = useState<NutritionalPlan | null>(null);

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotesChange = (field: string, value: string) => {
    setNotes((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePlan = (plan: NutritionalPlan) => {
    setSavedPlan(plan);
    showToast('Plan guardado. Puede registrar la consulta.');
  };

  const handleSubmit = async () => {
    if (!pacienteId) return;
    setSubmitting(true);
    setError('');

    try {
      const hasAnthro = measurements.peso !== '';
      const payload: Record<string, unknown> = {
        pacienteId,
        fecha,
        ...notes,
      };

      if (hasAnthro) {
        payload.anthropometry = {
          peso: parseFloat(measurements.peso) || 0,
          talla,
          imc: talla > 0 ? parseFloat((parseFloat(measurements.peso) / ((talla / 100) ** 2)).toFixed(2)) : 0,
          porcentajeGrasa: parseFloat(measurements.porcentajeGrasa) || 0,
          porcentajeAgua: parseFloat(measurements.porcentajeAgua) || 0,
          masaMusculo: parseFloat(measurements.masaMusculo) || 0,
          valoracionFisica: parseInt(measurements.valoracionFisica) || 0,
          masaOsea: parseFloat(measurements.masaOsea) || 0,
          dci: parseFloat(measurements.dci) || 0,
          edadMetabolica: parseInt(measurements.edadMetabolica) || 0,
          grasaVisceral: parseInt(measurements.grasaVisceral) || 0,
          circunferenciaCintura: parseFloat(measurements.circunferenciaCintura) || 0,
          circunferenciaCadera: parseFloat(measurements.circunferenciaCadera) || 0,
          pesoIdeal: 0,
          notas: measurements.notasAntropometria,
        };
      }

      if (savedPlan) {
        payload.nutritionalPlan = {
          objetivo: savedPlan.objetivo,
          caloriasDiarias: savedPlan.caloriasDiarias,
          proteinasPorcentaje: savedPlan.macros.proteinasPorcentaje,
          carbohidratosPorcentaje: savedPlan.macros.carbohidratosPorcentaje,
          grasasPorcentaje: savedPlan.macros.grasasPorcentaje,
          proteinasGramos: savedPlan.macros.proteinasGramos,
          carbohidratosGramos: savedPlan.macros.carbohidratosGramos,
          grasasGramos: savedPlan.macros.grasasGramos,
          comidas: savedPlan.comidas,
          restricciones: savedPlan.restricciones,
          suplementos: savedPlan.suplementos,
          notas: savedPlan.notas,
        };
      }

      await createConsultation(payload);
      router.push('/consultas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar consulta');
    } finally {
      setSubmitting(false);
    }
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

      {toast && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {toast.message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm font-medium">
          {error}
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
      <TabNavigation tabs={tabNames} activeTab={activeTab} onChange={setActiveTab} />

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
            <Button type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Registrando...' : 'Registrar Consulta'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
