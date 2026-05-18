using Finalproj.Application.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Infrastructure.Services;

public sealed class IdentityUserLookupService(UserManager<IdentityUser> userManager) : IIdentityUserLookupService
{
    private readonly UserManager<IdentityUser> _userManager = userManager;

    public Task<bool> AnyUsersAsync(CancellationToken cancellationToken = default) =>
        _userManager.Users.AnyAsync(cancellationToken);

    public async Task<Dictionary<string, string>> GetUserNamesByIdsAsync(IReadOnlyCollection<string> userIds, CancellationToken cancellationToken = default)
    {
        if (userIds.Count == 0)
            return new Dictionary<string, string>();
        var users = await _userManager.Users.Where(u => userIds.Contains(u.Id)).ToListAsync(cancellationToken);
        return users.ToDictionary(u => u.Id, u => u.UserName ?? u.Id);
    }
}
