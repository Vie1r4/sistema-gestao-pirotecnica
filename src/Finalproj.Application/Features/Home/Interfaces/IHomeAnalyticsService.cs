using Finalproj.Application.Features.Home.DTOs;

namespace Finalproj.Application.Features.Home.Interfaces;

public interface IHomeAnalyticsService
{
    Task<object> GetStatsAsync(CancellationToken cancellationToken = default);
    Task<object> GetGestorDashboardAsync(CancellationToken cancellationToken = default);
    Task<string?> GetTemaAsync(string userId, CancellationToken cancellationToken = default);
    Task SaveTemaAsync(string userId, string tema, CancellationToken cancellationToken = default);
    Task<PerfilEditViewModel> GetPerfilAsync(string userId, string userName, string email, IReadOnlyList<string> roles, CancellationToken cancellationToken = default);
    Task SavePerfilAsync(string userId, string? nome, string? telefone, CancellationToken cancellationToken = default);
}
