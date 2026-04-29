/**
 * Utilidades compartidas para los scripts de demostración académica.
 *
 * Cada script de prueba importa de aquí las funciones de formato y el
 * runner mínimo. Sin dependencias externas: solo stdout + códigos ANSI.
 */

export const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
};

export function line(char = '─', len = 78): string {
  return char.repeat(len);
}

export function header(titulo: string, objetivo: string, metodo: string): void {
  console.log();
  console.log(c.cyan + line('═') + c.reset);
  console.log(c.bold + c.cyan + '  ' + titulo + c.reset);
  console.log(c.cyan + line('═') + c.reset);
  console.log(c.bold + '  OBJETIVO:' + c.reset + ' ' + objetivo);
  console.log(c.bold + '  MÉTODO:  ' + c.reset + ' ' + metodo);
  console.log(c.cyan + line('─') + c.reset);
}

export function section(texto: string): void {
  console.log();
  console.log(c.bold + c.magenta + '▸ ' + texto + c.reset);
  console.log(c.gray + line('─') + c.reset);
}

export function info(texto: string): void {
  console.log(c.gray + '  ' + texto + c.reset);
}

type CaseResult = { pass: boolean; durationMs: number };

/**
 * Compara esperado vs actual con igualdad estructural (JSON).
 * Imprime una fila con ✓/✗, nombre, entrada, esperado y actual.
 */
export function runCase(opts: {
  nombre: string;
  entrada: unknown;
  esperado: unknown;
  fn: () => unknown;
}): CaseResult {
  const t0 = performance.now();
  let actual: unknown;
  let error: Error | null = null;
  try {
    actual = opts.fn();
  } catch (e) {
    error = e as Error;
  }
  const durationMs = performance.now() - t0;

  const pass =
    !error && JSON.stringify(actual) === JSON.stringify(opts.esperado);

  const mark = pass ? c.green + '✓' + c.reset : c.red + '✗' + c.reset;
  const nombre = opts.nombre.padEnd(42).slice(0, 42);
  console.log(`  ${mark} ${c.bold}${nombre}${c.reset}`);
  console.log(`      ${c.gray}entrada:  ${c.reset}${fmt(opts.entrada)}`);
  console.log(`      ${c.gray}esperado: ${c.reset}${fmt(opts.esperado)}`);
  if (error) {
    console.log(`      ${c.red}error:    ${c.reset}${error.message}`);
  } else {
    const actualColor = pass ? c.green : c.red;
    console.log(`      ${c.gray}actual:   ${c.reset}${actualColor}${fmt(actual)}${c.reset}`);
  }
  console.log(`      ${c.gray}tiempo:   ${durationMs.toFixed(3)} ms${c.reset}`);
  return { pass, durationMs };
}

/**
 * Variante para comparar números con tolerancia absoluta.
 * Útil para fórmulas con float (TMB, GET) donde un ε pequeño es irrelevante.
 */
export function runCaseNear(opts: {
  nombre: string;
  entrada: unknown;
  esperado: number;
  tolerancia: number;
  fn: () => number;
}): CaseResult {
  const t0 = performance.now();
  let actual = NaN;
  let error: Error | null = null;
  try {
    actual = opts.fn();
  } catch (e) {
    error = e as Error;
  }
  const durationMs = performance.now() - t0;

  const pass =
    !error && Math.abs(actual - opts.esperado) <= opts.tolerancia;

  const mark = pass ? c.green + '✓' + c.reset : c.red + '✗' + c.reset;
  const nombre = opts.nombre.padEnd(42).slice(0, 42);
  console.log(`  ${mark} ${c.bold}${nombre}${c.reset}`);
  console.log(`      ${c.gray}entrada:  ${c.reset}${fmt(opts.entrada)}`);
  console.log(
    `      ${c.gray}esperado: ${c.reset}${opts.esperado} ${c.gray}(±${opts.tolerancia})${c.reset}`
  );
  if (error) {
    console.log(`      ${c.red}error:    ${c.reset}${error.message}`);
  } else {
    const actualColor = pass ? c.green : c.red;
    const diff = actual - opts.esperado;
    console.log(
      `      ${c.gray}actual:   ${c.reset}${actualColor}${actual.toFixed(4)}${c.reset} ${c.gray}(Δ = ${diff >= 0 ? '+' : ''}${diff.toFixed(4)})${c.reset}`
    );
  }
  console.log(`      ${c.gray}tiempo:   ${durationMs.toFixed(3)} ms${c.reset}`);
  return { pass, durationMs };
}

function fmt(v: unknown): string {
  if (typeof v === 'string') return `"${v}"`;
  if (typeof v === 'number') return String(v);
  if (v === null || v === undefined) return String(v);
  return JSON.stringify(v);
}

export function summary(opts: {
  total: number;
  pass: number;
  fail: number;
  durationMs: number;
}): void {
  console.log();
  console.log(c.cyan + line('═') + c.reset);
  const color = opts.fail === 0 ? c.green : c.red;
  const etiqueta = opts.fail === 0 ? 'TODAS LAS PRUEBAS PASARON' : 'HAY FALLAS';
  console.log(
    '  ' +
      c.bold +
      color +
      etiqueta +
      c.reset +
      c.gray +
      '  │  ' +
      c.reset +
      `total ${opts.total}   ` +
      c.green +
      `✓ ${opts.pass}   ` +
      c.red +
      `✗ ${opts.fail}   ` +
      c.reset +
      c.gray +
      `${opts.durationMs.toFixed(1)} ms` +
      c.reset
  );
  console.log(c.cyan + line('═') + c.reset);
  console.log();
  process.exit(opts.fail > 0 ? 1 : 0);
}

/**
 * Formatea un número en micro/milisegundos según su magnitud.
 */
export function fmtTime(ms: number): string {
  if (ms < 0.001) return (ms * 1_000_000).toFixed(2) + ' ns';
  if (ms < 1) return (ms * 1000).toFixed(2) + ' µs';
  if (ms < 1000) return ms.toFixed(2) + ' ms';
  return (ms / 1000).toFixed(2) + ' s';
}

/**
 * Formatea número con separadores de miles para legibilidad.
 */
export function fmtNum(n: number): string {
  return n.toLocaleString('es-GT');
}
