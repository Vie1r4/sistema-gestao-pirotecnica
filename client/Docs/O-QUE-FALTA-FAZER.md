# O que falta fazer — revisão do projeto

Revisão atualizada após remoção de todo o localStorage de dados de negócio e introdução de Zustand para o tema.

---

## ✅ Já feito

### localStorage de dados de negócio — removido

- **clientes.ts**, **produtos.ts**, **armazem.ts**, **funcionarios.ts**: removidas todas as funções que liam/escreviam em localStorage (`getClientes`, `getClienteById`, `getProdutos`, `getProdutoById`, `getPaiois`, `getPaiolById`, `getFuncionarios`, `getFuncionarioById`, e CRUD local). Mantidos apenas tipos, constantes e funções de API.
- **encomendas.ts**: reduzido a tipos, `ESTADOS_ENCOMENDA`, `corEstado`, `podeEditarEncomenda`. Sem localStorage/sessionStorage.
- **entradasSaidasPaiol.ts**: reduzido a apenas tipos. Sem localStorage.
- **Tema**: migrado de ThemeContext para **Zustand** (`useUIStore` com persist em `pirofafe-theme`); sincronização com API (getPreferencias) via componente `ThemeSync`.

### Listagens (useQuery, API apenas)

Todas usam TanStack Query e não guardam listas em localStorage.

| Página      | Query key                    | API                    |
|------------|------------------------------|------------------------|
| Home       | `["home", "message"]`        | GET api/home           |
| Admin      | `["admin"]`                  | GET api/admin + utilizadores |
| Funcionários | `["funcionarios"]`         | GET api/funcionarios   |
| Clientes   | `["clientes"]`               | GET api/clientes       |
| Armazém    | `["armazem", "paiol"]`       | GET api/paiol          |
| Produtos   | `["produtos", ...filtros]`   | GET api/produtos       |
| Encomendas | `["encomendas", estado, pagina]` | GET api/encomendas |
| Serviços   | `["servicos", ...filtros]`   | GET api/servicos       |

### Detalhes, edição e eliminação

- Clientes, Produtos, Funcionários, Encomendas, Serviços, Armazém: useQuery para carregar (GET por id ou endpoints de edit/delete), useMutation para PUT/DELETE, invalidação e redirect no onSuccess.
- Encomendas editar: já usa PUT api/encomendas/{id} e GET api/encomendas/{id}; produtos via produtosApi.fetchList.

### Uso aceitável de localStorage

- **token** e **refresh token** (auth).
- **pirofafe-theme** (Zustand persist); opcionalmente limpeza de chaves antigas em clearData.

---

## ⚠️ Pendente / opcional

### 1. Feedback de erros global (toast/banner)

- **Estado**: Implementado um sistema global de notificações (toast) para erros de mutations e sessão expirada.
- **Comportamento**: Erros de mutation e erros de autenticação são mostrados num toast no canto da ecrã; o utilizador pode dispensar ou é redirecionado para login quando a sessão expira.

### 2. Páginas que ainda usam fetch manual (opcional)

Melhoria de consistência: migrar para useQuery/useMutation onde ainda exista `useEffect` + `fetch` + `useState` para dados da API:

- Armazém: gestao, [id]/conteudo, stock, movimentos, novo, entradas/registar, saidas/registar (algumas já usam useQuery).
- Encomendas novo, adicionar-itens (já usam encomendasApi; podem padronizar com useQuery/useMutation).
- Serviços novo, [id]/licenca; Clientes/Produtos/Funcionários novo, produtos/gerir; Admin utilizadores/[id]/editar; Perfil.

### 3. Documentação

- **AUDITORIA-LOCALSTORAGE.md** e **O-QUE-FALTA-FAZER.md** estão alinhados com o estado atual (zero localStorage de negócio; Zustand para tema; toast global para erros).

---

## Resumo em lista

1. ~~**localStorage de dados de negócio**~~ — **Feito.** Removido de clientes, produtos, armazém, funcionários, encomendas, entradasSaidasPaiol. Apenas token e tema (Zustand) em localStorage.
2. ~~**Encomendas [id] editar**~~ — **Feito.** Usa PUT/GET api/encomendas/{id} e produtosApi.
3. ~~**Libs encomendas, clientes, produtos, armazem, funcionarios, entradasSaidasPaiol**~~ — **Feito.** Reduzidas a tipos e/ou API; sem localStorage.
4. ~~**Feedback de erros global**~~ — **Feito.** Toast global para erros de mutation e sessão expirada.
5. **Opcional:** Páginas de criação/registar/gestão — padronizar com useQuery/useMutation onde ainda haja fetch manual.
