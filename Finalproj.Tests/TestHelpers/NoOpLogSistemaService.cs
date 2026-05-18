using Finalproj.Application.Services;

namespace Finalproj.Tests.TestHelpers;

public sealed class NoOpLogSistemaService : ILogSistemaService
{
    public Task RegistarAsync(
        string acao,
        string? userId,
        string? userName,
        object? dados = null,
        CancellationToken cancellationToken = default) =>
        Task.CompletedTask;
}
