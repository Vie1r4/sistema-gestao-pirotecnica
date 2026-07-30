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

    /// <summary>
    /// COMPRESSION no BACKUP DATABASE (requer SQL Server Standard+). LocalDB/Express falham — manter false em dev.
    /// </summary>
    public bool UsarCompressao { get; set; }

    /// <summary>
    /// Caminho partilhado entre o contentor da API e o contentor do SQL Server.
    /// Quando preenchido, o SQL Server escreve/lê o .bak neste caminho em vez
    /// de usar a InstanceDefaultBackupPath. Usado em ambientes Docker onde
    /// os contentores são separados.
    /// </summary>
    public string? CaminhoStagingSql { get; set; }
}
