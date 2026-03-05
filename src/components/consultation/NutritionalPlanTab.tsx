'use client';

import NutritionalPlanForm from '@/components/patients/NutritionalPlanForm';
import Card from '@/components/ui/Card';
import { NutritionalPlan } from '@/data/types';

interface NutritionalPlanTabProps {
  pacienteId: string;
  onSave: (plan: NutritionalPlan) => void;
  skipLabel?: string;
  onSkip?: () => void;
}

export default function NutritionalPlanTab({ pacienteId, onSave, skipLabel, onSkip }: NutritionalPlanTabProps) {
  return (
    <div className="space-y-4">
      {onSkip && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-700">Si no desea crear un plan nutricional en esta consulta, puede omitir este paso.</p>
            <button
              type="button"
              onClick={onSkip}
              className="text-sm font-medium text-blue-700 hover:text-blue-900 underline"
            >
              {skipLabel || 'Omitir'}
            </button>
          </div>
        </Card>
      )}
      <NutritionalPlanForm
        pacienteId={pacienteId}
        onSave={onSave}
        onCancel={onSkip || (() => {})}
      />
    </div>
  );
}
