'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import ReferenceIndicator from './ReferenceIndicator';
import { calculateIMC, getIMCClassification } from '@/lib/calculations';
import {
  classifyBodyFat,
  classifyVisceralFat,
  classifyWaterPercentage,
  classifyBoneMass,
  classifyPhysicalAssessment,
  calculatePesoIdeal,
  calculateIndiceCinturaCadera,
  classifyICC,
} from '@/lib/referenceRanges';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MeasurementsTabProps {
  talla: number;
  genero: 'M' | 'F';
  edad: number;
  values: {
    peso: string;
    porcentajeGrasa: string;
    porcentajeAgua: string;
    masaMusculo: string;
    valoracionFisica: string;
    masaOsea: string;
    dci: string;
    edadMetabolica: string;
    grasaVisceral: string;
    circunferenciaCintura: string;
    circunferenciaCadera: string;
    notasAntropometria: string;
  };
  onChange: (field: string, value: string) => void;
  readOnly?: boolean;
}

export default function MeasurementsTab({ talla, genero, edad, values, onChange, readOnly = false }: MeasurementsTabProps) {
  const [showRefTables, setShowRefTables] = useState(false);

  const peso = parseFloat(values.peso) || 0;
  const imc = peso > 0 && talla > 0 ? calculateIMC(peso, talla) : 0;
  const imcClass = imc > 0 ? getIMCClassification(imc) : null;
  const pesoIdeal = talla > 0 ? calculatePesoIdeal(talla, genero) : 0;

  const pGrasa = parseFloat(values.porcentajeGrasa) || 0;
  const pAgua = parseFloat(values.porcentajeAgua) || 0;
  const mMusculo = parseFloat(values.masaMusculo) || 0;
  const vFisica = parseInt(values.valoracionFisica) || 0;
  const mOsea = parseFloat(values.masaOsea) || 0;
  const gVisc = parseInt(values.grasaVisceral) || 0;
  const cintura = parseFloat(values.circunferenciaCintura) || 0;
  const cadera = parseFloat(values.circunferenciaCadera) || 0;
  const icc = cintura > 0 && cadera > 0 ? calculateIndiceCinturaCadera(cintura, cadera) : 0;

  return (
    <div className="space-y-6">
      {/* Auto-calculated summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center bg-gray-50">
          <p className="text-xs text-gray-500">IMC (auto)</p>
          {imc > 0 && imcClass ? (
            <>
              <p className="text-xl font-bold" style={{ color: imcClass.color }}>{imc}</p>
              <p className="text-xs" style={{ color: imcClass.color }}>{imcClass.label}</p>
            </>
          ) : (
            <p className="text-lg text-gray-300">--</p>
          )}
        </Card>
        <Card className="text-center bg-gray-50">
          <p className="text-xs text-gray-500">Peso Ideal (Lorentz)</p>
          {pesoIdeal > 0 ? (
            <p className="text-xl font-bold text-gray-900">{pesoIdeal} kg</p>
          ) : (
            <p className="text-lg text-gray-300">--</p>
          )}
        </Card>
        <Card className="text-center bg-gray-50">
          <p className="text-xs text-gray-500">ICC (auto)</p>
          {icc > 0 ? (
            <ReferenceIndicator value={icc} label={classifyICC(icc, genero).label} color={classifyICC(icc, genero).color} />
          ) : (
            <p className="text-lg text-gray-300">--</p>
          )}
        </Card>
      </div>

      {/* Bioimpedance scale inputs */}
      <Card>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Bascula de Bioimpedancia</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Input id="m-peso" label="Peso (kg)" type="number" step="0.1" value={values.peso} onChange={(e) => onChange('peso', e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <Input id="m-grasa" label="% Grasa Corporal" type="number" step="0.1" value={values.porcentajeGrasa} onChange={(e) => onChange('porcentajeGrasa', e.target.value)} disabled={readOnly} />
            {pGrasa > 0 && (
              <div className="mt-1">
                <ReferenceIndicator value={pGrasa} unit="%" label={classifyBodyFat(pGrasa, edad, genero).label} color={classifyBodyFat(pGrasa, edad, genero).color} />
              </div>
            )}
          </div>
          <div>
            <Input id="m-agua" label="% Agua Corporal" type="number" step="0.1" value={values.porcentajeAgua} onChange={(e) => onChange('porcentajeAgua', e.target.value)} disabled={readOnly} />
            {pAgua > 0 && (
              <div className="mt-1">
                <ReferenceIndicator value={pAgua} unit="%" label={classifyWaterPercentage(pAgua, genero).label} color={classifyWaterPercentage(pAgua, genero).color} />
              </div>
            )}
          </div>
          <div>
            <Input id="m-musculo" label="Masa Muscular (kg)" type="number" step="0.1" value={values.masaMusculo} onChange={(e) => onChange('masaMusculo', e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <Input id="m-vfisica" label="Valoracion Fisica (1-9)" type="number" min="1" max="9" value={values.valoracionFisica} onChange={(e) => onChange('valoracionFisica', e.target.value)} disabled={readOnly} />
            {vFisica > 0 && (
              <div className="mt-1">
                <ReferenceIndicator value={vFisica} label={classifyPhysicalAssessment(vFisica).label} color={classifyPhysicalAssessment(vFisica).color} />
              </div>
            )}
          </div>
          <div>
            <Input id="m-osea" label="Masa Osea (kg)" type="number" step="0.1" value={values.masaOsea} onChange={(e) => onChange('masaOsea', e.target.value)} disabled={readOnly} />
            {mOsea > 0 && peso > 0 && (
              <div className="mt-1">
                <ReferenceIndicator value={mOsea} unit=" kg" label={classifyBoneMass(mOsea, peso, genero).label} color={classifyBoneMass(mOsea, peso, genero).color} />
              </div>
            )}
          </div>
          <div>
            <Input id="m-dci" label="DCI (kcal)" type="number" value={values.dci} onChange={(e) => onChange('dci', e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <Input id="m-edadmet" label="Edad Metabolica" type="number" value={values.edadMetabolica} onChange={(e) => onChange('edadMetabolica', e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <Input id="m-gvisc" label="Grasa Visceral (1-59)" type="number" min="1" max="59" value={values.grasaVisceral} onChange={(e) => onChange('grasaVisceral', e.target.value)} disabled={readOnly} />
            {gVisc > 0 && (
              <div className="mt-1">
                <ReferenceIndicator value={gVisc} label={classifyVisceralFat(gVisc).label} color={classifyVisceralFat(gVisc).color} />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Manual measurements */}
      <Card>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Mediciones Manuales</h4>
        <div className="grid grid-cols-3 gap-4">
          <Input id="m-cintura" label="Cintura (cm)" type="number" step="0.1" value={values.circunferenciaCintura} onChange={(e) => onChange('circunferenciaCintura', e.target.value)} disabled={readOnly} />
          <Input id="m-cadera" label="Cadera (cm)" type="number" step="0.1" value={values.circunferenciaCadera} onChange={(e) => onChange('circunferenciaCadera', e.target.value)} disabled={readOnly} />
          <div className="col-span-1">
            <Input id="m-notas" label="Notas" value={values.notasAntropometria} onChange={(e) => onChange('notasAntropometria', e.target.value)} disabled={readOnly} />
          </div>
        </div>
      </Card>

      {/* Collapsible reference tables */}
      <Card>
        <button
          type="button"
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700"
          onClick={() => setShowRefTables(!showRefTables)}
        >
          <span>Tablas de Referencia</span>
          {showRefTables ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showRefTables && (
          <div className="mt-4 space-y-4 text-xs">
            {/* Body fat reference */}
            <div>
              <p className="font-medium text-gray-700 mb-1">% Grasa Corporal ({genero === 'F' ? 'Mujer' : 'Hombre'})</p>
              <table className="w-full border text-center">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-2 py-1">Edad</th>
                    <th className="border px-2 py-1 text-blue-600">Bajo</th>
                    <th className="border px-2 py-1 text-green-600">Saludable</th>
                    <th className="border px-2 py-1 text-yellow-600">Alto</th>
                    <th className="border px-2 py-1 text-red-600">Obeso</th>
                  </tr>
                </thead>
                <tbody>
                  {genero === 'F' ? (
                    <>
                      <tr><td className="border px-2 py-1">20-39</td><td className="border px-2 py-1">&lt;21%</td><td className="border px-2 py-1">21-33%</td><td className="border px-2 py-1">33-39%</td><td className="border px-2 py-1">&gt;39%</td></tr>
                      <tr><td className="border px-2 py-1">40-59</td><td className="border px-2 py-1">&lt;23%</td><td className="border px-2 py-1">23-34%</td><td className="border px-2 py-1">34-40%</td><td className="border px-2 py-1">&gt;40%</td></tr>
                      <tr><td className="border px-2 py-1">60-79</td><td className="border px-2 py-1">&lt;24%</td><td className="border px-2 py-1">24-36%</td><td className="border px-2 py-1">36-42%</td><td className="border px-2 py-1">&gt;42%</td></tr>
                    </>
                  ) : (
                    <>
                      <tr><td className="border px-2 py-1">20-39</td><td className="border px-2 py-1">&lt;8%</td><td className="border px-2 py-1">8-20%</td><td className="border px-2 py-1">20-25%</td><td className="border px-2 py-1">&gt;25%</td></tr>
                      <tr><td className="border px-2 py-1">40-59</td><td className="border px-2 py-1">&lt;11%</td><td className="border px-2 py-1">11-22%</td><td className="border px-2 py-1">22-28%</td><td className="border px-2 py-1">&gt;28%</td></tr>
                      <tr><td className="border px-2 py-1">60-79</td><td className="border px-2 py-1">&lt;13%</td><td className="border px-2 py-1">13-25%</td><td className="border px-2 py-1">25-30%</td><td className="border px-2 py-1">&gt;30%</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Visceral fat reference */}
            <div>
              <p className="font-medium text-gray-700 mb-1">Grasa Visceral</p>
              <div className="flex gap-4">
                <span className="text-green-600">1-12: Saludable</span>
                <span className="text-red-600">13-59: Exceso</span>
              </div>
            </div>

            {/* Water % reference */}
            <div>
              <p className="font-medium text-gray-700 mb-1">% Agua Corporal</p>
              <div className="flex gap-4">
                <span>Hombre: 50-65%</span>
                <span>Mujer: 45-60%</span>
              </div>
            </div>

            {/* Physical assessment */}
            <div>
              <p className="font-medium text-gray-700 mb-1">Valoracion Fisica (1-9)</p>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-red-600">1: Obesidad oculta</span>
                <span className="text-red-600">2: Obeso</span>
                <span className="text-yellow-600">3: Robusto</span>
                <span className="text-yellow-600">4: Falta ejercicio</span>
                <span className="text-green-600">5: Estandar</span>
                <span className="text-green-600">6: Estandar musculoso</span>
                <span className="text-blue-600">7: Delgado</span>
                <span className="text-blue-600">8: Delgado musculoso</span>
                <span className="text-blue-600">9: Muy musculoso</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
