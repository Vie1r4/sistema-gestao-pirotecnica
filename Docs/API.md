# Documentação da API

Índice: [README.md](README.md).

API REST do sistema de gestão pirotécnica (cliente Pirofafe); backend em **ASP.NET Core 8**; documentação interativa via **Swagger** (UI disponível **apenas em ambiente Development** — em produção o Swagger está desligado por segurança).

---

## Base URL

| Ambiente   | URL                      |
|-----------|---------------------------|
| Desenvolvimento | `https://localhost:7225` |
| Produção  | Definir em `NEXT_PUBLIC_API_URL` (frontend) / variável de ambiente |

Todos os endpoints da API estão sob o prefixo `/api/`.

---

## Autenticação

A API usa **JWT (JSON Web Token)**. A maioria dos endpoints exige o header:

```http
Authorization: Bearer <token>
```

### Fluxo

1. **Bootstrap do primeiro administrador** (público, rate limit `bootstrap`)  
   `GET /api/auth/existem-utilizadores`  
   Resposta: `{ "primeiroRegistoDisponivel": true|false }` — **não** indica se já existem contas (evita enumeração).  
   `true` só quando `Bootstrap:AllowFirstUserRegistration` está ativo **e** ainda não há utilizadores.

2. **Registar primeiro utilizador** (requer bootstrap ativo e BD sem contas)  
   `POST /api/auth/registar-primeiro-utilizador`  
   Body: `{ "email": "...", "password": "...", "nome": "..." }` (nome opcional)  
   Este utilizador recebe a role **Admin**. Com bootstrap desativado: **404**.

3. **Login**  
   `POST /api/auth/login`  
   Body: `{ "email": "...", "password": "..." }`  
   Resposta: `{ "token": "...", "expiresInSeconds": 3600, ... }`.  
   **Nota**: o login só é permitido após **confirmação do email** (Identity `EmailConfirmed=true`).

4. **Refresh do token**  
   `POST /api/auth/refresh`  
   Usa **cookie HttpOnly** de refresh token (não acessível a JavaScript).  
   - Body: `{}` (ou vazio)  
   - Requer `credentials: include` no frontend.  
   Resposta: novo `token`.

5. **Perfil do utilizador autenticado**  
   `GET /api/auth/me`  
   Requer Bearer token. Resposta: `id`, `email`, `userName`, `nome`, `roles`, **`permissions`** (lista de strings alinhada com `PoliticasAutorizacao.ObterPermissoes`).

6. **Logout** (invalidar refresh token)  
   `POST /api/auth/logout`  
   Body: `{}` (ou vazio). O refresh token é revogado no servidor (se existir) e o cookie é limpo.

7. **Recuperar palavra-passe** (público)  
   `POST /api/auth/forgot-password`  
   Body: `{ "email": "..." }`  
   Resposta: 200 sempre (não revela se o email existe). Se existir, envia email com link de reset.

8. **Redefinir palavra-passe** (público; link do email)  
   `POST /api/auth/reset-password`  
   Body: `{ "email": "...", "token": "...", "newPassword": "...", "confirmPassword": "..." }`  
   Resposta: 200 se sucesso; 400 se token inválido/expirado ou password não cumprir as mesmas regras do Identity (mín. 8 caracteres, maiúsculas, minúsculas, algarismo e carácter especial).

9. **Confirmar email** (público; link enviado ao criar conta)  
   `GET /api/auth/confirm-email?userId=...&code=...`  
   Confirma o email do utilizador e **inicia sessão** (devolve JWT; refresh token em cookie HttpOnly).  
   O token do link tem **tempo limite de 1 hora**. No frontend existe a página `/confirm-email` que chama este endpoint.

10. **Reenviar confirmação de email** (público)  
   `POST /api/auth/resend-confirm-email`  
   Body: `{ "email": "..." }`  
   Resposta: 200 sempre (não revela se o email existe). Se existir e ainda não estiver confirmado, envia novo link de confirmação.

### Palavra-passe, lockout e tokens no cliente

- **Política Identity:** mínimo **8** caracteres, com **maiúscula**, **minúscula**, **dígito** e **carácter especial**; lockout após tentativas falhadas (configuração em `Program.cs`).
- **Access token (JWT):** o frontend guarda-o **apenas em memória** (Zustand), não em `localStorage`.
- **Refresh token:** emitido em **cookie HttpOnly** (`pirofafe_rt`); renovação com `POST /api/auth/refresh` e `credentials: include`. **Não** persistir o refresh token em JavaScript.
- Após login ou refresh, usar o `token` da resposta JSON no header `Authorization: Bearer …` até expirar; então chamar `/refresh`.

### Autorização em listagens sensíveis

Os seguintes **GET** exigem JWT válido **e** política de autorização (não são públicos):

| Recurso | Política |
|---------|----------|
| `GET /api/funcionarios` (e sub-rotas) | `PodeGerirFuncionarios` |
| `GET /api/clientes` (e sub-rotas) | `PodeGerirClientes` |
| `GET /api/encomendas` (e sub-rotas) | `PodeGerirEncomendas` |

Sem token → **401**; com token mas sem permissão → **403**.

---

## Swagger (recomendado em desenvolvimento)

A documentação OpenAPI inclui **comentários XML** dos controllers (`GenerateDocumentationFile` em `Finalproj.Api.csproj`). Cada operação mostra resumo e, onde aplicável, códigos de resposta (`ProducesResponseType`).

A forma mais rápida de explorar e testar a API é usar o **Swagger UI** (só com `ASPNETCORE_ENVIRONMENT=Development` ou equivalente):

1. Inicie o backend: `dotnet run` (na raiz do projeto).
2. Abra no browser: **https://localhost:7225/swagger**.
3. Para endpoints protegidos:
   - Obtenha um token com **POST /api/auth/login** no Swagger.
   - Copie o valor de `token` da resposta (sem a palavra "Bearer").
   - Clique em **Authorize**, introduza `Bearer <token>` (ou só o token, consoante a configuração) e confirme.
   - As próximas chamadas incluem automaticamente o header de autorização.

---

## Recursos e endpoints

Resumo dos módulos. A listagem completa e os schemas estão no Swagger.

### Autenticação — ` /api/auth `

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/existem-utilizadores` | Bootstrap: `primeiroRegistoDisponivel`; se sem contas, `existemBackupsAnteriores` (boolean, sem contagem) |
| POST | `/registar-primeiro-utilizador` | Regista o primeiro utilizador (Admin) |
| POST | `/login` | Login; devolve JWT (refresh token em cookie HttpOnly) |
| GET | `/me` | Dados do utilizador autenticado (`roles`, **`permissions`**) |
| POST | `/refresh` | Renovar access token |
| POST | `/logout` | Invalidar refresh token |
| POST | `/forgot-password` | Envia link para redefinir palavra-passe (resposta 200 sempre) |
| POST | `/reset-password` | Redefine palavra-passe com token enviado por email |
| POST | `/resend-confirm-email` | Reenvia link de confirmação de email (resposta 200 sempre) |
| GET | `/confirm-email` | Confirma email (query `userId`, `code`); devolve JWT e define refresh em cookie |

### Clientes — `/api/clientes`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista de clientes (paginada) |
| GET | `/{id}` | Detalhe + encomendas ativas + histórico (parâmetro `historicoPagina`) |
| GET | `/create` | Dados para formulário de criação |
| POST | `/` | Criar cliente (`PodeGerirClientes` — Admin, Gestor) |
| GET | `/{id}/edit` | Dados para edição |
| PUT | `/{id}` | Atualizar cliente |
| GET | `/{id}/delete` | Dados para confirmação de eliminação |
| DELETE | `/{id}` | Eliminar cliente |
| GET | `/{id}/documentos/{extraId}` | Ficheiro de documento extra |

**DTOs:** respostas usam **ClienteResponseDto**; o **UserId** (Identity) só aparece nas respostas de **edição** (`includeSensitive`).

### Encomendas — `/api/encomendas`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista (filtros: estado, paginação) |
| GET | `/{id}` | Detalhe da encomenda |
| GET | `/create` | Dados para nova encomenda |
| POST | `/create` | Criar encomenda |
| GET | `/adicionar-itens` | Dados para adicionar itens |
| POST | `/adicionar-item` | Adicionar item ao rascunho |
| POST | `/adicionar-compilado` | Adicionar compilado (atalho); expande para produtos no rascunho |
| POST | `/remover-item` | Remover item |
| POST | `/submeter` | Submeter encomenda |
| PUT | `/{id}` | Editar encomenda. Aceita **`coordenadorPirotecnicoId`** (opcional) que é persistido na encomenda; o detalhe (`GET /{id}`) devolve `coordenadorPirotecnicoId` + `coordenadorPirotecnico`. |
| POST | `/{id}/aceitar` | Aceitar encomenda |
| GET | `/{id}/rejeitar` | Dados para rejeitar |
| POST | `/{id}/rejeitar` | Rejeitar encomenda |
| GET | `/{id}/preparar` | Dados para preparação |
| POST | `/{id}/registar-preparacao` | Registar preparação (FIFO). **400** com `ENCOMENDA_COORDENADOR_SEM_CRED` se a encomenda tiver `coordenadorPirotecnicoId` e o funcionário não tiver `numeroCredencial` na ficha — validação antes de alocar stock. |
| POST | `/{id}/concluir` | Concluir encomenda |

**DTOs (encomendas):** listagem e detalhe devolvem objetos tipados (`EncomendaListResponseDto`, `EncomendaDetailResponseDto`) — **sem** expor `FuncionarioAceiteUserId` / `FuncionarioPreparouUserId`. No **GET `/{id}`**, o JSON inclui também **`funcionarioAceiteNome`** e **`funcionarioPreparouNome`** no nível raiz (com `encomenda`, `stockPorProduto`).

### Serviços — `/api/servicos`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista de serviços (paginada) |
| GET | `/create` | Dados para criar (`itensEncomenda` quando `?encomendaId=`). |
| POST | `/` | Criar serviço (**JSON** `ServicoSaveRequestDto`: evento + `zonas[]` com linhas de material). |
| GET | `/{id}` | Detalhe |
| GET | `/{id}/edit` | Dados para edição (`itensEncomenda`, `zonasLancamento` no `servico`). |
| PUT | `/{id}` | Atualizar (**JSON** `ServicoSaveRequestDto`). |
| GET | `/{id}/delete` | Confirmação de eliminação |
| DELETE | `/{id}` | Eliminar |
| POST | `/{id}/documentos-extras` | Anexar documento (multipart: `nome`, `ficheiro`). |
| DELETE | `/{id}/documentos-extras/{extraId}` | Remover documento extra. |
| GET | `/{id}/documentos/{extraId}` | Documento extra |
| GET | `/{id}/upload-licenca` | Dados para upload de licença |
| POST | `/{id}/upload-licenca` | Upload de licença |
| GET | `/{id}/licenca/{licencaId}/ficheiro` | Ficheiro de licença |
| PUT | `/{id}/distancia-seguranca/{distanciaId}` | **Legado** — atualizar distância medida manualmente; valores são recalculados ao gravar zonas (fonte: MAX de `distanciaSegurancaPublico_m` do catálogo). Não exposto na UI. |
| POST | `/{id}/licenca/gerar` | Gerar declaração PSP (PDF, Admin/Gestor; 404 para restantes) |

**Documentação regulatória:** ver [documentacao-regulatoria/README.md](./documentacao-regulatoria/README.md).

**DTOs:** lista e **`servico`** em create/edit/delete/detalhe como **ServicoResponseDto** (inclui **`nomeEvento`**, **`coordenadorPirotecnicoId`**, **`zonasLancamento`** com linhas e distâncias por zona). POST/PUT usam **`ServicoSaveRequestDto`** (`equipaIds` histórico; **`responsavelPirotecnicoId`** por zona tem de pertencer à equipa; **`raioPublico`** ignorado — calculado a partir dos produtos). **Distâncias de segurança** (serviço e por zona): sincronizadas no servidor como o **máximo** de `distanciaSegurancaPublico_m` dos produtos alocados (por zona; serviço = máximo entre zonas); todas as linhas por tipo de referência recebem o mesmo valor (`distanciaMinima_m` = `distanciaMedida_m`). GET **`/create`** e **`/{id}/edit`** devolvem **`funcionarios`** (todos, para coordenador/equipa/responsáveis de zona). No GET **`/{id}`**, **`itensEncomenda`** são DTOs de item+produto (incl. **`distanciaSegurancaPublico_m`** no produto), **`paiolParaRota`** usa coordenadas da primeira zona (fallback: serviço), licenças sem caminho de ficheiro no JSON (**`hasFicheiro`**).

### Paiol / Armazém — `/api/paiol`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista de paióis (consoante permissões) |
| GET | `/stock` | Stock por produto/paiol |
| GET | `/movimentos` | Movimentos (entradas/saídas); query: `tipo`, `paiolId`, `pagina`, `itensPorPagina`. Cada linha inclui **`registadoPor`** / **`retiradoPor`** (nome); não expõe UserIds de Identity nas linhas. |
| GET | `/gestao` | Gestão completa (Admin) |
| GET | `/{id}/conteudo` | Conteúdo de um paiol |
| GET | `/{id}` | Detalhe do paiol |
| GET | `/create` | Dados para criar |
| POST | `/` | Criar paiol |
| GET | `/{id}/edit` | Dados para edição |
| PUT | `/{id}` | Atualizar |
| GET | `/{id}/delete` | Confirmação de eliminação |
| DELETE | `/{id}` | Eliminar |
| GET | `/{id}/documentos/{extraId}` | Documento extra |

**Visibilidade:** todos os paióis são visíveis para utilizadores com permissão de armazém (`PodeVerArmazemStock`); não existe filtro por cargo na criação/edição. POST/PUT não recebem `CargosAcesso`.

### Entrada / Saída Paiol — `/api/entrada-paiol`, `/api/saida-paiol`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista / contexto |
| GET | `/registar` | Dados para registar |
| POST | `/registar` | Registar entrada ou saída; resposta com `entrada` / `saida` em DTO (sem UserId do funcionário). |

### Produtos — `/api/produtos`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista de produtos |
| GET | `/gerir` | Lista para gestão |
| GET | `/{id}` | Detalhe |
| GET | `/create` | Dados para criar |
| POST | `/` | Criar |
| GET | `/{id}/edit` | Dados para edição |
| PUT | `/{id}` | Atualizar (`UpdateProdutoRequestDto`; inclui **`distanciaSegurancaPublico_m`** — metros; `dataRegisto` só no GET, read-only) |
| GET | `/{id}/delete` | Confirmação |
| DELETE | `/{id}` | Eliminar |

**Campo de catálogo:** cada produto tem **`distanciaSegurancaPublico_m`** (int, metros, obrigatório ao criar/editar). O **`raioPublico`** das zonas de serviço e do serviço é **calculado no servidor** como o **máximo** entre os produtos alocados em cada zona (ex.: bombas 100 m + caixas 50 m → 100 m); o cliente **não envia** `raioPublico` no POST/PUT.

### Compilados — `/api/compilados`

Atalhos nomeados (ex.: «Dúzia») com lista de produtos e quantidade **por unidade** do atalho. Nas encomendas, `POST /api/encomendas/adicionar-compilado` multiplica cada linha pela quantidade pedida. Política: **PodeGerirProdutos** (Admin, Gestor).

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista com itens e nomes de produto |
| GET | `/{id}` | Detalhe |
| POST | `/` | Criar (`nome`, `itens[]` com `produtoId`, `quantidadePorUnidade`) |
| PUT | `/{id}` | Atualizar |
| DELETE | `/{id}` | Eliminar |

### Funcionários — `/api/funcionarios`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista (paginada) |
| GET | `/{id}` | Detalhe |
| GET | `/create` | Dados para criar |
| POST | `/` | Criar |
| GET | `/{id}/edit` | Dados para edição |
| PUT | `/{id}` | Atualizar |
| GET | `/{id}/delete` | Confirmação |
| DELETE | `/{id}` | Eliminar |
| GET | `/{id}/desassociar` | Dados para desassociar |
| POST | `/{id}/desassociar` | Desassociar utilizador |
| GET | `/{id}/documentos` | Lista de documentos |

**DTOs:** **FuncionarioResponseDto**; na lista, **`contaAssociada`** e **`contaEmailConfirmada`** por item (sem **`userIdsConfirmados`**). No GET **`/{id}`**, **`associadoAoUtilizadorAtual`** no JSON raiz. **UserId** só no GET **`/{id}/edit`**.

### Admin — `/api/admin`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Resumo |
| GET | `/stats` | Estatísticas do dashboard (`utilizadoresSemEmailConfirmado`, totais, etc.) |
| GET | `/logs` | Logs paginados (`acao`, `userName`, `entidade`, `dataInicio`, `dataFim`, `pagina`, `itensPorPagina`). `entidade`: `encomenda`, `stock`, `admin`, `conta` |
| GET | `/health` | Estado da API (`status`, `database`, `environment`, `version`, `utcNow`) |
| GET | `/utilizadores` | Lista de utilizadores (`emailConfirmed` por item) |
| GET | `/utilizadores/criar-opcoes` | Roles permitidas e funcionários sem conta |
| POST | `/utilizadores` | Criar conta (`email`, `password`, `roles`, `funcionarioId?`, `enviarEmailConfirmacao`) |
| GET | `/utilizadores/{id}` | Detalhe utilizador (roles, funcionário) |
| PUT | `/utilizadores/{id}` | Atualizar roles e funcionário associado |
| PUT | `/utilizadores/{id}/credenciais` | Alterar email/username (`{ email }`) |
| POST | `/utilizadores/{id}/resend-confirm-email` | Reenviar email de confirmação |
| POST | `/utilizadores/{id}/confirm-email` | Marcar email como confirmado (admin) |
| POST | `/utilizadores/{id}/send-password-reset` | Enviar link de redefinição de palavra-passe |
| DELETE | `/utilizadores/{id}` | Eliminar |
| GET | `/backups` | Lista backups + `resumo` (`semContasNaBd`, `backupsDeInstalacaoAnterior`) |
| DELETE | `/backups/{nomeFicheiro}` | Apagar `.bak` e ZIP associado |
| POST | `/backups/run` | Backup completo: `.bak` + ZIP de `Uploads` (Admin) |
| GET | `/backups/{nomeFicheiro}/download` | Descarregar `.bak` ou `_uploads.zip` (Admin) |
| POST | `/backups/restore` | Restaurar BD + documentos — body `{ "nomeFicheiro": "....bak" }` |
| POST | `/clear-all-data` | Limpar BD, Uploads, contas e tokens; repor roles (apenas Development) |

### Home / Preferências — `/api/home`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Página inicial |
| GET | `/stats` | Estatísticas |
| GET | `/preferencias` | Preferências do utilizador |
| POST | `/preferencias` | Guardar preferências |
| GET | `/perfil` | Perfil |
| PUT | `/perfil` | Atualizar perfil |
| POST | `/alterar-password` | Alterar palavra-passe |
| GET | `/gestor-dashboard` | KPIs e atividade recente (Admin, Gestor). Inclui `kpiContexto`, `encomendasPendentesLista` (até 8, estado Pendente). |

### Analytics do gestor — `/api/gestor-analytics`

Autorização: **Admin**, **Gestor** (JWT).

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/volume` | Volume de encomendas. Query: `granularidade` = `dia` \| `semana` \| `mes` \| `ano`, `dias` (7–1095, default 90). A consulta inclui +1 ano para comparação homóloga. Variação % no frontend (homóloga). No painel: **Ctrl+scroll** no gráfico altera agrupamento (ano→mês→semana→dia). |
| GET | `/comparacao-anual` | Comparação **multi-ano** por mês civil (Jan–Dez). Query opcional: `produtoId`, `clienteId`. Resposta: `anoAtual`, `anosDisponiveis[]` (só anos com encomendas), `series[]` (`ano`, `pontos[]` com `mes`, `rotulo`, `total`, `futuro`, `encomendas[]`). O ano corrente termina no mês actual; anos completos vão até Dezembro. Com `produtoId`, totais em unidades. |
| GET | `/consumo-cliente` | O que o cliente encomendou no intervalo. Query obrigatória: `clienteId`, `desde`, `ate` (yyyy-MM-dd, inclusivos; ex. `2025-04-15` e `2025-04-20`); opcional: `produtoId`. Resposta: `desde`, `ate`, `linhas[]`, totais, `materiais`/`clientes`. |
| GET | `/top-clientes` | Top por encomendas e por serviços. Query: `limite`. Campo `risco` (volume em queda vs 90 dias anteriores). |

---

## Correlation id e suporte

- Cada resposta inclui o header **`X-Correlation-Id`** (o cliente pode enviar o mesmo header no pedido; o servidor valida e reutiliza ou gera um novo).
- Em erros **500** em rotas `/api/*`, o JSON pode incluir **`correlationId`** para cruzar com os logs do servidor.
- Em CORS, o header é **exposto** ao JavaScript (`Access-Control-Expose-Headers`). Ver [OPERACOES.md](OPERACOES.md).

## Paginação

Endpoints que devolvem listas paginadas usam tipicamente:

- **Query:** `pagina` (default 1), `itensPorPagina` (ex.: 20 ou 25, consoante o endpoint).
- **Resposta:** `totalRegistos`, `paginaAtual` (ou equivalente), e o array de itens.

Exemplos:

- **Clientes:** `GET /api/clientes?pagina=1&itensPorPagina=20`
- **Detalhe de cliente (histórico):** `GET /api/clientes/{id}?historicoPagina=2`
- **Movimentos:** `GET /api/paiol/movimentos?tipo=Entradas&pagina=1&itensPorPagina=20`
- **Encomendas:** `GET /api/encomendas?estado=...&pagina=1&itensPorPagina=20`
- **Serviços:** `GET /api/servicos?pagina=1&itensPorPagina=20`

---

## Códigos de resposta

| Código | Significado |
|--------|-------------|
| 200 | OK — sucesso |
| 201 | Created — recurso criado |
| 400 | Bad Request — dados inválidos ou regra de negócio |
| 401 | Unauthorized — token em falta ou inválido |
| 403 | Forbidden — sem permissão (role) |
| 404 | Not Found — recurso não encontrado |
| 500 | Internal Server Error — erro no servidor (em produção a mensagem é genérica) |

As respostas de erro em JSON contêm geralmente um campo `error` (e em desenvolvimento pode existir `detail`).

---

## Exemplo rápido (cURL)

```bash
# 1. Login
curl -s -X POST "https://localhost:7225/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SuaPassword123"}' \
  -k

# 2. Usar o token (substituir TOKEN pelo valor devolvido em "token")
curl -s -X GET "https://localhost:7225/api/clientes" \
  -H "Authorization: Bearer TOKEN" \
  -k
```

---

## Referência completa

Para todos os parâmetros, schemas de request/response e tipos, use o **Swagger** em **https://localhost:7225/swagger** com o backend a correr em **Development** (em produção use esta documentação ou clientes HTTP próprios).
