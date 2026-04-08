/**
 * Tablas de referencia y clasificaciones antropométricas.
 *
 * Los rangos provienen de la hoja de evaluación en papel de la clínica VITALLY,
 * que a su vez se basa en estándares de bioimpedancia (Tanita/Omron) y OMS.
 * Cada función clasifica un indicador y retorna label + color para la UI.
 */

/** Resultado de clasificación: etiqueta legible y color para indicadores visuales */
type Classification = { label: string; color: string };

/**
 * Rangos de % de grasa corporal por grupo etario para mujeres.
 * Los umbrales varían con la edad porque la composición corporal cambia naturalmente.
 */
const BODY_FAT_RANGES_FEMALE = [
  { ageMin: 20, ageMax: 39, bajo: [0, 21], saludable: [21, 33], alto: [33, 39], obeso: [39, 100] },
  { ageMin: 40, ageMax: 59, bajo: [0, 23], saludable: [23, 34], alto: [34, 40], obeso: [40, 100] },
  { ageMin: 60, ageMax: 79, bajo: [0, 24], saludable: [24, 36], alto: [36, 42], obeso: [42, 100] },
];

/** Rangos de % de grasa corporal por grupo etario para hombres. */
const BODY_FAT_RANGES_MALE = [
  { ageMin: 20, ageMax: 39, bajo: [0, 8], saludable: [8, 20], alto: [20, 25], obeso: [25, 100] },
  { ageMin: 40, ageMax: 59, bajo: [0, 11], saludable: [11, 22], alto: [22, 28], obeso: [28, 100] },
  { ageMin: 60, ageMax: 79, bajo: [0, 13], saludable: [13, 25], alto: [25, 30], obeso: [30, 100] },
];

/**
 * Clasifica el porcentaje de grasa corporal según edad y género.
 * Para edades fuera de rango, usa el último grupo etario como aproximación.
 */
export function classifyBodyFat(porcentaje: number, edad: number, genero: 'M' | 'F'): Classification {
  const ranges = genero === 'F' ? BODY_FAT_RANGES_FEMALE : BODY_FAT_RANGES_MALE;
  const ageRange = ranges.find(r => edad >= r.ageMin && edad <= r.ageMax) || ranges[ranges.length - 1];

  if (porcentaje < ageRange.bajo[1]) return { label: 'Bajo en grasa', color: '#3B82F6' };
  if (porcentaje < ageRange.saludable[1]) return { label: 'Saludable', color: '#16A34A' };
  if (porcentaje < ageRange.alto[1]) return { label: 'Alto en grasa', color: '#F59E0B' };
  return { label: 'Obeso', color: '#DC2626' };
}

/**
 * Escala de valoración física del 1 al 9 (usada por básculas de bioimpedancia).
 * Combina el % de grasa con la masa muscular para dar un perfil de complexión corporal.
 */
const PHYSICAL_ASSESSMENT_LABELS: Record<number, string> = {
  1: 'Obesidad oculta (mucha grasa, poca masa muscular)',
  2: 'Obeso',
  3: 'Complexión robusta (mucha grasa y masa muscular)',
  4: 'Falta de ejercicio',
  5: 'Estándar',
  6: 'Estándar musculoso',
  7: 'Delgado',
  8: 'Delgado y musculoso',
  9: 'Muy musculoso',
};

/**
 * Clasifica la valoración física (escala 1-9).
 * Valores 1-2 = alerta, 3-4 = precaución, 5-6 = saludable, 7-9 = bajo en grasa / musculoso.
 */
export function classifyPhysicalAssessment(value: number): Classification {
  const clamped = Math.min(9, Math.max(1, Math.round(value)));
  if (clamped <= 2) return { label: PHYSICAL_ASSESSMENT_LABELS[clamped], color: '#DC2626' };
  if (clamped <= 4) return { label: PHYSICAL_ASSESSMENT_LABELS[clamped], color: '#F59E0B' };
  if (clamped <= 6) return { label: PHYSICAL_ASSESSMENT_LABELS[clamped], color: '#16A34A' };
  return { label: PHYSICAL_ASSESSMENT_LABELS[clamped], color: '#3B82F6' };
}

/**
 * Clasifica la masa ósea (kg) según peso corporal y género.
 * Los rangos normales aumentan con el peso porque un esqueleto más grande soporta más masa.
 * Umbrales basados en tablas de referencia de bioimpedancia Tanita.
 */
export function classifyBoneMass(masaOsea: number, peso: number, genero: 'M' | 'F'): Classification {
  if (genero === 'F') {
    if (peso < 50) {
      if (masaOsea < 1.8) return { label: 'Bajo', color: '#DC2626' };
      if (masaOsea <= 2.5) return { label: 'Normal', color: '#16A34A' };
      return { label: 'Alto', color: '#3B82F6' };
    }
    if (peso <= 75) {
      if (masaOsea < 2.2) return { label: 'Bajo', color: '#DC2626' };
      if (masaOsea <= 3.0) return { label: 'Normal', color: '#16A34A' };
      return { label: 'Alto', color: '#3B82F6' };
    }
    if (masaOsea < 2.5) return { label: 'Bajo', color: '#DC2626' };
    if (masaOsea <= 3.2) return { label: 'Normal', color: '#16A34A' };
    return { label: 'Alto', color: '#3B82F6' };
  }
  // Hombre
  if (peso < 65) {
    if (masaOsea < 2.0) return { label: 'Bajo', color: '#DC2626' };
    if (masaOsea <= 2.8) return { label: 'Normal', color: '#16A34A' };
    return { label: 'Alto', color: '#3B82F6' };
  }
  if (peso <= 95) {
    if (masaOsea < 2.5) return { label: 'Bajo', color: '#DC2626' };
    if (masaOsea <= 3.3) return { label: 'Normal', color: '#16A34A' };
    return { label: 'Alto', color: '#3B82F6' };
  }
  if (masaOsea < 3.0) return { label: 'Bajo', color: '#DC2626' };
  if (masaOsea <= 3.7) return { label: 'Normal', color: '#16A34A' };
  return { label: 'Alto', color: '#3B82F6' };
}

/**
 * Clasifica el porcentaje de agua corporal.
 * Mujeres: normal 45-60%, Hombres: normal 50-65%.
 * Las mujeres tienen naturalmente menor % de agua por mayor proporción de tejido graso.
 */
export function classifyWaterPercentage(porcentaje: number, genero: 'M' | 'F'): Classification {
  if (genero === 'F') {
    if (porcentaje < 45) return { label: 'Bajo', color: '#DC2626' };
    if (porcentaje <= 60) return { label: 'Normal', color: '#16A34A' };
    return { label: 'Alto', color: '#3B82F6' };
  }
  if (porcentaje < 50) return { label: 'Bajo', color: '#DC2626' };
  if (porcentaje <= 65) return { label: 'Normal', color: '#16A34A' };
  return { label: 'Alto', color: '#3B82F6' };
}

/**
 * Clasifica la grasa visceral (escala de bioimpedancia, sin unidad).
 * Valores hasta 12 = saludable, >12 = exceso con riesgo cardiovascular.
 */
export function classifyVisceralFat(value: number): Classification {
  if (value <= 12) return { label: 'Saludable', color: '#16A34A' };
  return { label: 'Exceso', color: '#DC2626' };
}

/**
 * Calcula el peso ideal con la fórmula de Lorentz.
 * Hombres: talla - 100 - (talla - 150) / 4
 * Mujeres: talla - 100 - (talla - 150) / 2.5
 * Es una aproximación rápida; no reemplaza la evaluación clínica completa.
 */
export function calculatePesoIdeal(tallaCm: number, genero: 'M' | 'F'): number {
  const t = tallaCm;
  if (genero === 'M') {
    return Number((t - 100 - (t - 150) / 4).toFixed(1));
  }
  return Number((t - 100 - (t - 150) / 2.5).toFixed(1));
}

/**
 * Calcula el Índice Cintura/Cadera (ICC).
 * Indicador de distribución de grasa: valores altos sugieren grasa abdominal (androide).
 */
export function calculateIndiceCinturaCadera(cintura: number, cadera: number): number {
  if (cadera === 0) return 0;
  return Number((cintura / cadera).toFixed(2));
}

/**
 * Clasifica el ICC según umbrales de riesgo cardiovascular por género (OMS).
 * Hombres: <0.90 normal, 0.90-0.99 riesgo moderado, >=1.0 riesgo alto.
 * Mujeres: <0.80 normal, 0.80-0.84 riesgo moderado, >=0.85 riesgo alto.
 */
export function classifyICC(icc: number, genero: 'M' | 'F'): Classification {
  if (genero === 'M') {
    if (icc < 0.90) return { label: 'Normal', color: '#16A34A' };
    if (icc <= 0.99) return { label: 'Riesgo moderado', color: '#F59E0B' };
    return { label: 'Riesgo alto', color: '#DC2626' };
  }
  if (icc < 0.80) return { label: 'Normal', color: '#16A34A' };
  if (icc <= 0.84) return { label: 'Riesgo moderado', color: '#F59E0B' };
  return { label: 'Riesgo alto', color: '#DC2626' };
}
