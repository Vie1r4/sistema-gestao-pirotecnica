namespace Finalproj.Application.Features.Common.Interfaces;

public interface IUserDisplayNameService
{
    Task<string> GetDisplayNameAsync(string userId, CancellationToken cancellationToken = default);
    Task<Dictionary<string, string>> GetDisplayNamesAsync(IEnumerable<string> userIds, CancellationToken cancellationToken = default);
}
