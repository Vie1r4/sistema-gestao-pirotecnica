# Contratos de API: DTOs de resposta

Objetivo: **não expor entidades EF diretamente** nas respostas da API. Usar DTOs de resposta explícitos para evitar acoplamento, overfetch e **vazamento de identificadores do Identity** (UserIds) ou outros dados sensíveis.

---

## DTOs criados e utilizados

### Produto
- **ProdutoResponseDto** — Id, Nome, NEMPorUnidade, FamiliaRisco, Unidade, FiltroTecnico, Calibre, GrupoCompatibilidade.
- **ProdutoResponseDtoMapping.Map(Produto)** — usado em `ProdutosController` em: Index, Gerir, Details, Create (GET/POST), Edit (GET/PUT/BadRequest), Delete (GET).

### Encomenda
- **EncomendaListResponseDto** — listagem: Id, ClienteId, Estado, datas, Observacoes, MotivoRejeicao, **Cliente** (EncomendaClienteResumoDto: Id, Nome). **Não inclui** UserIds de quem aceitou ou preparou.
- **EncomendaDetailResponseDto** — detalhe: mesmos campos de negócio + **Cliente** (ClienteResponseDto) + **Itens** (EncomendaItemResponseDto com Produto). **Não inclui** `FuncionarioAceiteUserId` nem `FuncionarioPreparouUserId`.
- **EncomendaItemResponseDto** — Id, EncomendaId, ProdutoId, QuantidadePedida, Produto (opcional).
- **EncomendaResumoDto** — Id, Estado, DataCriacao, DataConclusao (ex.: encomendas no detalhe do cliente).
- **EncomendaClienteResumoDto** — Id, Nome (dropdowns).
- **EncomendaResponseDtoMapping** — MapToList, MapToDetail, MapToResumo, **MapItem** (item + produto como `ProdutoResponseDto`, ex. detalhe de serviço).
- **GET `/api/encomendas/{id}` (Details)** devolve, além de `encomenda` e `stockPorProduto`, **`funcionarioAceiteNome`** e **`funcionarioPreparouNome`** no objeto raiz (resolvidos no servidor a partir do Identity, sem expor os Ids no DTO da encomenda).

### Armazém / movimentos (`ArmazemResponseDtos.cs`)
- **PaiolListagemNomeDto** — Id, Nome (filtros e linhas de movimento).
- **ProdutoMovimentoDto** — Id, Nome, NEMPorUnidade.
- **EntradaPaiolMovimentoDto** — linha de entrada em `GET /api/paiol/movimentos`; inclui **RegistadoPor** (nome de exibição); **sem** `FuncionarioRegistouUserId`.
- **SaidaPaiolMovimentoDto** — linha de saída; **RetiradoPor**; **sem** `FuncionarioRetirouUserId`.
- **EntradaPaiolRegistadaDto** / **SaidaPaiolRegistadaDto** — resposta dos POST `registar` (sem UserIds).
- **ArmazemResponseDtoMapping** — mapeamento de entidades para estes DTOs; **EmptyPaiolParaFormulario** para GET create paiol.

### Paiol
- **PaiolResponseDto** — Id, Nome, Localizacao, CoordenadasLat/Lng, LimiteMLE, PerfilRisco, Estado, DataValidadeLicenca, NumeroLicenca, DivisaoDominante, DocumentosExtras (Id, Nome apenas).
- **PaiolDocumentoExtraDto** — Id, Nome.
- **PaiolComOcupacaoResponseDto** — Paiol (PaiolResponseDto), MleAtual, PercentagemOcupacao.
- **PaiolResponseDtoMapping.Map(Paiol)** — usado em **PaiolController** (lista, stock, movimentos — resumo de paióis, detalhe, conteúdo, create/edit/delete conforme implementação atual), e em dropdowns de **EntradaPaiolController**.

### Cliente
- **ClienteResponseDto** / **ClienteResponseDtoMapping** — usados em **ClientesController** (lista, detalhe, create/edit/delete). **`UserId`** (Identity) só é serializado com **`includeSensitive: true`** (GET/PUT edição); nas listagens e detalhe “público” vem `null`.

### Funcionário
- **FuncionarioResponseDto** / **FuncionarioResponseDtoMapping** — **FuncionariosController** e respostas aninhadas em serviços. **`UserId`** só com **`includeSensitive: true`** (formulário de edição). Em listagem/detalhe: **`contaAssociada`** (bool), **`contaEmailConfirmada`** (bool?, quando há conta). **GET `/api/funcionarios/{id}`** inclui no raiz **`associadoAoUtilizadorAtual`** (sem expor o UserId ao cliente). A lista **já não** devolve **`userIdsConfirmados`**.

### Serviço (`ServicoResponseDtos.cs`)
- **ServicoResponseDto** — campos do serviço + **Cliente**, **Encomenda** (**ServicoEncomendaResumoDto** com resumo de cliente), **ResponsavelTecnico** e **Equipa** como `FuncionarioResponseDto` / `ClienteResponseDto`; **DocumentosExtras**, **Licencas** (`ServicoLicencaDto` com **HasFicheiro**, sem **FicheiroPath**); **DistanciasSeguranca** como **ServicoDistanciaSegurancaResponseDto** (inclui **Cumpre**).
- **ServicoResponseDtoMapping.Map(Servico, distanciasOverride?)** — usado em **ServicosApiController**: lista, detalhe (com override das distâncias após `EnsureDistanciasSegurancaAsync`), create/edit/delete.
- **GET detalhe** (`/api/servicos/{id}`): **`itensEncomenda`** = lista de **EncomendaItemResponseDto**; **`paiolParaRota`** = **PaiolResponseDto** (não a entidade **Paiol**).

---

## Controllers atualizados (resumo)

| Controller | Alteração relevante |
|------------|---------------------|
| **ProdutosController** | Respostas com `ProdutoResponseDto`. |
| **EncomendasController** | Index: `items` = EncomendaListResponseDto. Details e fluxos que devolvem encomenda: `EncomendaDetailResponseDto`; nomes de aceite/preparação no **raiz** do JSON em Details. Create: `clientes` = EncomendaClienteResumoDto. |
| **ClientesController** | Details: encomendas como EncomendaResumoDto. Create (POST): ClienteResponseDto. |
| **PaiolController** | Index/Gestao: PaiolComOcupacaoResponseDto; stock com produtos como ProdutoResponseDto; movimentos com EntradaPaiolMovimentoDto / SaidaPaiolMovimentoDto; detalhe/conteúdo/CRUD com PaiolResponseDto onde aplicável. |
| **EntradaPaiolController** | Dropdowns: PaiolResponseDto / ProdutoResponseDto; POST registar: `entrada` = EntradaPaiolRegistadaDto. |
| **SaidaPaiolController** | POST registar: `saida` = SaidaPaiolRegistadaDto. |
| **ClientesController** | Respostas com **ClienteResponseDto** (sem **UserId** fora do modo sensível). |
| **FuncionariosController** | Respostas com **FuncionarioResponseDto**; lista sem **userIdsConfirmados**; detalhe com **associadoAoUtilizadorAtual**. |
| **ServicosApiController** | Lista e corpos principais com **ServicoResponseDto**; itens de encomenda e paiol para rota como DTOs; PUT distância: **ServicoDistanciaSegurancaResponseDto**. |

---

## Pendente (opcional)

- **EncomendasController** — **Create GET** / **AdicionarItens GET**: ainda podem incluir entidades **Cliente** / **Produto** nos payloads (alinhar a DTOs quando se tocar nesses fluxos).
- **ProdutosController** / **FuncionariosController** (ações sensíveis) / **ServicosApiController** (uploads): rever exposição campo a campo para roles não administrativas, se necessário.

---

## Formato JSON

O ASP.NET Core usa camelCase por defeito na serialização. Os DTOs têm propriedades em PascalCase; o JSON exposto mantém-se compatível com o que o frontend consome (`registadoPor`, `retiradoPor`, `funcionarioAceiteNome`, etc.).

**Mudanças de contrato conscientes:**
- Encomendas: sem **`funcionarioAceiteUserId`** / **`funcionarioPreparouUserId`** no objeto `encomenda`; usar nomes no raiz do GET detalhe.
- Movimentos de paiol: sem UserIds nas linhas; usar **`registadoPor`** / **`retiradoPor`** (e maps legados se existirem).
- Funcionários: lista sem **`userIdsConfirmados`**; usar **`contaAssociada`** e **`contaEmailConfirmada`** por item; **`userId`** no JSON do item só no GET **edit** (formulário admin).
- Clientes: **`userId`** omitido nas respostas não sensíveis.
- Serviços: lista/detalhe com **`servico`** tipado; **`itensEncomenda`** como itens+DTO de produto; licenças sem **`ficheiroPath`** na API (**`hasFicheiro`**); **`paiolParaRota`** como **PaiolResponseDto**.
