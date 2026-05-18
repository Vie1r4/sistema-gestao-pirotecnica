using Finalproj.Authorization;
using Finalproj.Application.Common.Models;
using Finalproj.Application.Common.Validators;
using Finalproj.Application.DTOs;
using Finalproj.Application.Features.Paiols.DTOs;
using Finalproj.Application.Features.Paiols.Interfaces;
using Finalproj.Application.Features.Produtos.Interfaces;
using Finalproj.Application.Services;
using Finalproj.Application.Services.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Finalproj.Controllers
{
    // Paióis: CRUD, documentos extras, acesso por role; listagem com ocupação MLE e percentagem
    [Route("api/paiol")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class PaiolController : ControllerBase
    {
        private readonly IPaiolApplicationService _paiois;
        private readonly IProdutoApplicationService _produtos;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IIdentityUserLookupService _identityUsers;
        private readonly IWebHostEnvironment _env;
        private readonly IDocumentoStorageService _documentoStorage;
        private readonly IValidator<CreatePaiolInputDto> _createPaiolValidator;
        private const string PastaDocumentosPaiol = "Documentos/Paiol";

        public PaiolController(IPaiolApplicationService paiois, IProdutoApplicationService produtos, UserManager<IdentityUser> userManager, IIdentityUserLookupService identityUsers, IWebHostEnvironment env, IDocumentoStorageService documentoStorage, IValidator<CreatePaiolInputDto> createPaiolValidator)
        {
            _paiois = paiois;
            _produtos = produtos;
            _userManager = userManager;
            _identityUsers = identityUsers;
            _env = env;
            _documentoStorage = documentoStorage;
            _createPaiolValidator = createPaiolValidator;
        }

        // Paióis a que o utilizador tem acesso (por cargo). Admin vê todos os paióis.
        private async Task<List<int>> ObterPaiolIdsComAcessoAsync(CancellationToken cancellationToken = default)
        {
            if (User.IsInRole(ConstantesRoles.Admin) || User.IsInRole(ConstantesRoles.Gestor))
                return (await _paiois.ListAllOrderedAsync(cancellationToken)).Select(p => p.Id).ToList();
            var user = await _userManager.GetUserAsync(User);
            var roles = user == null ? Array.Empty<string>() : (await _userManager.GetRolesAsync(user)).ToArray();
            return (await _paiois.GetPaiolIdsComAcessoAsync(false, roles, cancellationToken)).ToList();
        }

        // GET: Paiol — página operacional: lista de paióis com acesso
        [HttpGet]
        [Authorize(Policy = PoliticasAutorizacao.PodeVerArmazemStock)]
        public async Task<IActionResult> Index(CancellationToken cancellationToken = default)
        {
            var idsAcesso = await ObterPaiolIdsComAcessoAsync(cancellationToken);
            return Ok(await _paiois.ListComOcupacaoAsync(idsAcesso, cancellationToken));
        }

        // Catálogo com coluna stock (só nos paióis com acesso)
        [HttpGet("stock")]
        [Authorize(Policy = PoliticasAutorizacao.PodeVerArmazemStock)]
        public async Task<IActionResult> Stock(string? pesquisa, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre, CancellationToken cancellationToken = default)
        {
            var idsAcesso = await ObterPaiolIdsComAcessoAsync(cancellationToken);
            return Ok(await _paiois.GetStockCatalogoAsync(idsAcesso, pesquisa, classificacao, grupoCompatibilidade, filtroTecnico, calibre, cancellationToken));
        }

        // GET: Movimentos — entradas ou saídas, com filtro por paiol
        [HttpGet("movimentos")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirArmazem)]
        public async Task<IActionResult> Movimentos(string? tipo, int? paiolId, int pagina = 1, int itensPorPagina = 25, CancellationToken cancellationToken = default)
        {
            if (pagina < 1) pagina = 1;
            if (itensPorPagina < 5 || itensPorPagina > 100) itensPorPagina = 25;

            var idsAcesso = await ObterPaiolIdsComAcessoAsync(cancellationToken);
            var userIds = (await _paiois.GetMovimentoUserIdsAsync(idsAcesso, tipo, paiolId, pagina, itensPorPagina, cancellationToken)).ToList();
            var nomesUtilizadoresSaidas = await _identityUsers.GetUserNamesByIdsAsync(userIds, cancellationToken);
            return Ok(await _paiois.GetMovimentosAsync(idsAcesso, tipo, paiolId, pagina, itensPorPagina, nomesUtilizadoresSaidas, cancellationToken));
        }

        // GET: Gestao — CRUD completo; Admin e Gestor
        [HttpGet("gestao")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirArmazem)]
        public async Task<IActionResult> Gestao(CancellationToken cancellationToken = default)
        {
            return Ok(await _paiois.ListComOcupacaoAsync(null, cancellationToken));
        }

        // GET: Conteudo — conteúdo do paiol (itens em stock)
        [HttpGet("{id:int}/conteudo")]
        [Authorize(Policy = PoliticasAutorizacao.PodeVerArmazemStock)]
        public async Task<IActionResult> Conteudo(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();

            var idsAcesso = await ObterPaiolIdsComAcessoAsync(cancellationToken);
            var podeVerTodos = User.IsInRole(ConstantesRoles.Admin) || User.IsInRole(ConstantesRoles.Gestor);
            if (!podeVerTodos && !idsAcesso.Contains(id.Value))
                return Forbid();

            var data = await _paiois.GetConteudoAsync(id.Value, cancellationToken);
            return data == null ? NotFound() : Ok(data);
        }

        // GET: Details
        [HttpGet("{id:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeVerArmazemStock)]
        public async Task<IActionResult> Details(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();

            var idsAcesso = await ObterPaiolIdsComAcessoAsync(cancellationToken);
            var podeVerTodos = User.IsInRole(ConstantesRoles.Admin) || User.IsInRole(ConstantesRoles.Gestor);
            if (!podeVerTodos && !idsAcesso.Contains(id.Value))
                return Forbid();

            var data = await _paiois.GetDetailsDataAsync(id.Value, cancellationToken);
            return data == null ? NotFound() : Ok(data);
        }

        // GET: Create (Admin e Gestor)
        [HttpGet("create")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirArmazem)]
        public IActionResult Create()
        {
            return Ok(new
            {
                paiol = ArmazemResponseDtoMapping.EmptyPaiolParaFormulario(),
                perfisRisco = DropdownSelectLists.LicencasParaDropdown(),
                estados = ConstantesPaiol.Estados,
                cargosDisponiveis = ConstantesPaiol.CargosDisponiveis
            });
        }

        // POST: Create
        [HttpPost]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirArmazem)]
        public async Task<IActionResult> Create([FromForm] CreatePaiolInputDto input, CancellationToken cancellationToken = default)
        {
            var paiol = input.Paiol;
            var cargosAcesso = input.CargosAcesso;
            var documentosExtras = input.DocumentosExtras;

            var validationResult = await _createPaiolValidator.ValidateAsync(input, cancellationToken);
            ModelState.AddValidationResult(validationResult);

            if (ModelState.IsValid)
            {
                if (!ConstantesPaiol.PerfisRisco.Contains(paiol.PerfilRisco) || !ConstantesPaiol.Estados.Contains(paiol.Estado))
                {
                    ModelState.AddModelError(string.Empty, "Perfil de risco ou estado inválido.");
                    return BadRequest(new
                    {
                        paiol = PaiolResponseDtoMapping.Map(paiol),
                        perfisRisco = DropdownSelectLists.LicencasParaDropdown(),
                        estados = ConstantesPaiol.Estados,
                        cargosDisponiveis = ConstantesPaiol.CargosDisponiveis,
                        errors = ModelState
                    });
                }
                await _paiois.CreateAsync(paiol, cargosAcesso, null, cancellationToken);
                var docs = new List<PaiolDocumentoExtra>();
                if (documentosExtras != null)
                {
                    var idx = 0;
                    foreach (var ext in documentosExtras)
                    {
                        if (ext?.Ficheiro != null && _documentoStorage.ExtensaoPermitida(ext.Ficheiro.FileName))
                        {
                            var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento " + (idx + 1) : ext.Nome.Trim();
                            if (nome.Length > 100) nome = nome[..100];
                            var caminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosPaiol, paiol.Id, ext.Ficheiro, "doc_" + Guid.NewGuid().ToString("N")[..8], cancellationToken);
                            docs.Add(new PaiolDocumentoExtra { PaiolId = paiol.Id, Nome = nome, Caminho = caminho });
                            idx++;
                        }
                    }
                }
                if (docs.Count > 0)
                    await _paiois.UpdateAsync(paiol.Id, paiol, cargosAcesso, docs, null, cancellationToken);
                var paiolCriado = await _paiois.GetByIdAsync(paiol.Id, includeDocumentos: true, cancellationToken);
                if (paiolCriado == null) return NotFound();
                return CreatedAtAction(nameof(Details), new { id = paiol.Id }, new { paiol = PaiolResponseDtoMapping.Map(paiolCriado) });
            }
            return BadRequest(new
            {
                paiol = PaiolResponseDtoMapping.Map(paiol),
                perfisRisco = DropdownSelectLists.LicencasParaDropdown(),
                estados = ConstantesPaiol.Estados,
                cargosDisponiveis = ConstantesPaiol.CargosDisponiveis,
                errors = ModelState
            });
        }

        // GET: Edit (Admin e Gestor)
        [HttpGet("{id:int}/edit")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirArmazem)]
        public async Task<IActionResult> Edit(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();

            var paiol = await _paiois.GetByIdAsync(id.Value, includeDocumentos: true, cancellationToken);
            if (paiol == null)
                return NotFound();

            var cargosSelecionados = await _paiois.GetCargosAcessoAsync(id.Value, cancellationToken);

            return Ok(new
            {
                paiol = PaiolResponseDtoMapping.Map(paiol),
                perfisRisco = DropdownSelectLists.LicencasParaDropdown(),
                estados = ConstantesPaiol.Estados,
                cargosDisponiveis = ConstantesPaiol.CargosDisponiveis,
                cargosSelecionados
            });
        }

        // PUT: Edit
        [HttpPut("{id:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirArmazem)]
        public async Task<IActionResult> Edit(int id, [FromForm] EditPaiolInputDto input, CancellationToken cancellationToken = default)
        {
            var paiol = input.Paiol;
            var cargosAcesso = input.CargosAcesso;
            var documentosExtras = input.DocumentosExtras;
            var removerDocumentoExtraIds = input.RemoverDocumentoExtraIds;

            if (id != paiol.Id)
                return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    if (removerDocumentoExtraIds != null)
                        foreach (var docId in removerDocumentoExtraIds)
                            _documentoStorage.ApagarFicheiroSeExistir(await _paiois.GetDocumentoExtraPathForPaiolAsync(id, docId, cancellationToken));
                    var docs = new List<PaiolDocumentoExtra>();
                    if (documentosExtras != null)
                    {
                        var idx = 0;
                        foreach (var ext in documentosExtras)
                        {
                            if (ext?.Ficheiro != null && _documentoStorage.ExtensaoPermitida(ext.Ficheiro.FileName))
                            {
                                var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento " + (idx + 1) : ext.Nome.Trim();
                                if (nome.Length > 100) nome = nome[..100];
                                var caminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosPaiol, id, ext.Ficheiro, "doc_" + Guid.NewGuid().ToString("N")[..8], cancellationToken);
                                docs.Add(new PaiolDocumentoExtra { PaiolId = id, Nome = nome, Caminho = caminho });
                                idx++;
                            }
                        }
                    }
                    var atualizado = await _paiois.UpdateAsync(id, paiol, cargosAcesso, docs, removerDocumentoExtraIds, cancellationToken);
                    if (atualizado == null) return NotFound();
                }
                catch (InvalidOperationException)
                {
                    throw;
                }
                var paiolAtualizado = await _paiois.GetByIdAsync(id, includeDocumentos: true, cancellationToken);
                if (paiolAtualizado == null) return NotFound();
                return Ok(new { paiol = PaiolResponseDtoMapping.Map(paiolAtualizado) });
            }

            var cargosSelecionados = await _paiois.GetCargosAcessoAsync(id, cancellationToken);
            return BadRequest(new
            {
                paiol = PaiolResponseDtoMapping.Map(paiol),
                perfisRisco = DropdownSelectLists.LicencasParaDropdown(),
                estados = ConstantesPaiol.Estados,
                cargosDisponiveis = ConstantesPaiol.CargosDisponiveis,
                cargosSelecionados,
                errors = ModelState
            });
        }

        // GET: Delete (apenas Admin)
        [HttpGet("{id:int}/delete")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirArmazem)]
        public async Task<IActionResult> Delete(int? id, CancellationToken cancellationToken = default)
        {
            if (id == null)
                return NotFound();

            var paiol = await _paiois.GetByIdAsync(id.Value, false, cancellationToken);
            if (paiol == null)
                return NotFound();

            return Ok(PaiolResponseDtoMapping.Map(paiol));
        }

        // DELETE: Delete
        [HttpDelete("{id:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirArmazem)]
        public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken cancellationToken = default)
        {
            if (await _paiois.DeleteAsync(id, cancellationToken))
                _documentoStorage.ApagarPastaRecursiva(Path.Combine(PastaDocumentosPaiol, id.ToString()));
            return NoContent();
        }

        // Devolve documento extra do paiol (inline). Apenas se o utilizador tiver acesso ao paiol.
        [HttpGet("{id:int}/documentos/{extraId:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeVerArmazemStock)]
        public async Task<IActionResult> Download(int id, int extraId, CancellationToken cancellationToken = default)
        {
            var idsAcesso = await ObterPaiolIdsComAcessoAsync(cancellationToken);
            if (!idsAcesso.Contains(id))
                return Forbid();
            var caminho = await _paiois.GetDocumentoExtraPathForPaiolAsync(id, extraId, cancellationToken);
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
