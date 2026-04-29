/**
 * Particiones de equivalencia bidimensionales sobre classifyBodyFat.
 *
 * El dominio se parte por DOS ejes simultáneos:
 *   · Género (2 clases: M, F)
 *   · Grupo etario (3 clases: 20-39, 40-59, 60-79)
 *   · Nivel de grasa (4 clases: bajo, saludable, alto, obeso)
 *
 * El producto cartesiano da 2 × 3 × 4 = 24 clases de equivalencia.
 * Probamos un representante interior por cada una, demostrando que el
 * sistema aplica la tabla de referencia correcta para cada combinación
 * demográfica.
 *
 * Ejecutar:  npx tsx tests/partitions-body-fat.ts
 */

import { classifyBodyFat } from '../src/lib/referenceRanges';
import { c, header, section, info, runCase, summary } from './_runner';

const t0 = performance.now();
let total = 0;
let pass = 0;

function track(r: { pass: boolean }): void {
  total++;
  if (r.pass) pass++;
}

header(
  'PARTICIONES DE EQUIVALENCIA — % Grasa corporal (edad × género × nivel)',
  'Verificar que classifyBodyFat aplica la tabla correcta para cada combinación demográfica.',
  '24 casos = 2 géneros × 3 grupos etarios × 4 niveles. Un representante interno por clase.'
);

type Caso = {
  genero: 'M' | 'F';
  edad: number;
  grupo: string;
  nivel: string;
  porcentaje: number;
  label: string;
};

const casos: Caso[] = [
  // ─── Mujeres ───
  { genero: 'F', edad: 30, grupo: '20-39', nivel: 'bajo',      porcentaje: 15, label: 'Bajo en grasa' },
  { genero: 'F', edad: 30, grupo: '20-39', nivel: 'saludable', porcentaje: 27, label: 'Saludable' },
  { genero: 'F', edad: 30, grupo: '20-39', nivel: 'alto',      porcentaje: 36, label: 'Alto en grasa' },
  { genero: 'F', edad: 30, grupo: '20-39', nivel: 'obeso',     porcentaje: 45, label: 'Obeso' },

  { genero: 'F', edad: 50, grupo: '40-59', nivel: 'bajo',      porcentaje: 18, label: 'Bajo en grasa' },
  { genero: 'F', edad: 50, grupo: '40-59', nivel: 'saludable', porcentaje: 29, label: 'Saludable' },
  { genero: 'F', edad: 50, grupo: '40-59', nivel: 'alto',      porcentaje: 37, label: 'Alto en grasa' },
  { genero: 'F', edad: 50, grupo: '40-59', nivel: 'obeso',     porcentaje: 45, label: 'Obeso' },

  { genero: 'F', edad: 70, grupo: '60-79', nivel: 'bajo',      porcentaje: 20, label: 'Bajo en grasa' },
  { genero: 'F', edad: 70, grupo: '60-79', nivel: 'saludable', porcentaje: 30, label: 'Saludable' },
  { genero: 'F', edad: 70, grupo: '60-79', nivel: 'alto',      porcentaje: 39, label: 'Alto en grasa' },
  { genero: 'F', edad: 70, grupo: '60-79', nivel: 'obeso',     porcentaje: 50, label: 'Obeso' },

  // ─── Hombres ───
  { genero: 'M', edad: 30, grupo: '20-39', nivel: 'bajo',      porcentaje: 5,  label: 'Bajo en grasa' },
  { genero: 'M', edad: 30, grupo: '20-39', nivel: 'saludable', porcentaje: 14, label: 'Saludable' },
  { genero: 'M', edad: 30, grupo: '20-39', nivel: 'alto',      porcentaje: 22, label: 'Alto en grasa' },
  { genero: 'M', edad: 30, grupo: '20-39', nivel: 'obeso',     porcentaje: 30, label: 'Obeso' },

  { genero: 'M', edad: 50, grupo: '40-59', nivel: 'bajo',      porcentaje: 9,  label: 'Bajo en grasa' },
  { genero: 'M', edad: 50, grupo: '40-59', nivel: 'saludable', porcentaje: 16, label: 'Saludable' },
  { genero: 'M', edad: 50, grupo: '40-59', nivel: 'alto',      porcentaje: 25, label: 'Alto en grasa' },
  { genero: 'M', edad: 50, grupo: '40-59', nivel: 'obeso',     porcentaje: 32, label: 'Obeso' },

  { genero: 'M', edad: 70, grupo: '60-79', nivel: 'bajo',      porcentaje: 11, label: 'Bajo en grasa' },
  { genero: 'M', edad: 70, grupo: '60-79', nivel: 'saludable', porcentaje: 19, label: 'Saludable' },
  { genero: 'M', edad: 70, grupo: '60-79', nivel: 'alto',      porcentaje: 27, label: 'Alto en grasa' },
  { genero: 'M', edad: 70, grupo: '60-79', nivel: 'obeso',     porcentaje: 35, label: 'Obeso' },
];

let generoActual = '';
for (const caso of casos) {
  if (generoActual !== caso.genero) {
    generoActual = caso.genero;
    section(caso.genero === 'F' ? 'Mujeres (12 clases)' : 'Hombres (12 clases)');
  }
  track(
    runCase({
      nombre: `${caso.grupo} años · ${caso.nivel} (${caso.porcentaje}%)`,
      entrada: { edad: caso.edad, genero: caso.genero, porcentaje: caso.porcentaje },
      esperado: caso.label,
      fn: () => classifyBodyFat(caso.porcentaje, caso.edad, caso.genero).label,
    })
  );
}

section('Cobertura');
info(`Clases cubiertas: ${casos.length} / 24  (100%)`);
info('Particiones disjuntas: cada valor de entrada cae en exactamente una clase.');
info('Las fronteras de las tablas se prueban por separado en boundary-values.ts');

summary({
  total,
  pass,
  fail: total - pass,
  durationMs: performance.now() - t0,
});
