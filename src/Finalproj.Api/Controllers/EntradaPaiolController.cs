using Finalproj.Authorization;
using Finalproj.Application.Common.Validators;
using Finalproj.Application.DTOs;
using Finalproj.Application.Features.Paiols.DTOs;
using Finalproj.Application.Features.Paiols.Interfaces;
using Finalproj.Application.Features.Produtos.DTOs;
using Finalproj.Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Finalproj.Controllers
{
    /// <summary>Registo de entradas de stock no paiol (validação MLE e licença).</summary>
    [Route("api/entrada-paiol")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = PoliticasAutorizacao.PodeVerArmazemStock)]
    public class EntradaPaiolController : ControllerBase
    {
        private readonly IEntradaPaiolApplicationService _entradas;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly ILogSistemaService _logSistema;
        private readonly IValidator<EntradaPaiolViewModel> _entradaPaiolValidator;

        public EntradaPaiolController(IEntradaPaiolApplicationService entradas, UserManager<IdentityUser> userManager, ILogSistemaService logSistema, IValidator<EntradaPaiolViewModel> entradaPaiolValidator)
        {
            _entradas = entradas;
            _userManager = userManager;
            _logSistema = logSistema;
            _entradaPaiolValidator = entradaPaiolValidator;
        }

        /// <summary>Indica onde obter o histórico de entradas (Paiol/Movimentos).</summary>

        [HttpGet]
        public IActionResult Index()
        {
            return Ok(new
            {
                message = "Use GET api/paiol/movimentos?tipo=Entradas para listar o histórico de entradas.",
                movimentosUrl = "api/paiol/movimentos?tipo=Entradas"
            });
        }

        /// <summary>Formulário com filtros (paiol, classificação, grupo, etc.).</summary>

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

        /// <summary>Valida com MotorValidacaoPaiol, grava entrada e regista no log.</summary>
        [HttpPost("registar")]
        public async Task<IActionResult> Registar([FromBody] EntradaPaiolViewModel model, CancellationToken cancellationToken = default)
        {
            var validationResult = await _entradaPaiolValidator.ValidateAsync(model, cancellationToken);
            ModelState.AddValidationResult(validationResult);
            if (!ModelState.IsValid)
            {
                var (paióisComAcesso, produtos) = await PopularDropdownsAsync(model.PaiolId, model.ProdutoId, null, null, null, null, cancellationToken);
                return BadRequest(new { model, paióis = paióisComAcesso, produtos, errors = ModelState });
            }

            var userId = _userManager.GetUserId(User);
            var resultado = await _entradas.RegistarAsync(model, userId, cancellationToken);
            if (resultado.Erros.Count > 0)
            {
                foreach (var err in resultado.Erros)
                    ModelState.AddModelError(string.Empty, err);
                var (paióisComAcesso, produtos) = await PopularDropdownsAsync(model.PaiolId, model.ProdutoId, null, null, null, null, cancellationToken);
                return BadRequest(new { model, paióis = paióisComAcesso, produtos, errors = ModelState, avisos = resultado.Avisos });
            }

            var user = await _userManager.GetUserAsync(User);
            await _logSistema.RegistarAsync("ENTRADA_STOCK", user?.Id, user?.UserName, new
            {
                produto_id = resultado.Produto!.Id,
                produto_nome = resultado.Produto.Nome,
                numero_lote = model.NumeroLote,
                quantidade_kg = model.Quantidade,
                paiol_id = resultado.Paiol!.Id,
                paiol_nome = resultado.Paiol.Nome,
                mle_total_paiol_apos = resultado.MleTotalApos
            });

            return Ok(new
            {
                entrada = ArmazemResponseDtoMapping.MapEntradaRegistada(resultado.Entrada!),
                entradaSucesso = $"Entrada registada: {model.Quantidade} × {resultado.Produto!.Nome} no paiol {resultado.Paiol!.Nome}.",
                avisos = resultado.Avisos.Count > 0 ? resultado.Avisos : null
            });
        }

        // Preenche dropdowns paiol (com acesso) e produtos (com filtros)
        private async Task<(List<PaiolResponseDto> paióisComAcesso, List<ProdutoResponseDto> produtos)> PopularDropdownsAsync(int? paiolId, int? produtoId, string? classificacao, string? grupoCompatibilidade, string? filtroTecnico, string? calibre, CancellationToken cancellationToken)
        {
            var user = await _userManager.GetUserAsync(User);
            var rolesDoUtilizador = user == null ? Array.Empty<string>() : (await _userManager.GetRolesAsync(user)).ToArray();

            var (paióisComAcesso, produtosEnt) = await _entradas.GetFormularioAsync(rolesDoUtilizador, classificacao, grupoCompatibilidade, filtroTecnico, calibre, cancellationToken);

            return (
                paióisComAcesso.Select(PaiolResponseDtoMapping.Map).ToList(),
                produtosEnt.Select(ProdutoResponseDtoMapping.Map).ToList());
        }
    }
}
