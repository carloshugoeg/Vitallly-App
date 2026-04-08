'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { Utensils } from 'lucide-react';
import { Patient } from '@/types/api';
import { createPatient, updatePatient } from '@/hooks/usePatients';
import { ACTIVITY_LEVELS } from '@/lib/constants';

interface PatientFormProps {
  initialData?: Patient;
  isEditing?: boolean;
}

const activityOptions = Object.entries(ACTIVITY_LEVELS).map(([key, val]) => ({
  value: key,
  label: val.label,
}));

const genderOptions = [
  { value: 'F', label: 'Femenino' },
  { value: 'M', label: 'Masculino' },
];

function splitComma(s: string): string[] {
  return s.split(',').map(v => v.trim()).filter(Boolean);
}

function formToApiShape(form: Record<string, string | boolean>) {
  return {
    nombre: form.nombre as string,
    apellido: form.apellido as string,
    dpi: form.dpi as string,
    fechaNacimiento: form.fechaNacimiento as string,
    genero: form.genero as 'M' | 'F',
    telefono: form.telefono as string,
    email: form.email as string,
    direccion: form.direccion as string,
    ocupacion: form.ocupacion as string,
    contactoEmergencia: {
      nombre: form.emergenciaNombre as string,
      telefono: form.emergenciaTelefono as string,
      relacion: form.emergenciaRelacion as string,
    },
    antecedentesMedicos: splitComma(form.antecedentesMedicos as string),
    antecedentesFamiliares: splitComma(form.antecedentesFamiliares as string),
    alergias: splitComma(form.alergias as string),
    medicamentos: splitComma(form.medicamentos as string),
    estiloVida: {
      nivelActividad: form.nivelActividad as string,
      horasSueno: parseFloat(form.horasSueno as string) || 7,
      consumoAlcohol: form.consumoAlcohol as boolean,
      fumador: form.fumador as boolean,
      ejercicioSemanal: form.ejercicioSemanal as string,
    },
    perfilClinico: {
      estatura: parseFloat(form.estatura as string) || 0,
      patologias: splitComma(form.patologias as string),
      examenesLaboratorio: splitComma(form.examenesLaboratorio as string),
      sintomas: splitComma(form.sintomas as string),
      vicios: splitComma(form.vicios as string),
      alimentosNoTolerables: splitComma(form.alimentosNoTolerables as string),
    },
    notas: form.notas as string,
  };
}

export default function PatientForm({ initialData, isEditing }: PatientFormProps) {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    nombre: initialData?.nombre || '',
    apellido: initialData?.apellido || '',
    dpi: initialData?.dpi || '',
    fechaNacimiento: initialData?.fechaNacimiento || '',
    genero: initialData?.genero || 'F',
    telefono: initialData?.telefono || '',
    email: initialData?.email || '',
    direccion: initialData?.direccion || '',
    ocupacion: initialData?.ocupacion || '',
    emergenciaNombre: initialData?.contactoEmergencia.nombre || '',
    emergenciaTelefono: initialData?.contactoEmergencia.telefono || '',
    emergenciaRelacion: initialData?.contactoEmergencia.relacion || '',
    antecedentesMedicos: initialData?.antecedentesMedicos.join(', ') || '',
    antecedentesFamiliares: initialData?.antecedentesFamiliares.join(', ') || '',
    alergias: initialData?.alergias.join(', ') || '',
    medicamentos: initialData?.medicamentos.join(', ') || '',
    nivelActividad: initialData?.estiloVida.nivelActividad || 'sedentario',
    horasSueno: initialData?.estiloVida.horasSueno?.toString() || '7',
    consumoAlcohol: initialData?.estiloVida.consumoAlcohol || false,
    fumador: initialData?.estiloVida.fumador || false,
    ejercicioSemanal: initialData?.estiloVida.ejercicioSemanal || '',
    estatura: initialData?.perfilClinico?.estatura?.toString() || '',
    patologias: initialData?.perfilClinico?.patologias?.join(', ') || '',
    examenesLaboratorio: initialData?.perfilClinico?.examenesLaboratorio?.join(', ') || '',
    sintomas: initialData?.perfilClinico?.sintomas?.join(', ') || '',
    vicios: initialData?.perfilClinico?.vicios?.join(', ') || '',
    alimentosNoTolerables: initialData?.perfilClinico?.alimentosNoTolerables?.join(', ') || '',
    notas: initialData?.notas || '',
  });

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.nombre.trim()) errors.nombre = 'Nombre es requerido';
    if (!form.apellido.trim()) errors.apellido = 'Apellido es requerido';
    if (!form.dpi.trim()) {
      errors.dpi = 'DPI es requerido';
    } else if (!/^\d{13}$/.test(form.dpi.replace(/\s/g, ''))) {
      errors.dpi = 'DPI debe tener 13 dígitos';
    }
    if (!form.fechaNacimiento) errors.fechaNacimiento = 'Fecha de nacimiento es requerida';
    if (!form.telefono.trim()) errors.telefono = 'Teléfono es requerido';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setError('');

    try {
      const payload = formToApiShape(form as Record<string, string | boolean>) as Partial<Patient>;
      if (isEditing && initialData) {
        await updatePatient(initialData.id, payload);
      } else {
        await createPatient(payload);
      }
      setShowSuccess(true);
      setTimeout(() => {
        router.push(isEditing && initialData ? `/pacientes/${initialData.id}` : '/pacientes');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar paciente');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showSuccess && (
        <div className="bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
          Paciente {isEditing ? 'actualizado' : 'registrado'} exitosamente.
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Personales</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input id="nombre" label="Nombre" value={form.nombre} onChange={(e) => handleChange('nombre', e.target.value)} error={fieldErrors.nombre} required />
          <Input id="apellido" label="Apellido" value={form.apellido} onChange={(e) => handleChange('apellido', e.target.value)} error={fieldErrors.apellido} required />
          <Input id="dpi" label="DPI" value={form.dpi} onChange={(e) => handleChange('dpi', e.target.value)} error={fieldErrors.dpi} required />
          <Input id="fechaNacimiento" label="Fecha de Nacimiento" type="date" value={form.fechaNacimiento} onChange={(e) => handleChange('fechaNacimiento', e.target.value)} error={fieldErrors.fechaNacimiento} required />
          <Select id="genero" label="Género" options={genderOptions} value={form.genero} onChange={(e) => handleChange('genero', e.target.value)} />
          <Input id="ocupacion" label="Ocupación" value={form.ocupacion} onChange={(e) => handleChange('ocupacion', e.target.value)} />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacto</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input id="telefono" label="Teléfono" value={form.telefono} onChange={(e) => handleChange('telefono', e.target.value)} error={fieldErrors.telefono} required />
          <Input id="email" label="Email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          <div className="col-span-2">
            <Input id="direccion" label="Dirección" value={form.direccion} onChange={(e) => handleChange('direccion', e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacto de Emergencia</h3>
        <div className="grid grid-cols-3 gap-4">
          <Input id="emergenciaNombre" label="Nombre" value={form.emergenciaNombre} onChange={(e) => handleChange('emergenciaNombre', e.target.value)} />
          <Input id="emergenciaTelefono" label="Teléfono" value={form.emergenciaTelefono} onChange={(e) => handleChange('emergenciaTelefono', e.target.value)} />
          <Input id="emergenciaRelacion" label="Relación" value={form.emergenciaRelacion} onChange={(e) => handleChange('emergenciaRelacion', e.target.value)} />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Antecedentes</h3>
        <div className="grid grid-cols-2 gap-4">
          <Textarea id="antecedentesMedicos" label="Antecedentes Médicos" rows={3} placeholder="Separados por coma" value={form.antecedentesMedicos} onChange={(e) => handleChange('antecedentesMedicos', e.target.value)} />
          <Textarea id="antecedentesFamiliares" label="Antecedentes Familiares" rows={3} placeholder="Separados por coma" value={form.antecedentesFamiliares} onChange={(e) => handleChange('antecedentesFamiliares', e.target.value)} />
          <Input id="alergias" label="Alergias (separadas por coma)" value={form.alergias} onChange={(e) => handleChange('alergias', e.target.value)} />
          <Input id="medicamentos" label="Medicamentos (separados por coma)" value={form.medicamentos} onChange={(e) => handleChange('medicamentos', e.target.value)} />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estilo de Vida</h3>
        <div className="grid grid-cols-2 gap-4">
          <Select id="nivelActividad" label="Nivel de Actividad" options={activityOptions} value={form.nivelActividad} onChange={(e) => handleChange('nivelActividad', e.target.value)} />
          <Input id="horasSueno" label="Horas de Sueño" type="number" value={form.horasSueno} onChange={(e) => handleChange('horasSueno', e.target.value)} />
          <Input id="ejercicioSemanal" label="Ejercicio Semanal" value={form.ejercicioSemanal} onChange={(e) => handleChange('ejercicioSemanal', e.target.value)} />
          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.consumoAlcohol as boolean} onChange={(e) => handleChange('consumoAlcohol', e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              Consume alcohol
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.fumador as boolean} onChange={(e) => handleChange('fumador', e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              Fumador
            </label>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Perfil Clinico Nutricional</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input id="estatura" label="Estatura (cm)" type="number" step="0.1" value={form.estatura} onChange={(e) => handleChange('estatura', e.target.value)} />
          <Textarea id="patologias" label="Patologias (separadas por coma)" rows={2} placeholder="Ej: Hipotiroidismo, Diabetes tipo 2" value={form.patologias} onChange={(e) => handleChange('patologias', e.target.value)} />
          <Textarea id="examenesLaboratorio" label="Examenes de Laboratorio (separados por coma)" rows={2} placeholder="Ej: TSH: 3.2, Glucosa: 105 mg/dL" value={form.examenesLaboratorio} onChange={(e) => handleChange('examenesLaboratorio', e.target.value)} />
          <Textarea id="sintomas" label="Sintomas (separados por coma)" rows={2} placeholder="Ej: Fatiga, Mareos" value={form.sintomas} onChange={(e) => handleChange('sintomas', e.target.value)} />
          <Input id="vicios" label="Vicios (separados por coma)" value={form.vicios} onChange={(e) => handleChange('vicios', e.target.value)} />
          <Input id="alimentosNoTolerables" label="Alimentos No Tolerables (separados por coma)" value={form.alimentosNoTolerables} onChange={(e) => handleChange('alimentosNoTolerables', e.target.value)} />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas</h3>
        <Textarea id="notas" rows={4} value={form.notas} onChange={(e) => handleChange('notas', e.target.value)} placeholder="Notas adicionales sobre el paciente..." />
      </Card>

      {!isEditing && (
        <Card>
          <div className="flex items-center gap-3 text-gray-500">
            <Utensils size={20} className="text-primary shrink-0" />
            <p className="text-sm">Puede crear un plan nutricional desde el perfil del paciente una vez registrado.</p>
          </div>
        </Card>
      )}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Paciente'}
        </Button>
      </div>
    </form>
  );
}
