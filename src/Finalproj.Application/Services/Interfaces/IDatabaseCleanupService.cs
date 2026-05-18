namespace Finalproj.Application.Services.Interfaces;

public interface IDatabaseCleanupService
{
    Task ClearApplicationDataAsync(CancellationToken cancellationToken = default);
}
