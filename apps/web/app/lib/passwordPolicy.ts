/** Alinhado com ASP.NET Identity (Program.cs) e IdentityErrorDescriberPt. */

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_HINT =
  "Mínimo 8 caracteres, com maiúsculas, minúsculas, algarismo e carácter especial.";

export const PASSWORD_PLACEHOLDER =
  "Mín. 8 caracteres, maiúsculas, minúsculas, algarismo e símbolo";

/** Validação rápida no cliente; a API continua a ser a fonte de verdade. */
export function validatePasswordClient(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return "A palavra-passe tem de ter pelo menos 8 caracteres.";
  }
  if (!/[0-9]/.test(password)) {
    return "A palavra-passe tem de incluir pelo menos um algarismo (0-9).";
  }
  if (!/[a-z]/.test(password)) {
    return "A palavra-passe tem de incluir pelo menos uma letra minúscula.";
  }
  if (!/[A-Z]/.test(password)) {
    return "A palavra-passe tem de incluir pelo menos uma letra maiúscula.";
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return "A palavra-passe tem de incluir pelo menos um carácter especial.";
  }
  return null;
}

export function formatApiPasswordDetails(data: Record<string, unknown>): string | null {
  const details = data.details;
  if (Array.isArray(details) && details.length > 0) {
    return details.filter((d): d is string => typeof d === "string").join(" ");
  }
  return null;
}
