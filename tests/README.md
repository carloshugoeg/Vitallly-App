# Pruebas de demostración académica

Esta carpeta contiene pruebas ejecutables desde consola que demuestran, para cada
caso, **qué** se prueba, **cómo** (entradas / valor esperado) y **cuál es el
resultado** (PASS / FAIL con color y tiempo de ejecución).

No hay framework de testing instalado. Cada script es auto-contenido y se corre
con `tsx`. La salida está diseñada para ser legible en una proyección.

## Requisitos

1. Dependencias instaladas: `npm install`.
2. Para `test:db` — un PostgreSQL alcanzable con `DATABASE_URL` definido en `.env`
   o `.env.local` en la raíz del proyecto.

## Scripts disponibles

| Comando                    | Archivo                        | Qué demuestra                                                                    |
| -------------------------- | ------------------------------ | -------------------------------------------------------------------------------- |
| `npm run test:unit`        | `unit-calculations.ts`         | Pruebas unitarias sobre las fórmulas de IMC, TMB, GET y macros.                  |
| `npm run test:partitions`  | `partitions-*.ts` (tres)       | Particiones de equivalencia sobre IMC (6), % grasa corporal (24) e ICC (6).      |
| `npm run test:boundary`    | `boundary-values.ts`           | Análisis de valores frontera en los bordes de cada partición.                    |
| `npm run test:benchmark`   | `benchmark.ts`                 | Throughput (ops/seg) y latencia (p50/p95/p99) de las funciones puras.            |
| `npm run test:db`          | `db-connection.ts`             | Ping, latencia, pool concurrente e integridad de tablas sobre PostgreSQL.        |
| `npm run test:all`         | — todos en cadena —            | Corre todo lo anterior en orden.                                                 |

## Orden sugerido para la presentación

1. **`test:unit`** — abre con correctitud de fórmulas contra valores de referencia.
2. **`test:partitions`** — introduce la técnica formal de partición de equivalencia.
3. **`test:boundary`** — muestra cómo los bordes son fuente de bugs y cómo se cubren.
4. **`test:benchmark`** — cambia de correctitud a rendimiento (ops/seg, percentiles).
5. **`test:db`** — cierra con la prueba de integración real contra la BD.

Cada script imprime una cabecera con **OBJETIVO** y **MÉTODO**, ejecuta los casos
con ✓ / ✗ a color, y termina con un resumen. El código de salida es 0 si todo pasa
y 1 si hay al menos una falla, compatible con pipelines de CI si luego se
automatizan.

## Estructura

```
tests/
├── _runner.ts              # Helpers compartidos (colores, cabecera, runCase, summary)
├── unit-calculations.ts
├── partitions-imc.ts
├── partitions-body-fat.ts
├── partitions-icc.ts
├── boundary-values.ts
├── benchmark.ts
└── db-connection.ts
```

Ninguno de estos scripts modifica datos ni escribe a la BD.
