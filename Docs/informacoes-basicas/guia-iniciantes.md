# PIROFAFE — Guia em linguagem simples (para programadores iniciantes)

Este texto explica **o que é** o projeto, **como está organizado** e **porquê** se faz assim. Não é preciso dominar todas as tecnologias para perceber a ideia geral.

**Atualização:** maio de 2026 — roles/políticas alinhadas a `docs/backend/ROLES-E-PERMISSOES.md`; pasta `apps/web/app/lib`, refresh de sessão.

---

## 1. O que é este projeto?

**PIROFAFE** é uma aplicação de **gestão** para contexto pirotécnico: armazéns (paióis), produtos, encomendas, serviços no terreno, clientes, funcionários, etc.

Na prática são **dois programas** que trabalham em conjunto:

1. Um **servidor** (backend) que guarda dados numa **base de dados** e expõe **regras de negócio**.
2. Um **site / aplicação web** (frontend) que as pessoas usam no **browser** (Chrome, Edge, etc.).

Juntos formam o que se chama uma aplicação **full-stack**: há “frente” (o que vês) e “trás” (servidor e dados).

---

## 2. Porque é que existem duas partes (backend e frontend)?

### Backend (pasta na raiz do repositório)

- É feito em **ASP.NET Core** (C#, .NET).
- Corre como um **serviço** na máquina ou no servidor (por exemplo na porta `7225` em desenvolvimento).
- **Não é** a página bonita: é a parte que **valida**, **calcula** e **grava** na base de dados.
- Expõe uma **API REST**: pedidos HTTP com respostas em **JSON** (texto estruturado que o programa consegue ler).

**Porquê assim?**  
Assim a lógica e os dados ficam **num sítio controlado**. Qualquer cliente (web, futura app mobile, outro sistema) pode pedir dados **da mesma forma**, sem duplicar regras.

### Frontend (pasta `apps/web/`)

- É feito em **Next.js** (versão recente, com **App Router**), **TypeScript** e **React**.
- Corre normalmente na porta **3000** em desenvolvimento.
- É o que **vês e clicás**: ecrãs, formulários, listas, mapas.

**Porquê assim?**  
O browser dos utilizadores é o melhor sítio para interfaces ricas. O servidor não precisa de desenhar HTML “clássico” para cada página: o frontend **pede dados à API** e mostra-os.

**Onde está o código que chama a API?**  
Em geral, nas **páginas** (`apps/web/app/.../page.tsx`) e em ficheiros **`apps/web/app/lib/`**. Há vários ficheiros `*Api.ts` (por exemplo `encomendasApi.ts`, `paiolApi.ts`, `authApi.ts`) onde se concentram os **endereços** e os **pedidos HTTP** para não repetir o mesmo `fetch` em dez sítios. Ficheiros como `apiConfig.ts` sabem qual é o **URL base** da API (por defeito o backend em `https://localhost:7225`, configurável com `NEXT_PUBLIC_API_URL`).

---

## 3. Como é que as duas partes “falam”?

- O **browser** (frontend) faz **pedidos HTTP** ao **endereço** do backend (ex.: `https://localhost:7225/api/...`).
- O servidor **responde** com **JSON** (listas, objetos, mensagens de erro).
- Isto chama-se **cliente–servidor**: o frontend é o cliente; o backend é o servidor.

**CORS** (outro nome que vais ouvir): como o frontend e o backend podem estar em **portas ou domínios diferentes**, o browser tem regras de segurança. O backend está configurado para **aceitar** pedidos vindos do endereço do frontend (ex.: `http://localhost:3000`). Sem isto, o browser bloqueava os pedidos.

---

## 4. Autenticação — porque é que há login e “token”?

Nem todos os dados são públicos. Só utilizadores **registados** podem ver ou alterar coisas consoante o seu **papel** (Admin, Gestor, Comercial, Armazém, etc.).

Fluxo simples:

1. O utilizador faz **login** (email + palavra-passe).
2. O backend verifica na base de dados e devolve um **JWT** (access token) e, em muitos casos, um **refresh token** (outro segredo de sessão que serve para **pedir um JWT novo** sem voltar a pôr a palavra-passe).
3. Os pedidos seguintes levam o JWT no cabeçalho (`Authorization: Bearer ...`).
4. O servidor **confia** no JWT se a assinatura estiver correta (usa uma **chave secreta** guardada em configuração segura, não no Git).

**Quem és depois do login?**  
A aplicação web chama **`GET /api/auth/me`** (com o JWT) e o servidor devolve nome, email, **papéis** (roles) e uma lista de **permissões** em texto (ex.: `encomendas.gerir`, `armazem.stock`). O menu e os botões podem **esconder** o que o utilizador não pode fazer — mas a **validação real** continua no backend.

**Porquê JWT e refresh?**  
O JWT expira ao fim de algum tempo (por segurança). O **refresh token** permite renovar o access token **sem** novo login, desde que ainda seja válido. O frontend agenda essa renovação antes do JWT expirar.

**Porquê JWT e não só “sessão no servidor” para tudo?**  
É um padrão comum em APIs modernas: o access token leva informação mínima; o refresh fica armazenado de forma segura no cliente para renovações.

A **chave secreta do JWT** (`Jwt:Secret`) **não** deve ir para o repositório: em desenvolvimento usa-se **user-secrets**; em produção **variáveis de ambiente** ou cofre de segredos.

**localStorage:** não serve para guardar listas de clientes, encomendas ou stock — isso vem sempre da **API** (fonte de verdade). Só há exceções pequenas (tokens de sessão, tema, etc.); ver `docs/frontend/AUDITORIA-LOCALSTORAGE.md`.

---

## 5. Base de dados

Os dados persistentes (clientes, encomendas, stock, etc.) estão numa base **SQL Server**. O projeto usa **Entity Framework Core**: em vez de escrever SQL à mão para tudo, o código C# descreve **entidades** e **migrações** criam/atualizam tabelas.

Em desenvolvimento costuma usar-se **LocalDB** (SQL Server simplificado no Windows). Em produção usa-se uma instância SQL real; a **connection string** vem da configuração do ambiente, não de um ficheiro público com passwords.

O servidor pode também **fazer cópias de segurança** (ficheiros `.bak`) da base num horário configurável — útil em máquinas de desenvolvimento ou servidores pequenos. Isto está descrito em **`docs/backend/BACKUPS-AUTOMATICOS.md`** (opcional para iniciantes).

---

## 6. Pastas principais (visão de alto nível)

Na **raiz** do repositório (backend):

| Pasta / ficheiro | Ideia simples |
|------------------|----------------|
| `Controllers/` | Rotas da API: o que acontece em `GET /api/clientes`, `POST /api/...`, etc. |
| `Models/` | Forma dos dados (entidades, DTOs). |
| `Data/` | Contexto da base de dados, seed inicial (roles, dados mínimos). |
| `Services/` | Lógica mais pesada (regras de negócio, ficheiros, email, cópias de segurança agendadas) separada dos controllers. |
| `Program.cs` | Arranque da aplicação: serviços, JWT, CORS, pipeline HTTP, tarefas em segundo plano (ex.: backup). |

Em **`apps/web/`** (frontend):

| Pasta / ficheiro | Ideia simples |
|------------------|----------------|
| `app/` | Páginas e rotas (Next.js App Router). |
| `app/lib/*Api.ts` | Um sítio por área para **pedidos à API** (encomendas, paióis, login, etc.). |
| `app/lib/auth.ts` | Ler e guardar **tokens** no browser; **renovar** JWT; logout — sem misturar com cada ecrã. |
| `app/lib/apiConfig.ts` | URL base da API (`apiPath`, `getApiBaseUrl`). |
| `app/context/` | Contexto React, por exemplo **quem está autenticado** (`UserContext` + dados de `/api/auth/me`). |
| `app/components/` | Componentes reutilizáveis (navbar, tabelas, etc.). |

---

## 7. Outras escolhas que vais ver mencionadas

- **TanStack Query (React Query):** ajuda a **carregar** e **atualizar** dados da API no frontend, com cache e estados de “a carregar” / erro, sem reinventar tudo em `useEffect`.
- **Tailwind CSS:** estilos com classes; não é obrigatório perceber logo toda a sintaxe para seguir o projeto.
- **Zustand / toasts:** pequenos estados globais (ex.: mensagens “sucesso” ou “erro”) sem gravar dados de negócio.
- **Testes no client:** **Vitest** (testes automáticos) e **Playwright** (browser); no GitHub o workflow do client também corre Playwright após o build — ver `apps/web/README.md`.
- **Swagger:** em **desenvolvimento**, página que lista endpoints e permite testar a API. Em **produção** costuma estar **desligada** para não expor a superfície da API ao público.

---

## 8. Onde está a documentação “técnica” completa?

| Documento | Para quê |
|-----------|----------|
| [`docs/README.md`](../README.md) | Índice de **toda** a pasta `docs/`. |
| [`docs/visao-geral/PROJETO.md`](../visao-geral/PROJETO.md) | Produto, módulos da API, domínio, segurança, arranque. |
| [`docs/visao-geral/ARQUITETURA-E-VISAO-GERAL.md`](../visao-geral/ARQUITETURA-E-VISAO-GERAL.md) | Arquitetura mais **fina** (Program.cs, EF, camada `lib/`, convenções). |
| [`docs/api/API.md`](../api/API.md) | Endpoints, autenticação, exemplos. |
| [`README.md`](../../README.md) na raiz | Instalar, correr backend e frontend, JWT, primeiro utilizador. |

Este ficheiro (`guia-iniciantes.md`) não substitui esses documentos: serve de **ponte** para quem precisa primeiro de uma explicação em linguagem básica.

---

## Glossário rápido

| Termo | Significado simples |
|-------|---------------------|
| **API** | Conjunto de URLs e regras com que o frontend pede e altera dados. |
| **Endpoint** | Um URL concreto da API (ex.: listar clientes). |
| **JSON** | Formato de texto para trocar dados entre programas. |
| **JWT** | Token de sessão assinado que prova quem és nos pedidos. |
| **REST** | Estilo de API baseado em HTTP (GET, POST, PUT, DELETE). |
| **Migration** | Alteração versionada à estrutura da base de dados. |
| **DTO** | Objeto “só para transporte” na API, às vezes diferente da tabela na BD. |
| **CORS** | Mecanismo do browser que controla pedidos entre domínios/portas diferentes. |
| **Refresh token** | Segundo token (não é o JWT principal) usado só para **pedir um JWT novo** quando o antigo expira. |
| **Permissões** | Strings que o backend calcula a partir das roles (ex.: `clientes.gerir`); o frontend usa para mostrar ou esconder menus. |
| **App Router** | Forma atual do Next.js de organizar pastas = rotas (`app/pagina/page.tsx`). |

---

*Última ideia:* se algo no código parecer confuso, pergunta primeiro **“isto é backend ou frontend?”** e **“isto lê dados ou só mostra?”** — muitas vezes isso já reduz pela metade o sítio onde procurar. Para pedidos HTTP repetidos, pergunta **“já existe isto num `*Api.ts`?”**.
