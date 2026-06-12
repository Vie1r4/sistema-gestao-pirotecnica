/**
 * Classes partilhadas dos Compilados.
 * Re-exporta os tokens globais (components/ui/tokens.ts) e acrescenta apenas
 * o que é específico desta área: input compacto inline e o danger com estado disabled.
 */

import { btnDangerSolid } from "@/app/components/ui/tokens";

export {
  cardClass,
  inputClass,
  labelClass,
  btnPrimary,
  btnSecondary,
  inputClassFilter as inputClassInline,
} from "@/app/components/ui/tokens";

export const btnDanger = `${btnDangerSolid} disabled:opacity-50`;
