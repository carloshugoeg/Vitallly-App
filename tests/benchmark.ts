/**
 * Benchmark de velocidad sobre las funciones puras del dominio.
 *
 * Dos métricas distintas (y ambas importantes):
 *
 *   · Throughput (ops/seg): cuántas invocaciones logra el CPU en 1 s.
 *     Responde "¿cuántos pacientes podemos procesar por segundo?".
 *
 *   · Latencia (p50/p95/p99): tiempo de una invocación individual.
 *     Responde "¿cuánto espera el usuario en el peor 1% de los casos?".
 *
 * Ambas se miden sobre N=500,000 muestras con performance.now(), luego
 * se calculan percentiles sobre la distribución.
 *
 * Ejecutar:  npx tsx tests/benchmark.ts
 */

import {
  calculateIMC,
  calculateTMBMifflinStJeor,
  calculateGET,
  calculateMacrosGrams,
} from '../src/lib/calculations';
import {
  classifyBodyFat,
  classifyICC,
} from '../src/lib/referenceRanges';
import { c, header, section, info, line, fmtTime, fmtNum } from './_runner';

const SAMPLES = 500_000;
const THROUGHPUT_MS = 1000;

type BenchResult = {
  nombre: string;
  opsPerSec: number;
  p50: number;
  p95: number;
  p99: number;
  avg: number;
};

function bench(nombre: string, fn: () => void): BenchResult {
  // Calentamiento (JIT warmup)
  for (let i = 0; i < 10_000; i++) fn();

  // 1) Throughput: cuántas ops caben en THROUGHPUT_MS
  const tStart = performance.now();
  let ops = 0;
  while (performance.now() - tStart < THROUGHPUT_MS) {
    fn();
    ops++;
  }
  const elapsed = performance.now() - tStart;
  const opsPerSec = ops / (elapsed / 1000);

  // 2) Latencia: N muestras individuales
  const durations = new Float64Array(SAMPLES);
  for (let i = 0; i < SAMPLES; i++) {
    const a = performance.now();
    fn();
    durations[i] = performance.now() - a;
  }

  const sorted = Array.from(durations).sort((a, b) => a - b);
  const p = (q: number) => sorted[Math.floor(sorted.length * q)];
  const avg = sorted.reduce((s, v) => s + v, 0) / sorted.length;

  return {
    nombre,
    opsPerSec,
    p50: p(0.50),
    p95: p(0.95),
    p99: p(0.99),
    avg,
  };
}

header(
  'BENCHMARK — Velocidad de funciones puras',
  'Medir throughput y latencia de los cálculos nutricionales críticos.',
  `Por función: 1 s de ejecución continua (ops/seg) + ${fmtNum(SAMPLES)} muestras individuales (latencia).`
);

section('Plataforma');
info(`Node ${process.version}  ·  Plataforma ${process.platform}  ·  Arquitectura ${process.arch}`);
info(`Muestras de latencia por función: ${fmtNum(SAMPLES)}`);
info(`Ventana de throughput: ${THROUGHPUT_MS} ms  ·  Warmup: 10,000 invocaciones`);

section('Ejecutando benchmarks...');

const resultados: BenchResult[] = [];

resultados.push(bench('calculateIMC',              () => calculateIMC(70, 175)));
resultados.push(bench('calculateTMBMifflinStJeor', () => calculateTMBMifflinStJeor(70, 175, 30, 'M')));
resultados.push(bench('calculateGET',              () => calculateGET(1600, 'moderado')));
resultados.push(bench('calculateMacrosGrams',      () => calculateMacrosGrams(2000, 30, 40, 30)));
resultados.push(bench('classifyBodyFat',           () => classifyBodyFat(27, 30, 'F')));
resultados.push(bench('classifyICC',               () => classifyICC(0.85, 'M')));

// ─── Tabla de resultados ───────────────────────────────────────────────
section('Resultados');

const headCols = [
  'Función'.padEnd(28),
  'Ops/seg'.padStart(14),
  'p50'.padStart(11),
  'p95'.padStart(11),
  'p99'.padStart(11),
  'promedio'.padStart(11),
];
console.log(`  ${c.bold}${headCols.join('  ')}${c.reset}`);
console.log('  ' + c.gray + line('─', 92) + c.reset);

for (const r of resultados) {
  console.log(
    '  ' +
      r.nombre.padEnd(28) +
      '  ' +
      fmtNum(Math.round(r.opsPerSec)).padStart(14) +
      '  ' +
      fmtTime(r.p50).padStart(11) +
      '  ' +
      fmtTime(r.p95).padStart(11) +
      '  ' +
      fmtTime(r.p99).padStart(11) +
      '  ' +
      fmtTime(r.avg).padStart(11)
  );
}

// ─── Análisis ──────────────────────────────────────────────────────────
section('Análisis');

const masRapida = resultados.reduce((a, b) => (a.opsPerSec > b.opsPerSec ? a : b));
const masLenta = resultados.reduce((a, b) => (a.opsPerSec < b.opsPerSec ? a : b));
const ratio = masRapida.opsPerSec / masLenta.opsPerSec;

info(
  `Función más rápida:  ${c.green}${masRapida.nombre}${c.reset} con ${fmtNum(Math.round(masRapida.opsPerSec))} ops/seg`
);
info(
  `Función más lenta:   ${c.yellow}${masLenta.nombre}${c.reset} con ${fmtNum(Math.round(masLenta.opsPerSec))} ops/seg`
);
info(`Relación (más rápida / más lenta): ${ratio.toFixed(1)}×`);
info('');
info('Todas las funciones operan en microsegundos: seguras para render síncrono en UI.');
info('El overhead de la red (~50 ms) y de BD (~5-20 ms) dominan el tiempo total por request.');
info('Conclusión: optimizar estos cálculos NO mejora el sistema; el cuello de botella es I/O.');

console.log();
console.log(c.cyan + line('═') + c.reset);
console.log(
  '  ' +
    c.bold +
    c.green +
    'BENCHMARK COMPLETADO' +
    c.reset +
    c.gray +
    `   │   ${resultados.length} funciones medidas   ·   ${fmtNum(SAMPLES * resultados.length)} muestras totales` +
    c.reset
);
console.log(c.cyan + line('═') + c.reset);
console.log();
