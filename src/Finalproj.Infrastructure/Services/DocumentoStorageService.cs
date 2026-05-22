using Finalproj.Application.Services;
using Finalproj.Infrastructure.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Finalproj.Infrastructure.Services;

/// <summary>
/// Implementação de <see cref="IDocumentoStorageService"/> usando PirofafeData/Uploads (portátil).
/// Aplica limite de tamanho, extensão e validação de conteúdo (magic bytes).
/// </summary>
public class DocumentoStorageService : IDocumentoStorageService
{
    private readonly IArquivosRaizService _arquivos;
    private readonly IUploadFileContentValidator _contentValidator;
    private readonly ILogger<DocumentoStorageService> _logger;
    private readonly long _maxFileSizeBytes;

    public DocumentoStorageService(
        IArquivosRaizService arquivos,
        IUploadFileContentValidator contentValidator,
        ILogger<DocumentoStorageService> logger,
        IOptions<DocumentosOptions> options)
    {
        _arquivos = arquivos;
        _contentValidator = contentValidator;
        _logger = logger;
        _maxFileSizeBytes = options?.Value?.MaxFileSizeBytes ?? (10 * 1024 * 1024);
    }

    /// <inheritdoc />
    public IReadOnlyList<string> ExtensoesPermitidas => UploadFileContentRules.ExtensoesPermitidasLista;

    /// <inheritdoc />
    public bool ExtensaoPermitida(string fileName) => UploadFileContentRules.ExtensaoPermitida(fileName);

    /// <inheritdoc />
    public Task ValidarFicheiroParaUploadAsync(IFormFile ficheiro, CancellationToken cancellationToken = default) =>
        _contentValidator.ValidarAsync(ficheiro, cancellationToken);

    /// <inheritdoc />
    public async Task<string> GuardarFicheiroAsync(string pastaRelativaBase, int entidadeId, IFormFile ficheiro, string prefixoNome, CancellationToken cancellationToken = default)
    {
        await ValidarAntesDeGuardarAsync(ficheiro, cancellationToken);

        var pastaBase = Path.Combine(_arquivos.UploadsRoot, pastaRelativaBase, entidadeId.ToString());
        if (!Directory.Exists(pastaBase))
            Directory.CreateDirectory(pastaBase);

        var ext = Path.GetExtension(ficheiro.FileName).ToLowerInvariant();
        var nomeUnico = $"{prefixoNome}_{Guid.NewGuid():N}{ext}";
        var caminhoFisico = Path.Combine(pastaBase, nomeUnico);

        await using (var stream = new FileStream(caminhoFisico, FileMode.Create))
            await ficheiro.CopyToAsync(stream, cancellationToken);

        return Path.Combine(pastaRelativaBase, entidadeId.ToString(), nomeUnico).Replace('\\', '/');
    }

    /// <inheritdoc />
    public string? ResolverCaminhoFisicoParaLeitura(string? caminhoRelativo) =>
        _arquivos.ResolverCaminhoUploadFisico(caminhoRelativo);

    /// <inheritdoc />
    public async Task<string> GuardarFicheiroNoCaminhoRelativoAsync(string caminhoRelativo, IFormFile ficheiro, CancellationToken cancellationToken = default)
    {
        await ValidarAntesDeGuardarAsync(ficheiro, cancellationToken);

        var normalizado = caminhoRelativo.Replace('\\', '/').TrimStart('/');
        var nomeFicheiro = Path.GetFileName(normalizado);
        if (string.IsNullOrEmpty(nomeFicheiro))
            throw new InvalidOperationException("Caminho de ficheiro inválido.");

        var dirRelativo = Path.GetDirectoryName(normalizado.Replace('/', Path.DirectorySeparatorChar));
        var pastaFisica = string.IsNullOrEmpty(dirRelativo)
            ? _arquivos.UploadsRoot
            : Path.Combine(_arquivos.UploadsRoot, dirRelativo);

        var uploadsRootFull = Path.GetFullPath(_arquivos.UploadsRoot);
        var pastaFull = Path.GetFullPath(pastaFisica);
        if (!pastaFull.StartsWith(uploadsRootFull, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Caminho de destino inválido.");

        if (!Directory.Exists(pastaFull))
            Directory.CreateDirectory(pastaFull);

        var caminhoFisico = Path.Combine(pastaFull, nomeFicheiro);
        await using (var stream = new FileStream(caminhoFisico, FileMode.Create))
            await ficheiro.CopyToAsync(stream, cancellationToken);

        return normalizado;
    }

    /// <inheritdoc />
    public void ApagarFicheiroSeExistir(string? caminhoRelativo)
    {
        if (string.IsNullOrWhiteSpace(caminhoRelativo)) return;
        foreach (var caminhoFisico in _arquivos.ResolverCaminhosFisicos(caminhoRelativo))
        {
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
    }

    /// <inheritdoc />
    public void ApagarPastaRecursiva(string? pastaRelativa)
    {
        if (string.IsNullOrWhiteSpace(pastaRelativa)) return;
        foreach (var pastaFisica in _arquivos.ResolverCaminhosFisicos(pastaRelativa))
        {
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

    private async Task ValidarAntesDeGuardarAsync(IFormFile ficheiro, CancellationToken cancellationToken)
    {
        if (ficheiro.Length > _maxFileSizeBytes)
            throw new InvalidOperationException($"O ficheiro excede o tamanho máximo permitido ({_maxFileSizeBytes / (1024 * 1024)} MB).");

        await _contentValidator.ValidarAsync(ficheiro, cancellationToken);
    }
}
