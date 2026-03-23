# Documentação da API PIROFAFE

API REST do sistema de gestão pirotécnica. Backend em **ASP.NET Core 8**; documentação interativa via **Swagger**.

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

1. **Verificar se existem utilizadores** (público)  
   `GET /api/auth/existem-utilizadores`  
   Resposta: `{ "existem": true }` ou `{ "existem": false }`.

2. **Registar primeiro utilizador** (apenas quando não existem contas)  
   `POST /api/auth/registar-primeiro-utilizador`  
   Body: `{ "email": "...", "password": "..." }`  
   Este utilizador recebe a role **Admin**.

3. **Login**  
   `POST /api/auth/login`  
   Body: `{ "email": "...", "password": "..." }`  
   Resposta: `{ "token": "...", "refreshToken": "...", "expiresAt": "...", "userName": "..." }`.

4. **Refresh do token**  
   `POST /api/auth/refresh`  
   Body: `{ "refreshToken": "..." }`  
   Resposta: novo `token` e opcionalmente novo `refreshToken`.

5. **Perfil do utilizador autenticado**  
   `GET /api/auth/me`  
   Requer Bearer token. Resposta: dados do utilizador (nome, email, roles).

6. **Logout** (invalidar refresh token)  
   `POST /api/auth/logout`  
   Body: `{ "refreshToken": "..." }`.

---

## Swagger (recomendado)

A forma mais rápida de explorar e testar a API é usar o **Swagger UI**:

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
| GET | `/existem-utilizadores` | Verifica se já existem utilizadores (público) |
| POST | `/registar-primeiro-utilizador` | Regista o primeiro utilizador (Admin) |
| POST | `/login` | Login; devolve JWT e refresh token |
| GET | `/me` | Dados do utilizador autenticado |
| POST | `/refresh` | Renovar access token |
| POST | `/logout` | Invalidar refresh token |

### Clientes — `/api/clientes`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista de clientes (paginada) |
| GET | `/{id}` | Detalhe + encomendas ativas + histórico (parâmetro `historicoPagina`) |
| GET | `/create` | Dados para formulário de criação |
| POST | `/` | Criar cliente |
| GET | `/{id}/edit` | Dados para edição |
| PUT | `/{id}` | Atualizar cliente |
| GET | `/{id}/delete` | Dados para confirmação de eliminação |
| DELETE | `/{id}` | Eliminar cliente |
| GET | `/{id}/documentos/{extraId}` | Ficheiro de documento extra |

### Encomendas — `/api/encomendas`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista (filtros: estado, paginação) |
| GET | `/{id}` | Detalhe da encomenda |
| GET | `/create` | Dados para nova encomenda |
| POST | `/create` | Criar encomenda |
| GET | `/adicionar-itens` | Dados para adicionar itens |
| POST | `/adicionar-item` | Adicionar item ao rascunho |
| POST | `/remover-item` | Remover item |
| POST | `/submeter` | Submeter encomenda |
| PUT | `/{id}` | Editar encomenda |
| POST | `/{id}/aceitar` | Aceitar encomenda |
| GET | `/{id}/rejeitar` | Dados para rejeitar |
| POST | `/{id}/rejeitar` | Rejeitar encomenda |
| GET | `/{id}/preparar` | Dados para preparação |
| POST | `/{id}/registar-preparacao` | Registar preparação |
| POST | `/{id}/concluir` | Concluir encomenda |

### Serviços — `/api/servicos`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista de serviços (paginada) |
| GET | `/create` | Dados para criar |
| POST | `/` | Criar serviço |
| GET | `/{id}` | Detalhe |
| GET | `/{id}/edit` | Dados para edição |
| PUT | `/{id}` | Atualizar |
| GET | `/{id}/delete` | Confirmação de eliminação |
| DELETE | `/{id}` | Eliminar |
| GET | `/{id}/documentos/{extraId}` | Documento extra |
| GET | `/{id}/upload-licenca` | Dados para upload de licença |
| POST | `/{id}/upload-licenca` | Upload de licença |
| GET | `/{id}/licenca/{licencaId}/ficheiro` | Ficheiro de licença |
| PUT | `/{id}/distancia-seguranca/{distanciaId}` | Atualizar distância de segurança |

### Paiol / Armazém — `/api/paiol`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista de paióis (consoante permissões) |
| GET | `/stock` | Stock por produto/paiol |
| GET | `/movimentos` | Movimentos (entradas/saídas); query: `tipo`, `paiolId`, `pagina`, `itensPorPagina` |
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

### Entrada / Saída Paiol — `/api/entrada-paiol`, `/api/saida-paiol`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista / contexto |
| GET | `/registar` | Dados para registar |
| POST | `/registar` | Registar entrada ou saída |

### Produtos — `/api/produtos`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista de produtos |
| GET | `/gerir` | Lista para gestão |
| GET | `/{id}` | Detalhe |
| GET | `/create` | Dados para criar |
| POST | `/` | Criar |
| GET | `/{id}/edit` | Dados para edição |
| PUT | `/{id}` | Atualizar |
| GET | `/{id}/delete` | Confirmação |
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

### Admin — `/api/admin`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Resumo |
| GET | `/utilizadores` | Lista de utilizadores |
| GET | `/utilizadores/{id}` | Detalhe utilizador |
| PUT | `/utilizadores/{id}` | Atualizar (roles, etc.) |
| DELETE | `/utilizadores/{id}` | Eliminar |
| POST | `/clear-all-data` | Limpar dados (cuidado) |

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

---

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

Para todos os parâmetros, schemas de request/response e tipos, use o **Swagger** em **https://localhost:7225/swagger** com o backend a correr.
