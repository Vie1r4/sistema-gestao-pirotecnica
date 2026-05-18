namespace Finalproj.Application.Services.Interfaces;

/// <summary>
/// Consultas em massa sobre utilizadores Identity (sem expor IQueryable ao Presentation).
/// </summary>
public interface IIdentityUserLookupService
{
    Task<bool> AnyUsersAsync(CancellationToken cancellationToken = default);

    Task<Dictionary<string, string>> GetUserNamesByIdsAsync(IReadOnlyCollection<string> userIds, CancellationToken cancellationToken = default);
}
