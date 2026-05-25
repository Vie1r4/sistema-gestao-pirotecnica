/** UI destrutiva (limpar dados) só em desenvolvimento, salvo override explícito. */
export function isClearDataUiEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_ALLOW_CLEAR_DATA === "true") return true;
  return process.env.NODE_ENV !== "production";
}
