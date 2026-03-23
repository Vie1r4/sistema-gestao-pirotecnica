# Auditoria: localStorage vs API

Objetivo: **frontend ler das APIs e não guardar dados de negócio em localStorage**. Este documento reflete o estado após remoção de todo o localStorage de dados de negócio.

---

## ✅ Estado atual: zero localStorage para dados de negócio

Todas as listagens, detalhes, edição e eliminação usam **apenas a API** (TanStack Query onde aplicável). Nenhum módulo guarda ou lê listas/entidades de negócio em localStorage.

### Libs migradas (apenas tipos + API)

| Módulo | Estado |
|--------|--------|
| **lib/clientes.ts** | Tipos, `mapApiToCliente`, `fetchClientes`, `fetchClienteDetalhe`, funções de API (create/update/delete). Sem `getClientes`/`getClienteById` nem localStorage. |
| **lib/produtos.ts** | Tipos, constantes (CLASSIFICACOES_RISCO, etc.), helpers de texto/validação. Sem `getProdutos`/`getProdutoById` nem localStorage. |
| **lib/armazem.ts** | Tipos, constantes, `labelPerfilRisco`, `validarLimiteMLE`. Sem `getPaiois`/`getPaiolById` nem localStorage. |
| **lib/funcionarios.ts** | Tipos, `CARGOS`. Sem `getFuncionarios`/`getFuncionarioById` nem localStorage. |
| **lib/encomendas.ts** | Tipos (Encomenda, EncomendaItem, etc.), `ESTADOS_ENCOMENDA`, `corEstado`, `podeEditarEncomenda`. Sem localStorage nem sessionStorage. |
| **lib/entradasSaidasPaiol.ts** | Apenas tipos (EntradaPaiol, SaidaPaiol, CargaPaiolItem, EntradaComRestante). Sem localStorage. |
| **lib/servicos.ts** | Já estava migrado; usa apenas servicosApi e respostas da API. |

---

## ✅ Uso aceitável de localStorage

Apenas o seguinte é guardado localmente (conforme regra do projeto):

- **Token e refresh token** (lib/auth.ts): credenciais de sessão para os headers das chamadas API.
- **Tema** (`pirofafe-theme`): preferência de tema (UI pura), via **Zustand** com middleware `persist` em `app/stores/useUIStore.ts`. Sincronizado com a API (GET api/home/preferencias) quando o utilizador está autenticado.
- **clearData** (lib/clearData.ts): remove todas as chaves conhecidas no logout/limpar dados (incluindo as antigas, para compatibilidade).

A fonte do utilizador atual é **GET api/auth/me** (UserContext); não se guarda `pirofafe-user` no login.

---

## Resumo

- **Sim**: Todo o frontend lê dados de negócio **apenas das APIs**. Não há listas nem entidades (clientes, produtos, encomendas, serviços, paióis, funcionários, entradas/saídas) em localStorage.
- **localStorage** é usado só para token, refresh token e tema (Zustand persist).
- **Documentação**: Atualizado em março 2025 após remoção completa do localStorage de dados de negócio e introdução de Zustand para o tema.
