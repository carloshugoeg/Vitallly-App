'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { calculateIMC, getIMCClassification, calculateTMBHarrisBenedict, calculateTMBMifflinStJeor, calculateGET, calculateMacrosGrams } from '@/lib/calculations';
import { ACTIVITY_LEVELS } from '@/lib/constants';

const genderOptions = [
  { value: 'F', label: 'Femenino' },
  { value: 'M', label: 'Masculino' },
];

const formulaOptions = [
  { value: 'harris', label: 'Harris-Benedict' },
  { value: 'mifflin', label: 'Mifflin-St Jeor' },
];

const activityOptions = Object.entries(ACTIVITY_LEVELS).map(([k, v]) => ({
  value: k,
  label: `${v.label} — ${v.description}`,
}));

const MACRO_COLORS = ['#3B82F6', '#F59E0B', '#EF4444'];

export default function CalculadoraPage() {
  const [peso, setPeso] = useState('70');
  const [talla, setTalla] = useState('165');
  const [edad, setEdad] = useState('30');
  const [genero, setGenero] = useState<'M' | 'F'>('F');
  const [formula, setFormula] = useState('harris');
  const [actividad, setActividad] = useState<keyof typeof ACTIVITY_LEVELS>('moderado');

  const [protPct, setProtPct] = useState('30');
  const [carbPct, setCarbPct] = useState('45');
  const [fatPct, setFatPct] = useState('25');

  const pesoNum = parseFloat(peso) || 0;
  const tallaNum = parseFloat(talla) || 0;
  const edadNum = parseInt(edad) || 0;

  // IMC
  const imc = pesoNum > 0 && tallaNum > 0 ? calculateIMC(pesoNum, tallaNum) : 0;
  const imcClass = imc > 0 ? getIMCClassification(imc) : null;

  // TMB & GET
  const tmb = pesoNum > 0 && tallaNum > 0 && edadNum > 0
    ? formula === 'harris'
      ? calculateTMBHarrisBenedict(pesoNum, tallaNum, edadNum, genero)
      : calculateTMBMifflinStJeor(pesoNum, tallaNum, edadNum, genero)
    : 0;
  const get = tmb > 0 ? calculateGET(tmb, actividad) : 0;

  // Macros
  const protNum = parseFloat(protPct) || 0;
  const carbNum = parseFloat(carbPct) || 0;
  const fatNum = parseFloat(fatPct) || 0;
  const totalPct = protNum + carbNum + fatNum;
  const macros = get > 0 ? calculateMacrosGrams(get, protNum, carbNum, fatNum) : null;

  const pieData = macros
    ? [
        { name: 'Proteínas', value: macros.proteinasGramos, pct: protNum },
        { name: 'Carbohidratos', value: macros.carbohidratosGramos, pct: carbNum },
        { name: 'Grasas', value: macros.grasasGramos, pct: fatNum },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calculadora Nutricional</h1>
        <p className="text-sm text-gray-500">Calcular IMC, Gasto Energético Total y distribución de macronutrientes</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos del Paciente</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input id="calc-peso" label="Peso (kg)" type="number" step="0.1" value={peso} onChange={(e) => setPeso(e.target.value)} />
              <Input id="calc-talla" label="Talla (cm)" type="number" step="0.1" value={talla} onChange={(e) => setTalla(e.target.value)} />
              <Input id="calc-edad" label="Edad (años)" type="number" value={edad} onChange={(e) => setEdad(e.target.value)} />
              <Select id="calc-genero" label="Género" options={genderOptions} value={genero} onChange={(e) => setGenero(e.target.value as 'M' | 'F')} />
              <Select id="calc-formula" label="Fórmula" options={formulaOptions} value={formula} onChange={(e) => setFormula(e.target.value)} />
              <Select id="calc-actividad" label="Nivel de Actividad" options={activityOptions} value={actividad} onChange={(e) => setActividad(e.target.value as keyof typeof ACTIVITY_LEVELS)} />
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Macronutrientes (%)</h3>
            <div className="grid grid-cols-3 gap-4">
              <Input id="calc-prot" label="Proteínas %" type="number" value={protPct} onChange={(e) => setProtPct(e.target.value)} />
              <Input id="calc-carb" label="Carbohidratos %" type="number" value={carbPct} onChange={(e) => setCarbPct(e.target.value)} />
              <Input id="calc-fat" label="Grasas %" type="number" value={fatPct} onChange={(e) => setFatPct(e.target.value)} />
            </div>
            {totalPct !== 100 && (
              <p className="text-xs text-red-500 mt-2">
                El total debe sumar 100%. Actual: {totalPct}%
              </p>
            )}
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">IMC</h3>
            {imc > 0 && imcClass ? (
              <div className="text-center">
                <p className="text-5xl font-bold" style={{ color: imcClass.color }}>{imc}</p>
                <p className="text-lg mt-1" style={{ color: imcClass.color }}>{imcClass.label}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Ingresa peso y talla para calcular</p>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gasto Energético</h3>
            {tmb > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-primary">TMB</p>
                  <p className="text-2xl font-bold text-primary">{Math.round(tmb)}</p>
                  <p className="text-xs text-primary/70">kcal/día</p>
                </div>
                <div className="bg-primary rounded-lg p-4 text-center">
                  <p className="text-sm text-white/80">GET</p>
                  <p className="text-2xl font-bold text-white">{get}</p>
                  <p className="text-xs text-white/70">kcal/día</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Ingresa los datos del paciente</p>
            )}
          </Card>

          {macros && totalPct === 100 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Macronutrientes</h3>
              <div className="flex items-center gap-6">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={MACRO_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}g`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm">Proteínas ({protNum}%)</span>
                    </div>
                    <span className="font-bold text-sm">{macros.proteinasGramos}g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-sm">Carbohidratos ({carbNum}%)</span>
                    </div>
                    <span className="font-bold text-sm">{macros.carbohidratosGramos}g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm">Grasas ({fatNum}%)</span>
                    </div>
                    <span className="font-bold text-sm">{macros.grasasGramos}g</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
