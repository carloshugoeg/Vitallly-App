'use client';

import Card from '@/components/ui/Card';
import { Anthropometry } from '@/data/types';
import { formatDate } from '@/lib/utils';
import { getIMCClassification } from '@/lib/calculations';
import {
  classifyBodyFat,
  classifyVisceralFat,
  classifyWaterPercentage,
  classifyBoneMass,
  classifyPhysicalAssessment,
  calculateIndiceCinturaCadera,
  classifyICC,
} from '@/lib/referenceRanges';

interface MeasurementHistoryTableProps {
  data: Anthropometry[];
  genero: 'M' | 'F';
  edad: number;
}

function ColorCell({ value, unit, color }: { value: number | string; unit?: string; color?: string }) {
  return (
    <td className="py-2 px-2 text-right text-xs">
      <span style={color ? { color } : undefined} className="font-medium">
        {value}{unit}
      </span>
    </td>
  );
}

export default function MeasurementHistoryTable({ data, genero, edad }: MeasurementHistoryTableProps) {
  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-4">Historial Antropometrico</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 font-medium text-gray-500">Fecha</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">Peso</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">P. Ideal</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">IMC</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">% Grasa</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">% Agua</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">M. Musc.</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">V. Fis.</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">M. Osea</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">DCI</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">E. Met.</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">G. Visc.</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">Cintura</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">Cadera</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">ICC</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => {
              const imcC = getIMCClassification(a.imc);
              const fatC = classifyBodyFat(a.porcentajeGrasa, edad, genero);
              const waterC = classifyWaterPercentage(a.porcentajeAgua, genero);
              const physC = classifyPhysicalAssessment(a.valoracionFisica);
              const boneC = classifyBoneMass(a.masaOsea, a.peso, genero);
              const viscC = classifyVisceralFat(a.grasaVisceral);
              const icc = calculateIndiceCinturaCadera(a.circunferenciaCintura, a.circunferenciaCadera);
              const iccC = icc > 0 ? classifyICC(icc, genero) : null;

              return (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-2 text-gray-600 whitespace-nowrap">{formatDate(a.fecha)}</td>
                  <ColorCell value={a.peso} unit=" kg" />
                  <ColorCell value={a.pesoIdeal} unit=" kg" />
                  <ColorCell value={a.imc} color={imcC.color} />
                  <ColorCell value={a.porcentajeGrasa} unit="%" color={fatC.color} />
                  <ColorCell value={a.porcentajeAgua} unit="%" color={waterC.color} />
                  <ColorCell value={a.masaMusculo} unit=" kg" />
                  <ColorCell value={a.valoracionFisica} color={physC.color} />
                  <ColorCell value={a.masaOsea} unit=" kg" color={boneC.color} />
                  <ColorCell value={a.dci} unit=" kcal" />
                  <ColorCell value={a.edadMetabolica} />
                  <ColorCell value={a.grasaVisceral} color={viscC.color} />
                  <ColorCell value={a.circunferenciaCintura} unit=" cm" />
                  <ColorCell value={a.circunferenciaCadera} unit=" cm" />
                  <ColorCell value={icc || '--'} color={iccC?.color} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
