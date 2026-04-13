import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // React 19 / Compiler: esta regra marca padrões válidos em Next (mounted + client-only, sync URL→estado,
      // preencher formulários a partir de dados da API no useEffect). Refatorar tudo seria invasivo e arriscado
      // para pouco ganho; o typecheck e o resto do ESLint cobrem o essencial.
      "react-hooks/set-state-in-effect": "off",
      // TanStack Table: o compiler não memoiza useReactTable; é limitação da biblioteca, não bug nosso.
      "react-hooks/incompatible-library": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
