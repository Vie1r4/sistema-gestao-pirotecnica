namespace Finalproj.Services;

// Auditoria: uma linha por acção (userId, nome, dados em JSON, timestamp)
public interface ILogSistemaService
{
    Task RegistarAsync(string acao, string? userId, string? userName, object? dados = null, CancellationToken cancellationToken = default);
}
