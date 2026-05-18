namespace Finalproj.Infrastructure.Services;

public interface IDatabaseBackupService
{
    Task<string> ExecuteBackupNowAsync(CancellationToken cancellationToken = default);
}
