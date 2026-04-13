# Tratamento de erros no frontend e loops de useEffect

Este documento descreve os tipos de erros e más práticas que surgem no frontend quando **não há padrões consistentes** para carregar dados e tratar falhas. Os **loops de useEffect** são um sintoma comum.

---

## 1. Que erros são estes?

### 1.1 Loops infinitos com `useEffect`

- **Sintoma**: A página fica lenta, o browser pode travar; na consola vês muitas chamadas de rede ou muitos logs; React avisa de “Too many re-renders” ou a UI pisca.
- **Causa típica**: O array de dependências do `useEffect` inclui um **valor que muda em cada render** (objeto ou array criado “inline”). O efeito corre → atualiza estado → re-render → o valor nas dependências é de novo diferente (nova referência) → o efeito corre outra vez → ciclo infinito.

**Exemplo concreto no projeto** (`app/funcionarios/[id]/editar/page.tsx`):

```ts
const funcionario = editValue && ... ? mapApiItemToFuncionario(...) : null;  // novo objeto em cada render

useEffect(() => {
  if (!editValue || !funcionario) return;
  setForm({ ... });
  setDocs({ ... });
  setExistingDocPaths({ ... });
}, [editValue, funcionario]);  // funcionario é nova referência em cada render → efeito corre sempre → setState → re-render → loop
```

- **Correção**: Não colocar nas dependências objetos derivados que são recriados a cada render. Depender apenas de `editValue` (ou do id) e obter o que precisas **dentro** do efeito a partir de `editValue`.

---

### 1.2 Re-fetches em excesso (sem debounce)

- **Sintoma**: Cada tecla nos filtros (pesquisa, classificação, etc.) dispara um novo pedido à API; a lista pisca ou há muitos pedidos em sequência.
- **Causa**: Um `useEffect` que faz fetch com dependências `[mounted, pesquisa, classificacao, ...]`. Sem debounce, qualquer alteração a esses estados provoca um fetch imediato.
- **Onde aparece**: Páginas como `encomendas/novo/adicionar-itens`, `produtos/gerir` (aqui o fetch depende de todos os filtros; em adicionar-itens há debounce para o primeiro load, mas o efeito continua a depender de pesquisa/classificação e re-corre quando mudam).
- **Padrão mais seguro**: Usar **um único padrão** para listagens com filtros: ou debounce no estado dos filtros antes de o passar ao efeito, ou usar TanStack Query com chave que inclua os filtros (e opcionalmente `debounce` na própria query).

---

### 1.3 Tratamento de erros inconsistente

- **Sintoma**: Nalgumas páginas o utilizador vê uma mensagem clara em caso de falha; noutras a falha é silenciosa ou genérica; noutras ainda o erro é mostrado de forma diferente (estado local vs toast vs alert).
- **Exemplos no código**:
  - `setLoadError(msg)` (adicionar-itens, desassociar)
  - `setMessage({ type: "error", text: msg })` (produtos editar, funcionarios editar, perfil, etc.)
  - `setErro(...)` (preparar, movimentos)
  - `.catch(() => setApiData(null))` sem mensagem ao utilizador (preparar, stock, conteudo)
  - `.catch(() => {})` vazio (ThemeContext, login em alguns fluxos)
- **Problemas**:
  - Não há um único canal para “erro global” (ex.: toast ou barra no topo).
  - A mensagem útil da API (ex.: `res.json().message`) nem sempre é lida; noutros sítios usa-se `err.message`.
  - Falhas de rede vs 4xx vs 5xx não são tratadas de forma uniforme.

---

### 1.4 Padrões de “carregar dados” misturados

- **Sintoma**: Umas páginas usam `useEffect` + `fetch` + `setLoading`/`setError`/`setData`; outras usam `useQuery` (TanStack Query). Manutenção e comportamento (retry, cache, invalidação) ficam diferentes.
- **Problemas**:
  - Com `useEffect` + fetch: loading e erro têm de ser geridos à mão em cada página; não há invalidação automática nem retry consistente.
  - Com `useQuery`: loading/error já vêm da query; mas onde ainda se usa useEffect para “sync” (ex.: encher o form com dados da query), as dependências mal escolhidas geram os loops acima.

---

## 2. Porque é que os loops são “sintoma de falta de padrões”?

- Não há uma **regra clara** para “quando usar useEffect vs useQuery” nem para “como sincronizar dados da API com estado local (form)”.
- Sem essa regra, em formulários de edição cai-se no padrão “quando temos dados da API, fazemos setForm/setDocs num useEffect” e coloca-se nas dependências tanto `editValue` como um objeto derivado (`funcionario`) → loop.
- Com um padrão único (ex.: “dados da API só via useQuery; preencher form uma vez quando `data` passa de undefined a definido, usando apenas `data` na dependência”) estes erros seriam evitados de raiz.

---

## 3. Padrões que evitariam estes erros

| Problema | Padrão recomendado |
|----------|---------------------|
| Loop por dependência instável | Em efeitos de “sync API → form”, dependências só de `data` ou `id`; nunca de objetos derivados (calcular dentro do efeito a partir de `data`). |
| Re-fetches em excesso | Listagens com filtros: useQuery com queryKey que inclua os filtros; opcionalmente debounce nos valores antes de os passar à key. Evitar useEffect que faz fetch com muitos estados de filtro nas deps sem debounce. |
| Erros inconsistentes | Um único mecanismo de feedback (ex.: toast ou contexto de “notificações”) e uma função helper `handleApiError(res, err)` que extrai mensagem da API ou gera mensagem por tipo (rede, 401, 404, 5xx). |
| Mistura useEffect vs useQuery | Regra: “dados da API” → useQuery/useMutation; “sincronizar API → form” → um único useEffect com deps `[data]` (ou `[data?.id]`), e dentro do efeito fazer o set do form uma vez quando data existe. |

---

## 4. TypeScript, `tsc` e pastas `.next`

- **Problema**: Incluir **em paralelo** `.next/types/**/*.ts` e `.next/dev/types/**/*.ts` no `tsconfig.json` faz o TypeScript carregar **duas definições** de tipos de rotas (`LayoutRoutes`, etc.) e pode gerar **TS2344** no `validator.ts` gerado pelo Next.
- **Correção no projeto**: manter **só** `.next/types/**/*.ts` no `include`; `next-env.d.ts` importa `./.next/types/routes.d.ts` (fonte única). O **`npm run typecheck`** (`tsc --noEmit`) deve passar após um `next build` (ou `next dev`) que regenere `.next`.
- **Nota**: se `next dev` ou `next build` **voltarem a** acrescentar `.next/dev/types/**/*.ts` ao `include`, remover essa linha duplicada (comportamento conhecido no Next 16 em Windows; ver [issue #85028](https://github.com/vercel/next.js/issues/85028)).

---

## 5. Resumo

- **Loops de useEffect**: normalmente causados por **dependências instáveis** (objetos/arrays criados no render). Correção: não colocar esses valores nas deps; usar apenas identificadores estáveis (`id`, `data` da query).
- **Tratamento de erros**: hoje **inconsistente** (setLoadError vs setMessage vs .catch vazio). Um padrão único (toast/notificação + helper de erro) reduz bugs e melhora UX.
- **Padrões consistentes**: definir **uma** forma de carregar dados (preferencialmente useQuery) e **uma** forma de preencher formulários a partir da API (useEffect com deps estáveis), evita tanto loops como re-fetches desnecessários e facilita manutenção.
- **Tipos `tsc`**: ver secção 4 sobre `.next/types` vs `.next/dev/types`.
