using System.IdentityModel.Tokens.Jwt;
using Finalproj.Application.Features.Auth.DTOs;
using Finalproj.Application.Features.Auth.Interfaces;
using Finalproj.Application.Features.Auth.Services;
using Finalproj.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Finalproj.Tests.Auth;

public class AuthTokenServiceTests
{
    private static IConfiguration CreateJwtConfiguration() =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "test-secret-key-with-enough-length-for-hmac-sha256",
                ["Jwt:Issuer"] = "Finalproj.Tests",
                ["Jwt:Audience"] = "Finalproj.Tests",
                ["Jwt:ExpirationMinutes"] = "60",
                ["Jwt:RefreshTokenExpirationDays"] = "7",
            })
            .Build();

    [Fact]
    public async Task RefreshAsync_SemToken_RetornaMissing()
    {
        var sut = CreateSut(new FakeAccountInfo(), new FakeIdentityGateway());
        var result = await sut.RefreshAsync(null);
        Assert.False(result.Succeeded);
        Assert.Equal("Refresh token em falta.", result.Error);
    }

    [Fact]
    public async Task RefreshAsync_TokenDesconhecido_RetornaInvalid()
    {
        var sut = CreateSut(new FakeAccountInfo(), new FakeIdentityGateway());
        var result = await sut.RefreshAsync("token-desconhecido");
        Assert.False(result.Succeeded);
        Assert.Equal("Refresh token inválido ou expirado.", result.Error);
    }

    [Fact]
    public async Task RefreshAsync_TokenValido_RotacionaERetornaNovoAccess()
    {
        var gateway = new FakeIdentityGateway();
        var userId = "user-1";
        gateway.Users[userId] = new AuthUserSnapshot(userId, "user@teste.pt", "user@teste.pt", true);
        gateway.Roles[userId] = ["Gestor"];

        var account = new FakeAccountInfo();
        var plain = "refresh-plain-token";
        account.ActiveTokens[AuthTokenServiceHashForTest(plain)] = new RefreshToken
        {
            UserId = userId,
            TokenHash = AuthTokenServiceHashForTest(plain),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(1)
        };

        var sut = CreateSut(account, gateway);
        var result = await sut.RefreshAsync(plain);

        Assert.True(result.Succeeded);
        Assert.False(string.IsNullOrEmpty(result.AccessToken));
        Assert.False(string.IsNullOrEmpty(result.RefreshTokenPlain));
        Assert.Equal(3600, result.ExpiresInSeconds);
        Assert.True(account.Revoked.Count > 0);
    }

    [Fact]
    public async Task IssueSessionAsync_GeraJwtComClaimsEsperadas()
    {
        var gateway = new FakeIdentityGateway();
        var userId = "user-2";
        gateway.Users[userId] = new AuthUserSnapshot(userId, "gestor@teste.pt", "gestor@teste.pt", true);
        gateway.Roles[userId] = ["Gestor", "Admin"];
        var account = new FakeAccountInfo();
        account.Nomes[userId] = "Gestor Teste";

        var sut = CreateSut(account, gateway);
        var session = await sut.IssueSessionAsync(userId);

        Assert.False(string.IsNullOrEmpty(session.AccessToken));
        Assert.False(string.IsNullOrEmpty(session.RefreshTokenPlain));
        Assert.Equal("gestor@teste.pt", session.Email);
        Assert.Equal("Gestor Teste", session.NomeExibir);
        Assert.Contains("Gestor", session.Roles);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(session.AccessToken);
        Assert.Contains(jwt.Claims, c => c.Value == userId);
    }

    private static AuthTokenService CreateSut(FakeAccountInfo account, FakeIdentityGateway gateway) =>
        new(CreateJwtConfiguration(), account, gateway);

    private static string AuthTokenServiceHashForTest(string plain)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(plain);
        var hash = System.Security.Cryptography.SHA256.HashData(bytes);
        return Convert.ToBase64String(hash);
    }

    private sealed class FakeAccountInfo : IAuthAccountInfoService
    {
        public Dictionary<string, RefreshToken> ActiveTokens { get; } = new();
        public List<RefreshToken> Revoked { get; } = [];

        public Dictionary<string, string> Nomes { get; } = new();

        public Task<string> GetNomeUtilizadorAsync(string userId, CancellationToken cancellationToken = default) =>
            Task.FromResult(Nomes.TryGetValue(userId, out var nome) ? nome : "");

        public Task<string> CreateRefreshTokenAsync(string userId, int expirationDays, Func<string, string> hashToken, CancellationToken cancellationToken = default)
        {
            var plain = Guid.NewGuid().ToString("N");
            ActiveTokens[hashToken(plain)] = new RefreshToken
            {
                UserId = userId,
                TokenHash = hashToken(plain),
                ExpiresAtUtc = DateTime.UtcNow.AddDays(expirationDays)
            };
            return Task.FromResult(plain);
        }

        public Task<RefreshToken?> GetActiveRefreshTokenAsync(string tokenHash, CancellationToken cancellationToken = default) =>
            Task.FromResult(ActiveTokens.TryGetValue(tokenHash, out var token) ? token : null);

        public Task RevokeRefreshTokenAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
        {
            Revoked.Add(refreshToken);
            ActiveTokens.Remove(refreshToken.TokenHash);
            return Task.CompletedTask;
        }
    }

    private sealed class FakeIdentityGateway : IAuthIdentityGateway
    {
        public Dictionary<string, AuthUserSnapshot> Users { get; } = new();
        public Dictionary<string, IList<string>> Roles { get; } = new();
        public Dictionary<string, string> Nomes { get; } = new();

        public Task<AuthUserSnapshot?> FindByIdAsync(string userId, CancellationToken cancellationToken = default) =>
            Task.FromResult(Users.TryGetValue(userId, out var user) ? user : null);

        public Task<AuthUserSnapshot?> FindByEmailAsync(string email, CancellationToken cancellationToken = default) =>
            Task.FromResult(Users.Values.FirstOrDefault(u => u.Email == email));

        public Task<IList<string>> GetRolesAsync(string userId, CancellationToken cancellationToken = default) =>
            Task.FromResult(Roles.TryGetValue(userId, out var roles) ? roles : (IList<string>)Array.Empty<string>());

        public Task<string> GeneratePasswordResetTokenAsync(string userId, CancellationToken cancellationToken = default) =>
            Task.FromResult("reset");

        public Task<AuthIdentityResult> ResetPasswordAsync(string userId, string token, string newPassword, CancellationToken cancellationToken = default) =>
            Task.FromResult(AuthIdentityResult.Ok());

        public Task<bool> VerifyEmailConfirmationTokenAsync(string userId, string token, CancellationToken cancellationToken = default) =>
            Task.FromResult(true);

        public Task<AuthIdentityResult> ConfirmEmailAsync(string userId, string token, CancellationToken cancellationToken = default) =>
            Task.FromResult(AuthIdentityResult.Ok());

        public Task<string> GenerateEmailConfirmationTokenAsync(string userId, CancellationToken cancellationToken = default) =>
            Task.FromResult("confirm");

        public Task SetEmailConfirmedAsync(string userId, bool confirmed, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;
    }
}
