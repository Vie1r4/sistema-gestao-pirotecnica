# PIROFAFE — Guia em linguagem simples (para programadores iniciantes)

Este texto explica **o que é** o projeto, **como está organizado** e **porquê** se faz assim. Não é preciso dominar todas as tecnologias para perceber a ideia geral.

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

### Frontend (pasta `client/`)

- É feito em **Next.js** (JavaScript/TypeScript + React).
- Corre normalmente na porta **3000** em desenvolvimento.
- É o que **vês e clicás**: ecrãs, formulários, listas, mapas.

**Porquê assim?**  
O browser dos utilizadores é o melhor sítio para interfaces ricas. O servidor não precisa de desenhar HTML “clássico” para cada página: o frontend **pede dados à API** e mostra-os.

---

## 3. Como é que as duas partes “falam”?

- O **browser** (frontend) faz **pedidos HTTP** ao **endereço** do backend (ex.: `https://localhost:7225/api/...`).
- O servidor **responde** com **JSON** (listas, objetos, mensagens de erro).
- Isto chama-se **cliente–servidor**: o frontend é o cliente; o backend é o servidor.

**CORS** (outro nome que vais ouvir): como o frontend e o backend podem estar em **portas ou domínios diferentes**, o browser tem regras de segurança. O backend está configurado para **aceitar** pedidos vindos do endereço do frontend (ex.: `http://localhost:3000`). Sem isto, o browser bloqueava os pedidos.

---

## 4. Autenticação — porque é que há login e “token”?

Nem todos os dados são públicos. Só utilizadores **registados** podem ver ou alterar coisas consoante o seu **papel** (admin, armazém, comercial, etc.).

Fluxo simples:

1. O utilizador faz **login** (email + palavra-passe).
2. O backend verifica na base de dados e devolve um **JWT** (um “bilhete” digital assinado).
3. Os pedidos seguintes levam esse bilhete no cabeçalho (`Authorization: Bearer ...`).
4. O servidor **confia** no bilhete se a assinatura estiver correta (usa uma **chave secreta** guardada em configuração segura, não no Git).

**Porquê JWT e não só “sessão no servidor”?**  
É um padrão comum em APIs modernas: o servidor não precisa de guardar cada sessão em memória para tudo; o token leva informação mínima (quem és e que permissões tens).

A **chave secreta do JWT** (`Jwt:Secret`) **não** deve ir para o repositório: em desenvolvimento usa-se **user-secrets**; em produção **variáveis de ambiente** ou cofre de segredos.

---

## 5. Base de dados

Os dados persistentes (clientes, encomendas, stock, etc.) estão numa base **SQL Server**. O projeto usa **Entity Framework Core**: em vez de escrever SQL à mão para tudo, o código C# descreve **entidades** e **migrações** criam/atualizam tabelas.

Em desenvolvimento costuma usar-se **LocalDB** (SQL Server simplificado no Windows). Em produção usa-se uma instância SQL real; a **connection string** vem da configuração do ambiente, não de um ficheiro público com passwords.

---

## 6. Pastas principais (visão de alto nível)

Na **raiz** do repositório (backend):

| Pasta / ficheiro | Ideia simples |
|------------------|----------------|
| `Controllers/` | Rotas da API: o que acontece em `GET /api/clientes`, `POST /api/...`, etc. |
| `Models/` | Forma dos dados (entidades, DTOs). |
| `Data/` | Contexto da base de dados, seed inicial (roles, dados mínimos). |
| `Services/` | Lógica mais pesada (regras de negócio, ficheiros, email) separada dos controllers. |
| `Program.cs` | Arranque da aplicação: serviços, JWT, CORS, pipeline HTTP. |

Em **`client/`** (frontend):

| Pasta | Ideia simples |
|-------|----------------|
| `app/` | Páginas e rotas (Next.js App Router). |
| `app/lib/` | Funções que chamam a API, helpers, configuração da URL base. |
| `app/components/` | Componentes reutilizáveis (navbar, tabelas, etc.). |

---

## 7. Outras escolhas que vais ver mencionadas

- **TanStack Query (React Query):** ajuda a **carregar** e **atualizar** dados da API no frontend, com cache e estados de “a carregar” / erro, sem reinventar tudo em `useEffect`.
- **Tailwind CSS:** estilos com classes; não é obrigatório perceber logo toda a sintaxe para seguir o projeto.
- **Swagger:** em **desenvolvimento**, página que lista endpoints e permite testar a API. Em **produção** costuma estar **desligada** para não expor a superfície da API ao público.

---

## 8. Onde está a documentação “técnica” completa?

- **Índice geral:** [`Docs/README.md`](../README.md)
- **API detalhada:** [`Docs/api/API.md`](../api/API.md)
- **Visão do produto e stack:** [`Docs/visao-geral/PROJETO.md`](../visao-geral/PROJETO.md)

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

---

*Última ideia:* se algo no código parecer confuso, pergunta primeiro **“isto é backend ou frontend?”** e **“isto lê dados ou só mostra?”** — muitas vezes isso já reduz pela metade o sítio onde procurar.
