# Análise da paginação no frontend (app/)

Resumo de **quais páginas têm paginação**, **como a implementam** e se o padrão é **consistente** entre páginas.

---

## 1. Páginas com paginação

| Página | Tipo | Onde está | Consistente? |
|--------|------|------------|--------------|
| **Encomendas** (`/encomendas`) | Server-side (API) | URL `?estado=...&pagina=...` | Sim (padrão A) |
| **Serviços** (`/servicos`) | Server-side (API) | URL `?clienteId=...&dataDesde=...&dataAte=...&pagina=...` | Sim (padrão A) |
| **Armazém → Movimentos** (`/armazem/movimentos`) | Server-side (API) | URL `?tipo=...&paiolId=...&pagina=...` | Quase (padrão B) |
| **Cliente detalhe – histórico** (`/clientes/[id]`) | Server-side (API) | Backend devolve 1 página; **sem** param nem UI de paginação no frontend | N/A (só 1 página) |
| **Funcionários** (`/funcionarios`) | Client-side (DataTable) | Sem query params; todos os dados em memória | Padrão C |
| **Clientes** (`/clientes`) | Client-side (DataTable) | Sem query params; todos os dados em memória | Padrão C |
| **Armazém** (`/armazem`) | Client-side (DataTable) | Sem query params; todos os dados em memória | Padrão C |

---

## 2. Três formas de paginação

### Padrão A — Server-side com URL e TanStack Query (Encomendas, Serviços)

- **Página**: `searchParams.get("pagina")` (default 1).
- **Constante**: `ITENS_POR_PAGINA = 20`.
- **Fetch**: `useQuery` com `queryKey` que inclui `pagina` (e filtros); a API recebe `pagina` e `itensPorPagina`.
- **Navegação**: `router.push(/rota?…&pagina=N)` para anterior/próxima ou número de página.
- **Texto**: “X–Y de total” e “Página N de totalPaginas”; botões Anterior/Próximo e, em Encomendas/Serviços, janela de números (ex.: 1…5 6 7…12).
- **Cálculos**: `totalPaginas = ceil(totalRegistos / ITENS_POR_PAGINA)`, `start = (pagina-1)*ITENS_POR_PAGINA+1`, `end = min(pagina*ITENS_POR_PAGINA, total)`.

**Ficheiros**: `app/encomendas/page.tsx`, `app/servicos/page.tsx`, `lib/encomendasApi.ts`, `lib/servicosApi.ts` (e `lib/servicos.ts`).

---

### Padrão B — Server-side com URL e useEffect + fetch (Movimentos)

- **Página**: `searchParams.get("pagina")` (default 1).
- **Constante**: `ITENS_POR_PAGINA = 25` (diferente de A).
- **Fetch**: `useEffect` com `fetch()` (não useQuery); dependências `[mounted, tipo, paiolIdParam, pagina, retryCount]`; estado local `paginaAtual`, `totalRegistos`, `setPaginaAtual`, `setTotalRegistos` a partir da resposta.
- **Navegação**: `router.push(buildUrl({…, pagina: N}))`; função `buildUrl` para montar a URL com filtros e página.
- **UI**: Dois blocos de tabela (entradas e saídas), cada um com “X–Y de total” e botões Anterior/Próximo; `pageSize={10}` no DataTable refere-se à paginação **interna** do DataTable (client-side dentro da página atual), não à API.
- **Inconsistência**: Usa estado local (`paginaAtual`) sincronizado com a resposta, além do `pagina` da URL; Encomendas/Serviços usam só a URL e os dados da query.

**Ficheiros**: `app/armazem/movimentos/page.tsx`.

---

### Padrão C — Client-side (DataTable)

- **Dados**: Lista completa carregada da API (sem parâmetros de página).
- **Paginação**: Só na UI, via `DataTable` (TanStack Table) com `getPaginationRowModel()`, `pageSize={10}`.
- **URL**: Não muda com a página; não há `?pagina=`.
- **Texto**: “X–Y de filteredRows” e “Página N de getPageCount()” dentro do componente.

**Ficheiros**: `app/components/ui/DataTable.tsx`; usado em `app/funcionarios/page.tsx`, `app/clientes/page.tsx`, `app/armazem/page.tsx` (e em movimentos para a tabela dentro de cada página de resultados).

---

## 3. Cliente detalhe – histórico

- **Backend**: `GET api/clientes/:id` aceita `historicoPagina` (ex.: query) e devolve `encomendasHistorico`, `historicoPagina`, `totalPaginasHistorico`, `totalHistorico`.
- **Frontend**: `fetchClienteDetalhe(token, id)` **não** envia `historicoPagina`; a página não lê query param nem mostra controlos de paginação para o histórico. Ou seja, o histórico é paginado no servidor mas o utilizador só vê a primeira página.

---

## 4. Resumo de consistência

| Aspeto | Encomendas / Serviços | Movimentos | DataTable (listas) |
|--------|------------------------|------------|--------------------|
| Onde vive a “página” | URL `pagina` | URL `pagina` + estado `paginaAtual` | Estado interno da tabela (pageIndex) |
| Como se busca dados | useQuery + API com pagina/itensPorPagina | useEffect + fetch com pagina/itensPorPagina | 1 pedido sem paginação |
| Tamanho de página | 20 | 25 | 10 (fixo no DataTable) |
| Navegação | router.push com nova query | router.push(buildUrl({…, pagina})) | Botões da tabela |
| Cálculo totalPaginas | Sim (igual) | Sim (igual) | getPageCount() |

**Conclusão**:

- **Encomendas** e **Serviços** são consistentes entre si (padrão A): URL + useQuery + mesma lógica de totais e botões.
- **Movimentos** faz server-side com URL mas usa **useEffect + fetch** e estado duplicado (`pagina` vs `paginaAtual`), e usa **25** itens por página em vez de 20.
- **Funcionários, Clientes, Armazém** não têm paginação de API; usam apenas **DataTable** em memória (padrão C).
- **Cliente detalhe**: histórico paginado no backend mas **sem** controlos de paginação no frontend.

---

## 5. Recomendações

1. **Unificar server-side**: Usar o mesmo padrão de Encomendas/Serviços (useQuery + `pagina` na URL, sem estado `paginaAtual`) em **Movimentos**; alinhar `itensPorPagina` (ex.: 20) ou documentar quando for 25.
2. **Cliente detalhe**: Se o histórico tiver muitas encomendas, adicionar `historicoPagina` na URL, passá-lo a `fetchClienteDetalhe` e mostrar “Anterior / Próximo” (e opcionalmente “Página N de M”) para o histórico.
3. **Listas grandes (funcionários, clientes, armazém)**: Se no futuro forem muitos registos, considerar passar a **server-side** como Encomendas/Serviços (API com `pagina`/`itensPorPagina` e URL), em vez de carregar tudo e paginar só no DataTable.
