namespace Finalproj.Infrastructure.Configuration;

/// <summary>
/// Pastas de dados locais (uploads e backups) relativas ao ContentRootPath ou a CaminhoRaizDados.
/// </summary>
public class DadosLocaisOptions
{
    public const string SectionName = "DadosLocais";

    public string NomePastaDados { get; set; } = "PirofafeData";

    public string SubPastaDocumentos { get; set; } = "Uploads";

    public string SubPastaBackups { get; set; } = "Backups";

    /// <summary>Se preenchido, usa este caminho absoluto em vez de ContentRootPath como âncora.</summary>
    public string? CaminhoRaizDados { get; set; }

    /// <summary>Ler ficheiros antigos em wwwroot se não existirem em Uploads.</summary>
    public bool UsarFallbackWwwroot { get; set; } = false;
}
