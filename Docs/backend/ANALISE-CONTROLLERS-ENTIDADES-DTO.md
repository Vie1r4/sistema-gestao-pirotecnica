# Análise: Controllers a devolver entidades EF vs DTOs e dados sensíveis

## Resumo

- **Vários controllers devolvem entidades EF diretamente** (ou dentro de objetos anónimos), o que expõe toda a estrutura das entidades e **pode incluir dados sensíveis** (PII, UserIds do Identity, caminhos de ficheiros).
- **AdminController e AuthController** já usam DTOs/ViewModels e **não expõem Identity** (sem PasswordHash, SecurityStamp, etc.).

---

## 1. Onde são devolvidas entidades EF diretamente

### ClientesController
| Ação | Devolve | Risco |
|------|---------|--------|
| `Create` POST | `new { cliente, clienteCriado = true }` | **Cliente** (UserId, NIF, Morada, contacto) |
| `Edit` GET | `new { item, tiposCliente }` | **Cliente** com `DocumentosExtras` |
| `Edit` PUT | `new { cliente = existente, clienteEditado = true }` | **Cliente** |
| `Delete` GET | `return Ok(item)` | **Cliente** (entidade pura) |

### FuncionariosController
| Ação | Devolve | Risco |
|------|---------|--------|
| `Details` GET | `new { item, contaEmail, contaEmailConfirmada }` | **Funcionario** com `DocumentosExtras` (NIF, NSS, IBAN, UserId, caminhos de docs) |
| `Create` POST | `new { funcionario, funcionarioCriado = true }` | **Funcionario** |
| `Edit` GET | `new { item, cargos, rolesConta, contaEmail }` | **Funcionario** com `DocumentosExtras` |
| `Edit` PUT | `new { funcionario = existing, ... }` | **Funcionario** |
| `Delete` GET | `return Ok(item)` | **Funcionario** (entidade pura) |
| `Desassociar` GET | `return Ok(item)` | **Funcionario** |
| `Desassociar` POST | `new { item, ... }` | **Funcionario** |

### EncomendasController
| Ação | Devolve | Risco |
|------|---------|--------|
| `Create` GET | `new { clientes, model }` | **Lista de Cliente** (todas as propriedades) |
| `AdicionarItens` GET | `new { cliente, produtosFiltrados, ... }` | **Cliente** + **lista de Produto** |
| `Details` GET | `new { encomenda, stockPorProduto, ... }` | **Encomenda** com `Cliente`, `Itens` (e Produto), `Servicos` |
| `Create` POST | `new { encomenda, encomendaCriada = true }` | **Encomenda** (e navegações carregadas) |
| `Update` PUT | `new { encomenda = updated, ... }` | **Encomenda** com Cliente, Itens, Produto |
| `Aceitar` POST | `new { encomenda, ... }` | **Encomenda** |
| `Rejeitar` GET | `return Ok(encomenda)` | **Encomenda** com **Cliente** (entidade pura) |
| `Rejeitar` POST | `new { encomenda, ... }` | **Encomenda** |
| `Preparar` GET | `new { encomenda, paióis, ... }` | **Encomenda** (Cliente, Itens, Produto) + **lista de Paiol** |
| `Concluir` POST | `new { encomenda, ... }` | **Encomenda** |

### PaiolController
| Ação | Devolve | Risco |
|------|---------|--------|
| `Index` GET | `Ok(viewModel)` | **List&lt;PaiolComOcupacaoViewModel&gt;** onde cada item tem `.Paiol` = entidade **Paiol** completa |
| Vários `Details` / Create/Edit | `new { paiol, carga }`, `new { paiol }`, `return Ok(paiol)` | **Paiol** (por vezes com DocumentosExtras, PaiolAcessos) |

### ServicosApiController
| Ação | Devolve | Risco |
|------|---------|--------|
| `Create` POST | `new { servico }` | **Servico** |
| `Details` GET | `new { servico, itensEncomenda, distanciasSeguranca, paiolParaRota, licencasEvento, ... }` | **Servico** com Cliente, Encomenda, **ResponsavelTecnico** (Funcionario), **Equipa.ThenInclude(Funcionario)**, DocumentosExtras, Licencas; **itensEncomenda** (EncomendaItem+Produto); **paiolParaRota** (Paiol) |
| `Edit` GET | `new { servico, encomendas, funcionariosEquipa, ... }` | **Servico**, lista de **Encomenda**, lista de **Funcionario** |
| `Edit` PUT | `new { servico }` | **Servico** |
| `Delete` GET | `return Ok(servico)` | **Servico** com Cliente, Encomenda (entidade pura) |
| `UploadLicenca` POST | `new { licenca = lic }` | **ServicoLicenca** (FicheiroPath, etc.) |

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
| Index/Create GET | `new { model, paióis, produtos }` | **List&lt;Paiol&gt;** e **List&lt;Produto&gt;** (entidades completas) |
| Create POST | `new { entrada, ... }` | **EntradaPaiol** |

### SaidaPaiolController
| Ação | Devolve | Risco |
|------|---------|--------|
| Create POST | `new { saida, ... }` | **SaidaPaiol** (inclui **FuncionarioRetirouUserId**) |

---

## 2. Onde há risco de dados sensíveis

### Dados sensíveis / PII

- **Funcionario** (exposto em FuncionariosController e dentro de Servico.Details/Edit):
  - **NIF**, **NumeroSegurancaSocial**, **IBAN**, **Morada**, **UserId** (id da conta Identity), caminhos de documentos (CC, ADR, licença).
- **Cliente** (exposto em ClientesController e em EncomendasController / dentro de Encomenda):
  - **NIF**, **Morada**, **UserId**, email, telefone.
- **Encomenda**:
  - **FuncionarioAceiteUserId**, **FuncionarioPreparouUserId** (identificadores do Identity).
- **SaidaPaiol**:
  - **FuncionarioRetirouUserId** (identificador do Identity).
- **ServicoLicenca**:
  - **FicheiroPath** (caminho interno no servidor).

### Identity (ASP.NET Core Identity)

- **AdminController**: usa **UtilizadorComRolesViewModel** (Id, UserName, Email, Roles, FuncionarioAssociadoNome). **Não devolve IdentityUser** → sem PasswordHash, SecurityStamp, etc. ✅
- **AuthController**: devolve apenas token, refreshToken, email, nome, roles; `/me` devolve id, email, userName, nome, roles. **Não devolve a entidade IdentityUser**. ✅

### Informação interna

- **Caminhos de ficheiros** em respostas (Funcionario: CartaoCidadaoCaminho, DocumentoADDRCaminho, LicencaOperadorCaminho, OutrosCaminho; ServicoLicenca.FicheiroPath; documentos extras em várias entidades).
- **UserIds do Identity** em várias entidades (Funcionario.UserId, Cliente.UserId, Encomenda.FuncionarioAceiteUserId/FuncionarioPreparouUserId, SaidaPaiol.FuncionarioRetirouUserId) — permitem correlacionar utilizador com dados de negócio.
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
