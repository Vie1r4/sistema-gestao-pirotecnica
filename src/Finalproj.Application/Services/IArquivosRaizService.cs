namespace Finalproj.Application.Services;

/// <summary>
/// Resolve caminhos físicos portáteis para uploads e backups (PirofafeData).
/// </summary>
public interface IArquivosRaizService
{
    string UploadsRoot { get; }

    string BackupsRoot { get; }

    void GarantirPastasExistem();

    /// <summary>
    /// Resolve caminho físico seguro para leitura; tenta Uploads e opcionalmente wwwroot (legado).
    /// </summary>
    string? ResolverCaminhoUploadFisico(string? caminhoRelativo);

    /// <summary>Caminhos físicos seguros (uploads + wwwroot legado) para apagar ficheiros ou pastas.</summary>
    IReadOnlyList<string> ResolverCaminhosFisicos(string? caminhoRelativo);
}
