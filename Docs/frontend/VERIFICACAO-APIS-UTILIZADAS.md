# Verificação: APIs do backend vs utilização no frontend

**Última revisão:** maio de 2026.

Resumo da análise: quais endpoints existem no backend e se estão a ser usados no client.

---

## 1. APIs totalmente utilizadas pelo frontend

| API | Endpoints | Utilização |
|-----|-----------|------------|
| **api/auth** | GET existem-utilizadores, POST registar-primeiro-utilizador, POST login, GET me | **lib/authApi.ts** (páginas login/registar e UserContext); refresh/logout em **lib/auth.ts** |
| **api/home** | GET, GET privacy, GET error, GET/POST limpar-dados, GET/POST preferencias, GET/PUT perfil, POST alterar-password | page.tsx, privacy, error, admin, clearData, ThemeSync, ThemeToggle, perfil |
| **api/admin** | GET, GET/PUT/DELETE utilizadores/{id}, POST clear-all-data | lib/admin.ts, páginas admin |
| **api/servicos** | GET, GET create, POST, GET {id}, GET {id}/edit, PUT, GET {id}/delete, DELETE, documentos, upload-licenca GET/POST, licenca ficheiro, PUT distancia-seguranca | lib/servicosApi.ts, páginas servicos |
| **api/paiol** | GET, stock, movimentos, gestao, {id}, {id}/conteudo, create GET/POST, {id}/edit GET, PUT, {id}/delete GET, DELETE, {id}/documentos/{extraId} | **lib/paiolApi.ts** (incl. POST criar paiol, GET movimentos); páginas armazém |
| **api/clientes** | GET, GET {id}, create GET/POST, {id}/edit GET, PUT, {id}/delete GET, DELETE, {id}/documentos/{extraId} | clientes/*, lib (fetchClientes, fetchClienteDetalhe) |
| **api/produtos** | GET, gerir, {id}, create GET/POST, {id}/edit GET, PUT, {id}/delete GET, DELETE | lib/produtosApi.ts, produtos/* |
| **api/funcionarios** | GET, {id}, create GET/POST, {id}/edit GET, PUT, {id}/delete GET, DELETE, {id}/desassociar GET/POST, {id}/documentos | funcionarios/*, lib/funcionariosApi.ts (incl. postDesassociarConta) |
| **api/encomendas** | GET, create GET/POST, adicionar-itens GET, adicionar-item POST, remover-item POST, submeter POST, {id} GET, {id}/aceitar POST, {id}/rejeitar GET/POST, {id}/preparar GET, {id}/registar-preparacao POST, {id}/concluir POST | lib/encomendasApi.ts, encomendas/* |
| **api/entrada-paiol** | GET registar, POST registar | **lib/entradaPaiolApi.ts** (GET formulário + POST registar); página armazem/entradas/registar |
| **api/saida-paiol** | GET registar, POST registar | **lib/saidaPaiolApi.ts**; página armazem/saidas/registar |

---

## 2. Endpoints existentes mas pouco ou não utilizados pelo client

| Endpoint | Situação |
|----------|----------|
| **GET api/saida-paiol** (raiz) | No backend devolve mensagem sobre onde obter histórico. O frontend não chama este GET; só usa GET registar e POST registar. Uso opcional (mensagem informativa). |
| **POST api/admin/backups/run** | Existe para Admin disparar backup SQL imediato; **não** há botão no frontend (pode usar-se via Swagger/cURL). Ver `docs/backend/BACKUPS-AUTOMATICOS.md`. |

---

## 3. Frontend e localStorage (estado atual)

**Não há dados de negócio em localStorage.** Listagens, detalhes e CRUD usam as APIs; onde aplicável, **TanStack Query** (`useQuery` / `useMutation`) com invalidação.

| Tema | Conteúdo |
|------|----------|
| **O que é guardado** | Token/refresh (sessão), tema UI (`pirofafe-theme` via Zustand persist). |
| **Fonte do utilizador** | GET **api/auth/me** (UserContext), não objeto manual no login. |
| **Documentação detalhada** | Ver **AUDITORIA-LOCALSTORAGE.md** e a regra `.cursor/rules/prefer-backend-api.mdc`. |

---

## 4. Resumo

- **Quase todas as APIs estão a ser utilizadas** em algum fluxo (listagens, CRUD, auth, home, admin, encomendas, serviços, paiol, entrada/saída).
- **Centralização em `lib/*Api.ts`:** auth (público + `/me`), entrada/saída de paiol, movimentos e POST criar paiol estão em módulos dedicados; páginas deixam de chamar `apiPath`/`fetch` diretamente nesses fluxos. Casos especiais (página de erro, ThemeSync) podem continuar sem Query onde não fizer sentido.

Seguir a regra em `.cursor/rules/prefer-backend-api.mdc`: usar a API em primeiro lugar para dados de negócio.
