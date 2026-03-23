# Verificação: APIs do backend vs utilização no frontend

Resumo da análise: quais endpoints existem no backend e se estão a ser usados no client.

---

## 1. APIs totalmente utilizadas pelo frontend

| API | Endpoints | Utilização |
|-----|-----------|------------|
| **api/auth** | GET existem-utilizadores, POST registar-primeiro-utilizador, POST login | login, registar-primeiro-utilizador |
| **api/home** | GET, GET privacy, GET error, GET/POST limpar-dados, GET/POST preferencias, GET/PUT perfil, POST alterar-password | page.tsx, privacy, error, admin, clearData, ThemeContext, ThemeToggle, perfil |
| **api/admin** | GET, GET/PUT/DELETE utilizadores/{id}, POST clear-all-data | lib/admin.ts, páginas admin |
| **api/servicos** | GET, GET create, POST, GET {id}, GET {id}/edit, PUT, GET {id}/delete, DELETE, documentos, upload-licenca GET/POST, licenca ficheiro, PUT distancia-seguranca | lib/servicosApi.ts, páginas servicos |
| **api/paiol** | GET, stock, movimentos, gestao, {id}, {id}/conteudo, create GET/POST, {id}/edit GET, PUT, {id}/delete GET, DELETE, {id}/documentos/{extraId} | armazem/*, lib/paiolApi.ts |
| **api/clientes** | GET, GET {id}, create GET/POST, {id}/edit GET, PUT, {id}/delete GET, DELETE, {id}/documentos/{extraId} | clientes/page e [id] usam fetchClientes e fetchClienteDetalhe; criar/editar/eliminar usam API |
| **api/produtos** | GET, gerir, {id}, create GET/POST, {id}/edit GET, PUT, {id}/delete GET, DELETE | lib/produtosApi.ts, produtos/* (lista, gerir, detalhe, novo, editar, eliminar) |
| **api/funcionarios** | GET, {id}, create GET/POST, {id}/edit GET, PUT, {id}/delete GET, DELETE, {id}/desassociar GET/POST, {id}/documentos | funcionarios/* + lib/funcionariosApi.ts |
| **api/encomendas** | GET, create GET/POST, adicionar-itens GET, adicionar-item POST, remover-item POST, submeter POST, {id} GET, {id}/aceitar POST, {id}/rejeitar GET/POST, {id}/preparar GET, {id}/registar-preparacao POST, {id}/concluir POST | lib/encomendasApi.ts, encomendas/* (lista, novo, adicionar-itens, [id], preparar, rejeitar; detalhe [id] chama GET {id} quando não há dado local) |
| **api/entrada-paiol** | GET (raiz), GET registar, POST registar | armazem/entradas/registar (chama GET e GET registar e POST registar) |
| **api/saida-paiol** | GET registar, POST registar | armazem/saidas/registar (GET registar com query params e POST registar) |

---

## 2. Endpoints existentes mas pouco ou não utilizados

| Endpoint | Situação |
|----------|----------|
| **GET api/auth/me** | **Atualizado:** UserContext chama GET api/auth/me quando existe token; Navbar e perfil usam `useUser()`. O login/registar já não escrevem "pirofafe-user" no localStorage; a fonte do utilizador é a API. |
| **GET api/saida-paiol** (raiz) | No backend devolve mensagem sobre onde obter histórico. O frontend não chama este GET; só usa GET registar e POST registar. Uso opcional (mensagem informativa). |

---

## 3. Frontend que ainda usa localStorage/dados locais em vez de API

Ou seja: a API existe e está a ser chamada nalguns fluxos, mas há código que duplica lógica ou prefere dados locais.

| Área | O que acontece | O que fazer |
|------|----------------|-------------|
| **Clientes** | `lib/clientes.ts` tem `getClientes()` e `getClienteById()` a ler de localStorage. Usados em: **servicos/page.tsx** (dropdown clientes), **encomendas/page.tsx** e **encomendas/novo** (lista e nome do cliente), **lib/servicos.ts** e **lib/encomendas.ts**. A área clientes em si já usa `fetchClientes` e `fetchClienteDetalhe` (API). | Fazer servicos e encomendas obterem lista/nome de clientes via API (fetchClientes ou endpoint de detalhe) em vez de getClientes/getClienteById. |
| **Encomendas detalhe** | `encomendas/[id]/page.tsx` usa primeiro `getEncomendaById(id)` (localStorage) e só se for null chama GET api/encomendas/{id}. | Passar a usar sempre a API como fonte (GET api/encomendas/{id}); remover fallback localStorage para detalhe. |
| **Serviços** | `lib/servicos.ts` mantém listas em localStorage (pirofafe-servicos, equipa, licenças, distâncias, docs) e funções que leem/escrevem lá. As páginas de serviços podem estar a usar servicosApi; confirmar que nenhuma lista/detalhe/edição usa só localStorage. | Garantir que todas as listagens e CRUD de serviços usam apenas servicosApi; remover ou desativar fallbacks localStorage em servicos.ts. |
| **Produtos** | Páginas de produtos usam `produtosApi` (fetchList, fetchGerir, fetchDetails, etc.). `lib/produtos.ts` ainda tem localStorage; verificar se alguma página usa getProdutoById/loadProdutos. | Se alguma página (ex.: saidas) usar getProdutoById/getPaiolById, passar a obter dados via API (produtos, paiol). |
| **Armazém / movimentos** | `lib/armazem.ts` e `lib/entradasSaidasPaiol.ts` têm listas em localStorage. A lista de paióis e a página de movimentos já usam api/paiol e api/paiol/movimentos. | Remover ou marcar como legado o uso de armazem/entradasSaidasPaiol para listas; usar apenas API. |
| **Saídas registar** | `armazem/saidas/registar/page.tsx` usa `getPaiolById`, `getProdutoById`, `getStockDisponivelPaiolProduto` (lib/armazem e lib/entradasSaidasPaiol). Também chama GET api/saida-paiol/registar para o formulário. | Obter paiol, produto e stock via API (ex.: GET registar ou endpoints de paiol/produtos) e remover dependências de getPaiolById, getProdutoById, getStockDisponivelPaiolProduto. |

---

## 4. Resumo

- **Quase todas as APIs estão a ser utilizadas** em algum fluxo (listagens, CRUD, auth, home, admin, encomendas, serviços, paiol, entrada/saída).
- **Pontos fracos:**
  1. **api/auth/me** está pouco usado; o frontend poderia usá-lo como fonte única para utilizador (nome, roles) em vez de pirofafe-user no localStorage.
  2. **Duplicação de dados:** clientes, encomenda detalhe, serviços, produtos, armazém e saidas ainda têm código que usa localStorage ou helpers locais; a prioridade deve ser usar sempre a API quando o dado existe no backend.

Seguir a regra em `.cursor/rules/prefer-backend-api.mdc`: usar a API em primeiro lugar e eliminar fallbacks localStorage para dados que a API já fornece.
