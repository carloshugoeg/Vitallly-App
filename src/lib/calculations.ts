import { IMC_CLASSIFICATIONS, ACTIVITY_LEVELS } from './constants';

export function calculateIMC(peso: number, tallaCm: number): number {
  const tallaM = tallaCm / 100;
  return Number((peso / (tallaM * tallaM)).toFixed(2));
}

export function getIMCClassification(imc: number) {
  return IMC_CLASSIFICATIONS.find(c => imc >= c.min && imc <= c.max) || IMC_CLASSIFICATIONS[5];
}

export function calculateTMBHarrisBenedict(
  peso: number,
  tallaCm: number,
  edad: number,
  genero: 'M' | 'F'
): number {
  if (genero === 'M') {
    return 88.362 + 13.397 * peso + 4.799 * tallaCm - 5.677 * edad;
  }
  return 447.593 + 9.247 * peso + 3.098 * tallaCm - 4.33 * edad;
}

export function calculateTMBMifflinStJeor(
  peso: number,
  tallaCm: number,
  edad: number,
  genero: 'M' | 'F'
): number {
  if (genero === 'M') {
    return 10 * peso + 6.25 * tallaCm - 5 * edad + 5;
  }
  return 10 * peso + 6.25 * tallaCm - 5 * edad - 161;
}

export function calculateGET(
  tmb: number,
  nivelActividad: keyof typeof ACTIVITY_LEVELS
): number {
  return Number((tmb * ACTIVITY_LEVELS[nivelActividad].factor).toFixed(0));
}

export function calculateMacrosGrams(
  caloriasTotales: number,
  proteinasPct: number,
  carbohidratosPct: number,
  grasasPct: number
) {
  return {
    proteinasGramos: Number(((caloriasTotales * proteinasPct / 100) / 4).toFixed(1)),
    carbohidratosGramos: Number(((caloriasTotales * carbohidratosPct / 100) / 4).toFixed(1)),
    grasasGramos: Number(((caloriasTotales * grasasPct / 100) / 9).toFixed(1)),
  };
}
