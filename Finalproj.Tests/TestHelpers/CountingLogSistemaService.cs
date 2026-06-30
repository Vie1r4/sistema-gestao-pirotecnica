using Finalproj.Application.Services;

namespace Finalproj.Tests.TestHelpers;

/// <summary>Conta chamadas a <see cref="ILogSistemaService.RegistarAsync"/> nos testes.</summary>
public sealed class CountingLogSistemaService : ILogSistemaService
{
    public int Registos { get; private set; }

    public Task RegistarAsync(
        string acao,
        string? userId,
        string? userName,
        object? dados = null,
        CancellationToken cancellationToken = default)
    {
        Registos++;
        return Task.CompletedTask;
    }
}
