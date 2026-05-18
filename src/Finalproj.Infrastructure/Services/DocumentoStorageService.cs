using Finalproj.Application.Services;
using Finalproj.Infrastructure.Configuration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Finalproj.Infrastructure.Services;

/// <summary>
/// Implementação de <see cref="IDocumentoStorageService"/> usando wwwroot e ILogger para falhas de I/O.
/// Aplica limite de tamanho configurável (Documentos:MaxFileSizeBytes).
/// </summary>
public class DocumentoStorageService : IDocumentoStorageService
{
    private static readonly string[] Extensoes = { ".pdf", ".jpg", ".jpeg", ".png" };
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<DocumentoStorageService> _logger;
    private readonly long _maxFileSizeBytes;

    public DocumentoStorageService(IWebHostEnvironment env, ILogger<DocumentoStorageService> logger, IOptions<DocumentosOptions> options)
    {
        _env = env;
        _logger = logger;
        _maxFileSizeBytes = options?.Value?.MaxFileSizeBytes ?? (10 * 1024 * 1024);
    }

    /// <inheritdoc />
    public IReadOnlyList<string> ExtensoesPermitidas => Extensoes;

    /// <inheritdoc />
    public bool ExtensaoPermitida(string fileName)
    {
        var ext = Path.GetExtension(fileName);
        return !string.IsNullOrEmpty(ext) && Extensoes.Contains(ext.ToLowerInvariant());
    }

    /// <inheritdoc />
    public async Task<string> GuardarFicheiroAsync(string pastaRelativaBase, int entidadeId, IFormFile ficheiro, string prefixoNome, CancellationToken cancellationToken = default)
    {
        if (ficheiro.Length > _maxFileSizeBytes)
            throw new InvalidOperationException($"O ficheiro excede o tamanho máximo permitido ({_maxFileSizeBytes / (1024 * 1024)} MB).");

        var pastaBase = Path.Combine(_env.WebRootPath, pastaRelativaBase, entidadeId.ToString());
        if (!Directory.Exists(pastaBase))
            Directory.CreateDirectory(pastaBase);

        var ext = Path.GetExtension(ficheiro.FileName).ToLowerInvariant();
        var nomeUnico = $"{prefixoNome}_{Guid.NewGuid():N}{ext}";
        var caminhoFisico = Path.Combine(pastaBase, nomeUnico);

        await using (var stream = new FileStream(caminhoFisico, FileMode.Create))
            await ficheiro.CopyToAsync(stream, cancellationToken);

        return Path.Combine(pastaRelativaBase, entidadeId.ToString(), nomeUnico).Replace('\\', '/');
    }

    private string? ResolverCaminhoFisicoSeguro(string caminhoRelativo)
    {
        if (string.IsNullOrWhiteSpace(caminhoRelativo)) return null;
        var root = Path.GetFullPath(_env.WebRootPath);
        var combined = Path.GetFullPath(Path.Combine(root, caminhoRelativo.Replace('/', Path.DirectorySeparatorChar)));
        if (!combined.StartsWith(root, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Caminho de documento rejeitado (fora de wwwroot): {Caminho}", caminhoRelativo);
            return null;
        }
        return combined;
    }

    /// <inheritdoc />
    public void ApagarFicheiroSeExistir(string? caminhoRelativo)
    {
        if (string.IsNullOrWhiteSpace(caminhoRelativo)) return;
        var caminhoFisico = ResolverCaminhoFisicoSeguro(caminhoRelativo);
        if (caminhoFisico == null) return;
        try
        {
            if (File.Exists(caminhoFisico))
                File.Delete(caminhoFisico);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao apagar ficheiro de documento: {Caminho}", caminhoRelativo);
        }
    }

    /// <inheritdoc />
    public void ApagarPastaRecursiva(string? pastaRelativa)
    {
        if (string.IsNullOrWhiteSpace(pastaRelativa)) return;
        var pastaFisica = ResolverCaminhoFisicoSeguro(pastaRelativa);
        if (pastaFisica == null) return;
        try
        {
            if (Directory.Exists(pastaFisica))
                Directory.Delete(pastaFisica, recursive: true);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao apagar pasta de documentos: {Pasta}", pastaRelativa);
        }
    }
}
