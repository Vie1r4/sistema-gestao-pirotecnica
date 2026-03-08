using Finalproj.Data;
using Finalproj.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Finalproj.Controllers;

// Serviços no terreno: ligados a uma encomenda (1:1), equipa, licenças, distâncias de segurança, documentos
[Authorize]
public class ServicosController : Controller
{
    private const string PastaDocumentosServico = "Documentos/Servico";
    private static readonly string[] ExtensoesPermitidas = { ".pdf", ".jpg", ".jpeg", ".png" };
    private readonly FinalprojContext _context;
    private readonly IWebHostEnvironment _env;

    public ServicosController(FinalprojContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // Lista com filtros por cliente e intervalo de datas
    public async Task<IActionResult> Index(int? clienteId, DateTime? dataDesde, DateTime? dataAte, int pagina = 1, int itensPorPagina = 20, CancellationToken cancellationToken = default)
    {
        if (pagina < 1) pagina = 1;
        if (itensPorPagina < 5 || itensPorPagina > 100) itensPorPagina = 20;

        IQueryable<Servico> query = _context.Servicos
            .AsNoTracking()
            .Include(s => s.Cliente)
            .Include(s => s.Encomenda)
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

        var clientes = await _context.Clientes.OrderBy(c => c.Nome).Select(c => new { c.Id, c.Nome }).ToListAsync(cancellationToken);
        ViewData["ClienteId"] = new SelectList(clientes, "Id", "Nome", clienteId);
        ViewData["ClienteIdFiltro"] = clienteId;
        ViewData["DataDesde"] = dataDesde?.ToString("yyyy-MM-dd") ?? "";
        ViewData["DataAte"] = dataAte?.ToString("yyyy-MM-dd") ?? "";
        ViewData["PaginaAtual"] = pagina;
        ViewData["ItensPorPagina"] = itensPorPagina;
        ViewData["TotalRegistos"] = totalRegistos;
        return View(lista);
    }

    // Detalhe do serviço com equipa, licenças, distâncias, resumo material e mapa
    public async Task<IActionResult> Details(int? id, CancellationToken cancellationToken = default)
    {
        if (id == null) return NotFound();
        var servico = await _context.Servicos
            .AsNoTracking()
            .Include(s => s.Cliente)
            .Include(s => s.Encomenda)
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
            resumoMaterial = CalcularResumoMaterial(servico.EncomendaId, itens);
            itensEncomenda = itens;
        }
        ViewData["ResumoMaterial"] = resumoMaterial;
        ViewData["ItensEncomenda"] = itensEncomenda;

        await EnsureDistanciasSegurancaAsync(servico.Id, resumoMaterial?.DivisaoDominante, cancellationToken);
        var distanciasSeguranca = await _context.ServicoDistanciasSeguranca
            .AsNoTracking()
            .Where(d => d.ServicoId == servico.Id)
            .OrderBy(d => d.TipoReferencia)
            .ToListAsync(cancellationToken);
        ViewData["DistanciasSeguranca"] = distanciasSeguranca;

        Paiol? paiolParaRota = null;
        double? distanciaPaiolKm = null;
        if (servico.EncomendaId > 0 && servico.CoordenadasLat.HasValue && servico.CoordenadasLng.HasValue)
        {
            var saida = await _context.SaidasPaiol
                .AsNoTracking()
                .Include(s => s.Paiol)
                .Where(s => s.EncomendaId == servico.EncomendaId && s.Paiol.CoordenadasLat.HasValue && s.Paiol.CoordenadasLng.HasValue)
                .FirstOrDefaultAsync(cancellationToken);
            if (saida?.Paiol != null)
            {
                paiolParaRota = saida.Paiol;
                distanciaPaiolKm = (double)GeoHelper.CalcularDistanciaKm(
                    saida.Paiol.CoordenadasLat!.Value, saida.Paiol.CoordenadasLng!.Value,
                    servico.CoordenadasLat!.Value, servico.CoordenadasLng!.Value);
            }
        }
        ViewData["PaiolParaRota"] = paiolParaRota;
        ViewData["DistanciaPaiolKm"] = distanciaPaiolKm;
        ViewData["GoogleMapsApiKey"] = HttpContext.RequestServices.GetService<IConfiguration>() is IConfiguration cfg ? (cfg["GoogleMapsApiKey"] ?? "") : "";

        var obrigatorios = ConstantesServicoLicenca.TiposObrigatoriosPara(servico.PublicoPrivado).ToList();
        var licencasDoServico = servico.Licencas?.ToList() ?? new List<ServicoLicenca>();
        var linhas = new List<LicencaServicoLinhaViewModel>();
        foreach (var tipo in ConstantesServicoLicenca.TodosTiposPredefinidos())
        {
            var lic = licencasDoServico.FirstOrDefault(l => l.TipoLicenca == tipo);
            var obr = obrigatorios.Contains(tipo);
            int estado = 0;
            if (lic != null)
            {
                if (!string.IsNullOrWhiteSpace(lic.FicheiroPath)) estado = 2;
                else if (!string.IsNullOrWhiteSpace(lic.NumeroDocumento)) estado = 1;
            }
            linhas.Add(new LicencaServicoLinhaViewModel { Tipo = tipo, Obrigatorio = obr, Estado = estado, Licenca = lic });
        }
        foreach (var lic in licencasDoServico.Where(l => l.TipoLicenca == TipoLicencaServico.OUTRO))
        {
            int estado = string.IsNullOrWhiteSpace(lic.FicheiroPath) ? (string.IsNullOrWhiteSpace(lic.NumeroDocumento) ? 0 : 1) : 2;
            linhas.Add(new LicencaServicoLinhaViewModel { Tipo = TipoLicencaServico.OUTRO, Obrigatorio = false, Estado = estado, Licenca = lic });
        }
        ViewData["LicencasEvento"] = linhas;
        var totalObr = obrigatorios.Count;
        var entreguesObr = linhas.Where(l => l.Obrigatorio && l.Estado == 2).Count();
        ViewData["LicencasObrigatoriasTotal"] = totalObr;
        ViewData["LicencasObrigatoriasEntregues"] = entreguesObr;

        return View(servico);
    }

    // Resumo do material da encomenda (MLE, divisão dominante, categorias) para a vista Details
    private static ResumoMaterialServicoViewModel CalcularResumoMaterial(int encomendaId, List<EncomendaItem> itens)
    {
        var resumo = new ResumoMaterialServicoViewModel
        {
            EncomendaId = encomendaId,
            TemItens = itens.Count > 0
        };
        if (itens.Count == 0) return resumo;

        resumo.NumeroProdutos = itens.Select(i => i.ProdutoId).Distinct().Count();
        resumo.TotalUnidades = itens.Sum(i => i.QuantidadePedida);
        resumo.MleTotalKg = itens.Sum(i => i.QuantidadePedida * (i.Produto?.NEMPorUnidade ?? 0));
        // Peso bruto: o modelo Produto não tem campo; deixar null
        resumo.PesoBrutoKg = null;

        var familias = itens
            .Select(i => i.Produto?.FamiliaRisco)
            .Where(f => !string.IsNullOrWhiteSpace(f))
            .Distinct()
            .OrderBy(f => f)
            .ToList();
        resumo.CategoriasPresentes = string.Join(" · ", familias);

        // Divisão dominante = mais perigosa (1.1G > 1.3G > 1.4G > 1.4S)
        var ordemPerigo = new[] { "1.1G", "1.3G", "1.4G", "1.4S" };
        int IndicePerigo(string? f)
        {
            var i = Array.IndexOf(ordemPerigo, f ?? "");
            return i < 0 ? 999 : i;
        }
        resumo.DivisaoDominante = familias.OrderBy(IndicePerigo).FirstOrDefault();
        resumo.CorDivisaoDominante = resumo.DivisaoDominante switch
        {
            "1.1G" => "danger",
            "1.3G" => "warning",   // laranja em Bootstrap 5
            "1.4G" => "warning",  // amarelo
            "1.4S" => "success",  // verde
            _ => "secondary"
        };

        return resumo;
    }

    // Cria linhas de distâncias de segurança em falta (por tipo); HABITACAO usa divisão dominante
    private async Task EnsureDistanciasSegurancaAsync(int servicoId, string? divisaoDominante, CancellationToken cancellationToken)
    {
        var existentes = await _context.ServicoDistanciasSeguranca
            .Where(d => d.ServicoId == servicoId)
            .Select(d => d.TipoReferencia)
            .ToListAsync(cancellationToken);
        var tipos = Enum.GetValues<TipoReferenciaDistancia>().Where(t => t != TipoReferenciaDistancia.OUTRO).ToList();
        var faltam = tipos.Where(t => !existentes.Contains(t)).ToList();
        if (faltam.Count == 0) return;
        foreach (var tipo in faltam)
        {
            int min = tipo == TipoReferenciaDistancia.HABITACAO
                ? ConstantesDistanciaSeguranca.HabitacaoMinimaMetros(divisaoDominante)
                : tipo switch
                {
                    TipoReferenciaDistancia.ESTRADA_NACIONAL => ConstantesDistanciaSeguranca.EstradaNacional,
                    TipoReferenciaDistancia.AUTOESTRADA => ConstantesDistanciaSeguranca.Autoestrada,
                    TipoReferenciaDistancia.LINHA_ALTA_TENSAO => ConstantesDistanciaSeguranca.LinhaAltaTensao,
                    TipoReferenciaDistancia.FLORESTA => ConstantesDistanciaSeguranca.Floresta,
                    _ => 50
                };
            _context.ServicoDistanciasSeguranca.Add(new ServicoDistanciaSeguranca
            {
                ServicoId = servicoId,
                TipoReferencia = tipo,
                DescricaoReferencia = ConstantesDistanciaSeguranca.Nome(tipo),
                DistanciaMinima_m = min
            });
        }
        await _context.SaveChangesAsync(cancellationToken);
    }

    [Authorize(Roles = "Admin")]
    // GET: formulário novo serviço; dropdowns encomenda, responsável, equipa
    public async Task<IActionResult> Create(int? encomendaId, CancellationToken cancellationToken = default)
    {
        await PopularDropdownsCreateAsync(encomendaId, cancellationToken);
        ViewData["GoogleMapsApiKey"] = HttpContext.RequestServices.GetService<IConfiguration>()?["GoogleMapsApiKey"] ?? "";
        return View(new Servico { DataServico = DateTime.Today, EncomendaId = encomendaId ?? 0 });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    // Grava serviço, equipa, documentos e distâncias de segurança
    public async Task<IActionResult> Create(
        [Bind("EncomendaId,DataServico,PublicoPrivado,ResponsavelTecnicoId,Observacoes,MoradaCompleta,Cidade,Municipio,Distrito,CoordenadasLat,CoordenadasLng,RaioPublico")] Servico servico,
        int[]? EquipaIds,
        List<DocumentoExtraInput>? documentosExtras,
        CancellationToken cancellationToken = default)
    {
        var encomenda = await _context.Encomendas.Include(e => e.Cliente).FirstOrDefaultAsync(e => e.Id == servico.EncomendaId, cancellationToken);
        if (encomenda == null)
            ModelState.AddModelError(nameof(Servico.EncomendaId), "Selecione uma encomenda concluída.");
        else
        {
            servico.ClienteId = encomenda.ClienteId;
            var encomendaJaUsada = await _context.Servicos.AnyAsync(s => s.EncomendaId == servico.EncomendaId, cancellationToken);
            if (encomendaJaUsada)
                ModelState.AddModelError(nameof(Servico.EncomendaId), "Cada encomenda só pode ser utilizada num único serviço. Esta encomenda já está associada a outro serviço.");
        }

        // Regra: responsável técnico tem de ser funcionário com ADR e licença de operador
        if (servico.ResponsavelTecnicoId.HasValue)
        {
            var resp = await _context.Funcionarios.AsNoTracking().FirstOrDefaultAsync(f => f.Id == servico.ResponsavelTecnicoId.Value, cancellationToken);
            if (resp == null || string.IsNullOrWhiteSpace(resp.DocumentoADDRCaminho) || string.IsNullOrWhiteSpace(resp.LicencaOperadorCaminho))
                ModelState.AddModelError(nameof(Servico.ResponsavelTecnicoId), "O responsável técnico tem de ser um funcionário com ADR e licença de operador.");
        }

        // Regra: equipa só pode incluir funcionários com licença de operador
        if (EquipaIds != null && EquipaIds.Length > 0)
        {
            var comLicenca = await _context.Funcionarios
                .Where(f => !string.IsNullOrWhiteSpace(f.LicencaOperadorCaminho))
                .Select(f => f.Id)
                .ToListAsync(cancellationToken);
            var invalidos = EquipaIds.Where(id => !comLicenca.Contains(id)).ToList();
            if (invalidos.Any())
                ModelState.AddModelError("EquipaIds", "Só podem fazer parte da equipa funcionários com licença de operador.");
        }

        if (ModelState.IsValid && encomenda != null)
        {
            _context.Servicos.Add(servico);
            await _context.SaveChangesAsync(cancellationToken);

            if (EquipaIds != null && EquipaIds.Length > 0)
            {
                var comLicenca = await _context.Funcionarios
                    .Where(f => !string.IsNullOrWhiteSpace(f.LicencaOperadorCaminho))
                    .Select(f => f.Id)
                    .ToListAsync(cancellationToken);
                foreach (var fid in EquipaIds.Distinct())
                {
                    if (comLicenca.Contains(fid))
                        _context.ServicoEquipas.Add(new ServicoEquipa { ServicoId = servico.Id, FuncionarioId = fid });
                }
                await _context.SaveChangesAsync(cancellationToken);
            }

            var pastaBase = Path.Combine(_env.WebRootPath, PastaDocumentosServico, servico.Id.ToString());
            if (Directory.Exists(pastaBase) == false)
                Directory.CreateDirectory(pastaBase);
            if (documentosExtras != null)
            {
                var idx = 0;
                foreach (var ext in documentosExtras)
                {
                    if (ext?.Ficheiro != null && FicheiroPermitido(ext.Ficheiro.FileName))
                    {
                        var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento " + (idx + 1) : ext.Nome.Trim();
                        if (nome.Length > 100) nome = nome[..100];
                        var caminho = await GuardarFicheiro(ext.Ficheiro, pastaBase, "doc_" + Guid.NewGuid().ToString("N")[..8]);
                        _context.ServicoDocumentoExtras.Add(new ServicoDocumentoExtra { ServicoId = servico.Id, Nome = nome, Caminho = caminho });
                        idx++;
                    }
                }
                await _context.SaveChangesAsync(cancellationToken);
            }
            TempData["ServicoCriado"] = true;
            return RedirectToAction(nameof(Index));
        }
        await PopularDropdownsCreateAsync(servico.EncomendaId, cancellationToken);
        return View(servico);
    }

    [Authorize(Roles = "Admin")]
    // GET: formulário edição com dropdowns e equipa actual
    public async Task<IActionResult> Edit(int? id, CancellationToken cancellationToken = default)
    {
        if (id == null) return NotFound();
        var servico = await _context.Servicos.Include(s => s.Equipa).Include(s => s.DocumentosExtras).FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (servico == null) return NotFound();
        await PopularDropdownsEditAsync(servico, cancellationToken);
        ViewData["EquipaIds"] = servico.Equipa.Select(e => e.FuncionarioId).ToList();
        ViewData["GoogleMapsApiKey"] = HttpContext.RequestServices.GetService<IConfiguration>()?["GoogleMapsApiKey"] ?? "";
        return View(servico);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    // Actualiza serviço, equipa e documentos; valida responsável e equipa (ADR, licença)
    public async Task<IActionResult> Edit(
        int id,
        [Bind("Id,EncomendaId,ClienteId,DataServico,Local,PublicoPrivado,ResponsavelTecnicoId,Observacoes,MoradaCompleta,Cidade,Municipio,Distrito,CoordenadasLat,CoordenadasLng,RaioPublico")] Servico servico,
        int[]? EquipaIds,
        List<DocumentoExtraInput>? documentosExtras,
        List<int>? RemoverDocumentoExtraIds,
        CancellationToken cancellationToken = default)
    {
        if (id != servico.Id) return NotFound();
        var encomenda = await _context.Encomendas.Include(e => e.Cliente).FirstOrDefaultAsync(e => e.Id == servico.EncomendaId, cancellationToken);
        if (encomenda != null)
        {
            servico.ClienteId = encomenda.ClienteId;
            var encomendaJaUsada = await _context.Servicos.AnyAsync(s => s.EncomendaId == servico.EncomendaId && s.Id != id, cancellationToken);
            if (encomendaJaUsada)
                ModelState.AddModelError(nameof(Servico.EncomendaId), "Cada encomenda só pode ser utilizada num único serviço. Esta encomenda já está associada a outro serviço.");
        }

        // Regra: responsável técnico tem de ser funcionário com ADR e licença de operador
        if (servico.ResponsavelTecnicoId.HasValue)
        {
            var resp = await _context.Funcionarios.AsNoTracking().FirstOrDefaultAsync(f => f.Id == servico.ResponsavelTecnicoId.Value, cancellationToken);
            if (resp == null || string.IsNullOrWhiteSpace(resp.DocumentoADDRCaminho) || string.IsNullOrWhiteSpace(resp.LicencaOperadorCaminho))
                ModelState.AddModelError(nameof(Servico.ResponsavelTecnicoId), "O responsável técnico tem de ser um funcionário com ADR e licença de operador.");
        }

        // Regra: equipa só pode incluir funcionários com licença de operador
        if (EquipaIds != null && EquipaIds.Length > 0)
        {
            var comLicenca = await _context.Funcionarios
                .Where(f => !string.IsNullOrWhiteSpace(f.LicencaOperadorCaminho))
                .Select(f => f.Id)
                .ToListAsync(cancellationToken);
            var invalidos = EquipaIds.Where(id => !comLicenca.Contains(id)).ToList();
            if (invalidos.Any())
                ModelState.AddModelError("EquipaIds", "Só podem fazer parte da equipa funcionários com licença de operador.");
        }

        if (ModelState.IsValid)
        {
            try
            {
                if (RemoverDocumentoExtraIds != null && RemoverDocumentoExtraIds.Count > 0)
                {
                    var aRemover = await _context.ServicoDocumentoExtras.Where(d => d.ServicoId == id && RemoverDocumentoExtraIds.Contains(d.Id)).ToListAsync(cancellationToken);
                    foreach (var d in aRemover)
                    {
                        var caminhoFisico = Path.Combine(_env.WebRootPath, d.Caminho);
                        if (System.IO.File.Exists(caminhoFisico)) { try { System.IO.File.Delete(caminhoFisico); } catch { } }
                        _context.ServicoDocumentoExtras.Remove(d);
                    }
                    await _context.SaveChangesAsync(cancellationToken);
                }
                _context.Update(servico);
                var equipaAtual = await _context.ServicoEquipas.Where(e => e.ServicoId == id).ToListAsync(cancellationToken);
                _context.ServicoEquipas.RemoveRange(equipaAtual);
                var comLicenca = await _context.Funcionarios
                    .Where(f => !string.IsNullOrWhiteSpace(f.LicencaOperadorCaminho))
                    .Select(f => f.Id)
                    .ToListAsync(cancellationToken);
                if (EquipaIds != null && EquipaIds.Length > 0)
                {
                    foreach (var fid in EquipaIds.Distinct())
                    {
                        if (comLicenca.Contains(fid))
                            _context.ServicoEquipas.Add(new ServicoEquipa { ServicoId = id, FuncionarioId = fid });
                    }
                }
                await _context.SaveChangesAsync(cancellationToken);
                var pastaBase = Path.Combine(_env.WebRootPath, PastaDocumentosServico, id.ToString());
                if (Directory.Exists(pastaBase) == false) Directory.CreateDirectory(pastaBase);
                if (documentosExtras != null)
                {
                    var idx = 0;
                    foreach (var ext in documentosExtras)
                    {
                        if (ext?.Ficheiro != null && FicheiroPermitido(ext.Ficheiro.FileName))
                        {
                            var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento " + (idx + 1) : ext.Nome.Trim();
                            if (nome.Length > 100) nome = nome[..100];
                            var caminho = await GuardarFicheiro(ext.Ficheiro, pastaBase, "doc_" + Guid.NewGuid().ToString("N")[..8]);
                            _context.ServicoDocumentoExtras.Add(new ServicoDocumentoExtra { ServicoId = id, Nome = nome, Caminho = caminho });
                            idx++;
                        }
                    }
                    await _context.SaveChangesAsync(cancellationToken);
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Servicos.AnyAsync(s => s.Id == servico.Id, cancellationToken)) return NotFound();
                throw;
            }
            TempData["ServicoEditado"] = true;
            return RedirectToAction(nameof(Details), new { id });
        }
        await PopularDropdownsEditAsync(servico, cancellationToken);
        ViewData["EquipaIds"] = EquipaIds ?? Array.Empty<int>();
        return View(servico);
    }

    [Authorize(Roles = "Admin")]
    // GET: confirmação antes de apagar
    public async Task<IActionResult> Delete(int? id, CancellationToken cancellationToken = default)
    {
        if (id == null) return NotFound();
        var servico = await _context.Servicos.AsNoTracking().Include(s => s.Cliente).Include(s => s.Encomenda).FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (servico == null) return NotFound();
        return View(servico);
    }

    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    // Apaga serviço e pasta de documentos
    public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken cancellationToken = default)
    {
        var servico = await _context.Servicos.FindAsync(id);
        if (servico != null)
        {
            var pastaBase = Path.Combine(_env.WebRootPath, PastaDocumentosServico, id.ToString());
            if (Directory.Exists(pastaBase)) { try { Directory.Delete(pastaBase, recursive: true); } catch { } }
            _context.Servicos.Remove(servico);
            await _context.SaveChangesAsync(cancellationToken);
        }
        return RedirectToAction(nameof(Index));
    }

    // Devolve documento extra do serviço (inline)
    public IActionResult Download(int id, int extraId)
    {
        var doc = _context.ServicoDocumentoExtras.AsNoTracking().FirstOrDefault(d => d.Id == extraId && d.ServicoId == id);
        if (doc == null) return NotFound();
        return ServirFicheiro(doc.Caminho);
    }

    [Authorize(Roles = "Admin")]
    // GET: formulário para número/validade da licença e upload do ficheiro
    public async Task<IActionResult> UploadLicenca(int id, int tipo, int? licencaId, CancellationToken cancellationToken = default)
    {
        var servico = await _context.Servicos.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (servico == null) return NotFound();
        var tipoEnum = (TipoLicencaServico)tipo;
        ServicoLicenca? lic = null;
        if (licencaId.HasValue)
            lic = await _context.ServicoLicencas.FirstOrDefaultAsync(l => l.Id == licencaId.Value && l.ServicoId == id, cancellationToken);
        if (lic == null && licencaId.HasValue) return NotFound();
        ViewData["ServicoId"] = id;
        ViewData["TipoLicenca"] = tipo;
        ViewData["TipoNome"] = ConstantesServicoLicenca.Nome(tipoEnum);
        ViewData["Licenca"] = lic;
        return View(lic ?? new ServicoLicenca { ServicoId = id, TipoLicenca = tipoEnum });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    // Grava dados da licença e ficheiro (ou cria nova linha ServicoLicenca)
    public async Task<IActionResult> UploadLicenca(int id, int tipo, int? licencaId, ServicoLicenca model, IFormFile? ficheiro, CancellationToken cancellationToken = default)
    {
        var tipoEnum = (TipoLicencaServico)tipo;
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
            lic = new ServicoLicenca
            {
                ServicoId = id,
                TipoLicenca = tipoEnum,
                NumeroDocumento = model.NumeroDocumento,
                DataEmissao = model.DataEmissao,
                DataValidade = model.DataValidade,
                NomePersonalizado = model.NomePersonalizado,
                Observacoes = model.Observacoes
            };
            _context.ServicoLicencas.Add(lic);
            await _context.SaveChangesAsync(cancellationToken);
        }
        if (ficheiro != null && FicheiroPermitido(ficheiro.FileName))
        {
            var pastaLicencas = Path.Combine(_env.WebRootPath, PastaDocumentosServico, id.ToString(), "Licencas");
            if (!Directory.Exists(pastaLicencas)) Directory.CreateDirectory(pastaLicencas);
            var ext = Path.GetExtension(ficheiro.FileName).ToLowerInvariant();
            var nomeUnico = $"lic_{lic.Id}_{Guid.NewGuid():N}{ext}";
            var caminhoFisico = Path.Combine(pastaLicencas, nomeUnico);
            await using (var stream = new FileStream(caminhoFisico, FileMode.Create))
                await ficheiro.CopyToAsync(stream);
            var caminhoRelativo = Path.Combine(PastaDocumentosServico, id.ToString(), "Licencas", nomeUnico).Replace('\\', '/');
            if (!string.IsNullOrWhiteSpace(lic.FicheiroPath))
            {
                var antigo = Path.Combine(_env.WebRootPath, lic.FicheiroPath);
                if (System.IO.File.Exists(antigo)) try { System.IO.File.Delete(antigo); } catch { }
            }
            lic.FicheiroPath = caminhoRelativo;
            await _context.SaveChangesAsync(cancellationToken);
        }
        TempData["LicencaGuardada"] = true;
        return RedirectToAction(nameof(Details), new { id });
    }

    // Devolve ficheiro da licença (inline)
    public IActionResult DownloadLicenca(int id, int licencaId)
    {
        var lic = _context.ServicoLicencas.AsNoTracking().FirstOrDefault(l => l.Id == licencaId && l.ServicoId == id);
        if (lic == null || string.IsNullOrWhiteSpace(lic.FicheiroPath)) return NotFound();
        return ServirFicheiro(lic.FicheiroPath);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [Authorize(Roles = "Admin")]
    // Actualiza distância medida (metros) de uma linha de distância de segurança
    public async Task<IActionResult> GuardarDistanciaSeguranca(int id, int distanciaId, int? distanciaMedida_m, CancellationToken cancellationToken = default)
    {
        var d = await _context.ServicoDistanciasSeguranca.FirstOrDefaultAsync(x => x.Id == distanciaId && x.ServicoId == id, cancellationToken);
        if (d == null) return NotFound();
        d.DistanciaMedida_m = distanciaMedida_m;
        await _context.SaveChangesAsync(cancellationToken);
        TempData["DistanciaGuardada"] = true;
        return RedirectToAction(nameof(Details), new { id });
    }

    // Dropdowns para Create: encomendas disponíveis, responsáveis, equipa (com licença)
    private async Task PopularDropdownsCreateAsync(int? encomendaId, CancellationToken cancellationToken)
    {
        var encomendasJaUsadas = await _context.Servicos.AsNoTracking().Select(s => s.EncomendaId).ToListAsync(cancellationToken);
        var encomendas = await _context.Encomendas.AsNoTracking().Include(e => e.Cliente)
            .Where(e => e.Estado == ConstantesEncomenda.CONCLUIDA && !encomendasJaUsadas.Contains(e.Id))
            .OrderByDescending(e => e.DataConclusao)
            .ToListAsync(cancellationToken);
        var items = encomendas.Select(e => new { e.Id, Texto = "#" + e.Id + " - " + e.Cliente.Nome + " (" + (e.DataConclusao.HasValue ? e.DataConclusao.Value.ToString("dd/MM/yyyy") : "") + ")" }).ToList();
        ViewData["EncomendaId"] = new SelectList(items, "Id", "Texto", encomendaId);
        // Responsável técnico: só funcionários com ADR e Licença de Operador
        var responsaveis = await _context.Funcionarios
            .Where(f => !string.IsNullOrWhiteSpace(f.DocumentoADDRCaminho) && !string.IsNullOrWhiteSpace(f.LicencaOperadorCaminho))
            .OrderBy(f => f.NomeCompleto)
            .ToListAsync(cancellationToken);
        ViewData["ResponsaveisTecnicos"] = responsaveis;
        // Equipa: só funcionários com Licença de Operador
        var equipa = await _context.Funcionarios
            .Where(f => !string.IsNullOrWhiteSpace(f.LicencaOperadorCaminho))
            .OrderBy(f => f.NomeCompleto)
            .ToListAsync(cancellationToken);
        ViewData["FuncionariosEquipa"] = equipa;
        ViewData["TiposAcesso"] = new SelectList(ConstantesServico.TiposAcesso);
    }

    // Dropdowns para Edit: encomenda/cliente, responsáveis, equipa (com licença)
    private async Task PopularDropdownsEditAsync(Servico servico, CancellationToken cancellationToken)
    {
        var encomendasJaUsadas = await _context.Servicos.AsNoTracking().Where(s => s.Id != servico.Id).Select(s => s.EncomendaId).ToListAsync(cancellationToken);
        var encomendas = await _context.Encomendas.AsNoTracking().Include(e => e.Cliente)
            .Where(e => e.Estado == ConstantesEncomenda.CONCLUIDA && (!encomendasJaUsadas.Contains(e.Id) || e.Id == servico.EncomendaId))
            .OrderByDescending(e => e.DataConclusao)
            .ToListAsync(cancellationToken);
        var items = encomendas.Select(e => new { e.Id, Texto = "#" + e.Id + " - " + e.Cliente.Nome }).ToList();
        ViewData["EncomendaId"] = new SelectList(items, "Id", "Texto", servico.EncomendaId);
        var responsaveis = await _context.Funcionarios
            .Where(f => !string.IsNullOrWhiteSpace(f.DocumentoADDRCaminho) && !string.IsNullOrWhiteSpace(f.LicencaOperadorCaminho))
            .OrderBy(f => f.NomeCompleto)
            .ToListAsync(cancellationToken);
        ViewData["ResponsaveisTecnicos"] = responsaveis;
        var equipa = await _context.Funcionarios
            .Where(f => !string.IsNullOrWhiteSpace(f.LicencaOperadorCaminho))
            .OrderBy(f => f.NomeCompleto)
            .ToListAsync(cancellationToken);
        ViewData["FuncionariosEquipa"] = equipa;
        ViewData["TiposAcesso"] = new SelectList(ConstantesServico.TiposAcesso, servico.PublicoPrivado);
    }

    // Envia ficheiro do disco com Content-Type e nome para inline
    private IActionResult ServirFicheiro(string caminhoRelativo)
    {
        var caminhoFisico = Path.Combine(_env.WebRootPath, caminhoRelativo);
        if (!System.IO.File.Exists(caminhoFisico)) return NotFound();
        var ext = Path.GetExtension(caminhoRelativo).ToLowerInvariant();
        var contentType = ext switch { ".pdf" => "application/pdf", ".jpg" or ".jpeg" => "image/jpeg", ".png" => "image/png", _ => "application/octet-stream" };
        Response.Headers["Content-Disposition"] = "inline; filename=\"" + Path.GetFileName(caminhoRelativo).Replace("\"", "\\\"") + "\"";
        return PhysicalFile(caminhoFisico, contentType);
    }

    // Só permite extensões da lista (pdf, jpg, etc.)
    private static bool FicheiroPermitido(string fileName)
    {
        var ext = Path.GetExtension(fileName);
        return !string.IsNullOrEmpty(ext) && ExtensoesPermitidas.Contains(ext.ToLowerInvariant());
    }

    // Grava IFormFile na pasta com nome único; devolve caminho relativo
    private async Task<string> GuardarFicheiro(IFormFile ficheiro, string pastaBase, string prefixo)
    {
        var ext = Path.GetExtension(ficheiro.FileName).ToLowerInvariant();
        var nomeUnico = $"{prefixo}_{Guid.NewGuid():N}{ext}";
        var caminhoFisico = Path.Combine(pastaBase, nomeUnico);
        await using var stream = new FileStream(caminhoFisico, FileMode.Create);
        await ficheiro.CopyToAsync(stream);
        var idPasta = Path.GetFileName(pastaBase.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar));
        return Path.Combine(PastaDocumentosServico, idPasta, nomeUnico).Replace('\\', '/');
    }
}
