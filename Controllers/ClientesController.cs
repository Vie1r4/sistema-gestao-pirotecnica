using Finalproj.Data;
using Finalproj.Models;
using Finalproj.Services;
using Finalproj.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Controllers
{
    // Clientes: CRUD, documentos extras; detalhe com encomendas activas e histórico
    [Route("api/clientes")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ClientesController : ControllerBase
    {
        private readonly FinalprojContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IDocumentoStorageService _documentoStorage;
        private readonly IValidator<CreateClienteInputDto> _createClienteValidator;
        private const string PastaDocumentosClientes = "Documentos/Clientes";
        private const int HistoricoEncomendasPageSize = 15;

        public ClientesController(FinalprojContext context, IWebHostEnvironment env, IDocumentoStorageService documentoStorage, IValidator<CreateClienteInputDto> createClienteValidator)
        {
            _context = context;
            _env = env;
            _documentoStorage = documentoStorage;
            _createClienteValidator = createClienteValidator;
        }

        // Lista com pesquisa (nome, email, telefone, NIF) e ordenação
        [HttpGet]
        public async Task<IActionResult> Index(string? pesquisa, string? ordenar, CancellationToken cancellationToken = default)
        {
            var query = _context.Clientes.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(pesquisa))
            {
                var termo = pesquisa.Trim();
                query = query.Where(c =>
                    c.Nome.Contains(termo) ||
                    (c.Email != null && c.Email.Contains(termo)) ||
                    (c.Telefone != null && c.Telefone.Contains(termo)) ||
                    (c.NIF != null && c.NIF.Contains(termo)));
            }

            query = (ordenar ?? "nome") switch
            {
                "email" => query.OrderBy(c => c.Email ?? ""),
                "recentes" => query.OrderByDescending(c => c.DataRegisto ?? DateTime.MinValue),
                _ => query.OrderBy(c => c.Nome)
            };

            var lista = await query.ToListAsync(cancellationToken);
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
        public async Task<IActionResult> Details(int? id, int historicoPagina = 1, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var cliente = await _context.Clientes.AsNoTracking().Include(c => c.DocumentosExtras).FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
            if (cliente == null)
                return NotFound();

            var encomendasAtivas = await _context.Encomendas
                .AsNoTracking()
                .Include(e => e.Itens)
                .ThenInclude(i => i.Produto)
                .Where(e => e.ClienteId == id && ConstantesEncomenda.EstadosComReserva.Contains(e.Estado))
                .OrderByDescending(e => e.DataCriacao)
                .ToListAsync(cancellationToken);

            var queryHistorico = _context.Encomendas
                .AsNoTracking()
                .Where(e => e.ClienteId == id && (e.Estado == ConstantesEncomenda.CONCLUIDA || e.Estado == ConstantesEncomenda.REJEITADA))
                .OrderByDescending(e => e.DataConclusao ?? e.DataCriacao);

            var totalHistorico = await queryHistorico.CountAsync(cancellationToken);
            var totalPaginasHistorico = totalHistorico == 0 ? 1 : (int)Math.Ceiling(totalHistorico / (double)HistoricoEncomendasPageSize);
            historicoPagina = Math.Clamp(historicoPagina, 1, totalPaginasHistorico);

            var encomendasHistorico = await queryHistorico
                .Skip((historicoPagina - 1) * HistoricoEncomendasPageSize)
                .Take(HistoricoEncomendasPageSize)
                .ToListAsync(cancellationToken);

            var encomendasAtivasDto = encomendasAtivas.Select(EncomendaResponseDtoMapping.MapToResumo).ToList();
            var encomendasHistoricoDto = encomendasHistorico.Select(EncomendaResponseDtoMapping.MapToResumo).ToList();

            return Ok(new
            {
                cliente = ClienteResponseDtoMapping.Map(cliente, includeSensitive: false),
                encomendasAtivas = encomendasAtivasDto,
                encomendasHistorico = encomendasHistoricoDto,
                historicoPagina,
                totalPaginasHistorico,
                totalHistorico
            });
        }

        // GET: formulário novo cliente; dropdown tipo
        [HttpGet("create")]
        public IActionResult Create()
        {
            var tiposCliente = ConstantesFuncionariosClientes.TiposClienteParaDropdown();
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
                cliente.DataRegisto = DateTime.UtcNow;
                _context.Clientes.Add(cliente);
                await _context.SaveChangesAsync(cancellationToken);

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
                            _context.ClienteDocumentoExtras.Add(new ClienteDocumentoExtra { ClienteId = cliente.Id, Nome = nome, Caminho = caminho });
                            idx++;
                        }
                    }
                    await _context.SaveChangesAsync(cancellationToken);
                }

                return CreatedAtAction(nameof(Details), new { id = cliente.Id }, new { cliente = ClienteResponseDtoMapping.Map(cliente, false), clienteCriado = true });
            }

            return BadRequest(new
            {
                cliente = ClienteResponseDtoMapping.Map(cliente, includeSensitive: false),
                tiposCliente = ConstantesFuncionariosClientes.TiposClienteParaDropdown(),
                errors = ModelState
            });
        }

        // GET: formulário de edição com documentos
        [HttpGet("{id:int}/edit")]
        public async Task<IActionResult> Edit(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var item = await _context.Clientes.Include(c => c.DocumentosExtras).FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
            if (item == null)
                return NotFound();
            var tiposCliente = ConstantesFuncionariosClientes.TiposClienteParaDropdown();
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
                    if (removerDocumentoExtraIds != null && removerDocumentoExtraIds.Count > 0)
                    {
                        var aRemover = await _context.ClienteDocumentoExtras
                            .Where(e => e.ClienteId == id && removerDocumentoExtraIds.Contains(e.Id))
                            .ToListAsync(cancellationToken);
                        foreach (var e in aRemover)
                        {
                            _documentoStorage.ApagarFicheiroSeExistir(e.Caminho);
                            _context.ClienteDocumentoExtras.Remove(e);
                        }
                    }

                    var existente = await _context.Clientes.FindAsync(id);
                    if (existente == null)
                        return NotFound();
                    existente.Nome = cliente.Nome;
                    existente.TipoCliente = cliente.TipoCliente;
                    existente.NIF = cliente.NIF;
                    existente.Email = cliente.Email;
                    existente.Telefone = cliente.Telefone;
                    existente.Morada = cliente.Morada;
                    existente.Notas = cliente.Notas;

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
                                _context.ClienteDocumentoExtras.Add(new ClienteDocumentoExtra { ClienteId = id, Nome = nome, Caminho = caminho });
                                idx++;
                            }
                        }
                    }
                    await _context.SaveChangesAsync(cancellationToken);
                    var updated = await _context.Clientes.AsNoTracking().Include(c => c.DocumentosExtras).FirstAsync(c => c.Id == id, cancellationToken);
                    return Ok(new { cliente = ClienteResponseDtoMapping.Map(updated, includeSensitive: false), clienteEditado = true });
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!await _context.Clientes.AnyAsync(e => e.Id == cliente.Id, cancellationToken))
                        return NotFound();
                    throw;
                }
            }

            var existenteForBadRequest = await _context.Clientes.Include(c => c.DocumentosExtras).FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
            return BadRequest(new
            {
                cliente = existenteForBadRequest != null ? ClienteResponseDtoMapping.Map(existenteForBadRequest, includeSensitive: true) : ClienteResponseDtoMapping.Map(cliente, includeSensitive: true),
                tiposCliente = ConstantesFuncionariosClientes.TiposClienteParaDropdown(),
                errors = ModelState
            });
        }

        // GET: confirmação antes de apagar
        [HttpGet("{id:int}/delete")]
        public async Task<IActionResult> Delete(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();
            var item = await _context.Clientes.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
            if (item == null)
                return NotFound();
            return Ok(ClienteResponseDtoMapping.Map(item, includeSensitive: false));
        }

        [HttpDelete("{id:int}")]
        // Apaga cliente e pasta de documentos
        public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken cancellationToken = default)
        {
            var item = await _context.Clientes.FindAsync(id);
            if (item != null)
            {
                _documentoStorage.ApagarPastaRecursiva(Path.Combine(PastaDocumentosClientes, id.ToString()));
                _context.Clientes.Remove(item);
                await _context.SaveChangesAsync(cancellationToken);
            }
            return NoContent();
        }

        // Devolve ficheiro de documento extra (inline no browser)
        /// <summary>Download de documento extra do cliente. Apenas Admin.</summary>
        [HttpGet("{id:int}/documentos/{extraId:int}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = Finalproj.Authorization.PoliticasAutorizacao.PodeGerirClientes)]
        public IActionResult Download(int id, int extraId)
        {
            var extra = _context.ClienteDocumentoExtras.AsNoTracking().FirstOrDefault(e => e.Id == extraId && e.ClienteId == id);
            if (extra == null)
                return NotFound();
            return ServirFicheiro(extra.Caminho);
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
