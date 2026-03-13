using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace Finalproj.Services;

/// <summary>
/// Implementação de <see cref="IDocumentoStorageService"/> usando wwwroot e ILogger para falhas de I/O.
/// </summary>
public class DocumentoStorageService : IDocumentoStorageService
{
    private static readonly string[] Extensoes = { ".pdf", ".jpg", ".jpeg", ".png" };
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<DocumentoStorageService> _logger;

    public DocumentoStorageService(IWebHostEnvironment env, ILogger<DocumentoStorageService> logger)
    {
        _env = env;
        _logger = logger;
    }

    public IReadOnlyList<string> ExtensoesPermitidas => Extensoes;

    public bool ExtensaoPermitida(string fileName)
    {
        var ext = Path.GetExtension(fileName);
        return !string.IsNullOrEmpty(ext) && Extensoes.Contains(ext.ToLowerInvariant());
    }

    public async Task<string> GuardarFicheiroAsync(string pastaRelativaBase, int entidadeId, IFormFile ficheiro, string prefixoNome, CancellationToken cancellationToken = default)
    {
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

    public void ApagarFicheiroSeExistir(string? caminhoRelativo)
    {
        if (string.IsNullOrWhiteSpace(caminhoRelativo)) return;
        var caminhoFisico = Path.Combine(_env.WebRootPath, caminhoRelativo);
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

    public void ApagarPastaRecursiva(string? pastaRelativa)
    {
        if (string.IsNullOrWhiteSpace(pastaRelativa)) return;
        var pastaFisica = Path.Combine(_env.WebRootPath, pastaRelativa);
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
