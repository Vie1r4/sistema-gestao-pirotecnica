using Finalproj.Authorization;
using Finalproj.Data;
using Finalproj.Models;
using Finalproj.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Controllers
{
    // Entradas no paiol: formulário Registar com validação MLE e licença; histórico em Paiol/Movimentos
    [Route("api/entrada-paiol")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = PoliticasAutorizacao.PodeVerArmazemStock)]
    public class EntradaPaiolController : ControllerBase
    {
        private readonly FinalprojContext _context;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly Services.ILogSistemaService _logSistema;
        private readonly IValidator<EntradaPaiolViewModel> _entradaPaiolValidator;

        public EntradaPaiolController(FinalprojContext context, UserManager<IdentityUser> userManager, Services.ILogSistemaService logSistema, IValidator<EntradaPaiolViewModel> entradaPaiolValidator)
        {
            _context = context;
            _userManager = userManager;
            _logSistema = logSistema;
            _entradaPaiolValidator = entradaPaiolValidator;
        }

        // Indica onde obter o histórico de entradas (Paiol/Movimentos)
        [HttpGet]
        public IActionResult Index()
        {
            return Ok(new
            {
                message = "Use GET api/paiol/movimentos?tipo=Entradas para listar o histórico de entradas.",
                movimentosUrl = "api/paiol/movimentos?tipo=Entradas"
            });
        }

        // GET: formulário com filtros (paiol, classificação, grupo, etc.)
        [HttpGet("registar")]
        public async Task<IActionResult> Registar(int? paiolId, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre, CancellationToken cancellationToken = default)
        {
            var model = new EntradaPaiolViewModel();
            if (paiolId.HasValue)
                model.PaiolId = paiolId.Value;

            var (paióisComAcesso, produtos) = await PopularDropdownsAsync(paiolId, null, classificacao, grupoCompatibilidade, filtroTecnico, calibre, cancellationToken);

            return Ok(new
            {
                model,
                classificacao = classificacao ?? string.Empty,
                grupoCompatibilidade = grupoCompatibilidade ?? string.Empty,
                filtroTecnico = filtroTecnico ?? string.Empty,
                calibre = calibre ?? string.Empty,
                paióis = paióisComAcesso,
                produtos
            });
        }

        [HttpPost("registar")]
        // Valida com MotorValidacaoPaiol, grava entrada e regista no log
        public async Task<IActionResult> Registar([FromBody] EntradaPaiolViewModel model, CancellationToken cancellationToken = default)
        {
            var validationResult = await _entradaPaiolValidator.ValidateAsync(model, cancellationToken);
            ModelState.AddValidationResult(validationResult);
            if (!ModelState.IsValid)
            {
                var (paióisComAcesso, produtos) = await PopularDropdownsAsync(model.PaiolId, model.ProdutoId, null, null, null, null, cancellationToken);
                return BadRequest(new { model, paióis = paióisComAcesso, produtos, errors = ModelState });
            }

            var paiol = await _context.Paiol.FindAsync(model.PaiolId);
            var produto = await _context.Produtos.FindAsync(model.ProdutoId);

            if (paiol == null || produto == null)
            {
                ModelState.AddModelError(string.Empty, "Paiol ou produto inválido.");
                var (paióisComAcesso, produtos) = await PopularDropdownsAsync(model.PaiolId, model.ProdutoId, null, null, null, null, cancellationToken);
                return BadRequest(new { model, paióis = paióisComAcesso, produtos, errors = ModelState });
            }

            if (paiol.Estado != ConstantesPaiol.EstadoAtivo)
            {
                ModelState.AddModelError(string.Empty, "O paiol está em manutenção e não pode receber carga.");
                var (paióisComAcesso, produtos) = await PopularDropdownsAsync(model.PaiolId, model.ProdutoId, null, null, null, null, cancellationToken);
                return BadRequest(new { model, paióis = paióisComAcesso, produtos, errors = ModelState });
            }

            var stockPorProduto = new Dictionary<int, decimal>();
            var entradasNoPaiol = await _context.EntradasPaiol
                .Where(e => e.PaiolId == paiol.Id)
                .Include(e => e.Produto)
                .ToListAsync(cancellationToken);
            var saidasNoPaiol = await _context.SaidasPaiol
                .Where(s => s.PaiolId == paiol.Id)
                .ToListAsync(cancellationToken);
            foreach (var e in entradasNoPaiol)
                stockPorProduto[e.ProdutoId] = stockPorProduto.GetValueOrDefault(e.ProdutoId) + e.Quantidade;
            foreach (var s in saidasNoPaiol)
            {
                if (stockPorProduto.ContainsKey(s.ProdutoId))
                    stockPorProduto[s.ProdutoId] -= s.Quantidade;
            }

            var produtosNoPaiol = new List<ProdutoNoPaiolDto>();
            var mleAtualPaiol = 0m;
            foreach (var kv in stockPorProduto.Where(kv => kv.Value > 0))
            {
                var p = entradasNoPaiol.First(e => e.ProdutoId == kv.Key).Produto;
                var grupo = (p.GrupoCompatibilidade ?? "G").Trim().ToUpperInvariant();
                if (string.IsNullOrEmpty(grupo)) grupo = "G";
                produtosNoPaiol.Add(new ProdutoNoPaiolDto
                {
                    Divisao = p.FamiliaRisco ?? "",
                    Grupo = grupo,
                    Quantidade = kv.Value,
                    NEMPorUnidade = p.NEMPorUnidade
                });
                mleAtualPaiol += kv.Value * p.NEMPorUnidade;
            }

            var resultado = MotorValidacaoPaiol.ValidarEntrada(
                produto, paiol, model.Quantidade, produtosNoPaiol, mleAtualPaiol, model.DataValidade);

            if (!resultado.Aprovado)
            {
                foreach (var err in resultado.Erros)
                    ModelState.AddModelError(string.Empty, $"[{err.Codigo}] {err.Mensagem}");
                var (paióisComAcesso, produtos) = await PopularDropdownsAsync(model.PaiolId, model.ProdutoId, null, null, null, null, cancellationToken);
                return BadRequest(new { model, paióis = paióisComAcesso, produtos, errors = ModelState, avisos = resultado.Avisos });
            }

            var mleEntrada = model.Quantidade * produto.NEMPorUnidade;
            var mleTotalApos = mleAtualPaiol + mleEntrada;

            _context.EntradasPaiol.Add(new EntradaPaiol
            {
                PaiolId = paiol.Id,
                ProdutoId = produto.Id,
                Quantidade = model.Quantidade,
                DataEntrada = DateTime.UtcNow,
                FuncionarioRegistouUserId = _userManager.GetUserId(User),
                NumeroLote = string.IsNullOrWhiteSpace(model.NumeroLote) ? null : model.NumeroLote.Trim(),
                DataFabrico = model.DataFabrico,
                DataValidade = model.DataValidade
            });

            if (!string.IsNullOrEmpty(resultado.DivisaoDominanteResultante))
            {
                paiol.DivisaoDominante = resultado.DivisaoDominanteResultante;
            }

            await _context.SaveChangesAsync(cancellationToken);

            var user = await _userManager.GetUserAsync(User);
            await _logSistema.RegistarAsync("ENTRADA_STOCK", user?.Id, user?.UserName, new
            {
                produto_id = produto.Id,
                produto_nome = produto.Nome,
                numero_lote = model.NumeroLote,
                quantidade_kg = model.Quantidade,
                paiol_id = paiol.Id,
                paiol_nome = paiol.Nome,
                mle_total_paiol_apos = mleTotalApos
            });

            var entrada = await _context.EntradasPaiol
                .Where(e => e.PaiolId == paiol.Id && e.ProdutoId == produto.Id)
                .OrderByDescending(e => e.DataEntrada)
                .FirstOrDefaultAsync(cancellationToken);

            return Ok(new
            {
                entrada,
                entradaSucesso = $"Entrada registada: {model.Quantidade} × {produto.Nome} no paiol {paiol.Nome}.",
                avisos = resultado.Avisos.Count > 0 ? resultado.Avisos.Select(a => a.Mensagem).ToList() : null
            });
        }

        // Preenche dropdowns paiol (com acesso) e produtos (com filtros)
        private async Task<(List<Paiol> paióisComAcesso, List<Produto> produtos)> PopularDropdownsAsync(int? paiolId, int? produtoId, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre, CancellationToken cancellationToken)
        {
            var user = await _userManager.GetUserAsync(User);
            var rolesDoUtilizador = user == null ? Array.Empty<string>() : (await _userManager.GetRolesAsync(user)).ToArray();

            var idsPaióisComAcesso = await _context.PaiolAcessos
                .Where(a => rolesDoUtilizador.Contains(a.RoleName))
                .Select(a => a.PaiolId)
                .Distinct()
                .ToListAsync(cancellationToken);

            var paióisComAcesso = await _context.Paiol
                .Where(p => p.Estado == ConstantesPaiol.EstadoAtivo && idsPaióisComAcesso.Contains(p.Id))
                .OrderBy(p => p.Nome)
                .ToListAsync(cancellationToken);

            var query = _context.Produtos.AsQueryable();
            if (!string.IsNullOrEmpty(classificacao))
                query = query.Where(p => p.FamiliaRisco == classificacao);
            if (!string.IsNullOrEmpty(grupoCompatibilidade))
                query = query.Where(p => p.GrupoCompatibilidade == grupoCompatibilidade);
            if (!string.IsNullOrEmpty(filtroTecnico))
                query = query.Where(p => p.FiltroTecnico == filtroTecnico);
            if (!string.IsNullOrEmpty(calibre))
                query = query.Where(p => p.Calibre == calibre);
            var produtos = await query.OrderBy(p => p.Nome).ToListAsync(cancellationToken);

            return (paióisComAcesso, produtos);
        }
    }
}
