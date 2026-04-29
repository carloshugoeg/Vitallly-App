/**
 * Particiones de equivalencia sobre classifyICC (Índice Cintura/Cadera).
 *
 * El ICC es un predictor de riesgo cardiovascular. Las tablas OMS definen
 * umbrales distintos por género:
 *
 *   Hombres:   < 0.90          Normal
 *              0.90 – 0.99     Riesgo moderado
 *              ≥ 1.00          Riesgo alto
 *
 *   Mujeres:   < 0.80          Normal
 *              0.80 – 0.84     Riesgo moderado
 *              ≥ 0.85          Riesgo alto
 *
 * Particiones: 2 géneros × 3 niveles = 6 clases.
 *
 * Ejecutar:  npx tsx tests/partitions-icc.ts
 */

import { classifyICC } from '../src/lib/referenceRanges';
import { header, section, info, runCase, summary } from './_runner';

const t0 = performance.now();
let total = 0;
let pass = 0;

function track(r: { pass: boolean }): void {
  total++;
  if (r.pass) pass++;
}

header(
  'PARTICIONES DE EQUIVALENCIA — ICC (riesgo cardiovascular)',
  'Verificar que classifyICC aplica el umbral correcto por género.',
  '6 casos = 2 géneros × 3 niveles de riesgo. Representante interno por clase.'
);

type Caso = {
  genero: 'M' | 'F';
  nivel: string;
  icc: number;
  label: string;
};

const casos: Caso[] = [
  { genero: 'M', nivel: 'Normal',           icc: 0.85, label: 'Normal' },
  { genero: 'M', nivel: 'Riesgo moderado',  icc: 0.95, label: 'Riesgo moderado' },
  { genero: 'M', nivel: 'Riesgo alto',      icc: 1.05, label: 'Riesgo alto' },
  { genero: 'F', nivel: 'Normal',           icc: 0.75, label: 'Normal' },
  { genero: 'F', nivel: 'Riesgo moderado',  icc: 0.82, label: 'Riesgo moderado' },
  { genero: 'F', nivel: 'Riesgo alto',      icc: 0.90, label: 'Riesgo alto' },
];

section('Hombres');
for (const caso of casos.filter(c => c.genero === 'M')) {
  track(
    runCase({
      nombre: `${caso.nivel} (ICC = ${caso.icc})`,
      entrada: { icc: caso.icc, genero: caso.genero },
      esperado: caso.label,
      fn: () => classifyICC(caso.icc, caso.genero).label,
    })
  );
}

section('Mujeres');
for (const caso of casos.filter(c => c.genero === 'F')) {
  track(
    runCase({
      nombre: `${caso.nivel} (ICC = ${caso.icc})`,
      entrada: { icc: caso.icc, genero: caso.genero },
      esperado: caso.label,
      fn: () => classifyICC(caso.icc, caso.genero).label,
    })
  );
}

section('Cobertura');
info(`Clases cubiertas: ${casos.length} / 6  (100%)`);
info('Los umbrales exactos (0.80, 0.85, 0.90, 1.00) se validan en boundary-values.ts');

summary({
  total,
  pass,
  fail: total - pass,
  durationMs: performance.now() - t0,
});
