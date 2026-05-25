namespace Finalproj.Infrastructure.Services;

public sealed record BackupListItem(
    string NomeFicheiro,
    long TamanhoBytes,
    DateTime DataCriacaoUtc,
    bool TemDocumentos,
    string? NomeFicheiroDocumentos,
    long TamanhoDocumentosBytes);

/// <summary>Resumo para UI: distinguir BD vazia vs ficheiros .bak antigos em disco.</summary>
public sealed record BackupCatalogSummary(
    int Total,
    bool SemContasNaBd,
    bool BackupsDeInstalacaoAnterior);

public interface IDatabaseBackupService
{
    Task<string> ExecuteBackupNowAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BackupListItem>> ListBackupsAsync(CancellationToken cancellationToken = default);
    Task<int> CountBackupsAsync(CancellationToken cancellationToken = default);
    Task<BackupCatalogSummary> GetBackupSummaryAsync(bool semContasNaBd, CancellationToken cancellationToken = default);
    /// <summary>Caminho absoluto validado do ficheiro .bak ou _uploads.zip (apenas nome simples).</summary>
    string ResolveBackupFullPath(string nomeFicheiro);
    Task RestoreFromBackupAsync(string nomeFicheiro, CancellationToken cancellationToken = default);
    /// <summary>Remove o .bak e o ZIP de documentos associado (se existir).</summary>
    Task DeleteBackupAsync(string nomeFicheiroBak, CancellationToken cancellationToken = default);
}
