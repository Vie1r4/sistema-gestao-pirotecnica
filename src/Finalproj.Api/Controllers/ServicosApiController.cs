using Finalproj.Authorization;
using Finalproj.Api.Validators;
using Finalproj.Api.Helpers;
using Finalproj.Api.Models;
using Finalproj.Application.Features.DocumentacaoRegulatoria.Interfaces;
using Finalproj.Application.Features.Clientes.DTOs;
using Finalproj.Application.Features.Funcionarios.DTOs;
using Finalproj.Application.Features.Servicos.DTOs;
using Finalproj.Application.Features.Servicos.Interfaces;
using Finalproj.Application.Features.Servicos.Services;
using Finalproj.Application.Services;
using Finalproj.Helpers;
using Finalproj.Infrastructure.Configuration;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Finalproj.Controllers;

/// <summary>
/// API REST para Serviços (operações no terreno ligadas a encomendas concluídas).
/// Espelha a lógica do ServicosController MVC.
/// </summary>
[Route("api/servicos")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ServicosApiController : ControllerBase
{
    private const string PastaDocumentosServico = "Documentos/Servico";
    private readonly IDocumentoStorageService _documentoStorage;
    private readonly IServicoService _servicoService;
    private readonly IServicosApiApplicationService _servicosApi;
    private readonly IDocumentacaoRegulatoriaService _documentacaoRegulatoria;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly ILogger<ServicosApiController> _logger;
    private readonly DocumentosOptions _documentosOptions;
    private readonly IValidator<ServicoSaveRequestDto> _servicoSaveValidator;

    public ServicosApiController(
        IDocumentoStorageService documentoStorage,
        IServicoService servicoService,
        IServicosApiApplicationService servicosApi,
        IDocumentacaoRegulatoriaService documentacaoRegulatoria,
        UserManager<IdentityUser> userManager,
        ILogger<ServicosApiController> logger,
        IOptions<DocumentosOptions> documentosOptions,
        IValidator<ServicoSaveRequestDto> servicoSaveValidator)
    {
        _documentoStorage = documentoStorage;
        _servicoService = servicoService;
        _servicosApi = servicosApi;
        _documentacaoRegulatoria = documentacaoRegulatoria;
        _userManager = userManager;
        _logger = logger;
        _documentosOptions = documentosOptions?.Value ?? new DocumentosOptions();
        _servicoSaveValidator = servicoSaveValidator;
    }

    /// <summary>Servicos.</summary>

    [HttpGet]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> Index(
        int? clienteId,
        DateTime? dataDesde,
        DateTime? dataAte,
        int pagina = 1,
        int itensPorPagina = 20,
        CancellationToken cancellationToken = default)
    {
        if (pagina < 1) pagina = 1;
        if (itensPorPagina < 5 || itensPorPagina > 100) itensPorPagina = 20;

        return Ok(await _servicosApi.ListAsync(clienteId, dataDesde, dataAte, pagina, itensPorPagina, cancellationToken));
    }

    /// <summary>Servicos/create.</summary>

    [HttpGet("create")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> Create(int? encomendaId, CancellationToken cancellationToken = default) =>
        Ok(await _servicosApi.GetCreateDataAsync(encomendaId, cancellationToken));

    /// <summary>Servicos.</summary>

    [HttpPost]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> Create([FromBody] ServicoSaveRequestDto input, CancellationToken cancellationToken = default)
    {
        var validationResult = await _servicoSaveValidator.ValidateAsync(input, cancellationToken);
        ModelState.AddValidationResult(validationResult);
        if (!ModelState.IsValid)
            return BadRequest(new { error = "Dados inválidos.", errors = ModelState });

        var (created, erro) = await _servicoService.CriarServicoComZonasAsync(input, cancellationToken);
        if (erro != null)
            return BadRequest(new { error = erro });
        if (created == null)
            return BadRequest(new { error = "Erro ao criar serviço." });

        var createdFull = await _servicosApi.GetFullAfterChangeAsync(created.Id, cancellationToken);
        if (createdFull == null) return NotFound();
        return CreatedAtAction(nameof(Details), new { id = created.Id }, new { servico = ServicoResponseDtoMapping.Map(createdFull) });
    }

    /// <summary>Servicos/5.</summary>

    [HttpGet("{id:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> Details(int id, CancellationToken cancellationToken = default)
    {
        var data = await _servicosApi.GetDetailsDataAsync(id, cancellationToken);
        return data == null ? NotFound() : Ok(data);
    }

    /// <summary>Servicos/5/edit.</summary>

    [HttpGet("{id:int}/edit")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> Edit(int id, CancellationToken cancellationToken = default)
    {
        var data = await _servicosApi.GetEditDataAsync(id, cancellationToken);
        return data == null ? NotFound() : Ok(data);
    }

    /// <summary>Servicos/5.</summary>

    [HttpPut("{id:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> Edit(int id, [FromBody] ServicoSaveRequestDto input, CancellationToken cancellationToken = default)
    {
        if (id != input.Id) return NotFound();
        var validationResult = await _servicoSaveValidator.ValidateAsync(input, cancellationToken);
        ModelState.AddValidationResult(validationResult);
        if (!ModelState.IsValid)
            return BadRequest(new { error = "Dados inválidos.", errors = ModelState });

        var (updated, erro) = await _servicoService.AtualizarServicoComZonasAsync(
            id, input, Array.Empty<DocumentoGuardadoInput>(), null, cancellationToken);
        if (erro != null)
            return BadRequest(new { error = erro });
        if (updated == null)
            return BadRequest(new { error = "Erro ao atualizar serviço." });

        var updatedFull = await _servicosApi.GetFullAfterChangeAsync(id, cancellationToken);
        if (updatedFull == null) return NotFound();
        return Ok(new { servico = ServicoResponseDtoMapping.Map(updatedFull) });
    }

    /// <summary>Servicos/5/delete.</summary>

    [HttpGet("{id:int}/delete")]
    [Authorize(Policy = PoliticasAutorizacao.PodeApagarServicos)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        var servico = await _servicosApi.GetFullAsync(id, cancellationToken);
        if (servico == null) return NotFound();
        return Ok(ServicoResponseDtoMapping.Map(servico));
    }

    /// <summary>Servicos/5.</summary>

    [HttpDelete("{id:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeApagarServicos)]
    public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken cancellationToken = default)
    {
        var servico = await _servicosApi.DeleteAsync(id, cancellationToken);
        if (servico == null) return NotFound();

        _documentoStorage.ApagarPastaRecursiva(Path.Combine(PastaDocumentosServico, id.ToString()));
        return NoContent();
    }

    /// <summary>
    /// Transferência do ficheiro de um documento extra do serviço (validação de path no storage).
    /// </summary>
    /// <response code="200">Ficheiro do documento extra</response>
    /// <response code="403">Sem política PodeGerirServicos</response>
    /// <response code="404">Serviço ou documento não encontrado</response>
    [HttpPost("{id:int}/documentos-extras")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> AddDocumentoExtra(int id, [FromForm] string nome, IFormFile ficheiro, CancellationToken cancellationToken = default)
    {
        var uploaded = await FormFileMapper.ToUploadedFileContentAsync(ficheiro, cancellationToken);
        if (uploaded == null)
            return BadRequest(new { error = "Selecione um ficheiro." });
        if (uploaded.Length > _documentosOptions.MaxFileSizeBytes)
            return BadRequest(new { message = $"O ficheiro excede o tamanho máximo permitido ({_documentosOptions.MaxFileSizeBytes / (1024 * 1024)} MB)." });
        if (!_documentoStorage.ExtensaoPermitida(uploaded.FileName))
            return BadRequest(new { message = "Extensão de ficheiro não permitida." });

        var nomeDoc = string.IsNullOrWhiteSpace(nome) ? "Documento" : nome.Trim();
        if (nomeDoc.Length > 100) nomeDoc = nomeDoc[..100];
        var caminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosServico, id, uploaded, "doc_" + Guid.NewGuid().ToString("N")[..8], cancellationToken);
        await _servicoService.AdicionarDocumentosExtrasAsync(id, new[] { new DocumentoGuardadoInput(nomeDoc, caminho) }, cancellationToken);
        var servico = await _servicosApi.GetFullAfterChangeAsync(id, cancellationToken);
        if (servico == null) return NotFound();
        return Ok(new { servico = ServicoResponseDtoMapping.Map(servico) });
    }

    [HttpDelete("{id:int}/documentos-extras/{extraId:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> RemoverDocumentoExtra(int id, int extraId, CancellationToken cancellationToken = default)
    {
        var erro = await _servicoService.RemoverDocumentoExtraAsync(id, extraId, cancellationToken);
        if (erro != null)
            return BadRequest(new { error = erro });
        return NoContent();
    }

    [HttpGet("{id:int}/documentos/{extraId:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadDocumento(int id, int extraId, CancellationToken cancellationToken = default)
    {
        var caminho = await _servicosApi.GetDocumentoExtraPathAsync(id, extraId, cancellationToken);
        if (caminho == null) return NotFound();
        return await ServirFicheiro(caminho, cancellationToken: cancellationToken);
    }

    /// <summary>Dados para formulário de upload de licença (query tipo, licencaId, origem).</summary>

    [HttpGet("{id:int}/upload-licenca")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> GetUploadLicenca(int id, int tipo, int? licencaId, [FromQuery] int origem = 1, CancellationToken cancellationToken = default)
    {
        var tipoEnum = (TipoLicencaServico)tipo;
        var origemEnum = origem is 0 or 1 ? (OrigemRegistoServicoLicenca)origem : OrigemRegistoServicoLicenca.AutorizacaoDefinitiva;
        var data = await _servicosApi.GetUploadLicencaDataAsync(id, tipoEnum, origemEnum, licencaId, cancellationToken);
        return data == null ? NotFound() : Ok(data);
    }

    /// <summary>Servicos/5/upload-licenca.</summary>

    [HttpPost("{id:int}/upload-licenca")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> UploadLicenca(int id, [FromQuery] int tipo, [FromQuery] int? licencaId, [FromForm] UploadLicencaFormDto dto, [FromQuery] int origem = 1, CancellationToken cancellationToken = default)
    {
        var tipoEnum = (TipoLicencaServico)tipo;
        var model = ServicoLicencaDto.FromEntity(dto.Licenca);
        var origemEnum = origem is 0 or 1 ? (OrigemRegistoServicoLicenca)origem : OrigemRegistoServicoLicenca.AutorizacaoDefinitiva;

        var (lic, erro) = await _servicosApi.GuardarLicencaAsync(id, model, tipoEnum, origemEnum, licencaId, cancellationToken);
        if (erro != null) return BadRequest(new { error = erro });
        if (lic == null) return NotFound();

        var ficheiro = await FormFileMapper.ToUploadedFileContentAsync(dto.Ficheiro, cancellationToken);
        if (ficheiro != null)
        {
            if (ficheiro.Length > _documentosOptions.MaxFileSizeBytes)
                return BadRequest(new { message = $"O ficheiro excede o tamanho máximo permitido ({_documentosOptions.MaxFileSizeBytes / (1024 * 1024)} MB)." });
            if (!_documentoStorage.ExtensaoPermitida(ficheiro.FileName))
                return BadRequest(new { message = "Extensão de ficheiro não permitida." });
            var ext = Path.GetExtension(ficheiro.FileName).ToLowerInvariant();
            var nomeUnico = $"lic_{lic.Id}_{Guid.NewGuid():N}{ext}";
            var caminhoRelativo = Path.Combine(PastaDocumentosServico, id.ToString(), "Licencas", nomeUnico).Replace('\\', '/');
            await _documentoStorage.GuardarFicheiroNoCaminhoRelativoAsync(caminhoRelativo, ficheiro, cancellationToken);
            if (!string.IsNullOrWhiteSpace(lic.FicheiroPath))
                _documentoStorage.ApagarFicheiroSeExistir(lic.FicheiroPath);
            await _servicosApi.SaveLicencaFilePathAsync(lic, caminhoRelativo, cancellationToken);
        }

        return Ok(new { licenca = ServicoLicencaDto.FromEntity(lic) });
    }

    /// <summary>Gera declaração PSP (PDF) e regista licença PedidoGerado. Apenas Admin/Gestor (404 para os restantes).</summary>
    [HttpPost("{id:int}/licenca/gerar")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirDocumentacaoRegulatoria)]
    public async Task<IActionResult> GerarDeclaracaoPsp(int id, CancellationToken cancellationToken = default)
    {
        var (userId, userName) = await AuditUserResolver.ResolveAsync(_userManager, User, cancellationToken);
        var (licencaId, caminho, nomeFicheiro, erro) = await _documentacaoRegulatoria.GerarDeclaracaoPspAsync(id, userId, userName, cancellationToken);
        if (erro != null)
            return BadRequest(new { error = erro });

        var servico = await _servicosApi.GetFullAfterChangeAsync(id, cancellationToken);
        return Ok(new
        {
            licencaId,
            caminhoRelativo = caminho,
            nomeFicheiro,
            servico = servico != null ? ServicoResponseDtoMapping.Map(servico) : null
        });
    }

    /// <summary>Download do ficheiro de uma licença do serviço.</summary>
    /// <response code="200">Ficheiro da licença</response>
    /// <response code="403">Sem permissão</response>
    /// <response code="404">Licença ou ficheiro não encontrado</response>
    [HttpGet("{id:int}/licenca/{licencaId:int}/ficheiro")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> DownloadLicenca(int id, int licencaId, CancellationToken cancellationToken = default)
    {
        var (userId, userName) = await AuditUserResolver.ResolveAsync(_userManager, User, cancellationToken);
        var caminho = await _documentacaoRegulatoria.ResolverDownloadLicencaAsync(
            id,
            licencaId,
            AuthorizationHelpers.PodeGerirDocumentacaoRegulatoria(User),
            userId,
            userName,
            cancellationToken);
        if (string.IsNullOrWhiteSpace(caminho)) return NotFound();
        var attachment = caminho.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase)
            || caminho.EndsWith(".docx", StringComparison.OrdinalIgnoreCase);
        return await ServirFicheiro(caminho, attachment, cancellationToken);
    }

    /// <summary>Actualiza distância de segurança medida para um ponto do serviço.</summary>
    /// <response code="200">Distância actualizada</response>
    /// <response code="404">Serviço ou distância não encontrados</response>
    [HttpPut("{id:int}/distancia-seguranca/{distanciaId:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GuardarDistanciaSeguranca(int id, int distanciaId, [FromBody] GuardarDistanciaSegurancaDto dto, CancellationToken cancellationToken = default)
    {
        var d = await _servicosApi.GuardarDistanciaAsync(id, distanciaId, dto.DistanciaMedida_m, cancellationToken);
        if (d == null) return NotFound();
        return Ok(new { distancia = ServicoResponseDtoMapping.MapDistancia(d) });
    }

    private async Task<IActionResult> ServirFicheiro(string caminhoRelativo, bool attachment = false, CancellationToken cancellationToken = default) =>
        await DocumentoFileResult.FromPathAsync(this, _documentoStorage, caminhoRelativo, attachment, cancellationToken) ?? NotFound();
}
