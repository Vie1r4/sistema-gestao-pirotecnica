namespace Finalproj.Infrastructure.Services;

public sealed class DatabaseBackupOptions
{
    public const string SectionName = "Backups";

    // Hora local do servidor para backup diário.
    public int HoraDiaria { get; set; } = 19;

    public int MinutoDiario { get; set; } = 0;

    // Prefixo dos ficheiros .bak em PirofafeData/Backups.
    public string PrefixoFicheiro { get; set; } = "db-backup";

    // Quantos dias manter os backups na pasta de backups.
    public int RetencaoDias { get; set; } = 30;
}
