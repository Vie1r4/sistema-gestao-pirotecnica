namespace Finalproj.Infrastructure.Configuration;

/// <summary>Cifragem AES-256-GCM opcional para ficheiros em Uploads e backups (.bak, _uploads.zip).</summary>
public class CifragemEmRepousoOptions
{
    public const string SectionName = "CifragemEmRepouso";

    /// <summary>Quando true, novos ficheiros em Uploads e backups gerados são cifrados em disco.</summary>
    public bool Ativa { get; set; }

    /// <summary>Chave de 32 bytes em Base64. Obrigatória se <see cref="Ativa"/> for true.</summary>
    public string? ChaveBase64 { get; set; }

    /// <summary>Cifrar ficheiros .bak e _uploads.zip após cada backup.</summary>
    public bool CifrarBackups { get; set; } = true;
}
