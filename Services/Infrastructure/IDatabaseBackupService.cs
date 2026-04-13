namespace Finalproj.Services.Infrastructure;

public interface IDatabaseBackupService
{
    Task<string> ExecuteBackupNowAsync(CancellationToken cancellationToken = default);
}
