namespace Finalproj.Services;

/// <summary>
/// Opções de configuração para upload de documentos (tamanho máximo, etc.).
/// </summary>
public class DocumentosOptions
{
    public const string SectionName = "Documentos";

    /// <summary>Tamanho máximo por ficheiro em bytes. Predefinido: 10 MB.</summary>
    public long MaxFileSizeBytes { get; set; } = 10 * 1024 * 1024;
}
