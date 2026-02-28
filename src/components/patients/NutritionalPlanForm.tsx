'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { NutritionalPlan } from '@/data/types';
import { calculateMacrosGrams } from '@/lib/calculations';

interface NutritionalPlanFormProps {
  pacienteId: string;
  initialData?: NutritionalPlan;
  onSave: (plan: NutritionalPlan) => void;
  onCancel: () => void;
}

const defaultComidas = [
  { nombre: 'Desayuno', hora: '07:00', descripcion: '' },
  { nombre: 'Almuerzo', hora: '13:00', descripcion: '' },
  { nombre: 'Cena', hora: '19:00', descripcion: '' },
];

export default function NutritionalPlanForm({ pacienteId, initialData, onSave, onCancel }: NutritionalPlanFormProps) {
  const [fecha, setFecha] = useState(initialData?.fecha || new Date().toISOString().split('T')[0]);
  const [objetivo, setObjetivo] = useState(initialData?.objetivo || '');
  const [caloriasDiarias, setCaloriasDiarias] = useState(initialData?.caloriasDiarias || 2000);
  const [proteinasPct, setProteinasPct] = useState(initialData?.macros.proteinasPorcentaje || 30);
  const [carbohidratosPct, setCarbohidratosPct] = useState(initialData?.macros.carbohidratosPorcentaje || 45);
  const [grasasPct, setGrasasPct] = useState(initialData?.macros.grasasPorcentaje || 25);
  const [comidas, setComidas] = useState(initialData?.comidas || defaultComidas);
  const [restricciones, setRestricciones] = useState(initialData?.restricciones.join(', ') || '');
  const [suplementos, setSuplementos] = useState(initialData?.suplementos.join(', ') || '');
  const [notas, setNotas] = useState(initialData?.notas || '');

  const macroSum = proteinasPct + carbohidratosPct + grasasPct;
  const macrosGrams = calculateMacrosGrams(caloriasDiarias, proteinasPct, carbohidratosPct, grasasPct);

  const handleAddComida = () => {
    setComidas([...comidas, { nombre: '', hora: '12:00', descripcion: '' }]);
  };

  const handleRemoveComida = (index: number) => {
    setComidas(comidas.filter((_, i) => i !== index));
  };

  const handleComidaChange = (index: number, field: string, value: string) => {
    setComidas(comidas.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (macroSum !== 100) return;

    const plan: NutritionalPlan = {
      id: initialData?.id || 'np' + Date.now(),
      pacienteId,
      consultaId: initialData?.consultaId || '',
      fecha,
      objetivo,
      caloriasDiarias,
      macros: {
        proteinasPorcentaje: proteinasPct,
        carbohidratosPorcentaje: carbohidratosPct,
        grasasPorcentaje: grasasPct,
        ...macrosGrams,
      },
      comidas,
      restricciones: restricciones.split(',').map(s => s.trim()).filter(Boolean),
      suplementos: suplementos.split(',').map(s => s.trim()).filter(Boolean),
      notas,
    };

    onSave(plan);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input id="plan-fecha" label="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        <Input id="plan-calorias" label="Calorías Diarias (kcal)" type="number" value={caloriasDiarias.toString()} onChange={(e) => setCaloriasDiarias(Number(e.target.value))} required min="500" />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Objetivo</label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          rows={2}
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          placeholder="Ej: Pérdida de peso gradual manteniendo masa muscular"
          required
        />
      </div>

      {/* Macros */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Distribución de Macronutrientes (%)</label>
          {macroSum !== 100 && (
            <span className="text-xs text-red-500 font-medium">Total: {macroSum}% (debe ser 100%)</span>
          )}
          {macroSum === 100 && (
            <span className="text-xs text-green-600 font-medium">Total: 100%</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input id="plan-proteinas" label="Proteínas %" type="number" value={proteinasPct.toString()} onChange={(e) => setProteinasPct(Number(e.target.value))} min="0" max="100" required />
          <Input id="plan-carbohidratos" label="Carbohidratos %" type="number" value={carbohidratosPct.toString()} onChange={(e) => setCarbohidratosPct(Number(e.target.value))} min="0" max="100" required />
          <Input id="plan-grasas" label="Grasas %" type="number" value={grasasPct.toString()} onChange={(e) => setGrasasPct(Number(e.target.value))} min="0" max="100" required />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-2">
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <p className="text-xs text-blue-600">Proteínas</p>
            <p className="font-bold text-blue-700">{macrosGrams.proteinasGramos}g</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-2 text-center">
            <p className="text-xs text-yellow-600">Carbohidratos</p>
            <p className="font-bold text-yellow-700">{macrosGrams.carbohidratosGramos}g</p>
          </div>
          <div className="bg-red-50 rounded-lg p-2 text-center">
            <p className="text-xs text-red-600">Grasas</p>
            <p className="font-bold text-red-700">{macrosGrams.grasasGramos}g</p>
          </div>
        </div>
      </div>

      {/* Comidas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Comidas</label>
          <Button type="button" variant="ghost" size="sm" onClick={handleAddComida}>
            <Plus size={14} /> Agregar
          </Button>
        </div>
        <div className="space-y-3">
          {comidas.map((comida, i) => (
            <div key={i} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 grid grid-cols-4 gap-2">
                <Input id={`comida-nombre-${i}`} placeholder="Nombre" value={comida.nombre} onChange={(e) => handleComidaChange(i, 'nombre', e.target.value)} required />
                <Input id={`comida-hora-${i}`} type="time" value={comida.hora} onChange={(e) => handleComidaChange(i, 'hora', e.target.value)} required />
                <div className="col-span-2">
                  <Input id={`comida-desc-${i}`} placeholder="Descripción" value={comida.descripcion} onChange={(e) => handleComidaChange(i, 'descripcion', e.target.value)} />
                </div>
              </div>
              {comidas.length > 1 && (
                <button type="button" onClick={() => handleRemoveComida(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg mt-0.5">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Restricciones y Suplementos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Restricciones (separadas por coma)</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            rows={2}
            value={restricciones}
            onChange={(e) => setRestricciones(e.target.value)}
            placeholder="Ej: Sin gluten, Sin lactosa"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Suplementos (separados por coma)</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            rows={2}
            value={suplementos}
            onChange={(e) => setSuplementos(e.target.value)}
            placeholder="Ej: Proteína whey, Creatina"
          />
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Notas</label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Notas adicionales sobre el plan..."
        />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={macroSum !== 100}>
          {initialData ? 'Guardar Cambios' : 'Crear Plan'}
        </Button>
      </div>
    </form>
  );
}
