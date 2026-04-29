/**
 * Pruebas de conexión a PostgreSQL.
 *
 * Verificamos cinco aspectos de la conexión en vivo:
 *   1. Ping básico (la BD responde)
 *   2. Latencia sostenida (50 queries secuenciales, percentiles)
 *   3. Pool concurrente (20 queries en paralelo)
 *   4. Integridad del schema (las tablas existen y son consultables)
 *   5. Versión del servidor
 *
 * Usa pg.Pool directamente con DATABASE_URL — la misma configuración
 * que src/server/lib/prisma.ts, sin cargar server-only ni middlewares.
 *
 * Ejecutar:  npx tsx tests/db-connection.ts
 */

import { readFileSync } from 'fs';
import pg from 'pg';
import {
  c,
  header,
  section,
  info,
  line,
  fmtTime,
  fmtNum,
  summary,
} from './_runner';

// ─── Carga manual de .env (sin depender de dotenv) ─────────────────────
(function loadDotenv() {
  const candidates = ['.env', '.env.local'];
  for (const file of candidates) {
    try {
      const content = readFileSync(file, 'utf-8');
      for (const raw of content.split('\n')) {
        const l = raw.trim();
        if (!l || l.startsWith('#')) continue;
        const m = l.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
        if (!m) continue;
        let value = m[2].trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!process.env[m[1]]) process.env[m[1]] = value;
      }
    } catch {
      // Archivo no existe, probamos el siguiente
    }
  }
})();

const t0 = performance.now();
let total = 0;
let pass = 0;

function track(ok: boolean): void {
  total++;
  if (ok) pass++;
}

header(
  'CONEXIÓN A BASE DE DATOS — PostgreSQL',
  'Verificar que la BD es alcanzable, responde con baja latencia y el schema está íntegro.',
  'Pool de pg directo sobre DATABASE_URL. Mide ping, percentiles, concurrencia y conteo de tablas.'
);

if (!process.env.DATABASE_URL) {
  console.log();
  console.log(
    c.red + c.bold + '  ✗ DATABASE_URL no está definido.' + c.reset
  );
  console.log(
    c.gray +
      '    Agrega la cadena de conexión en .env o .env.local antes de correr esta prueba.' +
      c.reset
  );
  console.log();
  process.exit(1);
}

const sanitizedUrl = process.env.DATABASE_URL.replace(
  /:\/\/([^:]+):([^@]+)@/,
  '://$1:***@'
);
info(`DATABASE_URL = ${sanitizedUrl}`);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main(): Promise<void> {
  // ─── 1. Ping ────────────────────────────────────────────────────────
  section('1. Ping — la BD responde');
  try {
    const a = performance.now();
    const res = await pool.query('SELECT 1 as ok');
    const dur = performance.now() - a;
    const ok = res.rows[0]?.ok === 1;
    console.log(
      `  ${ok ? c.green + '✓' : c.red + '✗'}${c.reset} SELECT 1 devolvió ${res.rows[0]?.ok}  ${c.gray}(${fmtTime(dur)})${c.reset}`
    );
    track(ok);
  } catch (e) {
    console.log(
      `  ${c.red}✗${c.reset} No se pudo conectar: ${c.red}${(e as Error).message}${c.reset}`
    );
    console.log(
      c.gray +
        '    Verifica DATABASE_URL y que el servidor Postgres esté arriba.' +
        c.reset
    );
    await pool.end();
    process.exit(1);
  }

  // ─── 2. Latencia sostenida ──────────────────────────────────────────
  section('2. Latencia sostenida — 50 queries secuenciales');
  info('Mide cuán estable es la latencia cuando el cliente reusa la misma conexión.');

  const N = 50;
  const durations: number[] = [];
  const tStart = performance.now();
  for (let i = 0; i < N; i++) {
    const a = performance.now();
    await pool.query('SELECT 1');
    durations.push(performance.now() - a);
  }
  const elapsed = performance.now() - tStart;
  durations.sort((a, b) => a - b);
  const avg = durations.reduce((s, v) => s + v, 0) / N;
  const p = (q: number) => durations[Math.floor(N * q)];

  console.log(
    `  ${c.green}✓${c.reset} ${N} queries completadas en ${fmtTime(elapsed)}`
  );
  console.log(
    `      ${c.gray}promedio:${c.reset} ${fmtTime(avg)}    ${c.gray}p50:${c.reset} ${fmtTime(p(0.5))}    ${c.gray}p95:${c.reset} ${fmtTime(p(0.95))}    ${c.gray}p99:${c.reset} ${fmtTime(p(0.99))}`
  );
  console.log(
    `      ${c.gray}min:${c.reset} ${fmtTime(durations[0])}    ${c.gray}max:${c.reset} ${fmtTime(durations[N - 1])}`
  );
  track(true);

  // ─── 3. Pool concurrente ────────────────────────────────────────────
  section('3. Pool concurrente — 20 queries en paralelo');
  info('Demuestra que el pool de pg maneja múltiples conexiones simultáneas.');

  const CONC = 20;
  const tc = performance.now();
  const results = await Promise.all(
    Array.from({ length: CONC }, (_, i) =>
      pool.query<{ n: number }>('SELECT $1::int as n', [i])
    )
  );
  const cd = performance.now() - tc;
  const ok = results.every((r, i) => r.rows[0].n === i);
  console.log(
    `  ${ok ? c.green + '✓' : c.red + '✗'}${c.reset} ${CONC} queries paralelas completadas en ${fmtTime(cd)}`
  );
  console.log(
    `      ${c.gray}throughput efectivo:${c.reset} ${fmtNum(Math.round(CONC / (cd / 1000)))} queries/seg`
  );
  console.log(
    `      ${c.gray}pool total conexiones:${c.reset} ${pool.totalCount}    ${c.gray}ociosas:${c.reset} ${pool.idleCount}    ${c.gray}esperando:${c.reset} ${pool.waitingCount}`
  );
  track(ok);

  // ─── 4. Integridad del schema ───────────────────────────────────────
  section('4. Integridad del schema — conteo por tabla');
  info('Verifica que todas las tablas esperadas existan y sean consultables.');

  const tablas = [
    'Tenant',
    'User',
    'Invitation',
    'Patient',
    'Appointment',
    'Consultation',
    'Anthropometry',
    'NutritionalPlan',
    'AuditLog',
  ];

  console.log();
  console.log(
    `  ${c.bold}${'Tabla'.padEnd(22)}${'Filas'.padStart(12)}${'  Latencia'.padStart(14)}${c.reset}`
  );
  console.log(c.gray + '  ' + line('─', 48) + c.reset);

  let totalFilas = 0;
  for (const tabla of tablas) {
    try {
      const a = performance.now();
      const r = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM "${tabla}"`
      );
      const dur = performance.now() - a;
      const count = Number(r.rows[0].count);
      totalFilas += count;
      console.log(
        `  ${c.green}✓${c.reset} ${tabla.padEnd(20)}${fmtNum(count).padStart(12)}${fmtTime(dur).padStart(14)}`
      );
      track(true);
    } catch (e) {
      console.log(
        `  ${c.red}✗${c.reset} ${tabla.padEnd(20)}${c.red}${(e as Error).message}${c.reset}`
      );
      track(false);
    }
  }
  console.log(c.gray + '  ' + line('─', 48) + c.reset);
  console.log(
    `  ${c.bold}${'TOTAL'.padEnd(22)}${fmtNum(totalFilas).padStart(12)}${c.reset}`
  );

  // ─── 5. Versión del servidor ────────────────────────────────────────
  section('5. Versión del servidor Postgres');
  const v = await pool.query<{ version: string }>('SELECT version()');
  console.log(`  ${c.green}✓${c.reset} ${v.rows[0].version}`);
  track(true);

  // ─── Cierre ────────────────────────────────────────────────────────
  await pool.end();

  summary({
    total,
    pass,
    fail: total - pass,
    durationMs: performance.now() - t0,
  });
}

main().catch(async (e) => {
  console.log();
  console.log(c.red + c.bold + '  ✗ Error fatal: ' + c.reset + (e as Error).message);
  await pool.end().catch(() => {});
  process.exit(1);
});
