namespace Finalproj.Services.Infrastructure;

public sealed class DatabaseBackupOptions
{
    public const string SectionName = "Backups";

    // Hora local do servidor para backup diário.
    public int HoraDiaria { get; set; } = 19;

    public int MinutoDiario { get; set; } = 0;

    // Prefixo dos ficheiros .bak na raiz do projeto.
    public string PrefixoFicheiro { get; set; } = "db-backup";

    // Quantos dias manter os backups na raiz.
    public int RetencaoDias { get; set; } = 30;
}
