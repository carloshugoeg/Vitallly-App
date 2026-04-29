/**
 * Pruebas unitarias sobre los cálculos nutricionales puros.
 * Cada caso verifica la salida del sistema contra un valor de referencia
 * calculado a mano con la fórmula documentada en el código.
 *
 * Ejecutar:  npx tsx tests/unit-calculations.ts
 */

import {
  calculateIMC,
  getIMCClassification,
  calculateTMBHarrisBenedict,
  calculateTMBMifflinStJeor,
  calculateGET,
  calculateMacrosGrams,
} from '../src/lib/calculations';
import {
  c,
  header,
  section,
  info,
  runCase,
  runCaseNear,
  summary,
} from './_runner';

const t0 = performance.now();
let total = 0;
let pass = 0;

function track(result: { pass: boolean }): void {
  total++;
  if (result.pass) pass++;
}

header(
  'PRUEBAS UNITARIAS — Cálculos nutricionales',
  'Verificar que las fórmulas del dominio (IMC, TMB, GET, macros) producen los valores esperados.',
  'Para cada caso se compara la salida del sistema contra un valor de referencia calculado a mano.'
);

// ─── IMC ───────────────────────────────────────────────────────────────
section('1. IMC — Índice de Masa Corporal (fórmula OMS: peso / talla²)');
info('IMC es una función pura, determinista, con salida redondeada a 2 decimales.');

track(
  runCase({
    nombre: 'IMC hombre adulto normal',
    entrada: { peso: 70, talla: 175 },
    esperado: 22.86,
    fn: () => calculateIMC(70, 175),
  })
);

track(
  runCase({
    nombre: 'IMC mujer adulta normal',
    entrada: { peso: 55, talla: 160 },
    esperado: 21.48,
    fn: () => calculateIMC(55, 160),
  })
);

track(
  runCase({
    nombre: 'IMC paciente con obesidad II',
    entrada: { peso: 110, talla: 170 },
    esperado: 38.06,
    fn: () => calculateIMC(110, 170),
  })
);

track(
  runCase({
    nombre: 'IMC delgadez severa',
    entrada: { peso: 42, talla: 170 },
    esperado: 14.53,
    fn: () => calculateIMC(42, 170),
  })
);

// ─── Clasificación IMC ─────────────────────────────────────────────────
section('2. Clasificación OMS del IMC');
info('Cada rango del IMC mapea a una etiqueta diagnóstica estándar OMS.');

track(
  runCase({
    nombre: 'Clasificación IMC = 22.86 → Normal',
    entrada: 22.86,
    esperado: 'Normal',
    fn: () => getIMCClassification(22.86).label,
  })
);

track(
  runCase({
    nombre: 'Clasificación IMC = 38.06 → Obesidad grado II',
    entrada: 38.06,
    esperado: 'Obesidad grado II',
    fn: () => getIMCClassification(38.06).label,
  })
);

// ─── TMB Harris-Benedict ───────────────────────────────────────────────
section('3. TMB — Tasa Metabólica Basal (Harris-Benedict 1919)');
info('Fórmula hombres: 88.362 + 13.397·peso + 4.799·talla − 5.677·edad');
info('Fórmula mujeres: 447.593 + 9.247·peso + 3.098·talla − 4.33·edad');

track(
  runCaseNear({
    nombre: 'TMB-HB hombre 70kg/175cm/30a',
    entrada: { peso: 70, talla: 175, edad: 30, genero: 'M' },
    esperado: 1695.667,
    tolerancia: 0.01,
    fn: () => calculateTMBHarrisBenedict(70, 175, 30, 'M'),
  })
);

track(
  runCaseNear({
    nombre: 'TMB-HB mujer 55kg/160cm/25a',
    entrada: { peso: 55, talla: 160, edad: 25, genero: 'F' },
    esperado: 1343.608,
    tolerancia: 0.01,
    fn: () => calculateTMBHarrisBenedict(55, 160, 25, 'F'),
  })
);

// ─── TMB Mifflin-St Jeor ───────────────────────────────────────────────
section('4. TMB — Mifflin-St Jeor (1990, más precisa)');
info('Comparamos el mismo paciente con ambas fórmulas; la diferencia típica ronda los 40-60 kcal.');

track(
  runCaseNear({
    nombre: 'TMB-MSJ hombre 70kg/175cm/30a',
    entrada: { peso: 70, talla: 175, edad: 30, genero: 'M' },
    esperado: 1648.75,
    tolerancia: 0.01,
    fn: () => calculateTMBMifflinStJeor(70, 175, 30, 'M'),
  })
);

track(
  runCaseNear({
    nombre: 'TMB-MSJ mujer 55kg/160cm/25a',
    entrada: { peso: 55, talla: 160, edad: 25, genero: 'F' },
    esperado: 1264,
    tolerancia: 0.01,
    fn: () => calculateTMBMifflinStJeor(55, 160, 25, 'F'),
  })
);

const hb = calculateTMBHarrisBenedict(70, 175, 30, 'M');
const msj = calculateTMBMifflinStJeor(70, 175, 30, 'M');
console.log();
console.log(
  `  ${c.gray}Δ fórmulas (mismo paciente):${c.reset} HB = ${hb.toFixed(1)}  MSJ = ${msj.toFixed(1)}  ${c.yellow}diferencia = ${(hb - msj).toFixed(1)} kcal${c.reset}`
);

// ─── GET ───────────────────────────────────────────────────────────────
section('5. GET — Gasto Energético Total (TMB × factor de actividad)');
info('Los 5 factores OMS (PAL) cubren desde sedentario (1.2) hasta muy activo (1.9).');
info('Usamos TMB = 1600 kcal para obtener múltiplos enteros limpios y comparables.');

track(
  runCase({
    nombre: 'GET sedentario (×1.2)',
    entrada: { tmb: 1600, nivel: 'sedentario' },
    esperado: 1920,
    fn: () => calculateGET(1600, 'sedentario'),
  })
);
track(
  runCase({
    nombre: 'GET ligero (×1.375)',
    entrada: { tmb: 1600, nivel: 'ligero' },
    esperado: 2200,
    fn: () => calculateGET(1600, 'ligero'),
  })
);
track(
  runCase({
    nombre: 'GET moderado (×1.55)',
    entrada: { tmb: 1600, nivel: 'moderado' },
    esperado: 2480,
    fn: () => calculateGET(1600, 'moderado'),
  })
);
track(
  runCase({
    nombre: 'GET activo (×1.725)',
    entrada: { tmb: 1600, nivel: 'activo' },
    esperado: 2760,
    fn: () => calculateGET(1600, 'activo'),
  })
);
track(
  runCase({
    nombre: 'GET muy activo (×1.9)',
    entrada: { tmb: 1600, nivel: 'muy_activo' },
    esperado: 3040,
    fn: () => calculateGET(1600, 'muy_activo'),
  })
);

// ─── Macros ────────────────────────────────────────────────────────────
section('6. Distribución de macronutrientes (factores Atwater)');
info('Proteínas y carbohidratos = 4 kcal/g; grasas = 9 kcal/g.');
info('Plan típico 30/40/30 sobre 2000 kcal debe repartirse en 150 / 200 / 66.7 g.');

track(
  runCase({
    nombre: 'Macros 2000 kcal, 30/40/30',
    entrada: { calorias: 2000, p: 30, c: 40, g: 30 },
    esperado: { proteinasGramos: 150, carbohidratosGramos: 200, grasasGramos: 66.7 },
    fn: () => calculateMacrosGrams(2000, 30, 40, 30),
  })
);

track(
  runCase({
    nombre: 'Macros 1500 kcal, 25/50/25',
    entrada: { calorias: 1500, p: 25, c: 50, g: 25 },
    esperado: { proteinasGramos: 93.8, carbohidratosGramos: 187.5, grasasGramos: 41.7 },
    fn: () => calculateMacrosGrams(1500, 25, 50, 25),
  })
);

// ─── Resumen ───────────────────────────────────────────────────────────
summary({
  total,
  pass,
  fail: total - pass,
  durationMs: performance.now() - t0,
});
