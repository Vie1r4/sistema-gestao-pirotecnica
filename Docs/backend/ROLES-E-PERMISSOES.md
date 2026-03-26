# Roles e permissões – definir o que cada cargo pode aceder

## Situação atual

- **Roles (cargos) no sistema:** Admin, Armazém, Técnico, Comercial (definidos em `SeedRoles.cs`, `ConstantesFuncionariosClientes`, etc.).
- **Backend:** Quase todas as ações protegidas com `[Authorize(Roles = "Admin")]`. Só o perfil Admin consegue criar/editar/eliminar; os outros roles existem mas não têm permissões específicas.
- **Frontend:** Em todo o lado usa-se `isAdmin = user?.roles?.includes("Admin")` para mostrar/ocultar botões e bloquear páginas.
- **Paióis:** Já existe lógica de “cargos com acesso” por paiol (`CargosAcesso`): um utilizador só vê/usa o paiol se o seu role estiver nessa lista (e Admin continua a ter acesso a tudo).

---

## Objetivo

Definir **o que cada role pode aceder** (por área funcional) e implementar no backend e no frontend de forma consistente e fácil de manter.

---

## Proposta: matriz de permissões por área

Em vez de “só Admin” ou várias verificações soltas, definimos **áreas** (permissões) e atribuímos a cada role o que pode fazer.

### Áreas / permissões sugeridas

| Área (permissão)        | Descrição resumida |
|-------------------------|--------------------|
| **Clientes**            | Ver lista e detalhe; criar, editar, eliminar clientes |
| **Produtos**            | Ver catálogo; criar, editar, eliminar produtos |
| **Encomendas**          | Ver, criar, editar; aceitar/rejeitar; preparar; concluir |
| **Serviços**            | Ver lista e detalhe; criar, editar, eliminar serviços; licenças e distâncias |
| **Armazém**             | Ver paióis, conteúdo, movimentos; gestão de paióis; registar entradas/saídas |
| **Funcionários**        | Ver lista e detalhe; criar, editar, eliminar funcionários; desassociar conta |
| **Utilizadores**        | Painel Admin: listar e editar roles dos utilizadores (Identity) |

### Matriz sugerida (quem pode quê)

| Role      | Clientes | Produtos | Encomendas | Serviços | Armazém | Funcionários | Utilizadores |
|-----------|----------|----------|------------|----------|---------|--------------|---------------|
| **Admin** | Sim      | Sim      | Sim        | Sim      | Sim     | Sim          | Sim           |
| **Armazém** | Não    | Ver      | Ver        | Não      | Sim     | Não          | Não           |
| **Técnico** | Não    | Ver      | Ver + preparar/concluir | Sim | Ver + seu acesso por paiol | Não | Não |
| **Comercial** | Sim   | Ver      | Sim (criar/editar/aceitar/rejeitar) | Ver | Não | Não | Não |

- **Ver** = consulta (lista, detalhe).
- **Sim** = ver + criar + editar + eliminar (conforme aplicável à área).
- O acesso aos **paióis** continua a depender de `CargosAcesso` por paiol; “Armazém” e “Técnico” podem ter acesso a conjuntos diferentes de paióis.

Esta matriz pode ser ajustada (por exemplo, Comercial poder criar serviços, ou Técnico não ver encomendas). O importante é ter **um sítio único** onde isto fica definido.

---

## Melhor maneira de implementar

### 1. Backend (ASP.NET Core)

- **Fonte única das roles:** uma classe estática (ex.: `ConstantesRoles`) com os quatro nomes de roles, e referência em `SeedRoles`, validadores e dropdowns.
- **Fonte única da matriz:** uma classe de “autorização” que diz, para cada permissão (área), quais roles a têm. Exemplo:
  - `PermissoesPorRole.PodeGerirClientes(roles)` → true se alguma role do utilizador tiver permissão.
  - Ou: `PermissoesPorRole.RolesComAcesso("Clientes")` → `["Admin", "Comercial"]`.
- **Políticas de autorização:** em vez de `[Authorize(Roles = "Admin")]` em cada ação, usar **políticas**:
  - Ex.: `[Authorize(Policy = "PodeGerirClientes")]` nos endpoints de clientes (criar/editar/eliminar).
  - Em `Program.cs` (ou numa extensão) configurar cada política: “PodeGerirClientes” exige role Admin **ou** Comercial; “PodeGerirArmazem” exige Admin **ou** Armazém; etc.
- **Manter compatibilidade com paióis:** a lógica atual de “cargos com acesso” por paiol continua; as políticas só controlam quem pode aceder às **áreas** (ex.: quem pode abrir a gestão de paióis ou registar entradas).

Vantagens: alterar o que “Comercial” pode fazer passa a ser num único sítio (a matriz + políticas); os controllers ficam com `[Authorize(Policy = "…")]` em vez de roles hardcoded.

### 2. API “eu” (opcional mas recomendado)

- No `GET /api/auth/me` (ou no token) devolver também **permissões** derivadas das roles, por exemplo:
  - `permissions: ["clientes.gerir", "produtos.ver", "encomendas.gerir", …]`
- O frontend usa essas permissões para mostrar/ocultar menus e botões, em vez de repetir a lógica “se role Comercial então pode clientes”. Assim, a matriz fica só no backend e o frontend só consome uma lista de permissões.

### 3. Frontend (Next.js)

- Se houver **permissões** no `me`: usar `user.permissions` (ou equivalente) para decidir se mostra link “Clientes”, “Novo cliente”, “Editar”, etc. (ex.: `podeGerirClientes = user.permissions?.includes("clientes.gerir")`).
- Se não houver permissões no `me`: manter roles e ter no frontend um **mapeamento** (ex. em `lib/permissions.ts`) que, a partir de `user.roles`, calcula “pode gerir clientes”, “pode gerir armazém”, etc., alinhado com a matriz do backend. Menos ideal (duplicação), mas possível.

---

## Ordem de trabalho sugerida

1. **Definir e documentar a matriz** (esta tabela) como referência e ajustar com o teu domínio (quem pode fazer o quê).
2. **Backend:** criar `ConstantesRoles` e a classe/estrutura da matriz (ex.: “quem pode gerir clientes” = Admin, Comercial); configurar políticas em `Program.cs`; substituir `[Authorize(Roles = "Admin")]` por `[Authorize(Policy = "PodeGerirX")]` por área.
3. **Opcional:** em `/api/auth/me` (e no token se quiseres), adicionar o campo `permissions` calculado a partir das roles.
4. **Frontend:** usar permissões (ou o mapeamento roles → permissões) para mostrar/ocultar secções e botões em vez de só `isAdmin`.

Se quiseres, o próximo passo pode ser implementar o ponto 2 (constantes, matriz e políticas no backend) e depois o 3 e 4.
