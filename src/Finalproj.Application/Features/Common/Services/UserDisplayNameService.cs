using Finalproj.Application.Features.Common.Interfaces;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Common.Services;

public sealed class UserDisplayNameService(IFuncionarioRepository funcionarios, IPerfilRepository perfis) : IUserDisplayNameService
{
    public async Task<string> GetDisplayNameAsync(string userId, CancellationToken cancellationToken = default)
    {
        var funcionario = await funcionarios.GetNomeCompletoByUserIdAsync(userId, cancellationToken);
        if (!string.IsNullOrWhiteSpace(funcionario))
            return funcionario;
        return await perfis.GetNomeByUserIdAsync(userId, cancellationToken) ?? userId;
    }

    public async Task<Dictionary<string, string>> GetDisplayNamesAsync(IEnumerable<string> userIds, CancellationToken cancellationToken = default)
    {
        var result = new Dictionary<string, string>();
        foreach (var userId in userIds.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct())
            result[userId] = await GetDisplayNameAsync(userId, cancellationToken);
        return result;
    }
}
