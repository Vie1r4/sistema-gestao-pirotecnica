# Organização do frontend (`apps/web/app`)

Convenção para tornar previsível **onde vive cada coisa** e evitar duplicação.
Regra de ouro: "quero mudar X, está na pasta Y".

---

## Onde vive cada coisa

| Tipo | Local | Exemplos |
|------|-------|----------|
| Tipos, regras de domínio e **mapeadores de API** (`mapApiTo*`) | `app/lib/<feature>.ts` | `lib/armazem.ts`, `lib/encomendas.ts`, `lib/funcionarios.ts` |
| **Chamadas** à API | `app/lib/<feature>Api.ts` | `lib/paiolApi.ts`, `lib/encomendasApi.ts` |
| **Design tokens** (classes Tailwind partilhadas por toda a app) | `app/components/ui/tokens.ts` | `cardClass`, `inputClass`, `btnPrimary`, … |
| UI **genérica** reutilizável | `app/components/ui/` | `DataTable`, `StatusBadge`, `EmptyState` |
| UI **específica de uma feature** (cards, tabelas, formulários, doc links) | `app/<feature>/_components/` | `clientes/_components/clientesColumns.tsx`, `servicos/_components/ZonasLancamentoEditor.tsx` |
| Páginas/rotas | `app/<feature>/.../page.tsx` | `app/armazem/page.tsx` |

---

## Design tokens (`components/ui/tokens.ts`)

Fonte **única** das classes repetidas. As páginas importam daqui em vez de
redeclarar constantes locais.

- `cardClass`, `sectionTitleClass`, `labelClass`, `inputClass`
- `authCardClass` — card maior das páginas de autenticação (`p-8 … sm:p-10`)
- Inputs compactos (`px-3 py-2`), três variantes propositadas:
  - `inputClassCompact` — campos compactos de formulário (sem anel de foco/placeholder)
  - `inputClassFilter` — controlos de filtro (com anel de foco, sem placeholder)
  - `inputClassSearch` — caixas de pesquisa (com anel de foco e placeholder)
- Botões de **listas/detalhe** (`px-4 py-2`): `btnPrimary`, `btnSecondary`, `btnDanger`
- Botões de **formulários** (`px-5 py-2.5`): `btnPrimaryLg`, `btnSecondaryLg`
- Botão de **eliminar** sólido: `btnDangerSolid`

Os formulários reutilizam os tokens com alias para manter o tamanho maior:

```ts
import {
  cardClass,
  inputClass,
  labelClass,
  btnPrimaryLg as btnPrimary,
  btnSecondaryLg as btnSecondary,
} from "@/app/components/ui/tokens";
```

Estilos **intencionalmente diferentes** que continuam locais (não migrar):
botões full-width das páginas de auth (`w-full px-5 py-3`) e a ação âmbar de
"desassociar conta". Os inputs compactos e o card de auth já têm token próprio
(ver lista acima).

---

## Mapeadores de API e casing

A API pode devolver campos em camelCase **ou** PascalCase. Use o helper de
`app/lib/apiCase.ts` nos mapeadores em vez de reescrever `obj[k] ?? obj[K]`:

```ts
import { lerCampo, getter } from "@/app/lib/apiCase";

const get = getter(obj); // get("nome") aceita "nome" ou "Nome"
```

Mapeadores partilhados ficam no `lib` da feature (ex.: `mapApiToEncomendaLinha`,
`mapApiToEncomendaDetalhe`, `mapApiToEncomendaForm`, `mapPaiolComOcupacao`,
`mapApiToFuncionario`) e são consumidos pelas páginas e pelo dashboard — sem
duplicação.

---

## Ao adicionar/alterar UI

1. Precisa de uma classe já existente (card, input, botão)? Importa de `tokens.ts`.
2. É UI só desta feature? Cria em `app/<feature>/_components/`.
3. É genérico (serve várias features)? Vai para `app/components/ui/`.
4. Mexeu num contrato/endpoint? Atualiza `lib/<feature>.ts` / `lib/<feature>Api.ts` e a doc da API.
