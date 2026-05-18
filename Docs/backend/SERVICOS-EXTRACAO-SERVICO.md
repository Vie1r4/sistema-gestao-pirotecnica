# Serviços: estado da extração de lógica para serviços de domínio/aplicação

## Situação atual (atualizado)

**A lógica de Serviços foi extraída para um serviço de domínio.** Existem `IServicoService` (em `Services/`) e `ServicoService` (em `Services/Domain/`). O `ServicosApiController` usa o serviço para validações, dropdowns, criar/atualizar e resumo de material e distâncias de segurança. No controller permanecem apenas orquestração HTTP, guardar ficheiros (IFormFile) e mapeamento para resposta (MapServicoToResponse, ServirFicheiro).

### O que está no ServicosApiController (sem extração)

| Área | Métodos / lógica | Onde poderia ficar |
|------|------------------|---------------------|
| **Listagem** | `Index`: filtros (clienteId, dataDesde, dataAte), paginação, includes | Serviço de aplicação: ex. `ObterListaServicosAsync` |
| **Create GET** | `PopularDropdownsCreateAsync`: encomendas concluídas não usadas, responsáveis (ADR+licença), equipa (licença) | Serviço: ex. `ObterDadosParaCriarServicoAsync` |
| **Create POST** | Validação encomenda, “encomenda já usada”, `ValidarResponsavelEEquipaAsync`, `IncluirResponsavelNaEquipa`, `GravarEquipaAsync`, gravação de documentos extras | Serviço de domínio: ex. `CriarServicoAsync` (validações + equipa + docs) |
| **Details** | Carregar servico + resumo material (`CalcularResumoMaterial`), `EnsureDistanciasSegurancaAsync`, licenças do evento, paiol para rota, distância | Serviço: ex. `ObterDetalheServicoAsync` + helpers em serviço |
| **Edit GET** | `PopularDropdownsEditAsync` (quase duplicado de Create) | Reutilizar serviço de dropdowns com parâmetro “servico atual” |
| **Edit PUT** | Mesmas validações que Create; remoção/adição de documentos extras; atualização de equipa (`GravarEquipaAsync`) | Serviço: ex. `AtualizarServicoAsync` |
| **Delete** | Apagar pasta de documentos, remover entidade | Serviço: ex. `EliminarServicoAsync` (delegar apagar pasta em `IDocumentoStorageService` se já existir) |
| **Upload licença** | Validação ficheiro, gravar em disco, atualizar entidade | Serviço ou manter em controller usando apenas `IDocumentoStorageService` |
| **Distância segurança** | Atualizar `DistanciaMedida_m` | Pode ficar no controller ou em serviço fino |

### Helpers privados no controller (candidatos a serviço)

- `MapServicoToResponse` – mapeamento para DTO de resposta (pode ficar em DTO/Mapping ou serviço).
- `CalcularResumoMaterial` – regra de negócio (resumo por encomenda); **domínio**.
- `EnsureDistanciasSegurancaAsync` – garantir linhas de distâncias de segurança; **domínio**.
- `ValidarResponsavelEEquipaAsync` – responsável com ADR+licença, equipa com licença; **domínio**.
- `ObterIdsFuncionariosComLicencaOperadorAsync` – usado por validação e por `GravarEquipaAsync`; **domínio/infra**.
- `IncluirResponsavelNaEquipa` – puro; pode ficar em domínio ou em serviço de aplicação.
- `GravarEquipaAsync` – persistência da equipa; **aplicação**.
- `PopularDropdownsCreateAsync` / `PopularDropdownsEditAsync` – muita duplicação; unificar num método no serviço (ex. “obter dados para formulário Create/Edit”).
- `ServirFicheiro` – infra (ficheiro físico); pode ficar em controller ou em serviço de ficheiros se existir.

### Serviços já existentes no projeto (para comparação)

- **EncomendaService** – preparação com FIFO, validações de estado e acesso a paióis.
- **StockDisponivelService** – cálculo de stock disponível.
- **ServicoService** – regras de serviços no terreno (equipa, licenças, distâncias, formulários).
- **DocumentoStorageService**, **LogSistemaService**, **EmailSender** – infraestrutura.

---

## Conclusão (feito)

- **Estado:** a extração foi feita. `IServicoService` e `ServicoService` existem em `Services/` e `Services/Domain/`.
- **No serviço:** validações (responsável/equipa), `ObterDadosFormularioAsync` (dropdowns unificados), `CriarServicoAsync`, `AdicionarDocumentosExtrasAsync`, `AtualizarServicoAsync`, `CalcularResumoMaterial`, `EnsureDistanciasSegurancaAsync`; remoção de documentos no Edit usa `IDocumentoStorageService` (injetado no serviço).
- **No controller:** listagem (Index), receber pedidos, guardar ficheiros (IFormFile) e chamar o serviço; Details usa o serviço para resumo e distâncias; Create/Edit GET usam `ObterDadosFormularioAsync`; Create/Edit POST/PUT chamam o serviço e tratam de documentos (guardar em disco no controller, passar caminhos ao serviço).
- **Testes:** as regras em `ServicoService` podem ser testadas em isolamento (unit tests com mock do DbContext e do IDocumentoStorageService).
