'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Patient } from '@/types/api';

interface ClinicalNotesTabProps {
  values: {
    motivo: string;
    notasClinicas: string;
    diagnostico: string;
    recomendaciones: string;
  };
  onChange: (field: string, value: string) => void;
  patient?: Patient;
  readOnly?: boolean;
}

export default function ClinicalNotesTab({ values, onChange, patient, readOnly = false }: ClinicalNotesTabProps) {
  return (
    <div className="space-y-6">
      {/* Patient clinical profile (read-only display) */}
      {patient?.perfilClinico && (
        <Card>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Perfil Clinico del Paciente</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {patient.perfilClinico.patologias.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Patologias</p>
                <div className="flex flex-wrap gap-1">
                  {patient.perfilClinico.patologias.map((p) => <Badge key={p} variant="yellow">{p}</Badge>)}
                </div>
              </div>
            )}
            {patient.perfilClinico.sintomas.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Sintomas</p>
                <div className="flex flex-wrap gap-1">
                  {patient.perfilClinico.sintomas.map((s) => <Badge key={s} variant="red">{s}</Badge>)}
                </div>
              </div>
            )}
            {patient.perfilClinico.examenesLaboratorio.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Examenes de Laboratorio</p>
                <div className="flex flex-wrap gap-1">
                  {patient.perfilClinico.examenesLaboratorio.map((e) => <Badge key={e} variant="blue">{e}</Badge>)}
                </div>
              </div>
            )}
            {patient.perfilClinico.alimentosNoTolerables.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Alimentos No Tolerables</p>
                <div className="flex flex-wrap gap-1">
                  {patient.perfilClinico.alimentosNoTolerables.map((a) => <Badge key={a} variant="gray">{a}</Badge>)}
                </div>
              </div>
            )}
            {patient.perfilClinico.vicios.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Vicios</p>
                <div className="flex flex-wrap gap-1">
                  {patient.perfilClinico.vicios.map((v) => <Badge key={v} variant="red">{v}</Badge>)}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Notas de la Consulta</h4>
        <div className="space-y-4">
          <Input
            id="cn-motivo"
            label="Motivo de la Consulta"
            value={values.motivo}
            onChange={(e) => onChange('motivo', e.target.value)}
            disabled={readOnly}
            required
          />
          <Textarea
            id="cn-notas"
            label="Notas Clinicas"
            rows={4}
            value={values.notasClinicas}
            onChange={(e) => onChange('notasClinicas', e.target.value)}
            placeholder="Observaciones durante la consulta..."
            disabled={readOnly}
          />
          <Textarea
            id="cn-diagnostico"
            label="Diagnostico"
            rows={2}
            value={values.diagnostico}
            onChange={(e) => onChange('diagnostico', e.target.value)}
            disabled={readOnly}
          />
          <Textarea
            id="cn-recomendaciones"
            label="Recomendaciones"
            rows={3}
            value={values.recomendaciones}
            onChange={(e) => onChange('recomendaciones', e.target.value)}
            disabled={readOnly}
          />
        </div>
      </Card>
    </div>
  );
}
