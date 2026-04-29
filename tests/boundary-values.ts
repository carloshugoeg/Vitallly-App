/**
 * Análisis de valores frontera (Boundary Value Analysis).
 *
 * La evidencia empírica muestra que los defectos se concentran en los
 * bordes de las particiones: confusiones entre '<' y '<=', intervalos
 * abiertos vs cerrados, desbordamientos, división por cero.
 *
 * Técnica: por cada frontera crítica probamos tres puntos
 *   · justo antes    (borde − ε)
 *   · en el borde    (borde)
 *   · justo después  (borde + ε)
 * y verificamos que la clasificación cambia donde debe y solo donde debe.
 *
 * Ejecutar:  npx tsx tests/boundary-values.ts
 */

import {
  getIMCClassification,
  calculateIMC,
} from '../src/lib/calculations';
import {
  classifyICC,
  classifyVisceralFat,
  calculateIndiceCinturaCadera,
} from '../src/lib/referenceRanges';
import { c, header, section, info, runCase, summary } from './_runner';

const t0 = performance.now();
let total = 0;
let pass = 0;

function track(r: { pass: boolean }): void {
  total++;
  if (r.pass) pass++;
}

header(
  'ANÁLISIS DE VALORES FRONTERA',
  'Detectar errores off-by-one y asegurar que las transiciones entre clases ocurren donde deben.',
  'Por cada borde se prueban 3 puntos: borde−ε, borde, borde+ε.'
);

// ─── IMC ───────────────────────────────────────────────────────────────
section('Fronteras IMC · transición 24.9 → 25.0 (Normal → Sobrepeso)');
info('Epsilon de prueba: 0.01 (dos decimales, alineado con la precisión del cálculo).');

track(
  runCase({
    nombre: 'IMC 24.89 (antes del borde)',
    entrada: 24.89,
    esperado: 'Normal',
    fn: () => getIMCClassification(24.89).label,
  })
);
track(
  runCase({
    nombre: 'IMC 24.9  (en el borde superior de Normal)',
    entrada: 24.9,
    esperado: 'Normal',
    fn: () => getIMCClassification(24.9).label,
  })
);
track(
  runCase({
    nombre: 'IMC 25.0  (en el borde inferior de Sobrepeso)',
    entrada: 25.0,
    esperado: 'Sobrepeso',
    fn: () => getIMCClassification(25.0).label,
  })
);
track(
  runCase({
    nombre: 'IMC 25.01 (después del borde)',
    entrada: 25.01,
    esperado: 'Sobrepeso',
    fn: () => getIMCClassification(25.01).label,
  })
);

section('Fronteras IMC · transición 29.9 → 30.0 (Sobrepeso → Obesidad I)');
track(
  runCase({
    nombre: 'IMC 29.89',
    entrada: 29.89,
    esperado: 'Sobrepeso',
    fn: () => getIMCClassification(29.89).label,
  })
);
track(
  runCase({
    nombre: 'IMC 29.9',
    entrada: 29.9,
    esperado: 'Sobrepeso',
    fn: () => getIMCClassification(29.9).label,
  })
);
track(
  runCase({
    nombre: 'IMC 30.0',
    entrada: 30.0,
    esperado: 'Obesidad grado I',
    fn: () => getIMCClassification(30.0).label,
  })
);

section('Fronteras IMC · transición 39.9 → 40.0 (Obesidad II → III)');
track(
  runCase({
    nombre: 'IMC 39.9',
    entrada: 39.9,
    esperado: 'Obesidad grado II',
    fn: () => getIMCClassification(39.9).label,
  })
);
track(
  runCase({
    nombre: 'IMC 40.0',
    entrada: 40.0,
    esperado: 'Obesidad grado III',
    fn: () => getIMCClassification(40.0).label,
  })
);
track(
  runCase({
    nombre: 'IMC 55.0 (muy por encima → Obesidad III)',
    entrada: 55.0,
    esperado: 'Obesidad grado III',
    fn: () => getIMCClassification(55.0).label,
  })
);

// ─── ICC Hombres ───────────────────────────────────────────────────────
section('Fronteras ICC Hombres · umbral 0.90 (Normal → Riesgo moderado)');
info('Código: if (icc < 0.90) → Normal. Importante: 0.90 NO es Normal.');

track(
  runCase({
    nombre: 'ICC 0.89 (Normal)',
    entrada: 0.89,
    esperado: 'Normal',
    fn: () => classifyICC(0.89, 'M').label,
  })
);
track(
  runCase({
    nombre: 'ICC 0.90 (transición estricta)',
    entrada: 0.90,
    esperado: 'Riesgo moderado',
    fn: () => classifyICC(0.90, 'M').label,
  })
);
track(
  runCase({
    nombre: 'ICC 0.91',
    entrada: 0.91,
    esperado: 'Riesgo moderado',
    fn: () => classifyICC(0.91, 'M').label,
  })
);

section('Fronteras ICC Hombres · umbral 1.00 (moderado → alto)');
track(
  runCase({
    nombre: 'ICC 0.99 (último valor moderado)',
    entrada: 0.99,
    esperado: 'Riesgo moderado',
    fn: () => classifyICC(0.99, 'M').label,
  })
);
track(
  runCase({
    nombre: 'ICC 1.00 (salto a Riesgo alto)',
    entrada: 1.00,
    esperado: 'Riesgo alto',
    fn: () => classifyICC(1.00, 'M').label,
  })
);

// ─── ICC Mujeres ───────────────────────────────────────────────────────
section('Fronteras ICC Mujeres · umbrales 0.80 y 0.85');
track(
  runCase({
    nombre: 'ICC 0.79 (Normal)',
    entrada: 0.79,
    esperado: 'Normal',
    fn: () => classifyICC(0.79, 'F').label,
  })
);
track(
  runCase({
    nombre: 'ICC 0.80 (transición a moderado)',
    entrada: 0.80,
    esperado: 'Riesgo moderado',
    fn: () => classifyICC(0.80, 'F').label,
  })
);
track(
  runCase({
    nombre: 'ICC 0.84 (último moderado)',
    entrada: 0.84,
    esperado: 'Riesgo moderado',
    fn: () => classifyICC(0.84, 'F').label,
  })
);
track(
  runCase({
    nombre: 'ICC 0.85 (salto a alto)',
    entrada: 0.85,
    esperado: 'Riesgo alto',
    fn: () => classifyICC(0.85, 'F').label,
  })
);

// ─── Grasa visceral ────────────────────────────────────────────────────
section('Fronteras grasa visceral · umbral 12 (Saludable → Exceso)');
info('Código: if (value <= 12) → Saludable. El 12 SÍ es saludable (borde incluido).');

track(
  runCase({
    nombre: 'Visceral 11',
    entrada: 11,
    esperado: 'Saludable',
    fn: () => classifyVisceralFat(11).label,
  })
);
track(
  runCase({
    nombre: 'Visceral 12 (borde incluido)',
    entrada: 12,
    esperado: 'Saludable',
    fn: () => classifyVisceralFat(12).label,
  })
);
track(
  runCase({
    nombre: 'Visceral 13',
    entrada: 13,
    esperado: 'Exceso',
    fn: () => classifyVisceralFat(13).label,
  })
);

// ─── División por cero ─────────────────────────────────────────────────
section('Valor excepcional · división por cero en ICC');
info('Si la cadera no se midió (cadera = 0), la función debe retornar 0, no NaN ni ∞.');

track(
  runCase({
    nombre: 'ICC con cadera = 0 (defensivo)',
    entrada: { cintura: 85, cadera: 0 },
    esperado: 0,
    fn: () => calculateIndiceCinturaCadera(85, 0),
  })
);
track(
  runCase({
    nombre: 'ICC con cadera normal',
    entrada: { cintura: 85, cadera: 100 },
    esperado: 0.85,
    fn: () => calculateIndiceCinturaCadera(85, 100),
  })
);

// ─── Redondeo IMC ──────────────────────────────────────────────────────
section('Redondeo · IMC siempre con 2 decimales');
info('El sistema usa toFixed(2). Un valor con 4 decimales debe recortarse consistentemente.');

track(
  runCase({
    nombre: 'IMC 70kg/175cm → 22.86 (no 22.857...)',
    entrada: { peso: 70, talla: 175 },
    esperado: 22.86,
    fn: () => calculateIMC(70, 175),
  })
);

summary({
  total,
  pass,
  fail: total - pass,
  durationMs: performance.now() - t0,
});
