namespace Finalproj.Application.Services.Interfaces;

public interface IDatabaseCleanupService
{
    Task ClearApplicationDataAsync(CancellationToken cancellationToken = default);

    /// <summary>BD de negócio, tokens de refresh e pasta Uploads (reset de testes).</summary>
    Task ClearAllForResetAsync(CancellationToken cancellationToken = default);
}
