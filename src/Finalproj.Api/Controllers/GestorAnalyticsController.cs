using Finalproj.Application.Features.GestorAnalytics.Interfaces;
using Finalproj.Domain.Constants;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finalproj.Controllers;

/// <summary>Analytics do painel do gestor: volume, YoY, consumo por cliente, top clientes.</summary>
[Route("api/gestor-analytics")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = ConstantesRoles.Admin + "," + ConstantesRoles.Gestor)]
public class GestorAnalyticsController(IGestorAnalyticsService analytics) : ControllerBase
{
    [HttpGet("volume")]
    public Task<IActionResult> Volume(
        [FromQuery] string granularidade = "dia",
        [FromQuery] int dias = 90,
        CancellationToken cancellationToken = default) =>
        OkResult(analytics.GetVolumeAsync(granularidade, dias, cancellationToken));

    [HttpGet("comparacao-anual")]
    public Task<IActionResult> ComparacaoAnual(
        [FromQuery] int? produtoId = null,
        [FromQuery] int? clienteId = null,
        CancellationToken cancellationToken = default) =>
        OkResult(analytics.GetComparacaoAnualAsync(produtoId, clienteId, cancellationToken));

    [HttpGet("previsao")]
    public Task<IActionResult> Previsao(
        [FromQuery] int dias = 30,
        [FromQuery] decimal crescimentoPct = 0,
        CancellationToken cancellationToken = default) =>
        OkResult(analytics.GetPrevisaoAsync(dias, crescimentoPct, cancellationToken));

    [HttpGet("consumo-cliente")]
    public Task<IActionResult> ConsumoCliente(
        [FromQuery] int clienteId,
        [FromQuery] string desde,
        [FromQuery] string ate,
        [FromQuery] int? produtoId = null,
        CancellationToken cancellationToken = default)
    {
        if (clienteId <= 0)
            return Task.FromResult<IActionResult>(new BadRequestObjectResult(new { message = "O cliente é obrigatório." }));
        if (!DateOnly.TryParse(desde, out var desdeDt) || !DateOnly.TryParse(ate, out var ateDt))
            return Task.FromResult<IActionResult>(new BadRequestObjectResult(new { message = "Indica as datas no formato AAAA-MM-DD." }));
        if (ateDt < desdeDt)
            return Task.FromResult<IActionResult>(new BadRequestObjectResult(new { message = "A data final deve ser igual ou posterior à data inicial." }));

        return OkResult(analytics.GetConsumoClienteAsync(clienteId, desdeDt, ateDt, produtoId, cancellationToken));
    }

    [HttpGet("top-clientes")]
    public Task<IActionResult> TopClientes(
        [FromQuery] int limite = 10,
        CancellationToken cancellationToken = default) =>
        OkResult(analytics.GetTopClientesAsync(limite, cancellationToken));

    private static async Task<IActionResult> OkResult<T>(Task<T> task) => new OkObjectResult(await task);
}
