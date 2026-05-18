# O que falta fazer — revisão do projeto

Revisão atualizada após remoção de todo o localStorage de dados de negócio e introdução de Zustand para o tema.

**Plano PIROFAFE (2026-05):** matriz POST/DELETE e IDOR (7 cenários) nos testes de integração; E2E auth (erro, logout, reload); Vitest `funcionariosApi`; ReportGenerator no CI; CSP Report-Only refinada; `PageHeader` / `StatusBadge` / `ConfirmDialog`; boundaries em produtos/perfil/armazém; `POST /api/clientes` com `PodeGerirClientes`; XML Swagger em auth refresh/me/logout e paiol details.

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
- Encomendas editar: já usa PUT/GET api/encomendas/{id} e produtosApi.fetchList.

### TanStack Query em fluxos adicionais (padronização)

Migrados de `useEffect` + `fetch` manual para `useQuery` / `useMutation` onde fazia sentido:

| Área | Notas |
|------|--------|
| Armazém stock | `["armazem", "stock", filtros]` |
| Conteúdo do paiol | `fetchConteudoPaiol` + query por id |
| Entradas registar | formulário + POST com invalidação `["armazem"]` |
| Encomendas — adicionar-itens | query com filtros debounced + mutations (adicionar/remover/submeter) |
| Serviços novo / licença | create + upload-licença + detalhe (origem 0) |
| Produtos gerir | lista filtrada |
| Admin utilizador editar | GET edit + save mutation |
| Perfil | GET/PUT perfil (`home.ts`) |
| Funcionários desassociar | `["funcionarios", id, "desassociar"]` + `postDesassociarConta` em **lib/funcionariosApi.ts** |

### Uso aceitável de localStorage

- **pirofafe-theme** (Zustand persist); opcionalmente limpeza de chaves antigas em clearData.
- **Access token** em memória (`useAuthStore`); refresh em cookie HttpOnly no backend.

---

## ⚠️ Pendente / opcional

### 1. Feedback de erros global (toast/banner)

- **Estado**: Implementado um sistema global de notificações (toast) para erros de mutations e sessão expirada.
- **Comportamento**: Erros de mutation e erros de autenticação são mostrados num toast no canto da ecrã; o utilizador pode dispensar ou é redirecionado para login quando a sessão expira.

### 2. Páginas com `fetch` ainda inline (opcional)

Muitas páginas já usam TanStack Query mas mantêm `fetch` dentro de `queryFn`/`mutationFn` (válido). Melhorias opcionais:

- Extrair chamadas repetidas para **lib/** (ex.: GET funcionário por id partilhado entre detalhe e desassociar).
- Migrar páginas que ainda carregam dados só com `useEffect` + `fetch` sem Query (se restarem).
- Casos especiais a manter como estão: **login** (GET existem-utilizadores antes de hidratar providers), **error** (GET api/home/error), **ThemeSync** (preferências).

### 3. Documentação

- **AUDITORIA-LOCALSTORAGE.md**, **O-QUE-FALTA-FAZER.md** e **VERIFICACAO-APIS-UTILIZADAS.md** alinhados: sem dados de negócio em localStorage; **api/auth/me** como fonte do utilizador (UserContext). Índice geral: **`docs/README.md`** (revisão maio de 2026).

---

## Resumo em lista

1. ~~**localStorage de dados de negócio**~~ — **Feito.** Removido de clientes, produtos, armazém, funcionários, encomendas, entradasSaidasPaiol. Apenas token e tema (Zustand) em localStorage.
2. ~~**Encomendas [id] editar**~~ — **Feito.** Usa PUT/GET api/encomendas/{id} e produtosApi.
3. ~~**Libs encomendas, clientes, produtos, armazem, funcionarios, entradasSaidasPaiol**~~ — **Feito.** Reduzidas a tipos e/ou API; sem localStorage.
4. ~~**Feedback de erros global**~~ — **Feito.** Toast global para erros de mutation e sessão expirada.
5. ~~**Padronização TanStack Query** (stock, paiol, entradas, adicionar-itens, serviços, produtos gerir, admin editar, perfil, desassociar)~~ — **Feito** nas áreas listadas acima.
6. **Opcional:** Centralizar mais funções em `lib/*Api.ts` e reduzir `fetch` duplicado em páginas. **Parcial (2026):** auth (`authApi.ts`), movimentos/POST paiol (`paiolApi.ts`), entrada/saída (`entradaPaiolApi.ts`, `saidaPaiolApi.ts`); login/registar/UserContext já não usam `fetch`+`apiPath` inline.
