using Finalproj.Authorization;
using Finalproj.Data;
using Finalproj.Models;
using Finalproj.Services;
using Finalproj.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Controllers
{
    // Paióis: CRUD, documentos extras, acesso por role; listagem com ocupação MLE e percentagem
    [Route("api/paiol")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class PaiolController : ControllerBase
    {
        private readonly FinalprojContext _context;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IWebHostEnvironment _env;
        private readonly IDocumentoStorageService _documentoStorage;
        private readonly IValidator<CreatePaiolInputDto> _createPaiolValidator;
        private const string PastaDocumentosPaiol = "Documentos/Paiol";

        public PaiolController(FinalprojContext context, UserManager<IdentityUser> userManager, IWebHostEnvironment env, IDocumentoStorageService documentoStorage, IValidator<CreatePaiolInputDto> createPaiolValidator)
        {
            _context = context;
            _userManager = userManager;
            _env = env;
            _documentoStorage = documentoStorage;
            _createPaiolValidator = createPaiolValidator;
        }

        // Paióis a que o utilizador tem acesso (por cargo). Admin vê todos os paióis.
        private async Task<List<int>> ObterPaiolIdsComAcessoAsync(CancellationToken cancellationToken = default)
        {
            if (User.IsInRole(ConstantesRoles.Admin) || User.IsInRole(ConstantesRoles.Gestor))
                return await _context.Paiol.Select(p => p.Id).ToListAsync(cancellationToken);
            var user = await _userManager.GetUserAsync(User);
            var roles = user == null ? Array.Empty<string>() : (await _userManager.GetRolesAsync(user)).ToArray();
            return await _context.PaiolAcessos
                .Where(a => roles.Contains(a.RoleName))
                .Select(a => a.PaiolId)
                .Distinct()
                .ToListAsync(cancellationToken);
        }

        // MLE actual e % ocupação por paiol (para listagens)
        private async Task<Dictionary<int, (decimal MleAtual, decimal PercentagemOcupacao)>> CalcularOcupacaoPorPaiolAsync(IEnumerable<Paiol> paióis, CancellationToken cancellationToken = default)
        {
            var ids = paióis.Select(p => p.Id).ToList();
            if (ids.Count == 0)
                return new Dictionary<int, (decimal, decimal)>();

            var limitePorPaiol = paióis.ToDictionary(p => p.Id, p => p.LimiteMLE);
            var entradas = await _context.EntradasPaiol
                .Where(e => ids.Contains(e.PaiolId))
                .Include(e => e.Produto)
                .ToListAsync(cancellationToken);
            var saidas = await _context.SaidasPaiol
                .Where(s => ids.Contains(s.PaiolId))
                .ToListAsync(cancellationToken);

            var result = new Dictionary<int, (decimal, decimal)>();
            foreach (var id in ids)
            {
                var entradasPaiol = entradas.Where(e => e.PaiolId == id).ToList();
                var saidasPaiol = saidas.Where(s => s.PaiolId == id).ToList();
                var stockPorProduto = entradasPaiol
                    .GroupBy(e => e.ProdutoId)
                    .ToDictionary(g => g.Key, g => g.Sum(e => e.Quantidade));
                foreach (var s in saidasPaiol)
                {
                    if (stockPorProduto.ContainsKey(s.ProdutoId))
                        stockPorProduto[s.ProdutoId] -= s.Quantidade;
                }
                decimal mleAtual = 0;
                foreach (var kv in stockPorProduto.Where(kv => kv.Value > 0))
                {
                    var prod = entradasPaiol.First(e => e.ProdutoId == kv.Key).Produto;
                    mleAtual += kv.Value * prod.NEMPorUnidade;
                }
                var limite = limitePorPaiol[id];
                var percentagem = limite > 0 ? mleAtual / limite * 100 : 0;
                result[id] = (mleAtual, percentagem);
            }
            return result;
        }

        // GET: Paiol — página operacional: lista de paióis com acesso
        [HttpGet]
        [Authorize(Policy = PoliticasAutorizacao.PodeVerArmazemStock)]
        public async Task<IActionResult> Index(CancellationToken cancellationToken = default)
        {
            var idsAcesso = await ObterPaiolIdsComAcessoAsync(cancellationToken);
            var lista = await _context.Paiol
                .Where(p => idsAcesso.Contains(p.Id))
                .OrderBy(p => p.Nome)
                .ToListAsync(cancellationToken);
            var ocupacao = await CalcularOcupacaoPorPaiolAsync(lista, cancellationToken);
            var result = lista.Select(p => new PaiolComOcupacaoResponseDto
            {
                Paiol = PaiolResponseDtoMapping.Map(p),
                MleAtual = ocupacao.GetValueOrDefault(p.Id).MleAtual,
                PercentagemOcupacao = ocupacao.GetValueOrDefault(p.Id).PercentagemOcupacao
            }).ToList();
            return Ok(result);
        }

        // Stock físico (entradas - saídas) por produto nos paióis com acesso
        private async Task<Dictionary<int, decimal>> ObterStockFisicoPorProdutoAsync(List<int> idsPaióis, CancellationToken cancellationToken = default)
        {
            if (idsPaióis.Count == 0)
                return new Dictionary<int, decimal>();

            var entradas = await _context.EntradasPaiol
                .Where(e => idsPaióis.Contains(e.PaiolId))
                .GroupBy(e => e.ProdutoId)
                .Select(g => new { ProdutoId = g.Key, Total = g.Sum(e => e.Quantidade) })
                .ToListAsync(cancellationToken);
            var saidas = await _context.SaidasPaiol
                .Where(s => idsPaióis.Contains(s.PaiolId))
                .GroupBy(s => s.ProdutoId)
                .Select(g => new { ProdutoId = g.Key, Total = g.Sum(s => s.Quantidade) })
                .ToListAsync(cancellationToken);

            var resultado = new Dictionary<int, decimal>();
            foreach (var e in entradas)
                resultado[e.ProdutoId] = e.Total;
            foreach (var s in saidas)
                resultado[s.ProdutoId] = resultado.GetValueOrDefault(s.ProdutoId) - s.Total;
            return resultado;
        }

        // Catálogo com coluna stock (só nos paióis com acesso)
        [HttpGet("stock")]
        [Authorize(Policy = PoliticasAutorizacao.PodeVerArmazemStock)]
        public async Task<IActionResult> Stock(string? pesquisa, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre, CancellationToken cancellationToken = default)
        {
            var idsAcesso = await ObterPaiolIdsComAcessoAsync(cancellationToken);
            var stockPorProduto = await ObterStockFisicoPorProdutoAsync(idsAcesso, cancellationToken);

            var query = _context.Produtos.AsQueryable();
            if (!string.IsNullOrWhiteSpace(pesquisa))
                query = query.Where(p => p.Nome.Contains(pesquisa));
            if (!string.IsNullOrEmpty(classificacao))
                query = query.Where(p => p.FamiliaRisco == classificacao);
            if (!string.IsNullOrEmpty(grupoCompatibilidade))
                query = query.Where(p => p.GrupoCompatibilidade == grupoCompatibilidade);
            if (!string.IsNullOrEmpty(filtroTecnico))
                query = query.Where(p => p.FiltroTecnico == filtroTecnico);
            if (!string.IsNullOrEmpty(calibre))
                query = query.Where(p => p.Calibre == calibre);

            var lista = await query.OrderBy(p => p.Nome).ToListAsync(cancellationToken);

            return Ok(new
            {
                items = lista,
                stockPorProduto,
                pesquisa = pesquisa ?? string.Empty,
                classificacao = classificacao ?? string.Empty,
                grupoCompatibilidade = grupoCompatibilidade ?? string.Empty,
                filtroTecnico = filtroTecnico ?? string.Empty,
                calibre = calibre ?? string.Empty
            });
        }

        // Dicionário userId → nome (UserName) para mostrar em listagens
        private async Task<Dictionary<string, string>> ObterNomesUtilizadoresAsync(List<string> userIds, CancellationToken cancellationToken = default)
        {
            if (userIds.Count == 0) return new Dictionary<string, string>();
            var users = await _userManager.Users.Where(u => userIds.Contains(u.Id)).ToListAsync(cancellationToken);
            return users.ToDictionary(u => u.Id, u => u.UserName ?? u.Id);
        }

        // GET: Movimentos — entradas ou saídas, com filtro por paiol
        [HttpGet("movimentos")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirArmazem)]
        public async Task<IActionResult> Movimentos(string? tipo, int? paiolId, int pagina = 1, int itensPorPagina = 25, CancellationToken cancellationToken = default)
        {
            if (pagina < 1) pagina = 1;
            if (itensPorPagina < 5 || itensPorPagina > 100) itensPorPagina = 25;

            var idsAcesso = await ObterPaiolIdsComAcessoAsync(cancellationToken);
            var paióis = await _context.Paiol
                .Where(p => idsAcesso.Contains(p.Id))
                .OrderBy(p => p.Nome)
                .ToListAsync(cancellationToken);

            if (string.IsNullOrEmpty(tipo))
            {
                return Ok(new
                {
                    paióis,
                    paiolIdFiltro = paiolId,
                    tipo = tipo ?? string.Empty,
                    entradas = new List<EntradaPaiol>(),
                    saidas = new List<SaidaPaiol>(),
                    paginaAtual = pagina,
                    totalRegistos = 0,
                    itensPorPagina
                });
            }

            if (tipo == "Entradas")
            {
                var query = _context.EntradasPaiol
                    .Include(e => e.Paiol)
                    .Include(e => e.Produto)
                    .Where(e => idsAcesso.Contains(e.PaiolId));
                if (paiolId.HasValue)
                    query = query.Where(e => e.PaiolId == paiolId.Value);
                query = query.OrderByDescending(e => e.DataEntrada);
                var totalRegistos = await query.CountAsync(cancellationToken);
                var entradas = await query
                    .Skip((pagina - 1) * itensPorPagina)
                    .Take(itensPorPagina)
                    .ToListAsync(cancellationToken);
                var userIdsEntradas = entradas.Where(e => !string.IsNullOrEmpty(e.FuncionarioRegistouUserId)).Select(e => e.FuncionarioRegistouUserId!).Distinct().ToList();
                var nomesUtilizadoresEntradas = await ObterNomesUtilizadoresAsync(userIdsEntradas, cancellationToken);

                return Ok(new
                {
                    paióis,
                    paiolIdFiltro = paiolId,
                    tipo,
                    entradas,
                    saidas = new List<SaidaPaiol>(),
                    nomesUtilizadoresEntradas,
                    paginaAtual = pagina,
                    totalRegistos,
                    itensPorPagina
                });
            }

            var querySaidas = _context.SaidasPaiol
                .Include(s => s.Paiol)
                .Include(s => s.Produto)
                .Where(s => idsAcesso.Contains(s.PaiolId));
            if (paiolId.HasValue)
                querySaidas = querySaidas.Where(s => s.PaiolId == paiolId.Value);
            querySaidas = querySaidas.OrderByDescending(s => s.DataSaida);
            var totalRegistosSaidas = await querySaidas.CountAsync(cancellationToken);
            var saidas = await querySaidas
                .Skip((pagina - 1) * itensPorPagina)
                .Take(itensPorPagina)
                .ToListAsync(cancellationToken);
            var userIds = saidas.Where(s => !string.IsNullOrEmpty(s.FuncionarioRetirouUserId)).Select(s => s.FuncionarioRetirouUserId!).Distinct().ToList();
            var nomesUtilizadoresSaidas = await ObterNomesUtilizadoresAsync(userIds, cancellationToken);

            return Ok(new
            {
                paióis,
                paiolIdFiltro = paiolId,
                tipo,
                entradas = new List<EntradaPaiol>(),
                saidas,
                nomesUtilizadoresSaidas,
                paginaAtual = pagina,
                totalRegistos = totalRegistosSaidas,
                itensPorPagina
            });
        }

        // GET: Gestao — CRUD completo; Admin e Gestor
        [HttpGet("gestao")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirArmazem)]
        public async Task<IActionResult> Gestao(CancellationToken cancellationToken = default)
        {
            var lista = await _context.Paiol.OrderBy(p => p.Nome).ToListAsync(cancellationToken);
            var ocupacao = await CalcularOcupacaoPorPaiolAsync(lista, cancellationToken);
            var result = lista.Select(p => new PaiolComOcupacaoResponseDto
            {
                Paiol = PaiolResponseDtoMapping.Map(p),
                MleAtual = ocupacao.GetValueOrDefault(p.Id).MleAtual,
                PercentagemOcupacao = ocupacao.GetValueOrDefault(p.Id).PercentagemOcupacao
            }).ToList();
            return Ok(result);
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

            var paiol = await _context.Paiol.FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
            if (paiol == null)
                return NotFound();

            var entradas = await _context.EntradasPaiol.Where(e => e.PaiolId == id).Include(e => e.Produto).ToListAsync(cancellationToken);
            var saidas = await _context.SaidasPaiol.Where(s => s.PaiolId == id).ToListAsync(cancellationToken);
            var stockPorProduto = entradas
                .GroupBy(e => e.ProdutoId)
                .Select(g => new { ProdutoId = g.Key, Entradas = g.Sum(e => e.Quantidade) })
                .ToDictionary(x => x.ProdutoId, x => x.Entradas);
            foreach (var s in saidas)
            {
                if (stockPorProduto.ContainsKey(s.ProdutoId))
                    stockPorProduto[s.ProdutoId] -= s.Quantidade;
            }
            var produtosIds = stockPorProduto.Keys.ToList();
            var produtos = await _context.Produtos.Where(pr => produtosIds.Contains(pr.Id)).ToDictionaryAsync(pr => pr.Id, cancellationToken);
            var carga = stockPorProduto
                .Where(kv => kv.Value > 0)
                .Select(kv =>
                {
                    var p = produtos.GetValueOrDefault(kv.Key);
                    return p == null ? null : new CargaPaiolItem { ProdutoId = p.Id, ProdutoNome = p.Nome, Quantidade = kv.Value, NEMPorUnidade = p.NEMPorUnidade, Divisao = p.FamiliaRisco ?? "" };
                })
                .Where(x => x != null)
                .Cast<CargaPaiolItem>()
                .ToList();

            return Ok(new { paiol, carga });
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

            var paiol = await _context.Paiol.Include(p => p.DocumentosExtras).FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
            if (paiol == null)
                return NotFound();

            var entradas = await _context.EntradasPaiol.Where(e => e.PaiolId == id).Include(e => e.Produto).ToListAsync(cancellationToken);
            var saidas = await _context.SaidasPaiol.Where(s => s.PaiolId == id).Include(s => s.Produto).ToListAsync(cancellationToken);
            var stockPorProduto = entradas
                .GroupBy(e => e.ProdutoId)
                .Select(g => new { ProdutoId = g.Key, Entradas = g.Sum(e => e.Quantidade) })
                .ToDictionary(x => x.ProdutoId, x => x.Entradas);
            foreach (var s in saidas)
            {
                if (stockPorProduto.ContainsKey(s.ProdutoId))
                    stockPorProduto[s.ProdutoId] -= s.Quantidade;
            }
            var produtosIds = stockPorProduto.Keys.ToList();
            var produtos = await _context.Produtos.Where(pr => produtosIds.Contains(pr.Id)).ToDictionaryAsync(pr => pr.Id, cancellationToken);
            var carga = stockPorProduto
                .Where(kv => kv.Value > 0)
                .Select(kv =>
                {
                    var p = produtos.GetValueOrDefault(kv.Key);
                    return p == null ? null : new CargaPaiolItem { ProdutoId = p.Id, ProdutoNome = p.Nome, Quantidade = kv.Value, NEMPorUnidade = p.NEMPorUnidade, Divisao = p.FamiliaRisco ?? "" };
                })
                .Where(x => x != null)
                .Cast<CargaPaiolItem>()
                .ToList();
            var nemAtual = carga.Sum(x => x.NEMTotal);
            var cargosAcesso = await _context.PaiolAcessos.Where(a => a.PaiolId == id).Select(a => a.RoleName).ToListAsync(cancellationToken);

            return Ok(new { paiol, nemAtual, carga, cargosAcesso });
        }

        // GET: Create (Admin e Gestor)
        [HttpGet("create")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirArmazem)]
        public IActionResult Create()
        {
            return Ok(new
            {
                paiol = new Paiol(),
                perfisRisco = ConstantesPaiol.LicencasParaDropdown(),
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
                        paiol,
                        perfisRisco = ConstantesPaiol.LicencasParaDropdown(),
                        estados = ConstantesPaiol.Estados,
                        cargosDisponiveis = ConstantesPaiol.CargosDisponiveis,
                        errors = ModelState
                    });
                }
                _context.Add(paiol);
                await _context.SaveChangesAsync(cancellationToken);
                if (cargosAcesso != null)
                {
                    foreach (var role in cargosAcesso)
                    {
                        if (ConstantesPaiol.CargosDisponiveis.Contains(role))
                            _context.PaiolAcessos.Add(new PaiolAcesso { PaiolId = paiol.Id, RoleName = role });
                    }
                    await _context.SaveChangesAsync(cancellationToken);
                }
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
                            _context.PaiolDocumentoExtras.Add(new PaiolDocumentoExtra { PaiolId = paiol.Id, Nome = nome, Caminho = caminho });
                            idx++;
                        }
                    }
                    await _context.SaveChangesAsync(cancellationToken);
                }
                return CreatedAtAction(nameof(Details), new { id = paiol.Id }, new { paiol });
            }
            return BadRequest(new
            {
                paiol,
                perfisRisco = ConstantesPaiol.LicencasParaDropdown(),
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

            var paiol = await _context.Paiol.Include(p => p.DocumentosExtras).FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
            if (paiol == null)
                return NotFound();

            var cargosSelecionados = await _context.PaiolAcessos.Where(a => a.PaiolId == id).Select(a => a.RoleName).ToListAsync(cancellationToken);

            return Ok(new
            {
                paiol,
                perfisRisco = ConstantesPaiol.LicencasParaDropdown(),
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
                    if (removerDocumentoExtraIds != null && removerDocumentoExtraIds.Count > 0)
                    {
                        var aRemover = await _context.PaiolDocumentoExtras
                            .Where(e => e.PaiolId == id && removerDocumentoExtraIds.Contains(e.Id))
                            .ToListAsync(cancellationToken);
                        foreach (var e in aRemover)
                        {
                            _documentoStorage.ApagarFicheiroSeExistir(e.Caminho);
                            _context.PaiolDocumentoExtras.Remove(e);
                        }
                        await _context.SaveChangesAsync(cancellationToken);
                    }

                    _context.Update(paiol);
                    await _context.SaveChangesAsync(cancellationToken);

                    var existentes = await _context.PaiolAcessos.Where(a => a.PaiolId == id).ToListAsync(cancellationToken);
                    _context.PaiolAcessos.RemoveRange(existentes);
                    if (cargosAcesso != null)
                    {
                        foreach (var role in cargosAcesso)
                        {
                            if (ConstantesPaiol.CargosDisponiveis.Contains(role))
                                _context.PaiolAcessos.Add(new PaiolAcesso { PaiolId = id, RoleName = role });
                        }
                    }
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
                                var caminho = await _documentoStorage.GuardarFicheiroAsync(PastaDocumentosPaiol, id, ext.Ficheiro, "doc_" + Guid.NewGuid().ToString("N")[..8], cancellationToken);
                                _context.PaiolDocumentoExtras.Add(new PaiolDocumentoExtra { PaiolId = id, Nome = nome, Caminho = caminho });
                                idx++;
                            }
                        }
                        await _context.SaveChangesAsync(cancellationToken);
                    }
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!await PaiolExistsAsync(paiol.Id, cancellationToken))
                        return NotFound();
                    throw;
                }
                return Ok(new { paiol });
            }

            var cargosSelecionados = await _context.PaiolAcessos.Where(a => a.PaiolId == id).Select(a => a.RoleName).ToListAsync(cancellationToken);
            return BadRequest(new
            {
                paiol,
                perfisRisco = ConstantesPaiol.LicencasParaDropdown(),
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

            var paiol = await _context.Paiol.FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
            if (paiol == null)
                return NotFound();

            return Ok(paiol);
        }

        // DELETE: Delete
        [HttpDelete("{id:int}")]
        [Authorize(Policy = PoliticasAutorizacao.PodeGerirArmazem)]
        public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken cancellationToken = default)
        {
            var paiol = await _context.Paiol.FindAsync(id);
            if (paiol != null)
            {
                _documentoStorage.ApagarPastaRecursiva(Path.Combine(PastaDocumentosPaiol, id.ToString()));
                _context.Paiol.Remove(paiol);
                await _context.SaveChangesAsync(cancellationToken);
            }
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
            var extra = await _context.PaiolDocumentoExtras.AsNoTracking().FirstOrDefaultAsync(e => e.Id == extraId && e.PaiolId == id, cancellationToken);
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

        private async Task<bool> PaiolExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Paiol.AnyAsync(e => e.Id == id, cancellationToken);
        }
    }
}
