using Finalproj.Authorization;
using Finalproj.Data;
using Finalproj.Models;
using Finalproj.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    private readonly FinalprojContext _context;
    private readonly IWebHostEnvironment _env;
    private readonly IDocumentoStorageService _documentoStorage;
    private readonly IServicoService _servicoService;
    private readonly ILogger<ServicosApiController> _logger;
    private readonly DocumentosOptions _documentosOptions;

    public ServicosApiController(
        FinalprojContext context,
        IWebHostEnvironment env,
        IDocumentoStorageService documentoStorage,
        IServicoService servicoService,
        ILogger<ServicosApiController> logger,
        IOptions<DocumentosOptions> documentosOptions)
    {
        _context = context;
        _env = env;
        _documentoStorage = documentoStorage;
        _servicoService = servicoService;
        _logger = logger;
        _documentosOptions = documentosOptions?.Value ?? new DocumentosOptions();
    }

    // GET: api/servicos
    [HttpGet]
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

        IQueryable<Servico> query = _context.Servicos
            .AsNoTracking()
            .Include(s => s.Cliente)
            .Include(s => s.Encomenda).ThenInclude(e => e.Cliente)
            .Include(s => s.ResponsavelTecnico);

        if (clienteId.HasValue)
            query = query.Where(s => s.ClienteId == clienteId.Value);
        if (dataDesde.HasValue)
            query = query.Where(s => s.DataServico >= dataDesde.Value);
        if (dataAte.HasValue)
        {
            var fim = dataAte.Value.Date.AddDays(1);
            query = query.Where(s => s.DataServico < fim);
        }

        query = query.OrderByDescending(s => s.DataServico);
        var totalRegistos = await query.CountAsync(cancellationToken);
        var lista = await query
            .Skip((pagina - 1) * itensPorPagina)
            .Take(itensPorPagina)
            .ToListAsync(cancellationToken);

        var listaDto = lista.Select(s => ServicoResponseDtoMapping.Map(s)).ToList();

        var clientes = await _context.Clientes.OrderBy(c => c.Nome).Select(c => new { c.Id, c.Nome }).ToListAsync(cancellationToken);

        return Ok(new
        {
            lista = listaDto,
            clientes,
            clienteIdFiltro = clienteId,
            dataDesde = dataDesde?.ToString("yyyy-MM-dd") ?? "",
            dataAte = dataAte?.ToString("yyyy-MM-dd") ?? "",
            paginaAtual = pagina,
            itensPorPagina,
            totalRegistos
        });
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

        var createdFull = await _context.Servicos.AsNoTracking().Include(s => s.Cliente).Include(s => s.Encomenda).ThenInclude(e => e.Cliente).Include(s => s.ResponsavelTecnico).Include(s => s.Equipa).ThenInclude(e => e.Funcionario).Include(s => s.DocumentosExtras).Include(s => s.Licencas).FirstAsync(s => s.Id == created.Id, cancellationToken);
        return CreatedAtAction(nameof(Details), new { id = created.Id }, new { servico = ServicoResponseDtoMapping.Map(createdFull) });
    }

    // GET: api/servicos/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Details(int id, CancellationToken cancellationToken = default)
    {
        var servico = await _context.Servicos
            .AsNoTracking()
            .Include(s => s.Cliente)
            .Include(s => s.Encomenda).ThenInclude(e => e.Cliente)
            .Include(s => s.ResponsavelTecnico)
            .Include(s => s.Equipa).ThenInclude(e => e.Funcionario)
            .Include(s => s.DocumentosExtras)
            .Include(s => s.Licencas)
            .Include(s => s.DistanciasSeguranca)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (servico == null) return NotFound();

        ResumoMaterialServicoViewModel? resumoMaterial = null;
        List<EncomendaItem> itensEncomenda = new();
        if (servico.EncomendaId > 0)
        {
            var itens = await _context.EncomendaItems
                .AsNoTracking()
                .Include(i => i.Produto)
                .Where(i => i.EncomendaId == servico.EncomendaId)
                .ToListAsync(cancellationToken);
            resumoMaterial = _servicoService.CalcularResumoMaterial(servico.EncomendaId, itens);
            itensEncomenda = itens;
        }

        var itensEncomendaDto = itensEncomenda.Select(EncomendaResponseDtoMapping.MapItem).ToList();

        await _servicoService.EnsureDistanciasSegurancaAsync(servico.Id, resumoMaterial?.DivisaoDominante, cancellationToken);
        var distanciasSeguranca = await _context.ServicoDistanciasSeguranca
            .AsNoTracking()
            .Where(d => d.ServicoId == servico.Id)
            .OrderBy(d => d.TipoReferencia)
            .ToListAsync(cancellationToken);

        PaiolResponseDto? paiolParaRotaDto = null;
        double? distanciaPaiolKm = null;
        if (servico.EncomendaId > 0 && servico.CoordenadasLat.HasValue && servico.CoordenadasLng.HasValue)
        {
            var saida = await _context.SaidasPaiol
                .AsNoTracking()
                .Include(s => s.Paiol)
                .Where(s => s.EncomendaId == servico.EncomendaId && s.Paiol!.CoordenadasLat.HasValue && s.Paiol.CoordenadasLng.HasValue)
                .FirstOrDefaultAsync(cancellationToken);
            if (saida?.Paiol != null)
            {
                paiolParaRotaDto = PaiolResponseDtoMapping.Map(saida.Paiol);
                distanciaPaiolKm = (double)GeoHelper.CalcularDistanciaKm(
                    saida.Paiol.CoordenadasLat!.Value, saida.Paiol.CoordenadasLng!.Value,
                    servico.CoordenadasLat!.Value, servico.CoordenadasLng!.Value);
            }
        }

        var obrigatorios = ConstantesServicoLicenca.TiposObrigatoriosPara(servico.PublicoPrivado).ToList();
        var licencasDoServico = servico.Licencas?.ToList() ?? new List<ServicoLicenca>();
        var linhas = new List<LicencaServicoLinhaViewModel>();
        foreach (var tipo in ConstantesServicoLicenca.TodosTiposPredefinidos())
        {
            var obr = obrigatorios.Contains(tipo);
            var licPed = licencasDoServico.FirstOrDefault(l =>
                l.TipoLicenca == tipo && l.OrigemRegisto == OrigemRegistoServicoLicenca.PedidoGerado);
            var licDef = licencasDoServico.FirstOrDefault(l =>
                l.TipoLicenca == tipo && l.OrigemRegisto == OrigemRegistoServicoLicenca.AutorizacaoDefinitiva);
            linhas.Add(new LicencaServicoLinhaViewModel
            {
                Tipo = tipo,
                Obrigatorio = obr,
                LicencaPedido = licPed != null ? ServicoLicencaDto.FromEntity(licPed) : null,
                LicencaDefinitiva = licDef != null ? ServicoLicencaDto.FromEntity(licDef) : null,
                EstadoPedido = LicencaServicoLinhaViewModel.CalcularEstado(licPed),
                EstadoDefinitiva = LicencaServicoLinhaViewModel.CalcularEstado(licDef),
            });
        }
        foreach (var lic in licencasDoServico.Where(l => l.TipoLicenca == TipoLicencaServico.OUTRO))
        {
            var vm = new LicencaServicoLinhaViewModel
            {
                Tipo = TipoLicencaServico.OUTRO,
                Obrigatorio = false,
            };
            if (lic.OrigemRegisto == OrigemRegistoServicoLicenca.PedidoGerado)
            {
                vm.LicencaPedido = ServicoLicencaDto.FromEntity(lic);
                vm.EstadoPedido = LicencaServicoLinhaViewModel.CalcularEstado(lic);
            }
            else
            {
                vm.LicencaDefinitiva = ServicoLicencaDto.FromEntity(lic);
                vm.EstadoDefinitiva = LicencaServicoLinhaViewModel.CalcularEstado(lic);
            }
            linhas.Add(vm);
        }

        var totalObr = obrigatorios.Count;
        var entreguesObr = linhas.Count(l => l.Obrigatorio && l.EstadoDefinitiva == 2);

        // Objeto anónimo evita serialização frágil de propriedades calculadas no ViewModel.
        var licencasEventoDto = linhas.Select(l => new
        {
            tipo = l.Tipo,
            nomeExibicao = l.NomeExibicao,
            tooltip = l.Tooltip,
            obrigatorio = l.Obrigatorio,
            estadoPedido = l.EstadoPedido,
            estadoDefinitiva = l.EstadoDefinitiva,
            licencaPedido = l.LicencaPedido,
            licencaDefinitiva = l.LicencaDefinitiva,
        }).ToList();

        var servicoDto = ServicoResponseDtoMapping.Map(servico, distanciasSeguranca);

        return Ok(new
        {
            servico = servicoDto,
            resumoMaterial,
            itensEncomenda = itensEncomendaDto,
            distanciasSeguranca = servicoDto.DistanciasSeguranca,
            paiolParaRota = paiolParaRotaDto,
            distanciaPaiolKm,
            licencasEvento = licencasEventoDto,
            licencasObrigatoriasTotal = totalObr,
            licencasObrigatoriasEntregues = entreguesObr
        });
    }

    // GET: api/servicos/5/edit
    [HttpGet("{id:int}/edit")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> Edit(int id, CancellationToken cancellationToken = default)
    {
        var servico = await _context.Servicos
            .Include(s => s.Cliente)
            .Include(s => s.Encomenda).ThenInclude(e => e.Cliente)
            .Include(s => s.ResponsavelTecnico)
            .Include(s => s.Equipa).ThenInclude(e => e.Funcionario)
            .Include(s => s.DocumentosExtras)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (servico == null) return NotFound();

        var dados = await _servicoService.ObterDadosFormularioAsync(servicoIdParaExcluirEncomenda: id, encomendaIdSugerido: servico.EncomendaId, cancellationToken);
        var equipaIds = servico.Equipa.Select(e => e.FuncionarioId).ToList();
        var servicoDto = ServicoResponseDtoMapping.Map(servico);
        var responsaveisDto = dados.ResponsaveisTecnicos.Select(f => FuncionarioResponseDtoMapping.Map(f, false)).ToList();
        var equipaDto = dados.FuncionariosEquipa.Select(f => FuncionarioResponseDtoMapping.Map(f, false)).ToList();

        return Ok(new
        {
            servico = servicoDto,
            encomendas = dados.Encomendas,
            responsaveisTecnicos = responsaveisDto,
            funcionariosEquipa = equipaDto,
            tiposAcesso = dados.TiposAcesso,
            equipaIds
        });
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
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Servicos.AnyAsync(s => s.Id == servico.Id, cancellationToken)) return NotFound();
            throw;
        }

        var updatedFull = await _context.Servicos.Include(s => s.Cliente).Include(s => s.Encomenda).ThenInclude(e => e.Cliente).Include(s => s.ResponsavelTecnico).Include(s => s.Equipa).ThenInclude(e => e.Funcionario).Include(s => s.DocumentosExtras).Include(s => s.Licencas).FirstAsync(s => s.Id == id, cancellationToken);
        return Ok(new { servico = ServicoResponseDtoMapping.Map(updatedFull) });
    }

    // GET: api/servicos/5/delete
    [HttpGet("{id:int}/delete")]
    [Authorize(Policy = PoliticasAutorizacao.PodeApagarServicos)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        var servico = await _context.Servicos.AsNoTracking().Include(s => s.Cliente).Include(s => s.Encomenda).ThenInclude(e => e.Cliente).Include(s => s.ResponsavelTecnico).Include(s => s.Equipa).ThenInclude(e => e.Funcionario).Include(s => s.DocumentosExtras).Include(s => s.Licencas).FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (servico == null) return NotFound();
        return Ok(ServicoResponseDtoMapping.Map(servico));
    }

    // DELETE: api/servicos/5
    [HttpDelete("{id:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeApagarServicos)]
    public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken cancellationToken = default)
    {
        var servico = await _context.Servicos.FindAsync(id);
        if (servico == null) return NotFound();

        _documentoStorage.ApagarPastaRecursiva(Path.Combine(PastaDocumentosServico, id.ToString()));
        _context.Servicos.Remove(servico);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    // GET: api/servicos/5/documentos/123
    [HttpGet("{id:int}/documentos/{extraId:int}")]
    public IActionResult DownloadDocumento(int id, int extraId)
    {
        var doc = _context.ServicoDocumentoExtras.AsNoTracking().FirstOrDefault(d => d.Id == extraId && d.ServicoId == id);
        if (doc == null) return NotFound();
        return ServirFicheiro(doc.Caminho);
    }

    // GET: api/servicos/5/upload-licenca?tipo=0&licencaId=1 (dados para o formulário)
    [HttpGet("{id:int}/upload-licenca")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> GetUploadLicenca(int id, int tipo, int? licencaId, [FromQuery] int origem = 1, CancellationToken cancellationToken = default)
    {
        var servico = await _context.Servicos.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (servico == null) return NotFound();
        var tipoEnum = (TipoLicencaServico)tipo;
        var origemEnum = origem is 0 or 1 ? (OrigemRegistoServicoLicenca)origem : OrigemRegistoServicoLicenca.AutorizacaoDefinitiva;

        ServicoLicenca? lic = null;
        if (licencaId.HasValue)
            lic = await _context.ServicoLicencas.FirstOrDefaultAsync(l => l.Id == licencaId.Value && l.ServicoId == id, cancellationToken);
        else if (tipoEnum != TipoLicencaServico.OUTRO)
            lic = await _context.ServicoLicencas.FirstOrDefaultAsync(l =>
                l.ServicoId == id && l.TipoLicenca == tipoEnum && l.OrigemRegisto == origemEnum, cancellationToken);

        if (lic == null && licencaId.HasValue) return NotFound();

        var licencaDto = lic != null
            ? ServicoLicencaDto.FromEntity(lic)
            : new ServicoLicencaDto { ServicoId = id, TipoLicenca = tipoEnum, OrigemRegisto = origemEnum };
        return Ok(new
        {
            servicoId = id,
            tipoLicenca = tipo,
            tipoNome = ConstantesServicoLicenca.Nome(tipoEnum),
            origemRegisto = (int)origemEnum,
            licenca = licencaDto
        });
    }

    // POST: api/servicos/5/upload-licenca
    [HttpPost("{id:int}/upload-licenca")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> UploadLicenca(int id, [FromQuery] int tipo, [FromQuery] int? licencaId, [FromForm] UploadLicencaDto dto, [FromQuery] int origem = 1, CancellationToken cancellationToken = default)
    {
        var tipoEnum = (TipoLicencaServico)tipo;
        var model = dto.Licenca;
        var origemEnum = origem is 0 or 1 ? (OrigemRegistoServicoLicenca)origem : OrigemRegistoServicoLicenca.AutorizacaoDefinitiva;

        ServicoLicenca? lic = licencaId.HasValue
            ? await _context.ServicoLicencas.FirstOrDefaultAsync(l => l.Id == licencaId.Value && l.ServicoId == id, cancellationToken)
            : null;

        if (lic != null)
        {
            lic.NumeroDocumento = model.NumeroDocumento;
            lic.DataEmissao = model.DataEmissao;
            lic.DataValidade = model.DataValidade;
            lic.NomePersonalizado = model.NomePersonalizado;
            lic.Observacoes = model.Observacoes;
        }
        else
        {
            if (tipoEnum != TipoLicencaServico.OUTRO)
            {
                var existe = await _context.ServicoLicencas.AnyAsync(l =>
                    l.ServicoId == id && l.TipoLicenca == tipoEnum && l.OrigemRegisto == origemEnum, cancellationToken);
                if (existe)
                    return BadRequest(new { error = "Já existe um registo deste tipo e origem para este serviço." });
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(model.NomePersonalizado))
                {
                    var existeNome = await _context.ServicoLicencas.AnyAsync(l =>
                        l.ServicoId == id && l.TipoLicenca == tipoEnum && l.OrigemRegisto == origemEnum && l.NomePersonalizado == model.NomePersonalizado, cancellationToken);
                    if (existeNome)
                        return BadRequest(new { error = "Já existe um documento «Outro» com este nome para esta origem." });
                }
                else
                {
                    var existeSemNome = await _context.ServicoLicencas.AnyAsync(l =>
                        l.ServicoId == id && l.TipoLicenca == tipoEnum && l.OrigemRegisto == origemEnum && string.IsNullOrWhiteSpace(l.NomePersonalizado), cancellationToken);
                    if (existeSemNome)
                        return BadRequest(new { error = "Já existe um documento «Outro» sem nome para esta origem. Indique um nome personalizado." });
                }
            }

            lic = new ServicoLicenca
            {
                ServicoId = id,
                TipoLicenca = tipoEnum,
                OrigemRegisto = origemEnum,
                NumeroDocumento = model.NumeroDocumento,
                DataEmissao = model.DataEmissao,
                DataValidade = model.DataValidade,
                NomePersonalizado = model.NomePersonalizado,
                Observacoes = model.Observacoes
            };
            _context.ServicoLicencas.Add(lic);
            await _context.SaveChangesAsync(cancellationToken);
        }

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
            lic.FicheiroPath = caminhoRelativo;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Ok(new { licenca = ServicoLicencaDto.FromEntity(lic) });
    }

    // GET: api/servicos/5/licenca/123/ficheiro
    [HttpGet("{id:int}/licenca/{licencaId:int}/ficheiro")]
    public IActionResult DownloadLicenca(int id, int licencaId)
    {
        var lic = _context.ServicoLicencas.AsNoTracking().FirstOrDefault(l => l.Id == licencaId && l.ServicoId == id);
        if (lic == null || string.IsNullOrWhiteSpace(lic.FicheiroPath)) return NotFound();
        return ServirFicheiro(lic.FicheiroPath);
    }

    // PUT: api/servicos/5/distancia-seguranca/123
    [HttpPut("{id:int}/distancia-seguranca/{distanciaId:int}")]
    [Authorize(Policy = PoliticasAutorizacao.PodeGerirServicos)]
    public async Task<IActionResult> GuardarDistanciaSeguranca(int id, int distanciaId, [FromBody] GuardarDistanciaSegurancaDto dto, CancellationToken cancellationToken = default)
    {
        var d = await _context.ServicoDistanciasSeguranca.FirstOrDefaultAsync(x => x.Id == distanciaId && x.ServicoId == id, cancellationToken);
        if (d == null) return NotFound();
        d.DistanciaMedida_m = dto.DistanciaMedida_m;
        await _context.SaveChangesAsync(cancellationToken);
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
