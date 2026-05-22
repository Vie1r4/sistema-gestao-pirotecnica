namespace Finalproj.Infrastructure.Services;

public sealed record BackupListItem(string NomeFicheiro, long TamanhoBytes, DateTime DataCriacaoUtc);

public interface IDatabaseBackupService
{
    Task<string> ExecuteBackupNowAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BackupListItem>> ListBackupsAsync(CancellationToken cancellationToken = default);
}
