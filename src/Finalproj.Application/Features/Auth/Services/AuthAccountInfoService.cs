using Finalproj.Application.Features.Auth.Interfaces;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Auth.Services;

public sealed class AuthAccountInfoService(
    IFuncionarioRepository funcionarios,
    IPerfilRepository perfis,
    IRefreshTokenRepository refreshTokens,
    IUnitOfWork unitOfWork) : IAuthAccountInfoService
{
    public async Task<string> GetNomeUtilizadorAsync(string userId, CancellationToken cancellationToken = default)
    {
        var nomeFuncionario = await funcionarios.GetNomeCompletoByUserIdAsync(userId, cancellationToken);
        if (!string.IsNullOrWhiteSpace(nomeFuncionario))
            return nomeFuncionario;
        return await perfis.GetNomeByUserIdAsync(userId, cancellationToken) ?? "";
    }

    public async Task<string> CreateRefreshTokenAsync(string userId, int expirationDays, Func<string, string> hashToken, CancellationToken cancellationToken = default)
    {
        var plainToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
        await refreshTokens.AddAsync(new RefreshToken
        {
            UserId = userId,
            TokenHash = hashToken(plainToken),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(expirationDays),
            CreatedAtUtc = DateTime.UtcNow
        }, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return plainToken;
    }

    public Task<RefreshToken?> GetActiveRefreshTokenAsync(string tokenHash, CancellationToken cancellationToken = default) =>
        refreshTokens.FindActiveByTokenHashAsync(tokenHash, cancellationToken);

    public async Task RevokeRefreshTokenAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        refreshToken.RevokedAtUtc = DateTime.UtcNow;
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
