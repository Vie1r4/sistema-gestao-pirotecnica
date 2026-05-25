/**
 * Limpeza de todos os dados da aplicação (apenas desenvolvimento, via Admin API).
 */

import { getToken } from "@/app/lib/auth";
import { clearAllDataApi } from "@/app/lib/admin";

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

function clearLocalStorage(): void {
  try {
    for (const key of LOCAL_KEYS) {
      localStorage.removeItem(key);
    }
    for (const key of SESSION_KEYS) {
      sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Limpa BD, documentos Uploads, contas e roles (recriadas no servidor); depois limpa o browser e redireciona.
 */
export async function clearAllDataAndRedirect(): Promise<{ message: string }> {
  if (typeof window === "undefined") {
    return { message: "" };
  }

  const token = getToken();
  if (!token) {
    throw new Error("Sessão em falta. Inicie sessão como Admin.");
  }

  const result = await clearAllDataApi(token);
  clearLocalStorage();
  window.location.href = "/?cleared=1";
  return result;
}
