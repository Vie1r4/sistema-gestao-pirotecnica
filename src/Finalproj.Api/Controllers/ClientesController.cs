using Finalproj.Application.Common.Models;
using Finalproj.Application.Features.Clientes.DTOs;
using Finalproj.Application.Features.Clientes.Interfaces;
using Finalproj.Application.Services;
using Finalproj.Application.Common.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finalproj.Controllers
{
    // Clientes: CRUD, documentos extras; detalhe com encomendas activas e histórico
    [Route("api/clientes")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ClientesController : ControllerBase
    {
        private readonly IClienteApplicationService _clientes;
        private readonly IWebHostEnvironment _env;
        private readonly IDocumentoStorageService _documentoStorage;
        private readonly IValidator<CreateClienteInputDto> _createClienteValidator;
        private const string PastaDocumentosClientes = "Documentos/Clientes";
        private const int HistoricoEncomendasPageSize = 15;

        public ClientesController(IClienteApplicationService clientes, IWebHostEnvironment env, IDocumentoStorageService documentoStorage, IValidator<CreateClienteInputDto> createClienteValidator)
        {
            _clientes = clientes;
            _env = env;
            _documentoStorage = documentoStorage;
            _createClienteValidator = createClienteValidator;
        }

        // Lista com pesquisa (nome, email, telefone, NIF) e ordenação
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

        // Detalhe do cliente + encomendas com reserva + histórico (concluídas/rejeitadas) paginado
        [HttpGet("{id:int}")]
        [Authorize(Policy = Finalproj.Authorization.PoliticasAutorizacao.PodeGerirClientes)]
        public async Task<IActionResult> Details(int? id, int historicoPagina = 1, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var details = await _clientes.GetDetailsAsync(id.Value, historicoPagina, HistoricoEncomendasPageSize, cancellationToken);
            return details == null ? NotFound() : Ok(details);
        }

        // GET: formulário novo cliente; dropdown tipo
        [HttpGet("create")]
        public IActionResult Create()
        {
            var tiposCliente = DropdownSelectLists.TiposClienteParaDropdown();
            return Ok(new { cliente = ClienteResponseDtoMapping.Map(new Cliente(), includeSensitive: false), tiposCliente });
        }

        [HttpPost]
        // Grava cliente e documentos extras na pasta do cliente
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

        // GET: formulário de edição com documentos
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

        [HttpPut("{id:int}")]
        // Actualiza dados, remove/apaga documentos marcados e adiciona novos
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

        // GET: confirmação antes de apagar
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

        [HttpDelete("{id:int}")]
        // Apaga cliente e pasta de documentos
        public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken cancellationToken = default)
        {
            if (await _clientes.DeleteAsync(id, cancellationToken))
                _documentoStorage.ApagarPastaRecursiva(Path.Combine(PastaDocumentosClientes, id.ToString()));
            return NoContent();
        }

        // Devolve ficheiro de documento extra (inline no browser)
        /// <summary>Download de documento extra do cliente. Apenas Admin.</summary>
        [HttpGet("{id:int}/documentos/{extraId:int}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = Finalproj.Authorization.PoliticasAutorizacao.PodeGerirClientes)]
        public async Task<IActionResult> Download(int id, int extraId, CancellationToken cancellationToken = default)
        {
            var caminho = await _clientes.GetDocumentoExtraPathForClienteAsync(id, extraId, cancellationToken);
            if (caminho == null)
                return NotFound();
            return ServirFicheiro(caminho);
        }

        // Envia ficheiro do disco com Content-Type e nome para inline
        private IActionResult ServirFicheiro(string caminhoRelativo)
        {
            var caminhoFisico = Path.Combine(_env.WebRootPath, caminhoRelativo);
            if (!System.IO.File.Exists(caminhoFisico))
                return NotFound();
            var ext = Path.GetExtension(caminhoRelativo).ToLowerInvariant();
            var contentType = ext switch { ".pdf" => "application/pdf", ".jpg" or ".jpeg" => "image/jpeg", ".png" => "image/png", _ => "application/octet-stream" };
            var nomeFicheiro = Path.GetFileName(caminhoRelativo);
            Response.Headers["Content-Disposition"] = "inline; filename=\"" + nomeFicheiro.Replace("\"", "\\\"") + "\"";
            return PhysicalFile(caminhoFisico, contentType);
        }

    }
}
