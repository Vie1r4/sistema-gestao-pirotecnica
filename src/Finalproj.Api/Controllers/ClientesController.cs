using Finalproj.Api.Models;
using Finalproj.Api.Validators;
using Finalproj.Application.Features.Clientes.DTOs;
using Finalproj.Application.Features.Clientes.Interfaces;
using Finalproj.Application.Features.Clientes.Services;
using Finalproj.Application.Services;
using Finalproj.Helpers;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finalproj.Controllers
{
    /// <summary>CRUD de clientes, documentos extras e histórico de encomendas.</summary>
    [Route("api/clientes")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ClientesController : ControllerBase
    {
        private readonly IClienteApplicationService _clientes;
        private readonly ClienteImportService _clienteImport;
        private readonly IDocumentoStorageService _documentoStorage;
        private readonly IValidator<CreateClienteInputDto> _createClienteValidator;
        private readonly IConfiguration _configuration;
        private const string PastaDocumentosClientes = "Documentos/Clientes";
        private const int HistoricoEncomendasPageSize = 15;

        public ClientesController(
            IClienteApplicationService clientes,
            ClienteImportService clienteImport,
            IDocumentoStorageService documentoStorage,
            IValidator<CreateClienteInputDto> createClienteValidator,
            IConfiguration configuration)
        {
            _clientes = clientes;
            _clienteImport = clienteImport;
            _documentoStorage = documentoStorage;
            _createClienteValidator = createClienteValidator;
            _configuration = configuration;
        }

        /// <summary>Lista com pesquisa (nome, email, telefone, NIF) e ordenação.</summary>

        [HttpGet]
        [Authorize(Policy = Finalproj.Authorization.PoliticasAutorizacao.PodeGerirClientes)]
        public async Task<IActionResult> Index(string? pesquisa, string? ordenar, CancellationToken cancellationToken = default)
        {
            var lista = await _clientes.SearchAsync(pesquisa, ordenar, cancellationToken);
            var items = lista.Select(c => ClienteResponseDtoMapping.Map(c, includeSensitive: false)).ToList();
            return Ok(new
            {
                items,
                pesquisa = pesquisa ?? string.Empty,
                ordenar = ordenar ?? "nome"
            });
        }

        /// <summary>Detalhe do cliente + encomendas com reserva + histórico (concluídas/rejeitadas) paginado.</summary>

        [HttpGet("{id:int}")]
        [Authorize(Policy = Finalproj.Authorization.PoliticasAutorizacao.PodeGerirClientes)]
        public async Task<IActionResult> Details(int? id, int historicoPagina = 1, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var details = await _clientes.GetDetailsAsync(id.Value, historicoPagina, HistoricoEncomendasPageSize, cancellationToken);
            return details == null ? NotFound() : Ok(details);
        }

        /// <summary>Formulário novo cliente; dropdown tipo.</summary>

        [HttpGet("create")]
        public IActionResult Create()
        {
            var tiposCliente = DropdownSelectLists.TiposClienteParaDropdown();
            return Ok(new { cliente = ClienteResponseDtoMapping.Map(new Cliente(), includeSensitive: false), tiposCliente });
        }

        /// <summary>Cria cliente e documentos extras na pasta do cliente.</summary>
        [HttpPost]
        [Authorize(Policy = Finalproj.Authorization.PoliticasAutorizacao.PodeGerirClientes)]
        public async Task<IActionResult> Create([FromForm] CreateClienteInputDto input, CancellationToken cancellationToken = default)
        {
            var cliente = input.Cliente;
            var documentosExtras = input.DocumentosExtras;

            var validationResult = await _createClienteValidator.ValidateAsync(input, cancellationToken);
            ModelState.AddValidationResult(validationResult);

            if (ModelState.IsValid)
            {
                await _clientes.CreateAsync(cliente, null, cancellationToken);

                if (documentosExtras != null)
                {
                    var idx = 0;
                    foreach (var ext in documentosExtras)
                    {
                        if (ext?.Ficheiro != null && _documentoStorage.ExtensaoPermitida(ext.Ficheiro.FileName))
                        {
                            var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento " + (idx + 1) : ext.Nome.Trim();
                            if (nome.Length > 100) nome = nome[..100];
                            var caminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosClientes, cliente.Id, ext.Ficheiro, "doc_" + idx, cancellationToken);
                            await _clientes.AddDocumentosExtrasAsync(cliente.Id, [new ClienteDocumentoExtra { ClienteId = cliente.Id, Nome = nome, Caminho = caminho }], cancellationToken);
                            idx++;
                        }
                    }
                }

                return CreatedAtAction(nameof(Details), new { id = cliente.Id }, new { cliente = ClienteResponseDtoMapping.Map(cliente, false), clienteCriado = true });
            }

            return BadRequest(new
            {
                cliente = ClienteResponseDtoMapping.Map(cliente, includeSensitive: false),
                tiposCliente = DropdownSelectLists.TiposClienteParaDropdown(),
                errors = ModelState
            });
        }

        /// <summary>Formulário de edição com documentos.</summary>

        [HttpGet("{id:int}/edit")]
        public async Task<IActionResult> Edit(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var item = await _clientes.GetByIdAsync(id.Value, includeDocumentos: true, cancellationToken);
            if (item == null)
                return NotFound();
            var tiposCliente = DropdownSelectLists.TiposClienteParaDropdown();
            return Ok(new { item = ClienteResponseDtoMapping.Map(item, includeSensitive: true), tiposCliente });
        }

        /// <summary>Actualiza dados, remove documentos marcados e adiciona novos.</summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Edit(int id, [FromForm] EditClienteInputDto input, CancellationToken cancellationToken = default)
        {
            var cliente = input.Cliente;
            var documentosExtras = input.DocumentosExtras;
            var removerDocumentoExtraIds = input.RemoverDocumentoExtraIds;

            if (id != cliente.Id)
                return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    if (removerDocumentoExtraIds != null)
                        foreach (var docId in removerDocumentoExtraIds)
                            _documentoStorage.ApagarFicheiroSeExistir(await _clientes.GetDocumentoExtraPathForClienteAsync(id, docId, cancellationToken));
                    var novosDocs = new List<ClienteDocumentoExtra>();
                    if (documentosExtras != null)
                    {
                        var idx = 0;
                        foreach (var ext in documentosExtras)
                        {
                            if (ext?.Ficheiro != null && _documentoStorage.ExtensaoPermitida(ext.Ficheiro.FileName))
                            {
                                var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento " + (idx + 1) : ext.Nome.Trim();
                                if (nome.Length > 100) nome = nome[..100];
                                var caminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosClientes, id, ext.Ficheiro, "doc_" + Guid.NewGuid().ToString("N")[..8], cancellationToken);
                                novosDocs.Add(new ClienteDocumentoExtra { ClienteId = id, Nome = nome, Caminho = caminho });
                                idx++;
                            }
                        }
                    }
                    var updated = await _clientes.UpdateAsync(id, cliente, novosDocs, removerDocumentoExtraIds, cancellationToken);
                    if (updated == null) return NotFound();
                    return Ok(new { cliente = ClienteResponseDtoMapping.Map(updated, includeSensitive: false), clienteEditado = true });
                }
                catch (InvalidOperationException)
                {
                    throw;
                }
            }

            var existenteForBadRequest = await _clientes.GetByIdAsync(id, includeDocumentos: true, cancellationToken);
            return BadRequest(new
            {
                cliente = existenteForBadRequest != null ? ClienteResponseDtoMapping.Map(existenteForBadRequest, includeSensitive: true) : ClienteResponseDtoMapping.Map(cliente, includeSensitive: true),
                tiposCliente = DropdownSelectLists.TiposClienteParaDropdown(),
                errors = ModelState
            });
        }

        /// <summary>Confirmação antes de apagar.</summary>

        [HttpGet("{id:int}/delete")]
        public async Task<IActionResult> Delete(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var item = await _clientes.GetByIdAsync(id.Value, false, cancellationToken);
            if (item == null)
                return NotFound();
            return Ok(ClienteResponseDtoMapping.Map(item, includeSensitive: false));
        }

        /// <summary>Apaga cliente e pasta de documentos.</summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken cancellationToken = default)
        {
            if (await _clientes.DeleteAsync(id, cancellationToken))
                _documentoStorage.ApagarPastaRecursiva(Path.Combine(PastaDocumentosClientes, id.ToString()));
            return NoContent();
        }

        /// <summary>Importa clientes a partir de ficheiro CSV (migração de dados).</summary>
        [HttpPost("import")]
        [Authorize(Policy = Finalproj.Authorization.PoliticasAutorizacao.PodeGerirClientes)]
        public async Task<IActionResult> ImportCsv([FromForm] ImportClientesCsvInputDto input, CancellationToken cancellationToken = default)
        {
            if (input.Ficheiro == null || input.Ficheiro.Length == 0)
                return BadRequest(new { message = "Selecione um ficheiro CSV ou TXT." });

            var nome = input.Ficheiro.FileName ?? "";
            var extensaoValida = nome.EndsWith(".csv", StringComparison.OrdinalIgnoreCase)
                || nome.EndsWith(".txt", StringComparison.OrdinalIgnoreCase);
            var tipoValido = string.Equals(input.Ficheiro.ContentType, "text/csv", StringComparison.OrdinalIgnoreCase)
                || string.Equals(input.Ficheiro.ContentType, "text/plain", StringComparison.OrdinalIgnoreCase)
                || string.Equals(input.Ficheiro.ContentType, "application/vnd.ms-excel", StringComparison.OrdinalIgnoreCase);
            if (!extensaoValida && !tipoValido)
                return BadRequest(new { message = "O ficheiro deve ser CSV (.csv) ou texto (.txt)." });

            var maxBytes = _configuration.GetValue<long>("Clientes:ImportMaxFileSizeBytes", 50 * 1024 * 1024);
            if (input.Ficheiro.Length > maxBytes)
                return BadRequest(new { message = $"O ficheiro não pode exceder {maxBytes / (1024 * 1024)} MB." });

            await using var stream = new MemoryStream(input.Ficheiro.Content);
            var resultado = await _clienteImport.ImportarCsvAsync(stream, input.ModoDuplicadoNif, cancellationToken);
            return Ok(resultado);
        }

        /// <summary>Download de documento extra do cliente (inline no browser). Requer política PodeGerirClientes.</summary>
        [HttpGet("{id:int}/documentos/{extraId:int}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = Finalproj.Authorization.PoliticasAutorizacao.PodeGerirClientes)]
        public async Task<IActionResult> Download(int id, int extraId, CancellationToken cancellationToken = default)
        {
            var caminho = await _clientes.GetDocumentoExtraPathForClienteAsync(id, extraId, cancellationToken);
            if (caminho == null)
                return NotFound();
            return await ServirFicheiro(caminho, cancellationToken);
        }

        private async Task<IActionResult> ServirFicheiro(string caminhoRelativo, CancellationToken cancellationToken = default) =>
            await DocumentoFileResult.FromPathAsync(this, _documentoStorage, caminhoRelativo, attachment: false, cancellationToken) ?? NotFound();

    }
}
