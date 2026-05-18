namespace Finalproj.Application.Features.Admin.Interfaces;

public interface IAdminStatsService
{
    Task<object> GetStatsAsync(int totalUtilizadores, CancellationToken cancellationToken = default);
    Task<object> GetLogsAsync(string? acao, int pagina, int itensPorPagina, CancellationToken cancellationToken = default);
    Task<Dictionary<string, string>> GetFuncionariosPorUserIdAsync(CancellationToken cancellationToken = default);
    Task<object> GetFuncionariosDisponiveisAsync(string userId, CancellationToken cancellationToken = default);
    Task<int?> GetFuncionarioIdByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task AssociarFuncionarioAUtilizadorAsync(string userId, int? funcionarioId, CancellationToken cancellationToken = default);
    Task DesassociarUtilizadorAsync(string userId, CancellationToken cancellationToken = default);
}
