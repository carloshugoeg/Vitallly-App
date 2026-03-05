'use client';

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import Button from '@/components/ui/Button';
import { Patient, Anthropometry, NutritionalPlan, Consultation } from '@/data/types';
import { calculateAge, formatDate, formatDateLong } from '@/lib/utils';
import { getIMCClassification } from '@/lib/calculations';
import { classifyBodyFat, classifyVisceralFat, classifyWaterPercentage } from '@/lib/referenceRanges';
import { Printer } from 'lucide-react';

interface PatientReportProps {
  patient: Patient;
  anthropometry: Anthropometry[];
  plans: NutritionalPlan[];
  consultations: Consultation[];
}

export default function PatientReport({ patient, anthropometry, plans, consultations }: PatientReportProps) {
  const sortedAnthro = [...anthropometry].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const latest = sortedAnthro[sortedAnthro.length - 1];
  const first = sortedAnthro[0];
  const latestPlan = [...plans].sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  const edad = calculateAge(patient.fechaNacimiento);

  const weightData = sortedAnthro.map((a) => ({
    fecha: formatDate(a.fecha, 'dd/MM/yy'),
    peso: a.peso,
  }));

  const bmiData = sortedAnthro.map((a) => ({
    fecha: formatDate(a.fecha, 'dd/MM/yy'),
    imc: a.imc,
  }));

  const handlePrint = () => window.print();

  return (
    <div>
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={handlePrint}><Printer size={16} /> Imprimir / Guardar PDF</Button>
      </div>

      <div id="patient-report" className="space-y-6 text-sm">
        {/* Header */}
        <div className="text-center border-b pb-4">
          <h1 className="text-xl font-bold text-primary">Vitally - Clinica de Nutricion</h1>
          <p className="text-gray-500 text-xs mt-1">Reporte generado el {formatDateLong(new Date().toISOString().split('T')[0])}</p>
        </div>

        {/* Patient Info */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3 border-b pb-1">Informacion del Paciente</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <p><span className="text-gray-500">Nombre:</span> {patient.nombre} {patient.apellido}</p>
            <p><span className="text-gray-500">Edad:</span> {edad} anios</p>
            <p><span className="text-gray-500">Genero:</span> {patient.genero === 'F' ? 'Femenino' : 'Masculino'}</p>
            <p><span className="text-gray-500">DPI:</span> {patient.dpi}</p>
            <p><span className="text-gray-500">Telefono:</span> {patient.telefono}</p>
            <p><span className="text-gray-500">Email:</span> {patient.email}</p>
            <p><span className="text-gray-500">Estatura:</span> {patient.perfilClinico.estatura} cm</p>
          </div>
          {patient.antecedentesMedicos.length > 0 && (
            <p className="mt-2"><span className="text-gray-500">Antecedentes Medicos:</span> {patient.antecedentesMedicos.join(', ')}</p>
          )}
          {patient.alergias.length > 0 && (
            <p><span className="text-gray-500">Alergias:</span> {patient.alergias.join(', ')}</p>
          )}
          {patient.medicamentos.length > 0 && (
            <p><span className="text-gray-500">Medicamentos:</span> {patient.medicamentos.join(', ')}</p>
          )}
          {patient.perfilClinico.patologias.length > 0 && (
            <p><span className="text-gray-500">Patologias:</span> {patient.perfilClinico.patologias.join(', ')}</p>
          )}
          {patient.perfilClinico.sintomas.length > 0 && (
            <p><span className="text-gray-500">Sintomas:</span> {patient.perfilClinico.sintomas.join(', ')}</p>
          )}
          {patient.perfilClinico.examenesLaboratorio.length > 0 && (
            <p><span className="text-gray-500">Examenes Lab:</span> {patient.perfilClinico.examenesLaboratorio.join(', ')}</p>
          )}
          {patient.perfilClinico.alimentosNoTolerables.length > 0 && (
            <p><span className="text-gray-500">Alimentos No Tolerables:</span> {patient.perfilClinico.alimentosNoTolerables.join(', ')}</p>
          )}
        </div>

        {/* Progress Summary */}
        {latest && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3 border-b pb-1">Resumen de Progreso</h2>
            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="border rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Peso Actual</p>
                <p className="font-bold">{latest.peso} kg</p>
              </div>
              <div className="border rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Peso Ideal</p>
                <p className="font-bold">{latest.pesoIdeal} kg</p>
              </div>
              <div className="border rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">IMC</p>
                <p className="font-bold" style={{ color: getIMCClassification(latest.imc).color }}>{latest.imc}</p>
                <p className="text-xs text-gray-500">{getIMCClassification(latest.imc).label}</p>
              </div>
              <div className="border rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">% Grasa</p>
                <p className="font-bold" style={{ color: classifyBodyFat(latest.porcentajeGrasa, edad, patient.genero).color }}>{latest.porcentajeGrasa}%</p>
                <p className="text-xs text-gray-500">{classifyBodyFat(latest.porcentajeGrasa, edad, patient.genero).label}</p>
              </div>
              <div className="border rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">G. Visceral</p>
                <p className="font-bold" style={{ color: classifyVisceralFat(latest.grasaVisceral).color }}>{latest.grasaVisceral}</p>
                <p className="text-xs text-gray-500">{classifyVisceralFat(latest.grasaVisceral).label}</p>
              </div>
            </div>

            {sortedAnthro.length >= 2 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-medium mb-2">Cambios desde primera medicion ({formatDate(first.fecha)}):</p>
                <table className="w-full text-xs border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-1 px-2 border-b">Metrica</th>
                      <th className="text-right py-1 px-2 border-b">Inicial</th>
                      <th className="text-right py-1 px-2 border-b">Actual</th>
                      <th className="text-right py-1 px-2 border-b">Cambio</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-1 px-2 border-b">Peso (kg)</td>
                      <td className="text-right py-1 px-2 border-b">{first.peso}</td>
                      <td className="text-right py-1 px-2 border-b">{latest.peso}</td>
                      <td className="text-right py-1 px-2 border-b font-medium" style={{ color: latest.peso <= first.peso ? '#16A34A' : '#DC2626' }}>
                        {(latest.peso - first.peso) > 0 ? '+' : ''}{(latest.peso - first.peso).toFixed(1)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 border-b">IMC</td>
                      <td className="text-right py-1 px-2 border-b">{first.imc}</td>
                      <td className="text-right py-1 px-2 border-b">{latest.imc}</td>
                      <td className="text-right py-1 px-2 border-b font-medium" style={{ color: latest.imc <= first.imc ? '#16A34A' : '#DC2626' }}>
                        {(latest.imc - first.imc) > 0 ? '+' : ''}{(latest.imc - first.imc).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 border-b">% Grasa</td>
                      <td className="text-right py-1 px-2 border-b">{first.porcentajeGrasa}%</td>
                      <td className="text-right py-1 px-2 border-b">{latest.porcentajeGrasa}%</td>
                      <td className="text-right py-1 px-2 border-b font-medium" style={{ color: latest.porcentajeGrasa <= first.porcentajeGrasa ? '#16A34A' : '#DC2626' }}>
                        {(latest.porcentajeGrasa - first.porcentajeGrasa) > 0 ? '+' : ''}{(latest.porcentajeGrasa - first.porcentajeGrasa).toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 border-b">Masa Muscular (kg)</td>
                      <td className="text-right py-1 px-2 border-b">{first.masaMusculo}</td>
                      <td className="text-right py-1 px-2 border-b">{latest.masaMusculo}</td>
                      <td className="text-right py-1 px-2 border-b font-medium" style={{ color: latest.masaMusculo >= first.masaMusculo ? '#16A34A' : '#DC2626' }}>
                        {(latest.masaMusculo - first.masaMusculo) > 0 ? '+' : ''}{(latest.masaMusculo - first.masaMusculo).toFixed(1)} kg
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 border-b">% Agua</td>
                      <td className="text-right py-1 px-2 border-b">{first.porcentajeAgua}%</td>
                      <td className="text-right py-1 px-2 border-b">{latest.porcentajeAgua}%</td>
                      <td className="text-right py-1 px-2 border-b font-medium" style={{ color: latest.porcentajeAgua >= first.porcentajeAgua ? '#16A34A' : '#DC2626' }}>
                        {(latest.porcentajeAgua - first.porcentajeAgua) > 0 ? '+' : ''}{(latest.porcentajeAgua - first.porcentajeAgua).toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2">Grasa Visceral</td>
                      <td className="text-right py-1 px-2">{first.grasaVisceral}</td>
                      <td className="text-right py-1 px-2">{latest.grasaVisceral}</td>
                      <td className="text-right py-1 px-2 font-medium" style={{ color: latest.grasaVisceral <= first.grasaVisceral ? '#16A34A' : '#DC2626' }}>
                        {(latest.grasaVisceral - first.grasaVisceral) > 0 ? '+' : ''}{latest.grasaVisceral - first.grasaVisceral}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Charts */}
            {weightData.length >= 2 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Evolucion de Peso (kg)</p>
                  <LineChart width={250} height={160} data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="peso" stroke="#2D5A3D" strokeWidth={2} dot={{ r: 3, fill: '#2D5A3D' }} name="Peso (kg)" />
                  </LineChart>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Tendencia de IMC</p>
                  <AreaChart width={250} height={160} data={bmiData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} domain={[15, 45]} />
                    <Tooltip />
                    <ReferenceLine y={18.5} stroke="#3B82F6" strokeDasharray="3 3" />
                    <ReferenceLine y={25} stroke="#16A34A" strokeDasharray="3 3" />
                    <ReferenceLine y={30} stroke="#F59E0B" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="imc" stroke="#2D5A3D" fill="#E8F5EC" strokeWidth={2} name="IMC" dot={{ r: 3, fill: '#2D5A3D' }} />
                  </AreaChart>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Meal Plan */}
        {latestPlan && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3 border-b pb-1">Plan Nutricional Actual</h2>
            <p className="mb-1"><span className="text-gray-500">Fecha:</span> {formatDate(latestPlan.fecha)}</p>
            <p className="mb-2"><span className="text-gray-500">Objetivo:</span> {latestPlan.objetivo}</p>
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div className="border rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Calorias</p>
                <p className="font-bold">{latestPlan.caloriasDiarias} kcal</p>
              </div>
              <div className="border rounded-lg p-2 text-center bg-blue-50">
                <p className="text-xs text-blue-600">Proteinas</p>
                <p className="font-bold text-blue-700">{latestPlan.macros.proteinasGramos}g ({latestPlan.macros.proteinasPorcentaje}%)</p>
              </div>
              <div className="border rounded-lg p-2 text-center bg-yellow-50">
                <p className="text-xs text-yellow-600">Carbohidratos</p>
                <p className="font-bold text-yellow-700">{latestPlan.macros.carbohidratosGramos}g ({latestPlan.macros.carbohidratosPorcentaje}%)</p>
              </div>
              <div className="border rounded-lg p-2 text-center bg-red-50">
                <p className="text-xs text-red-600">Grasas</p>
                <p className="font-bold text-red-700">{latestPlan.macros.grasasGramos}g ({latestPlan.macros.grasasPorcentaje}%)</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-1">Comidas:</p>
            {latestPlan.comidas.map((comida, i) => (
              <p key={i} className="text-sm text-gray-600 ml-2">
                <span className="font-medium">{comida.nombre}</span> ({comida.hora}): {comida.descripcion}
              </p>
            ))}
            {latestPlan.restricciones.length > 0 && (
              <p className="mt-2"><span className="text-gray-500">Restricciones:</span> {latestPlan.restricciones.join(', ')}</p>
            )}
            {latestPlan.suplementos.length > 0 && (
              <p><span className="text-gray-500">Suplementos:</span> {latestPlan.suplementos.join(', ')}</p>
            )}
          </div>
        )}

        {/* Consultation History */}
        {consultations.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3 border-b pb-1">Ultimas Consultas</h2>
            {consultations.slice(0, 5).map((c) => (
              <div key={c.id} className="mb-2 pb-2 border-b border-gray-100 last:border-0">
                <p className="font-medium text-gray-800">{formatDate(c.fecha)} — {c.motivo}</p>
                <p className="text-gray-500">Diagnostico: {c.diagnostico}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center border-t pt-4 text-xs text-gray-400">
          <p>Generado el {formatDateLong(new Date().toISOString().split('T')[0])} — Vitally Clinica de Nutricion</p>
        </div>
      </div>
    </div>
  );
}
