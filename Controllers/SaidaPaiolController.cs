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
    // Saídas do paiol: escolher paiol e produto, depois quantidade; acesso por cargo
    [Route("api/saida-paiol")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = PoliticasAutorizacao.PodeVerArmazemStock)]
    public class SaidaPaiolController : ControllerBase
    {
        private readonly FinalprojContext _context;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IValidator<SaidaPaiolViewModel> _saidaPaiolValidator;

        public SaidaPaiolController(FinalprojContext context, UserManager<IdentityUser> userManager, IValidator<SaidaPaiolViewModel> saidaPaiolValidator)
        {
            _context = context;
            _userManager = userManager;
            _saidaPaiolValidator = saidaPaiolValidator;
        }

        // Indica onde obter o histórico de saídas (Paiol/Movimentos)
        [HttpGet]
        public IActionResult Index()
        {
            return Ok(new
            {
                message = "Use GET api/paiol/movimentos?tipo=Saidas para listar o histórico de saídas.",
                movimentosUrl = "api/paiol/movimentos?tipo=Saidas"
            });
        }

        // GET: paiol + produto obrigatórios; mostra stock disponível
        [HttpGet("registar")]
        public async Task<IActionResult> Registar(int? paiolId, int? produtoId, CancellationToken cancellationToken = default)
        {
            if (!paiolId.HasValue || !produtoId.HasValue)
                return BadRequest(new { error = "PaiolId e ProdutoId são obrigatórios. Use GET api/paiol para listar paióis." });

            var user = await _userManager.GetUserAsync(User);
            var roles = user == null ? Array.Empty<string>() : (await _userManager.GetRolesAsync(user)).ToArray();
            var idsAcesso = await _context.PaiolAcessos
                .Where(a => roles.Contains(a.RoleName))
                .Select(a => a.PaiolId)
                .Distinct()
                .ToListAsync(cancellationToken);
            if (!idsAcesso.Contains(paiolId.Value))
                return Forbid();

            var paiol = await _context.Paiol.FindAsync(paiolId);
            var produto = await _context.Produtos.FindAsync(produtoId);
            if (paiol == null || produto == null)
                return NotFound();

            var entradas = await _context.EntradasPaiol
                .Where(e => e.PaiolId == paiolId && e.ProdutoId == produtoId)
                .SumAsync(e => e.Quantidade, cancellationToken);
            var saidas = await _context.SaidasPaiol
                .Where(s => s.PaiolId == paiolId && s.ProdutoId == produtoId)
                .SumAsync(s => s.Quantidade, cancellationToken);
            var stockDisponivel = entradas - saidas;

            var model = new SaidaPaiolViewModel { PaiolId = paiolId.Value, ProdutoId = produtoId.Value };
            return Ok(new
            {
                model,
                paiolNome = paiol.Nome,
                produtoNome = produto.Nome,
                stockDisponivel
            });
        }

        [HttpPost("registar")]
        // Grava saída
        public async Task<IActionResult> Registar([FromBody] SaidaPaiolViewModel model, CancellationToken cancellationToken = default)
        {
            var validationResult = await _saidaPaiolValidator.ValidateAsync(model, cancellationToken);
            ModelState.AddValidationResult(validationResult);
            if (!ModelState.IsValid)
                return BadRequest(new { model, errors = ModelState });

            var paiol = await _context.Paiol.FindAsync(model.PaiolId);
            var produto = await _context.Produtos.FindAsync(model.ProdutoId);

            if (paiol == null || produto == null)
            {
                ModelState.AddModelError(string.Empty, "Paiol ou produto inválido.");
                return BadRequest(new { model, error = "Paiol ou produto inválido.", errors = ModelState });
            }

            var user = await _userManager.GetUserAsync(User);
            var roles = user == null ? Array.Empty<string>() : (await _userManager.GetRolesAsync(user)).ToArray();
            var idsAcesso = await _context.PaiolAcessos
                .Where(a => roles.Contains(a.RoleName))
                .Select(a => a.PaiolId)
                .Distinct()
                .ToListAsync(cancellationToken);
            if (!idsAcesso.Contains(model.PaiolId))
                return Forbid();

            var entradas = await _context.EntradasPaiol
                .Where(e => e.PaiolId == model.PaiolId && e.ProdutoId == model.ProdutoId)
                .SumAsync(e => e.Quantidade, cancellationToken);
            var saidas = await _context.SaidasPaiol
                .Where(s => s.PaiolId == model.PaiolId && s.ProdutoId == model.ProdutoId)
                .SumAsync(s => s.Quantidade, cancellationToken);
            var stockDisponivel = entradas - saidas;

            if (model.Quantidade > stockDisponivel)
            {
                ModelState.AddModelError(string.Empty,
                    $"Quantidade indisponível. Stock atual neste paiol: {stockDisponivel:N2}. Não pode retirar {model.Quantidade:N2}.");
                return BadRequest(new
                {
                    model,
                    paiolNome = paiol.Nome,
                    produtoNome = produto.Nome,
                    stockDisponivel,
                    errors = ModelState
                });
            }

            var saida = new SaidaPaiol
            {
                PaiolId = model.PaiolId,
                ProdutoId = model.ProdutoId,
                Quantidade = model.Quantidade,
                DataSaida = DateTime.UtcNow,
                FuncionarioRetirouUserId = _userManager.GetUserId(User)
            };
            _context.SaidasPaiol.Add(saida);
            await _context.SaveChangesAsync(cancellationToken);

            return Ok(new
            {
                saida,
                saidaSucesso = $"Saída registada: {model.Quantidade} × {produto.Nome} do paiol {paiol.Nome}.",
                conteudoPaiolUrl = $"api/paiol/{model.PaiolId}/conteudo"
            });
        }
    }
}
