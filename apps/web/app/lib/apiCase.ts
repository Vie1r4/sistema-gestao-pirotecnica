/**
 * Helper para ler campos de respostas da API que podem vir em camelCase ou
 * PascalCase. Centraliza o padrão `obj[key] ?? obj[Key]` usado pelos mapeadores
 * (mapApiTo*) em vez de o reescrever inline em cada um.
 */

/** Devolve `obj[key]` ou `obj[Key]` (primeira letra maiúscula), aceitando ambos os casings. */
export function lerCampo(obj: Record<string, unknown>, key: string): unknown {
  return obj[key] ?? obj[key.charAt(0).toUpperCase() + key.slice(1)];
}

/** Cria um getter ligado a um objeto: `const get = getter(obj); get("nome")`. */
export function getter(obj: Record<string, unknown>): (key: string) => unknown {
  return (key: string) => lerCampo(obj, key);
}
