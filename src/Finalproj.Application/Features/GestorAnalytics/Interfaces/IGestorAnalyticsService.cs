using Finalproj.Application.Features.GestorAnalytics.DTOs;

namespace Finalproj.Application.Features.GestorAnalytics.Interfaces;

public interface IGestorAnalyticsService
{
    Task<VolumeResponseDto> GetVolumeAsync(string granularidade, int dias, CancellationToken cancellationToken = default);
    Task<ComparacaoAnualResponseDto> GetComparacaoAnualAsync(
        string periodoId,
        int? produtoId,
        int? clienteId,
        CancellationToken cancellationToken = default);
    Task<PrevisaoResponseDto> GetPrevisaoAsync(int dias, decimal crescimentoPct, CancellationToken cancellationToken = default);
    Task<ConsumoClienteResponseDto> GetConsumoClienteAsync(
        int clienteId,
        DateOnly desde,
        DateOnly ate,
        int? produtoId,
        CancellationToken cancellationToken = default);
    Task<TopClientesResponseDto> GetTopClientesAsync(int limite, CancellationToken cancellationToken = default);
}
