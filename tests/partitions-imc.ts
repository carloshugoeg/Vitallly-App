/**
 * Particiones de equivalencia sobre la clasificación OMS del IMC.
 *
 * Teoría: una partición de equivalencia es un subconjunto de entradas
 * que el sistema trata uniformemente. Si el sistema funciona para un
 * representante, por hipótesis funciona para toda la clase. Basta un
 * caso por partición en lugar de probar cada valor posible del dominio.
 *
 * La tabla IMC_CLASSIFICATIONS define 6 particiones disjuntas y exhaustivas
 * que cubren todo el dominio [0, +∞). Por cada una elegimos un valor
 * representativo interno (no fronterizo — los bordes van en boundary-values).
 *
 * Ejecutar:  npx tsx tests/partitions-imc.ts
 */

import { getIMCClassification } from '../src/lib/calculations';
import { c, header, section, info, runCase, summary } from './_runner';

const t0 = performance.now();
let total = 0;
let pass = 0;

function track(r: { pass: boolean }): void {
  total++;
  if (r.pass) pass++;
}

header(
  'PARTICIONES DE EQUIVALENCIA — Clasificación IMC (OMS)',
  'Demostrar que cada una de las 6 clases diagnósticas OMS se reconoce correctamente.',
  'Un representante interno por clase (no frontera). 6 casos cubren el dominio completo del IMC.'
);

section('Tabla de particiones derivada de IMC_CLASSIFICATIONS');

console.log(
  `  ${c.bold}${'Clase'.padEnd(22)}${'Rango'.padEnd(18)}${'Representante'.padEnd(16)}${'Etiqueta esperada'.padEnd(22)}${c.reset}`
);
console.log(c.gray + '  ' + '─'.repeat(76) + c.reset);

const casos: Array<{
  clase: string;
  rango: string;
  representante: number;
  etiqueta: string;
}> = [
  { clase: 'Bajo peso',     rango: '[0, 18.5)',     representante: 17.0, etiqueta: 'Bajo peso' },
  { clase: 'Normal',        rango: '[18.5, 24.9]',  representante: 22.0, etiqueta: 'Normal' },
  { clase: 'Sobrepeso',     rango: '[25, 29.9]',    representante: 27.5, etiqueta: 'Sobrepeso' },
  { clase: 'Obesidad I',    rango: '[30, 34.9]',    representante: 32.0, etiqueta: 'Obesidad grado I' },
  { clase: 'Obesidad II',   rango: '[35, 39.9]',    representante: 37.0, etiqueta: 'Obesidad grado II' },
  { clase: 'Obesidad III',  rango: '[40, +∞)',      representante: 45.0, etiqueta: 'Obesidad grado III' },
];

for (const caso of casos) {
  console.log(
    `  ${caso.clase.padEnd(22)}${caso.rango.padEnd(18)}${String(caso.representante).padEnd(16)}${caso.etiqueta.padEnd(22)}`
  );
}

section('Ejecución de casos representativos');
info('Para cada clase evaluamos getIMCClassification(IMC).label y comparamos.');

for (const caso of casos) {
  track(
    runCase({
      nombre: `${caso.clase} (IMC = ${caso.representante})`,
      entrada: caso.representante,
      esperado: caso.etiqueta,
      fn: () => getIMCClassification(caso.representante).label,
    })
  );
}

section('Cobertura lógica');
info(`Particiones cubiertas: ${casos.length} / 6  (100% del dominio IMC)`);
info('Los valores en la frontera exacta se validan en boundary-values.ts');

summary({
  total,
  pass,
  fail: total - pass,
  durationMs: performance.now() - t0,
});
