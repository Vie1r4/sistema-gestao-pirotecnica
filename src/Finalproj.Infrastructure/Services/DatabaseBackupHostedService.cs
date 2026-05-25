using System.IO.Compression;

using Finalproj.Application.Services;

using Microsoft.Data.SqlClient;

using Microsoft.Extensions.Options;



namespace Finalproj.Infrastructure.Services;



public sealed class DatabaseBackupHostedService : BackgroundService, IDatabaseBackupService

{

    private const string UploadsZipSuffix = "_uploads.zip";



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

                _logger.LogError(ex, "Falha no backup automático.");

            }

        }

    }



    public string ResolveBackupFullPath(string nomeFicheiro)

    {

        if (string.IsNullOrWhiteSpace(nomeFicheiro))

            throw new ArgumentException("Nome do ficheiro em falta.", nameof(nomeFicheiro));



        var fileName = Path.GetFileName(nomeFicheiro);

        if (!string.Equals(fileName, nomeFicheiro, StringComparison.Ordinal) ||

            !fileName.StartsWith(_options.PrefixoFicheiro + "_", StringComparison.OrdinalIgnoreCase))

        {

            throw new ArgumentException("Ficheiro de backup inválido.", nameof(nomeFicheiro));

        }



        var isBak = fileName.EndsWith(".bak", StringComparison.OrdinalIgnoreCase);

        var isUploadsZip = fileName.EndsWith(UploadsZipSuffix, StringComparison.OrdinalIgnoreCase);

        if (!isBak && !isUploadsZip)

            throw new ArgumentException("Ficheiro de backup inválido.", nameof(nomeFicheiro));



        var rootFull = Path.GetFullPath(_arquivos.BackupsRoot);

        var fullPath = Path.GetFullPath(Path.Combine(_arquivos.BackupsRoot, fileName));

        if (!fullPath.StartsWith(rootFull, StringComparison.OrdinalIgnoreCase))

            throw new ArgumentException("Caminho de backup inválido.", nameof(nomeFicheiro));



        if (!File.Exists(fullPath))

            throw new FileNotFoundException("Backup não encontrado.", fileName);



        return fullPath;

    }



    public async Task RestoreFromBackupAsync(string nomeFicheiro, CancellationToken cancellationToken = default)

    {

        await _backupLock.WaitAsync(cancellationToken);

        try

        {

            var backupPath = ResolveBackupFullPath(nomeFicheiro);

            if (!backupPath.EndsWith(".bak", StringComparison.OrdinalIgnoreCase))

                throw new ArgumentException("Indique o ficheiro .bak do backup.", nameof(nomeFicheiro));



            var connectionString = _configuration.GetConnectionString("FinalprojContext")

                ?? throw new InvalidOperationException("ConnectionStrings:FinalprojContext não está configurada.");



            var builder = new SqlConnectionStringBuilder(connectionString);

            var dbName = builder.InitialCatalog

                ?? throw new InvalidOperationException("A connection string não contém o nome da base de dados (Initial Catalog).");



            builder.InitialCatalog = "master";

            var escapedPath = backupPath.Replace("'", "''");



            var sql = $"""

                       ALTER DATABASE [{dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

                       RESTORE DATABASE [{dbName}] FROM DISK = N'{escapedPath}' WITH REPLACE, RECOVERY;

                       ALTER DATABASE [{dbName}] SET MULTI_USER;

                       """;



            _logger.LogWarning(

                "A restaurar a base de dados {Database} a partir de {BackupPath}.",

                dbName,

                backupPath);



            await using var connection = new SqlConnection(builder.ConnectionString);

            await connection.OpenAsync(cancellationToken);

            await using var command = new SqlCommand(sql, connection)

            {

                CommandTimeout = 60 * 60

            };

            await command.ExecuteNonQueryAsync(cancellationToken);



            _logger.LogInformation("Restauro da BD {Database} concluído.", dbName);



            var uploadsZipPath = ObterCaminhoZipDocumentos(backupPath);

            if (File.Exists(uploadsZipPath))

            {

                await RestaurarDocumentosDesdeZipAsync(uploadsZipPath, cancellationToken);

                _logger.LogInformation("Documentos restaurados a partir de {ZipPath}.", uploadsZipPath);

            }

            else

            {

                _logger.LogWarning(

                    "Backup sem ficheiro de documentos ({ExpectedZip}). Apenas a base de dados foi restaurada.",

                    Path.GetFileName(uploadsZipPath));

            }

        }

        finally

        {

            _backupLock.Release();

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

                var uploadsZip = ObterCaminhoZipDocumentos(path);

                FileInfo? zipInfo = File.Exists(uploadsZip) ? new FileInfo(uploadsZip) : null;

                return new BackupListItem(

                    info.Name,

                    info.Exists ? info.Length : 0,

                    info.Exists ? info.LastWriteTimeUtc : DateTime.UtcNow,

                    zipInfo != null,

                    zipInfo?.Name,

                    zipInfo?.Exists == true ? zipInfo.Length : 0);

            })

            .OrderByDescending(x => x.DataCriacaoUtc)

            .ThenByDescending(x => x.NomeFicheiro)

            .ToList();



        return Task.FromResult<IReadOnlyList<BackupListItem>>(items);

    }



    public Task<int> CountBackupsAsync(CancellationToken cancellationToken = default)

    {

        cancellationToken.ThrowIfCancellationRequested();

        var root = _arquivos.BackupsRoot;

        if (!Directory.Exists(root))

            return Task.FromResult(0);



        var pattern = $"{_options.PrefixoFicheiro}_*.bak";

        var count = Directory.EnumerateFiles(root, pattern, SearchOption.TopDirectoryOnly).Count();

        return Task.FromResult(count);

    }



    public async Task<BackupCatalogSummary> GetBackupSummaryAsync(bool semContasNaBd, CancellationToken cancellationToken = default)

    {

        var total = await CountBackupsAsync(cancellationToken);

        return new BackupCatalogSummary(

            total,

            semContasNaBd,

            semContasNaBd && total > 0);

    }



    public async Task DeleteBackupAsync(string nomeFicheiroBak, CancellationToken cancellationToken = default)

    {

        await _backupLock.WaitAsync(cancellationToken);

        try

        {

            var backupPath = ResolveBackupFullPath(nomeFicheiroBak);

            if (!backupPath.EndsWith(".bak", StringComparison.OrdinalIgnoreCase))

                throw new ArgumentException("Indique o ficheiro .bak do backup.", nameof(nomeFicheiroBak));



            if (File.Exists(backupPath))

                File.Delete(backupPath);



            var uploadsZip = ObterCaminhoZipDocumentos(backupPath);

            if (File.Exists(uploadsZip))

                File.Delete(uploadsZip);



            _logger.LogInformation("Backup removido: {Bak}.", Path.GetFileName(backupPath));

        }

        finally

        {

            _backupLock.Release();

        }

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



            var withOptions = MontarOpcoesBackupSql();

            var sql = $"""

                       BACKUP DATABASE [{dbName}]

                       TO DISK = N'{escapedPath}'

                       WITH {withOptions};

                       """;



            _logger.LogInformation("A iniciar backup da BD {Database} para {Path}.", dbName, backupPath);



            await using var connection = new SqlConnection(connectionString);

            await connection.OpenAsync(cancellationToken);

            await using var command = new SqlCommand(sql, connection)

            {

                CommandTimeout = 60 * 60

            };

            await command.ExecuteNonQueryAsync(cancellationToken);



            try

            {

                await CriarZipDocumentosAsync(backupPath, cancellationToken);

            }

            catch (Exception ex)

            {

                _logger.LogError(ex, "Falha ao criar ZIP de documentos após backup da BD.");

                try

                {

                    if (File.Exists(backupPath))

                        File.Delete(backupPath);

                }

                catch (Exception deleteEx)

                {

                    _logger.LogWarning(deleteEx, "Não foi possível remover o .bak após falha no ZIP de documentos.");

                }



                throw;

            }



            LimparBackupsAntigos();



            _logger.LogInformation("Backup completo concluído em {Path}.", backupPath);

            return backupPath;

        }

        finally

        {

            _backupLock.Release();

        }

    }



    private async Task CriarZipDocumentosAsync(string backupBakPath, CancellationToken cancellationToken)

    {

        var zipPath = ObterCaminhoZipDocumentos(backupBakPath);

        if (File.Exists(zipPath))

            File.Delete(zipPath);



        _arquivos.GarantirPastasExistem();

        var uploadsRoot = _arquivos.UploadsRoot;



        await Task.Run(() =>

        {

            cancellationToken.ThrowIfCancellationRequested();

            if (Directory.Exists(uploadsRoot) &&

                Directory.EnumerateFileSystemEntries(uploadsRoot).Any())

            {

                ZipFile.CreateFromDirectory(uploadsRoot, zipPath, CompressionLevel.Optimal, includeBaseDirectory: false);

            }

            else

            {

                ZipFile.Open(zipPath, ZipArchiveMode.Create).Dispose();

            }

        }, cancellationToken);



        _logger.LogInformation("ZIP de documentos criado em {ZipPath}.", zipPath);

    }



    private async Task RestaurarDocumentosDesdeZipAsync(string zipPath, CancellationToken cancellationToken)

    {

        _arquivos.GarantirPastasExistem();

        var uploadsRoot = _arquivos.UploadsRoot;



        await Task.Run(() =>

        {

            cancellationToken.ThrowIfCancellationRequested();

            if (Directory.Exists(uploadsRoot))

                Directory.Delete(uploadsRoot, recursive: true);

            Directory.CreateDirectory(uploadsRoot);

            ExtrairZipUploadsComSeguranca(zipPath, uploadsRoot);

        }, cancellationToken);

    }



    private static string ObterCaminhoZipDocumentos(string backupBakPath) =>

        backupBakPath.Replace(".bak", UploadsZipSuffix, StringComparison.OrdinalIgnoreCase);



    private string MontarOpcoesBackupSql()

    {

        var parts = new List<string> { "INIT", "CHECKSUM", "STATS = 10" };

        if (_options.UsarCompressao)

            parts.Insert(1, "COMPRESSION");

        return string.Join(", ", parts);

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



                    var uploadsZip = ObterCaminhoZipDocumentos(file);

                    if (File.Exists(uploadsZip))

                    {

                        File.Delete(uploadsZip);

                        _logger.LogInformation("ZIP de documentos removido: {Path}.", uploadsZip);

                    }

                }

            }

            catch (Exception ex)

            {

                _logger.LogWarning(ex, "Falha a remover backup antigo: {Path}.", file);

            }

        }

    }



    private static void ExtrairZipUploadsComSeguranca(string zipPath, string uploadsRoot)
    {
        var destFull = Path.GetFullPath(uploadsRoot);
        var destPrefix = destFull.EndsWith(Path.DirectorySeparatorChar)
            ? destFull
            : destFull + Path.DirectorySeparatorChar;

        using var archive = ZipFile.OpenRead(zipPath);
        foreach (var entry in archive.Entries)
        {
            if (string.IsNullOrEmpty(entry.Name))
                continue;

            var combined = Path.GetFullPath(Path.Combine(destFull, entry.FullName));
            if (!combined.StartsWith(destPrefix, StringComparison.OrdinalIgnoreCase))
                throw new InvalidDataException("ZIP de backup inválido: entrada com path não permitido.");
        }

        ZipFile.ExtractToDirectory(zipPath, uploadsRoot, overwriteFiles: true);
    }

    private static DateTime CalcularProximaExecucao(DateTime now, int hora, int minuto)

    {

        var hoje = new DateTime(now.Year, now.Month, now.Day, hora, minuto, 0, now.Kind);

        return now < hoje ? hoje : hoje.AddDays(1);

    }

}


