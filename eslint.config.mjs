import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Configuracion de ESLint con las reglas recomendadas de Next.js.
 * - core-web-vitals: detecta problemas que afectan rendimiento y UX
 * - typescript: reglas de tipado estricto para prevenir errores en tiempo de ejecucion
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Sobreescribe los ignores por defecto de eslint-config-next
  // para tener control explicito sobre que directorios se excluyen
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
