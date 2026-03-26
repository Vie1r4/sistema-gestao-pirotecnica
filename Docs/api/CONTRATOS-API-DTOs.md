# Contratos de API: DTOs de resposta

Objetivo: **não expor entidades EF diretamente** nas respostas da API. Usar DTOs de resposta explícitos para evitar acoplamento e overfetch.

---

## DTOs criados e utilizados

### Produto
- **ProdutoResponseDto** — Id, Nome, NEMPorUnidade, FamiliaRisco, Unidade, FiltroTecnico, Calibre, GrupoCompatibilidade.
- **ProdutoResponseDtoMapping.Map(Produto)** — usado em `ProdutosController` em: Index, Gerir, Details, Create (GET/POST), Edit (GET/PUT/BadRequest), Delete (GET).

### Encomenda
- **EncomendaListResponseDto** — listagem com Cliente resumo (Id, Nome).
- **EncomendaDetailResponseDto** — detalhe com Cliente (ClienteResponseDto), Itens (EncomendaItemResponseDto com Produto).
- **EncomendaItemResponseDto** — Id, EncomendaId, ProdutoId, QuantidadePedida, Produto (opcional).
- **EncomendaResumoDto** — Id, Estado, DataCriacao, DataConclusao (para listas curtas, ex.: encomendas no detalhe do cliente).
- **EncomendaClienteResumoDto** — Id, Nome (para dropdowns).
- **EncomendaResponseDtoMapping** — MapToList, MapToDetail, MapToResumo.
- Usado em **EncomendasController**: Index (items), Details (encomenda), Create (clientes), AdicionarItens (cliente, produtosFiltrados).
- Usado em **ClientesController**: Details (encomendasAtivas, encomendasHistorico como EncomendaResumoDto).

### Paiol
- **PaiolResponseDto** — Id, Nome, Localizacao, CoordenadasLat/Lng, LimiteMLE, PerfilRisco, Estado, DataValidadeLicenca, NumeroLicenca, DivisaoDominante, DocumentosExtras (Id, Nome apenas).
- **PaiolDocumentoExtraDto** — Id, Nome.
- **PaiolComOcupacaoResponseDto** — Paiol (PaiolResponseDto), MleAtual, PercentagemOcupacao.
- **PaiolResponseDtoMapping.Map(Paiol)** — usado em **PaiolController**: Index e Gestao (lista como PaiolComOcupacaoResponseDto).

### Cliente (já existente)
- **ClienteResponseDto** / **ClienteResponseDtoMapping** — já usados em ClientesController. Create (POST) passou a devolver `cliente = ClienteResponseDtoMapping.Map(cliente, false)` em vez da entidade.

### Funcionário (já existente)
- **FuncionarioResponseDto** / **FuncionarioResponseDtoMapping** — já utilizados em FuncionariosController.

---

## Controllers atualizados

| Controller | Alteração |
|------------|-----------|
| **ProdutosController** | Todas as respostas que devolviam `Produto` passam a devolver `ProdutoResponseDto`. |
| **EncomendasController** | Index: `items` = lista de EncomendaListResponseDto. Details: `encomenda` = EncomendaDetailResponseDto. Create: `clientes` = lista de EncomendaClienteResumoDto. AdicionarItens: `cliente` = EncomendaClienteResumoDto, `produtosFiltrados` = lista de ProdutoResponseDto. |
| **ClientesController** | Details: `encomendasAtivas` e `encomendasHistorico` = lista de EncomendaResumoDto. Create (POST): `cliente` = ClienteResponseDto. |
| **PaiolController** | Index e Gestao: resposta = lista de PaiolComOcupacaoResponseDto (em vez de PaiolComOcupacaoViewModel com entidade Paiol). |

---

## Pendente (opcional)

- **PaiolController**: outros endpoints que ainda devolvem `paiol` (entidade) — ex.: Details, Create response, Edit, Conteudo, etc. — podem ser alterados para devolver `PaiolResponseDtoMapping.Map(paiol)` para consistência.
- **FuncionariosController** e **ServicosApiController**: confirmar que todas as respostas usam FuncionarioResponseDto / DTOs e não entidades.
- **EntradaPaiolController** / **SaidaPaiolController**: se devolverem entidades, definir DTOs de resposta e mapear.

---

## Formato JSON

O ASP.NET Core usa camelCase por defeito na serialização. Os DTOs têm propriedades em PascalCase; o JSON exposto mantém-se compatível com o que o frontend já consome (id, nome, etc.). Não é esperada quebra de contrato no cliente.
