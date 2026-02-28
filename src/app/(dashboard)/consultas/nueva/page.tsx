'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { patients } from '@/data/patients';
import { calculateIMC, getIMCClassification } from '@/lib/calculations';

export default function NuevaConsultaPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const patientOptions = [
    { value: '', label: 'Seleccionar paciente...' },
    ...patients.map((p) => ({ value: p.id, label: `${p.nombre} ${p.apellido}` })),
  ];

  const [form, setForm] = useState({
    pacienteId: '',
    fecha: new Date().toISOString().split('T')[0],
    motivo: '',
    notasClinicas: '',
    diagnostico: '',
    recomendaciones: '',
    peso: '',
    talla: '',
    circunferenciaCintura: '',
    circunferenciaCadera: '',
    circunferenciaBrazo: '',
    porcentajeGrasa: '',
    porcentajeMusculo: '',
    notasAntropometria: '',
  });

  const peso = parseFloat(form.peso) || 0;
  const talla = parseFloat(form.talla) || 0;
  const imc = peso > 0 && talla > 0 ? calculateIMC(peso, talla) : 0;
  const imcClass = imc > 0 ? getIMCClassification(imc) : null;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Consulta</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select id="c-patient" label="Paciente" options={patientOptions} value={form.pacienteId} onChange={(e) => handleChange('pacienteId', e.target.value)} required />
            <Input id="c-fecha" label="Fecha" type="date" value={form.fecha} onChange={(e) => handleChange('fecha', e.target.value)} required />
            <div className="col-span-2">
              <Input id="c-motivo" label="Motivo de la Consulta" value={form.motivo} onChange={(e) => handleChange('motivo', e.target.value)} required />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas Clínicas</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Notas Clínicas</label>
              <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" rows={4} value={form.notasClinicas} onChange={(e) => handleChange('notasClinicas', e.target.value)} placeholder="Observaciones durante la consulta..." />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
              <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" rows={2} value={form.diagnostico} onChange={(e) => handleChange('diagnostico', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Recomendaciones</label>
              <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" rows={3} value={form.recomendaciones} onChange={(e) => handleChange('recomendaciones', e.target.value)} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Medidas Antropométricas</h3>
            {imc > 0 && imcClass && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">IMC:</span>
                <span className="text-lg font-bold" style={{ color: imcClass.color }}>{imc}</span>
                <span className="text-sm" style={{ color: imcClass.color }}>({imcClass.label})</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input id="c-peso" label="Peso (kg)" type="number" step="0.1" value={form.peso} onChange={(e) => handleChange('peso', e.target.value)} />
            <Input id="c-talla" label="Talla (cm)" type="number" step="0.1" value={form.talla} onChange={(e) => handleChange('talla', e.target.value)} />
            <Input id="c-cintura" label="Cintura (cm)" type="number" step="0.1" value={form.circunferenciaCintura} onChange={(e) => handleChange('circunferenciaCintura', e.target.value)} />
            <Input id="c-cadera" label="Cadera (cm)" type="number" step="0.1" value={form.circunferenciaCadera} onChange={(e) => handleChange('circunferenciaCadera', e.target.value)} />
            <Input id="c-brazo" label="Brazo (cm)" type="number" step="0.1" value={form.circunferenciaBrazo} onChange={(e) => handleChange('circunferenciaBrazo', e.target.value)} />
            <Input id="c-grasa" label="% Grasa" type="number" step="0.1" value={form.porcentajeGrasa} onChange={(e) => handleChange('porcentajeGrasa', e.target.value)} />
            <Input id="c-musculo" label="% Músculo" type="number" step="0.1" value={form.porcentajeMusculo} onChange={(e) => handleChange('porcentajeMusculo', e.target.value)} />
            <div className="col-span-2">
              <Input id="c-notas-ant" label="Notas" value={form.notasAntropometria} onChange={(e) => handleChange('notasAntropometria', e.target.value)} />
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit">Registrar Consulta</Button>
        </div>
      </form>
    </div>
  );
}
