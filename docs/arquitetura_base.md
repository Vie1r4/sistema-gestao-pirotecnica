# PIROFAFE — Arquitetura base (Source of Truth)

Este documento define as regras de negócio e de arquitetura que orientam refatorações e alterações estruturais. **Antes de mover ficheiros, criar camadas novas ou alterar fluxos transversais, consultar este ficheiro.**

---

## 1. Stack e organização

### Backend

- **Framework:** ASP.NET Core 8.
- **Arquitetura:** Clean Architecture **rigorosa**:
  - **Domain:** entidades, value objects, regras de domínio puras — **sem** referências a EF Core, SQL, HTTP ou infraestrutura.
  - **Application:** casos de uso, interfaces (ports), DTOs de aplicação, orquestração — depende apenas do Domain.
  - **Infrastructure:** EF Core, `DbContext`, repositórios concretos, serviços externos, armazenamento de ficheiros, email, etc.
  - **Presentation/API:** controladores minimalistas, filtros de autorização, binding — sem lógica de negócio pesada.

### Frontend

- **Framework:** Next.js.
- **Organização:** arquitetura **baseada em Features** (módulos por capacidade de negócio: UI, hooks, API client e tipos agrupados por feature), evitando apenas “pastas por tipo” sem contexto de domínio.

---

## 2. Segurança

- **Autenticação:** JWT para acesso à API.
- **Refresh tokens:** persistidos com **hash SHA-256** (nunca armazenar o token em claro onde couber risco de exposição em massa).
- **Autorização por papéis (roles):**
  - **Admin**
  - **Armazém**
  - **Técnico**
  - **Comercial**

Novas permissões ou alterações de política devem alinhar com estes papéis salvo decisão explícita de alterar este documento.

---

## 3. Domínio de negócio (regras rigorosas)

### Paióis

- Os paióis têm **limites MLE** e **NEM** (capacidades/regulações do espaço de armazenamento). Qualquer validação de ocupação, entrada ou movimento deve respeitar estes limites conforme modelado no domínio.

### Encomendas e serviços

- **Uma encomenda associa-se no máximo a um serviço:** `1 Encomenda` → **no máximo** `1 Serviço` (regra de cardinalidade de negócio a manter em invariantes e validações).

### Serviços

- Os **serviços** possuem **distâncias de segurança** (requisitos regulamentares / operacionais).
- Os **serviços** estão sujeitos a **licenças** (validação e documentação conforme modelo de domínio).

---

## 4. Uso deste documento

- É a **fonte única de verdade** para decisões de arquitetura PIROFAFE durante a refatorização.
- Documentação técnica mais detalhada pode existir em outros ficheiros sob `docs/`, mas **não deve contradizer** as regras aqui fixadas.
- Qualquer exceção temporária deve ser registada (PR/comentário) e, idealmente, este ficheiro atualizado quando a exceção deixar de ser temporária.

---

*Última revisão conceitual: alinhamento inicial Clean Architecture backend + Features frontend + regras de segurança e domínio PIROFAFE.*
