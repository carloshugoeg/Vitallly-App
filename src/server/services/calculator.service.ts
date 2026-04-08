import 'server-only';

import { prisma } from '@/server/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import {
  calculateIMC,
  getIMCClassification,
  calculateTMBHarrisBenedict,
  calculateTMBMifflinStJeor,
  calculateGET,
  calculateMacrosGrams,
} from '@/lib/calculations';
import { ACTIVITY_LEVELS } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalculateParams {
  peso: number;
  tallaCm: number;
  edad: number;
  genero: 'M' | 'F';
  nivelActividad: keyof typeof ACTIVITY_LEVELS;
  formula?: 'harris_benedict' | 'mifflin_st_jeor';
  proteinasPct?: number;
  carbohidratosPct?: number;
  grasasPct?: number;
}

interface SaveToPatientData {
  pacienteId: string;
  calculatorResults: {
    caloriasDiarias: number;
    proteinasPorcentaje: number;
    carbohidratosPorcentaje: number;
    grasasPorcentaje: number;
    proteinasGramos: number;
    carbohidratosGramos: number;
    grasasGramos: number;
  };
  objetivo?: string;
  comidas?: { nombre: string; hora: string; descripcion: string }[];
  restricciones?: string[];
  suplementos?: string[];
  notas?: string;
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Run all nutritional calculations based on the given parameters.
 */
export function calculate(params: CalculateParams) {
  const {
    peso,
    tallaCm,
    edad,
    genero,
    nivelActividad,
    formula = 'harris_benedict',
    proteinasPct = 30,
    carbohidratosPct = 40,
    grasasPct = 30,
  } = params;

  const imc = calculateIMC(peso, tallaCm);
  const imcClassification = getIMCClassification(imc);

  const tmb =
    formula === 'mifflin_st_jeor'
      ? calculateTMBMifflinStJeor(peso, tallaCm, edad, genero)
      : calculateTMBHarrisBenedict(peso, tallaCm, edad, genero);

  const get = calculateGET(tmb, nivelActividad);

  const macrosGrams = calculateMacrosGrams(get, proteinasPct, carbohidratosPct, grasasPct);

  return {
    imc,
    imcClassification,
    tmb: Number(tmb.toFixed(0)),
    get,
    caloriasDiarias: get,
    macros: {
      proteinasPorcentaje: proteinasPct,
      carbohidratosPorcentaje: carbohidratosPct,
      grasasPorcentaje: grasasPct,
      proteinasGramos: macrosGrams.proteinasGramos,
      carbohidratosGramos: macrosGrams.carbohidratosGramos,
      grasasGramos: macrosGrams.grasasGramos,
    },
  };
}

/**
 * Save calculator results as a new standalone NutritionalPlan for a patient.
 */
export async function saveToPatient(tenantId: string, data: SaveToPatientData) {
  const today = new Date().toISOString().split('T')[0]; // yyyy-MM-dd

  const plan = await prisma.nutritionalPlan.create({
    data: {
      tenantId,
      pacienteId: data.pacienteId,
      consultaId: null,
      fecha: today,
      objetivo: data.objetivo ?? '',
      caloriasDiarias: data.calculatorResults.caloriasDiarias,
      proteinasPorcentaje: data.calculatorResults.proteinasPorcentaje,
      carbohidratosPorcentaje: data.calculatorResults.carbohidratosPorcentaje,
      grasasPorcentaje: data.calculatorResults.grasasPorcentaje,
      proteinasGramos: data.calculatorResults.proteinasGramos,
      carbohidratosGramos: data.calculatorResults.carbohidratosGramos,
      grasasGramos: data.calculatorResults.grasasGramos,
      comidas: (data.comidas ?? []) as Prisma.InputJsonValue,
      restricciones: data.restricciones ?? [],
      suplementos: data.suplementos ?? [],
      notas: data.notas ?? '',
    },
  });

  return plan;
}
