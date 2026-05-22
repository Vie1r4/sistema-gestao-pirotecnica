using Finalproj.Authorization;
using Finalproj.Application.Common.Validators;
using Finalproj.Application.Features.Paiols.DTOs;
using Finalproj.Application.Features.Paiols.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Finalproj.Controllers
{
    /// <summary>Registo de saídas de stock do paiol.</summary>
    [Route("api/saida-paiol")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = PoliticasAutorizacao.PodeVerArmazemStock)]
    public class SaidaPaiolController : ControllerBase
    {
        private readonly ISaidaPaiolApplicationService _saidas;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IValidator<SaidaPaiolViewModel> _saidaPaiolValidator;

        public SaidaPaiolController(ISaidaPaiolApplicationService saidas, UserManager<IdentityUser> userManager, IValidator<SaidaPaiolViewModel> saidaPaiolValidator)
        {
            _saidas = saidas;
            _userManager = userManager;
            _saidaPaiolValidator = saidaPaiolValidator;
        }

        /// <summary>Indica onde obter o histórico de saídas (Paiol/Movimentos).</summary>

        [HttpGet]
        public IActionResult Index()
        {
            return Ok(new
            {
                message = "Use GET api/paiol/movimentos?tipo=Saidas para listar o histórico de saídas.",
                movimentosUrl = "api/paiol/movimentos?tipo=Saidas"
            });
        }

        /// <summary>Paiol + produto obrigatórios; mostra stock disponível.</summary>

        [HttpGet("registar")]
        public async Task<IActionResult> Registar(int? paiolId, int? produtoId, CancellationToken cancellationToken = default)
        {
            if (!paiolId.HasValue || !produtoId.HasValue)
                return BadRequest(new { error = "PaiolId e ProdutoId são obrigatórios. Use GET api/paiol para listar paióis." });

            var user = await _userManager.GetUserAsync(User);
            var roles = user == null ? Array.Empty<string>() : (await _userManager.GetRolesAsync(user)).ToArray();
            var dados = await _saidas.GetFormularioAsync(paiolId.Value, produtoId.Value, roles, cancellationToken);
            if (!dados.TemAcesso)
                return Forbid();
            if (dados.Paiol == null || dados.Produto == null)
                return NotFound();

            var model = new SaidaPaiolViewModel { PaiolId = paiolId.Value, ProdutoId = produtoId.Value };
            return Ok(new
            {
                model,
                paiolNome = dados.Paiol.Nome,
                produtoNome = dados.Produto.Nome,
                stockDisponivel = dados.StockDisponivel
            });
        }

        /// <summary>Regista saída de stock do paiol.</summary>
        [HttpPost("registar")]
        public async Task<IActionResult> Registar([FromBody] SaidaPaiolViewModel model, CancellationToken cancellationToken = default)
        {
            var validationResult = await _saidaPaiolValidator.ValidateAsync(model, cancellationToken);
            ModelState.AddValidationResult(validationResult);
            if (!ModelState.IsValid)
                return BadRequest(new { model, errors = ModelState });

            var user = await _userManager.GetUserAsync(User);
            var roles = user == null ? Array.Empty<string>() : (await _userManager.GetRolesAsync(user)).ToArray();
            var resultado = await _saidas.RegistarAsync(model, _userManager.GetUserId(User), roles, cancellationToken);
            if (!resultado.TemAcesso)
                return Forbid();
            if (resultado.Paiol == null || resultado.Produto == null)
            {
                ModelState.AddModelError(string.Empty, "Paiol ou produto inválido.");
                return BadRequest(new { model, error = "Paiol ou produto inválido.", errors = ModelState });
            }
            if (resultado.Erro != null)
            {
                ModelState.AddModelError(string.Empty, $"{resultado.Erro} Não pode retirar {model.Quantidade:N2}.");
                return BadRequest(new
                {
                    model,
                    paiolNome = resultado.Paiol.Nome,
                    produtoNome = resultado.Produto.Nome,
                    stockDisponivel = resultado.StockDisponivel,
                    errors = ModelState
                });
            }

            return Ok(new
            {
                saida = ArmazemResponseDtoMapping.MapSaidaRegistada(resultado.Saida!),
                saidaSucesso = $"Saída registada: {model.Quantidade} × {resultado.Produto.Nome} do paiol {resultado.Paiol.Nome}.",
                conteudoPaiolUrl = $"api/paiol/{model.PaiolId}/conteudo"
            });
        }
    }
}
