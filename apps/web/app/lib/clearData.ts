/**
 * Limpeza de todos os dados da aplicação (apenas para testes).
 * - clearAllDataAndRedirect: API Admin (POST api/admin/clear-all-data)
 * - homeLimparDadosAndRedirect: API Home (POST api/home/limpar-dados) — apaga dados, recria roles, termina sessão
 */

import { getToken } from "@/app/lib/auth";
import { clearAllDataApi } from "@/app/lib/admin";
import { postLimparDados } from "@/app/lib/home";

const LOCAL_KEYS = [
  "token",
  "pirofafe-user",
  "pirofafe-user-name",
  "pirofafe-users",
  "pirofafe-theme",
  "pirofafe-clientes",
  "pirofafe-produtos",
  "pirofafe-armazem",
  "pirofafe-encomendas",
  "pirofafe-encomenda-itens",
  "pirofafe-encomenda-reservas",
  "pirofafe-servicos",
  "pirofafe-servico-equipa",
  "pirofafe-servico-licencas",
  "pirofafe-servico-distancias",
  "pirofafe-servico-documentos",
  "pirofafe-entradas-paiol",
  "pirofafe-saidas-paiol",
  "pirofafe-funcionarios",
];

const SESSION_KEYS = ["pirofafe-encomenda-draft"];

function clearLocalAndRedirect(): void {
  try {
    for (const key of LOCAL_KEYS) {
      localStorage.removeItem(key);
    }
    for (const key of SESSION_KEYS) {
      sessionStorage.removeItem(key);
    }
  } catch {}
  window.location.href = "/";
}

/**
 * Limpa todos os dados: chama a API Admin para apagar a base de dados e contas;
 * depois limpa localStorage/sessionStorage e redireciona para a página inicial.
 */
export async function clearAllDataAndRedirect(): Promise<void> {
  if (typeof window === "undefined") return;
  const token = getToken();
  if (token) {
    try {
      await clearAllDataApi(token);
    } catch {
      // API em baixo, 403 ou CORS: mesmo assim limpamos o cliente
    }
  }
  clearLocalAndRedirect();
}

/**
 * Limpa dados via API Home (apaga utilizadores e dados, recria roles, termina sessão);
 * depois limpa dados locais e redireciona.
 */
export async function homeLimparDadosAndRedirect(): Promise<void> {
  if (typeof window === "undefined") return;
  const token = getToken();
  if (token) {
    try {
      await postLimparDados(token);
    } catch {
      // API em baixo ou CORS: mesmo assim limpamos o cliente
    }
  }
  clearLocalAndRedirect();
}
