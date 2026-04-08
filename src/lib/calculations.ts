/**
 * Funciones de cálculo nutricional y antropométrico.
 *
 * Implementa las fórmulas estándar utilizadas en la consulta nutricional:
 * IMC (OMS), TMB (Harris-Benedict y Mifflin-St Jeor), GET y distribución
 * de macronutrientes. Estas fórmulas son las mismas que la nutricionista
 * usa en sus hojas de cálculo manuales.
 */

import { IMC_CLASSIFICATIONS, ACTIVITY_LEVELS } from './constants';
export { calculatePesoIdeal, calculateIndiceCinturaCadera } from './referenceRanges';

/**
 * Calcula el Índice de Masa Corporal (IMC).
 * Fórmula OMS: peso(kg) / talla(m)^2
 */
export function calculateIMC(peso: number, tallaCm: number): number {
  const tallaM = tallaCm / 100;
  return Number((peso / (tallaM * tallaM)).toFixed(2));
}

/**
 * Obtiene la clasificación OMS del IMC (bajo peso, normal, sobrepeso, obesidad I-III).
 * Si no se encuentra rango, retorna la última clasificación (obesidad III) como fallback.
 */
export function getIMCClassification(imc: number) {
  return IMC_CLASSIFICATIONS.find(c => imc >= c.min && imc <= c.max) || IMC_CLASSIFICATIONS[5];
}

/**
 * Calcula la Tasa Metabólica Basal con la ecuación de Harris-Benedict (1919, revisada 1984).
 * Hombres: 88.362 + (13.397 x peso) + (4.799 x talla) - (5.677 x edad)
 * Mujeres: 447.593 + (9.247 x peso) + (3.098 x talla) - (4.33 x edad)
 * Resultado en kcal/día. Menos precisa que Mifflin-St Jeor pero aún muy usada en la práctica.
 */
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

/**
 * Calcula la Tasa Metabólica Basal con la ecuación de Mifflin-St Jeor (1990).
 * Hombres: (10 x peso) + (6.25 x talla) - (5 x edad) + 5
 * Mujeres: (10 x peso) + (6.25 x talla) - (5 x edad) - 161
 * Considerada más precisa que Harris-Benedict para poblaciones actuales.
 */
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

/**
 * Calcula el Gasto Energético Total (GET) multiplicando la TMB por el factor de actividad.
 * GET = TMB x factor de actividad física. Resultado en kcal/día.
 */
export function calculateGET(
  tmb: number,
  nivelActividad: keyof typeof ACTIVITY_LEVELS
): number {
  return Number((tmb * ACTIVITY_LEVELS[nivelActividad].factor).toFixed(0));
}

/**
 * Convierte porcentajes de macronutrientes a gramos diarios.
 * Usa los factores Atwater: proteínas y carbohidratos = 4 kcal/g, grasas = 9 kcal/g.
 */
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
