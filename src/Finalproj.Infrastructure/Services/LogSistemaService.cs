using System.Text.Json;
using Finalproj.Application.Services.Interfaces;
using Finalproj.Domain.Entities;
using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.Application.Services;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Infrastructure.Services;

/// <summary>
/// Registo de auditoria: cada ação (ex.: ENCOMENDA_ACEITE, SAIDA_STOCK) fica numa linha com userId, dados em JSON, timestamp.
/// </summary>
public class LogSistemaService(FinalprojContext context, IIdentityUserLookupService identityLookup) : ILogSistemaService
{
    /// <inheritdoc />
    public async Task RegistarAsync(string acao, string? userId, string? userName, object? dados = null, CancellationToken cancellationToken = default)
    {
        var resolvedUserName = userName;
        if (string.IsNullOrWhiteSpace(resolvedUserName) && !string.IsNullOrWhiteSpace(userId))
        {
            var map = await identityLookup.GetUserNamesByIdsAsync(new[] { userId }, cancellationToken);
            if (map.TryGetValue(userId, out var fromIdentity))
                resolvedUserName = fromIdentity;
        }

        var json = dados != null ? JsonSerializer.Serialize(dados) : null;
        context.LogSistema.Add(new LogSistema
        {
            Acao = acao,
            UserId = userId,
            UserName = resolvedUserName,
            JsonDados = json,
            Timestamp = DateTime.UtcNow
        });
        await context.SaveChangesAsync(cancellationToken);
    }
}
