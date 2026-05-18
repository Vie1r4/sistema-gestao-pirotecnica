using Finalproj.Authorization;
using Finalproj.Application.Features.Clientes.DTOs;
using Finalproj.Application.Features.Funcionarios.DTOs;
using Finalproj.Application.Features.Servicos.DTOs;
using Finalproj.Application.Features.Servicos.Interfaces;
using Finalproj.Application.Features.Servicos.Services;
using Finalproj.Application.Services;
using Finalproj.Infrastructure.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
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
    private readonly IWebHostEnvironment _env;
    private readonly IDocumentoStorageService _documentoStorage;
    private readonly IServicoService _servicoService;
    private readonly IServicosApiApplicationService _servicosApi;
    private readonly ILogger<ServicosApiController> _logger;
    private readonly DocumentosOptions _documentosOptions;

    public ServicosApiController(
        IWebHostEnvironment env,
        IDocumentoStorageService documentoStorage,
        IServicoService servicoService,
        IServicosApiApplicationService servicosApi,
        ILogger<ServicosApiController> logger,
        IOptions<DocumentosOptions> documentosOptions)
    {
        _env = env;
        _documentoStorage = documentoStorage;
        _servicoService = servicoService;
        _servicosApi = servicosApi;
        _logger = logger;
        _documentosOptions = documentosOptions?.Value ?? new DocumentosOptions();
    }

    // GET: api/servicos
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

    // GET: api/servicos/create
    [HttpGet("create")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> Create(int? encomendaId, CancellationToken cancellationToken = default)
    {
        var dados = await _servicoService.ObterDadosFormularioAsync(servicoIdParaExcluirEncomenda: null, encomendaIdSugerido: encomendaId, cancellationToken);
        var responsaveisDto = dados.ResponsaveisTecnicos.Select(f => FuncionarioResponseDtoMapping.Map(f, false)).ToList();
        var equipaDto = dados.FuncionariosEquipa.Select(f => FuncionarioResponseDtoMapping.Map(f, false)).ToList();
        return Ok(new
        {
            encomendas = dados.Encomendas,
            responsaveisTecnicos = responsaveisDto,
            funcionariosEquipa = equipaDto,
            tiposAcesso = dados.TiposAcesso,
            servico = new { DataServico = DateTime.Today, EncomendaId = encomendaId ?? 0 }
        });
    }

    // POST: api/servicos
    [HttpPost]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> Create([FromForm] CreateServicoInputDto input, CancellationToken cancellationToken = default)
    {
        var servico = input.Servico;
        var equipaIds = input.EquipaIds;
        var (created, erro) = await _servicoService.CriarServicoAsync(servico, equipaIds, cancellationToken);
        if (erro != null)
            return BadRequest(new { error = erro });
        if (created == null)
            return BadRequest(new { error = "Erro ao criar serviço." });

        var documentosGuardados = new List<DocumentoGuardadoInput>();
        if (input.DocumentosExtras != null)
        {
            var idx = 0;
            foreach (var ext in input.DocumentosExtras)
            {
                if (ext?.Ficheiro != null && _documentoStorage.ExtensaoPermitida(ext.Ficheiro.FileName))
                {
                    var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento " + (idx + 1) : ext.Nome.Trim();
                    if (nome.Length > 100) nome = nome[..100];
                    var caminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosServico, created.Id, ext.Ficheiro, "doc_" + Guid.NewGuid().ToString("N")[..8], cancellationToken);
                    documentosGuardados.Add(new DocumentoGuardadoInput(nome, caminho));
                    idx++;
                }
            }
        }
        if (documentosGuardados.Count > 0)
            await _servicoService.AdicionarDocumentosExtrasAsync(created.Id, documentosGuardados, cancellationToken);

        var createdFull = await _servicosApi.GetFullAfterChangeAsync(created.Id, cancellationToken);
        if (createdFull == null) return NotFound();
        return CreatedAtAction(nameof(Details), new { id = created.Id }, new { servico = ServicoResponseDtoMapping.Map(createdFull) });
    }

    // GET: api/servicos/5
    [HttpGet("{id:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> Details(int id, CancellationToken cancellationToken = default)
    {
        var data = await _servicosApi.GetDetailsDataAsync(id, cancellationToken);
        return data == null ? NotFound() : Ok(data);
    }

    // GET: api/servicos/5/edit
    [HttpGet("{id:int}/edit")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> Edit(int id, CancellationToken cancellationToken = default)
    {
        var data = await _servicosApi.GetEditDataAsync(id, cancellationToken);
        return data == null ? NotFound() : Ok(data);
    }

    // PUT: api/servicos/5
    [HttpPut("{id:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> Edit(int id, [FromForm] EditServicoInputDto input, CancellationToken cancellationToken = default)
    {
        var servico = input.Servico;
        if (id != servico.Id) return NotFound();

        var documentosNovos = new List<DocumentoGuardadoInput>();
        if (input.DocumentosExtras != null)
        {
            var idx = 0;
            foreach (var ext in input.DocumentosExtras)
            {
                if (ext?.Ficheiro != null && _documentoStorage.ExtensaoPermitida(ext.Ficheiro.FileName))
                {
                    var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento " + (idx + 1) : ext.Nome.Trim();
                    if (nome.Length > 100) nome = nome[..100];
                    var caminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosServico, id, ext.Ficheiro, "doc_" + Guid.NewGuid().ToString("N")[..8], cancellationToken);
                    documentosNovos.Add(new DocumentoGuardadoInput(nome, caminho));
                    idx++;
                }
            }
        }

        try
        {
            var (updated, erro) = await _servicoService.AtualizarServicoAsync(id, servico, input.EquipaIds, documentosNovos, input.RemoverDocumentoExtraIds, cancellationToken);
            if (erro != null)
                return BadRequest(new { error = erro });
            if (updated == null)
                return BadRequest(new { error = "Erro ao atualizar serviço." });
        }
        catch (InvalidOperationException)
        {
            throw;
        }

        var updatedFull = await _servicosApi.GetFullAfterChangeAsync(id, cancellationToken);
        if (updatedFull == null) return NotFound();
        return Ok(new { servico = ServicoResponseDtoMapping.Map(updatedFull) });
    }

    // GET: api/servicos/5/delete
    [HttpGet("{id:int}/delete")]
    [Authorize(Policy = PoliticasAutorizacao.PodeApagarServicos)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        var servico = await _servicosApi.GetFullAsync(id, cancellationToken);
        if (servico == null) return NotFound();
        return Ok(ServicoResponseDtoMapping.Map(servico));
    }

    // DELETE: api/servicos/5
    [HttpDelete("{id:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeApagarServicos)]
    public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken cancellationToken = default)
    {
        var servico = await _servicosApi.DeleteAsync(id, cancellationToken);
        if (servico == null) return NotFound();

        _documentoStorage.ApagarPastaRecursiva(Path.Combine(PastaDocumentosServico, id.ToString()));
        return NoContent();
    }

    // GET: api/servicos/5/documentos/123
    [HttpGet("{id:int}/documentos/{extraId:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> DownloadDocumento(int id, int extraId, CancellationToken cancellationToken = default)
    {
        var caminho = await _servicosApi.GetDocumentoExtraPathAsync(id, extraId, cancellationToken);
        if (caminho == null) return NotFound();
        return ServirFicheiro(caminho);
    }

    // GET: api/servicos/5/upload-licenca?tipo=0&licencaId=1 (dados para o formulário)
    [HttpGet("{id:int}/upload-licenca")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> GetUploadLicenca(int id, int tipo, int? licencaId, [FromQuery] int origem = 1, CancellationToken cancellationToken = default)
    {
        var tipoEnum = (TipoLicencaServico)tipo;
        var origemEnum = origem is 0 or 1 ? (OrigemRegistoServicoLicenca)origem : OrigemRegistoServicoLicenca.AutorizacaoDefinitiva;
        var data = await _servicosApi.GetUploadLicencaDataAsync(id, tipoEnum, origemEnum, licencaId, cancellationToken);
        return data == null ? NotFound() : Ok(data);
    }

    // POST: api/servicos/5/upload-licenca
    [HttpPost("{id:int}/upload-licenca")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> UploadLicenca(int id, [FromQuery] int tipo, [FromQuery] int? licencaId, [FromForm] UploadLicencaDto dto, [FromQuery] int origem = 1, CancellationToken cancellationToken = default)
    {
        var tipoEnum = (TipoLicencaServico)tipo;
        var model = ServicoLicencaDto.FromEntity(dto.Licenca);
        var origemEnum = origem is 0 or 1 ? (OrigemRegistoServicoLicenca)origem : OrigemRegistoServicoLicenca.AutorizacaoDefinitiva;

        var (lic, erro) = await _servicosApi.GuardarLicencaAsync(id, model, tipoEnum, origemEnum, licencaId, cancellationToken);
        if (erro != null) return BadRequest(new { error = erro });
        if (lic == null) return NotFound();

        var ficheiro = dto.Ficheiro;
        if (ficheiro != null)
        {
            if (ficheiro.Length > _documentosOptions.MaxFileSizeBytes)
                return BadRequest(new { message = $"O ficheiro excede o tamanho máximo permitido ({_documentosOptions.MaxFileSizeBytes / (1024 * 1024)} MB)." });
            if (!_documentoStorage.ExtensaoPermitida(ficheiro.FileName))
                return BadRequest(new { message = "Extensão de ficheiro não permitida." });
            var pastaLicencas = Path.Combine(_env.WebRootPath!, PastaDocumentosServico, id.ToString(), "Licencas");
            if (!Directory.Exists(pastaLicencas)) Directory.CreateDirectory(pastaLicencas);
            var ext = Path.GetExtension(ficheiro.FileName).ToLowerInvariant();
            var nomeUnico = $"lic_{lic.Id}_{Guid.NewGuid():N}{ext}";
            var caminhoFisico = Path.Combine(pastaLicencas, nomeUnico);
            await using (var stream = new FileStream(caminhoFisico, FileMode.Create))
                await ficheiro.CopyToAsync(stream);
            var caminhoRelativo = Path.Combine(PastaDocumentosServico, id.ToString(), "Licencas", nomeUnico).Replace('\\', '/');
            if (!string.IsNullOrWhiteSpace(lic.FicheiroPath))
                _documentoStorage.ApagarFicheiroSeExistir(lic.FicheiroPath);
            await _servicosApi.SaveLicencaFilePathAsync(lic, caminhoRelativo, cancellationToken);
        }

        return Ok(new { licenca = ServicoLicencaDto.FromEntity(lic) });
    }

    // GET: api/servicos/5/licenca/123/ficheiro
    [HttpGet("{id:int}/licenca/{licencaId:int}/ficheiro")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> DownloadLicenca(int id, int licencaId, CancellationToken cancellationToken = default)
    {
        var caminho = await _servicosApi.GetLicencaFilePathAsync(id, licencaId, cancellationToken);
        if (string.IsNullOrWhiteSpace(caminho)) return NotFound();
        return ServirFicheiro(caminho);
    }

    // PUT: api/servicos/5/distancia-seguranca/123
    [HttpPut("{id:int}/distancia-seguranca/{distanciaId:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> GuardarDistanciaSeguranca(int id, int distanciaId, [FromBody] GuardarDistanciaSegurancaDto dto, CancellationToken cancellationToken = default)
    {
        var d = await _servicosApi.GuardarDistanciaAsync(id, distanciaId, dto.DistanciaMedida_m, cancellationToken);
        if (d == null) return NotFound();
        return Ok(new { distancia = ServicoResponseDtoMapping.MapDistancia(d) });
    }

    private IActionResult ServirFicheiro(string caminhoRelativo)
    {
        var caminhoFisico = Path.Combine(_env.WebRootPath!, caminhoRelativo);
        if (!System.IO.File.Exists(caminhoFisico)) return NotFound();
        var ext = Path.GetExtension(caminhoRelativo).ToLowerInvariant();
        var contentType = ext switch { ".pdf" => "application/pdf", ".jpg" or ".jpeg" => "image/jpeg", ".png" => "image/png", _ => "application/octet-stream" };
        Response.Headers["Content-Disposition"] = "inline; filename=\"" + Path.GetFileName(caminhoRelativo).Replace("\"", "\\\"") + "\"";
        return PhysicalFile(caminhoFisico, contentType);
    }
}
