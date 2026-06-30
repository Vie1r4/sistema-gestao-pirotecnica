using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Finalproj.Application.Features.Auth.DTOs;
using Finalproj.Application.Features.Auth.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Finalproj.Application.Features.Auth.Services;

public sealed class AuthTokenService(
    IConfiguration configuration,
    IAuthAccountInfoService accountInfo,
    IAuthIdentityGateway identityGateway) : IAuthTokenService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly IAuthAccountInfoService _accountInfo = accountInfo;
    private readonly IAuthIdentityGateway _identityGateway = identityGateway;

    public int RefreshTokenExpirationDays =>
        _configuration.GetValue<int>("Jwt:RefreshTokenExpirationDays", 7);

    private int AccessTokenExpirationSeconds =>
        _configuration.GetValue<int>("Jwt:ExpirationMinutes", 60) * 60;

    public async Task<AuthSessionTokens> IssueSessionAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await _identityGateway.FindByIdAsync(userId, cancellationToken)
            ?? throw new InvalidOperationException("Utilizador não encontrado.");
        var roles = await _identityGateway.GetRolesAsync(userId, cancellationToken);
        var nome = await _accountInfo.GetNomeUtilizadorAsync(userId, cancellationToken);
        return await IssueSessionAsync(userId, user.Email, nome, roles, cancellationToken);
    }

    public async Task<AuthSessionTokens> IssueSessionAsync(
        string userId,
        string email,
        string nome,
        IList<string> roles,
        CancellationToken cancellationToken = default)
    {
        var accessToken = GenerateAccessToken(userId, email, nome, roles);
        var refreshToken = await _accountInfo.CreateRefreshTokenAsync(
            userId,
            RefreshTokenExpirationDays,
            HashRefreshToken,
            cancellationToken);
        var nomeExibir = !string.IsNullOrEmpty(nome) ? nome : email;
        return new AuthSessionTokens(accessToken, refreshToken, AccessTokenExpirationSeconds, email, nomeExibir, roles);
    }

    public async Task<AuthTokenRefreshResult> RefreshAsync(string? rawRefreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(rawRefreshToken))
            return AuthTokenRefreshResult.MissingToken();

        var hash = HashRefreshToken(rawRefreshToken.Trim());
        var entity = await _accountInfo.GetActiveRefreshTokenAsync(hash, cancellationToken);
        if (entity == null)
            return AuthTokenRefreshResult.Invalid();

        var user = await _identityGateway.FindByIdAsync(entity.UserId, cancellationToken);
        if (user == null)
        {
            await _accountInfo.RevokeRefreshTokenAsync(entity, cancellationToken);
            return AuthTokenRefreshResult.UserNotFound();
        }

        await _accountInfo.RevokeRefreshTokenAsync(entity, cancellationToken);
        var session = await IssueSessionAsync(user.UserId, cancellationToken);
        return AuthTokenRefreshResult.Success(session.AccessToken, session.RefreshTokenPlain, session.ExpiresInSeconds);
    }

    public async Task RevokeRefreshTokenIfPresentAsync(string? rawRefreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(rawRefreshToken))
            return;

        var hash = HashRefreshToken(rawRefreshToken.Trim());
        var entity = await _accountInfo.GetActiveRefreshTokenAsync(hash, cancellationToken);
        if (entity != null)
            await _accountInfo.RevokeRefreshTokenAsync(entity, cancellationToken);
    }

    private string GenerateAccessToken(string userId, string email, string nome, IList<string> roles)
    {
        var secret = _configuration["Jwt:Secret"] ?? "";
        var issuer = _configuration["Jwt:Issuer"] ?? "";
        var audience = _configuration["Jwt:Audience"] ?? "";
        var expirationMinutes = _configuration.GetValue<int>("Jwt:ExpirationMinutes", 60);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Email, email ?? ""),
            new("nome", nome ?? "")
        };
        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string HashRefreshToken(string token)
    {
        var bytes = Encoding.UTF8.GetBytes(token);
        var hash = SHA256.HashData(bytes);
        return Convert.ToBase64String(hash);
    }
}
