/** Filtra linhas pelo número (id) ou nome / evento. */
export function matchesNomeOuNumero(
  term: string,
  opts: { id: string; nome?: string | null }
): boolean {
  const t = term.trim().toLowerCase();
  if (!t) return true;
  if (opts.id.toLowerCase().includes(t)) return true;
  const nome = opts.nome?.trim().toLowerCase();
  if (nome && nome.includes(t)) return true;
  return false;
}
