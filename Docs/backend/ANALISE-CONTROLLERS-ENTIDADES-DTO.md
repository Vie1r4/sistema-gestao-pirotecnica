# Análise: Controllers a devolver entidades EF vs DTOs e dados sensíveis

## Resumo

- **Vários controllers devolvem entidades EF diretamente** (ou dentro de objetos anónimos), o que expõe toda a estrutura das entidades e **pode incluir dados sensíveis** (PII, UserIds do Identity, caminhos de ficheiros).
- **AdminController e AuthController** já usam DTOs/ViewModels e **não expõem Identity** (sem PasswordHash, SecurityStamp, etc.).

### Atualização (refactor DTOs — encomendas, paiol/movimentos, entrada/saída)

- **EncomendasController**: respostas de listagem e detalhe usam **EncomendaListResponseDto** / **EncomendaDetailResponseDto**; **não** são serializados `FuncionarioAceiteUserId` / `FuncionarioPreparouUserId` no objeto `encomenda`. Em **GET Details**, `funcionarioAceiteNome` e `funcionarioPreparouNome` vêm no **JSON raiz**.
- **PaiolController**: **GET movimentos** devolve linhas como **EntradaPaiolMovimentoDto** / **SaidaPaiolMovimentoDto** (com `registadoPor` / `retiradoPor`); stock e vários endpoints de `paiol` usam **ProdutoResponseDto** / **PaiolResponseDto** (ver `Docs/api/CONTRATOS-API-DTOs.md`).
- **EntradaPaiolController** / **SaidaPaiolController**: POST **registar** devolve **EntradaPaiolRegistadaDto** / **SaidaPaiolRegistadaDto** (sem UserId na resposta).
- **ClientesController** / **FuncionariosController**: respostas já eram em grande parte DTOs; **UserId** (Identity) do cliente/funcionário **omitido** nas respostas não sensíveis; funcionários — lista com **contaAssociada** / **contaEmailConfirmada** por item (removido **userIdsConfirmados**); GET detalhe com **associadoAoUtilizadorAtual**.
- **ServicosApiController**: **ServicoResponseDto** na lista e nos corpos principais; **itensEncomenda** como **EncomendaItemResponseDto**; **paiolParaRota** como **PaiolResponseDto**; distâncias como DTO com **Cumpre**; PUT distância devolve DTO (não a entidade).

As tabelas abaixo mantêm o histórico de risco; linhas já mitigadas estão assinaladas.

---

## 1. Onde são devolvidas entidades EF diretamente

### ClientesController
| Ação | Devolve | Risco |
|------|---------|--------|
| Lista / detalhe / create-delete | **ClienteResponseDto** | ✅ **DTO**; **UserId** só com `includeSensitive: true` (edição) |
| `Create` POST | `ClienteResponseDto` | ✅ |
| `Edit` GET/PUT / BadRequest | **ClienteResponseDto** (sensível no formulário: NIF, Morada, UserId) | ✅ DTO; PII limitado ao necessário para edição |

### FuncionariosController
| Ação | Devolve | Risco |
|------|---------|--------|
| `Index` GET | **FuncionarioResponseDto** (sem **UserId**; **contaAssociada**, **contaEmailConfirmada**) | ✅ |
| `Details` GET | **FuncionarioResponseDto** + **associadoAoUtilizadorAtual** no raiz | ✅ |
| `Create` POST | **FuncionarioResponseDto** | ✅ |
| `Edit` GET | **FuncionarioResponseDto** com `includeSensitive: true` (**UserId** para o form) | ✅ |
| `Edit` PUT | **FuncionarioResponseDto** | ✅ |
| `Delete` GET | **FuncionarioResponseDto** | ✅ |
| `Desassociar` GET/POST | **FuncionarioResponseDto** | ✅ |

### EncomendasController
| Ação | Devolve | Risco |
|------|---------|--------|
| `Create` GET | `new { clientes, model }` | **Lista de Cliente** (todas as propriedades) |
| `AdicionarItens` GET | `new { cliente, produtosFiltrados, ... }` | **Cliente** + **lista de Produto** |
| `Details` GET | `new { encomenda = EncomendaDetailResponseDto, stockPorProduto, funcionarioAceiteNome, funcionarioPreparouNome }` | ✅ **DTO** para `encomenda`; inclui `Servicos` apenas se ainda carregados no include (rever se necessário expor serviços como DTO) |
| `Create` POST | `new { encomenda = EncomendaDetailResponseDto, ... }` | ✅ **DTO** |
| `Update` PUT | `new { encomenda = EncomendaDetailResponseDto, ... }` | ✅ **DTO** |
| `Aceitar` POST | `new { encomenda = EncomendaDetailResponseDto, ... }` | ✅ **DTO** |
| `Rejeitar` GET | `Ok(EncomendaDetailResponseDto)` — corpo é o DTO diretamente | ✅ **DTO** |
| `Rejeitar` POST | `new { encomenda = EncomendaDetailResponseDto, ... }` | ✅ **DTO** |
| `Preparar` GET | `new { encomenda = DTO, paióis = PaiolResponseDto[], ... }` | ✅ **DTOs** (rever restantes campos do payload) |
| `Concluir` POST | `new { encomenda = EncomendaDetailResponseDto, ... }` | ✅ **DTO** |
| `Index` GET | `items` = EncomendaListResponseDto | ✅ **DTO** |

### PaiolController
| Ação | Devolve | Risco |
|------|---------|--------|
| `Index` GET | `Ok(viewModel)` | **List&lt;PaiolComOcupacaoResponseDto&gt;** (Paiol como DTO) — ✅ mitigado para lista principal |
| `Movimentos` GET | entradas/saídas como DTOs de movimento | ✅ **EntradaPaiolMovimentoDto** / **SaidaPaiolMovimentoDto** |
| Vários `Details` / Create/Edit / Conteudo | `PaiolResponseDto` / mapeamentos | ✅ em grande parte **DTO** (confirmar cada ação no código) |

### ServicosApiController
| Ação | Devolve | Risco |
|------|---------|--------|
| `Index` GET | `lista` = **ServicoResponseDto** | ✅ |
| `Create` POST | **ServicoResponseDto** | ✅ |
| `Details` GET | **servico** = **ServicoResponseDto**; **itensEncomenda** = **EncomendaItemResponseDto**; **paiolParaRota** = **PaiolResponseDto**; distâncias alinhadas ao DTO | ✅ |
| `Edit` GET | **servico** = **ServicoResponseDto**; dropdowns encomendas como objetos `{ id, texto }`; responsáveis/equipa como **FuncionarioResponseDto** | ✅ |
| `Edit` PUT | **ServicoResponseDto** | ✅ |
| `Delete` GET | **ServicoResponseDto** | ✅ |
| `UploadLicenca` POST | **ServicoLicencaDto** (sem **FicheiroPath**; **HasFicheiro**) | ✅ |
| `GuardarDistanciaSeguranca` PUT | **ServicoDistanciaSegurancaResponseDto** | ✅ |

### ProdutosController
| Ação | Devolve | Risco |
|------|---------|--------|
| `Details` GET | `return Ok(produto)` | **Produto** (entidade pura) |
| `Create` POST | `new { produto }` | **Produto** |
| `Edit` GET | `new { produto, ... }` | **Produto** |
| `Edit` PUT | `new { produto }` | **Produto** |
| `Delete` GET | `return Ok(produto)` | **Produto** (entidade pura) |

### EntradaPaiolController
| Ação | Devolve | Risco |
|------|---------|--------|
| Index/Create GET | `new { model, paióis, produtos }` | **PaiolResponseDto** / **ProdutoResponseDto** nos dropdowns — ✅ |
| Create POST | `new { entrada = EntradaPaiolRegistadaDto, ... }` | ✅ **DTO** (sem UserId na resposta) |

### SaidaPaiolController
| Ação | Devolve | Risco |
|------|---------|--------|
| Create POST | `new { saida = SaidaPaiolRegistadaDto, ... }` | ✅ **DTO** (sem **FuncionarioRetirouUserId** na resposta) |

---

## 2. Onde há risco de dados sensíveis

### Dados sensíveis / PII

- **Funcionario**: em **DTOs** de listagem/detalhe **não** vai **UserId**; NSS/IBAN só em edição (`includeSensitive`). Documentos: apenas flags **Has*** e extras Id/Nome.
- **Cliente**: **UserId** omitido fora do modo sensível; NIF/Morada só quando necessário para o formulário de edição.
- **Encomenda** (na API JSON):
  - Os UserIds de aceite/preparação **já não** são expostos nas DTOs de listagem/detalhe; o cliente recebe **nomes** no detalhe (raiz do JSON). A entidade EF na base de dados mantém os campos.
- **SaidaPaiol** / **EntradaPaiol** (na API JSON):
  - Respostas de **movimentos** e POST **registar** usam DTOs **sem** expor UserIds de quem registou/retirou; maps auxiliares podem ainda existir na resposta de movimentos para compatibilidade.
- **ServicoLicenca**:
  - **FicheiroPath** (caminho interno no servidor).

### Identity (ASP.NET Core Identity)

- **AdminController**: usa **UtilizadorComRolesViewModel** (Id, UserName, Email, Roles, FuncionarioAssociadoNome). **Não devolve IdentityUser** → sem PasswordHash, SecurityStamp, etc. ✅
- **AuthController**: devolve apenas token, refreshToken, email, nome, roles; `/me` devolve id, email, userName, nome, roles. **Não devolve a entidade IdentityUser**. ✅

### Informação interna

- **Caminhos de ficheiros** em respostas (Funcionario: CartaoCidadaoCaminho, DocumentoADDRCaminho, LicencaOperadorCaminho, OutrosCaminho; ServicoLicenca.FicheiroPath; documentos extras em várias entidades).
- **UserIds do Identity** ainda presentes em entidades e em alguns endpoints não migrados (Funcionario, Cliente, etc.). Encomendas (DTOs) e movimentos/registo entrada-saída (DTOs) **reduziram** esta exposição na API.
- **Estrutura completa das entidades** (navegações, coleções) — acoplamento ao modelo EF e possível evolução indesejada da API.

---

## 3. Controllers que já usam DTOs/ViewModels

- **AdminController**: `UtilizadorComRolesViewModel`, `EditarUtilizadorRolesViewModel`, etc.
- **AuthController**: objetos anónimos com apenas os campos necessários (token, email, roles, etc.).
- **HomeController**: `PerfilEditViewModel`, `AlterarPasswordViewModel`, etc.

---

## 4. Recomendações

1. **Introduzir DTOs de resposta** por recurso (ex.: `ClienteDto`, `FuncionarioDto`, `EncomendaDto`, `ServicoDto`, `PaiolDto`) e devolver apenas os campos necessários para o frontend (evitando UserId quando não for necessário, e nunca caminhos completos de ficheiros se não forem necessários para download).
2. **Não devolver UserIds do Identity** na API (ou restringir a Admin e a respostas que precisem mesmo disso), para reduzir superfície de correlação com contas.
3. **Mascarar ou omitir dados muito sensíveis** (NSS, IBAN) em listagens e, se possível, em detalhes para roles não-Admin, ou devolver apenas “últimos X dígitos”.
4. **Substituir entidades por DTOs** em todos os `return Ok(entity)` e `new { entity }` listados acima, mapeando apenas as propriedades necessárias.
5. **Manter a política atual** de não expor IdentityUser (PasswordHash, SecurityStamp, etc.) e continuar a usar ViewModels/DTOs em Admin e Auth.

Este documento pode ser usado como checklist para refatorar respostas da API para DTOs e reduzir exposição de dados sensíveis.
