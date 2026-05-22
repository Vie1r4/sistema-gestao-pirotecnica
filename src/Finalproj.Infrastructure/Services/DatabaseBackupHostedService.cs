using Finalproj.Application.Services;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;

namespace Finalproj.Infrastructure.Services;

public sealed class DatabaseBackupHostedService : BackgroundService, IDatabaseBackupService
{
    private readonly ILogger<DatabaseBackupHostedService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IArquivosRaizService _arquivos;
    private readonly DatabaseBackupOptions _options;
    private readonly SemaphoreSlim _backupLock = new(1, 1);

    public DatabaseBackupHostedService(
        ILogger<DatabaseBackupHostedService> logger,
        IConfiguration configuration,
        IArquivosRaizService arquivos,
        IOptions<DatabaseBackupOptions> options)
    {
        _logger = logger;
        _configuration = configuration;
        _arquivos = arquivos;
        _options = options.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "Sistema de backups ativo. Execução diária às {Hora:D2}:{Minuto:D2}.",
            _options.HoraDiaria,
            _options.MinutoDiario);

        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.Now;
            var nextRun = CalcularProximaExecucao(now, _options.HoraDiaria, _options.MinutoDiario);
            var delay = nextRun - now;

            _logger.LogInformation("Próximo backup automático agendado para {NextRun}.", nextRun);

            if (delay > TimeSpan.Zero)
            {
                await Task.Delay(delay, stoppingToken);
            }

            if (stoppingToken.IsCancellationRequested)
            {
                break;
            }

            try
            {
                await ExecuteBackupNowAsync(stoppingToken);
                LimparBackupsAntigos();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Falha no backup automático da base de dados.");
            }
        }
    }

    public Task<IReadOnlyList<BackupListItem>> ListBackupsAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var root = _arquivos.BackupsRoot;
        if (!Directory.Exists(root))
            return Task.FromResult<IReadOnlyList<BackupListItem>>(Array.Empty<BackupListItem>());

        var pattern = $"{_options.PrefixoFicheiro}_*.bak";
        var items = Directory
            .EnumerateFiles(root, pattern, SearchOption.TopDirectoryOnly)
            .Select(path =>
            {
                var info = new FileInfo(path);
                return new BackupListItem(
                    info.Name,
                    info.Exists ? info.Length : 0,
                    info.Exists ? info.CreationTimeUtc : DateTime.UtcNow);
            })
            .OrderByDescending(x => x.DataCriacaoUtc)
            .ToList();

        return Task.FromResult<IReadOnlyList<BackupListItem>>(items);
    }

    public async Task<string> ExecuteBackupNowAsync(CancellationToken cancellationToken = default)
    {
        await _backupLock.WaitAsync(cancellationToken);
        try
        {
            var connectionString = _configuration.GetConnectionString("FinalprojContext");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("ConnectionStrings:FinalprojContext não está configurada.");
            }

            var builder = new SqlConnectionStringBuilder(connectionString);
            var dbName = builder.InitialCatalog;
            if (string.IsNullOrWhiteSpace(dbName))
            {
                throw new InvalidOperationException("A connection string não contém o nome da base de dados (Initial Catalog).");
            }

            _arquivos.GarantirPastasExistem();
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var fileName = $"{_options.PrefixoFicheiro}_{dbName}_{timestamp}.bak";
            var backupPath = Path.Combine(_arquivos.BackupsRoot, fileName);
            var escapedPath = backupPath.Replace("'", "''");

            var sql = $"""
                       BACKUP DATABASE [{dbName}]
                       TO DISK = N'{escapedPath}'
                       WITH INIT, FORMAT, COMPRESSION, CHECKSUM, STATS = 10;
                       """;

            _logger.LogInformation("A iniciar backup da BD {Database} para {Path}.", dbName, backupPath);

            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync(cancellationToken);
            await using var command = new SqlCommand(sql, connection)
            {
                CommandTimeout = 60 * 60
            };
            await command.ExecuteNonQueryAsync(cancellationToken);
            LimparBackupsAntigos();

            _logger.LogInformation("Backup concluído com sucesso em {Path}.", backupPath);
            return backupPath;
        }
        finally
        {
            _backupLock.Release();
        }
    }

    private void LimparBackupsAntigos()
    {
        if (_options.RetencaoDias <= 0)
        {
            return;
        }

        var root = _arquivos.BackupsRoot;
        var pattern = $"{_options.PrefixoFicheiro}_*.bak";
        var limite = DateTime.Now.AddDays(-_options.RetencaoDias);

        if (!Directory.Exists(root))
            return;

        foreach (var file in Directory.EnumerateFiles(root, pattern, SearchOption.TopDirectoryOnly))
        {
            try
            {
                var info = new FileInfo(file);
                if (info.CreationTime < limite)
                {
                    File.Delete(file);
                    _logger.LogInformation("Backup antigo removido: {Path}.", file);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Falha a remover backup antigo: {Path}.", file);
            }
        }
    }

    private static DateTime CalcularProximaExecucao(DateTime now, int hora, int minuto)
    {
        var hoje = new DateTime(now.Year, now.Month, now.Day, hora, minuto, 0, now.Kind);
        return now < hoje ? hoje : hoje.AddDays(1);
    }
}
