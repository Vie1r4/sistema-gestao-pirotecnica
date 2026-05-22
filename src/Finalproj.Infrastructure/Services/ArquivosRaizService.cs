using Finalproj.Application.Services;
using Finalproj.Infrastructure.Configuration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;

namespace Finalproj.Infrastructure.Services;

public sealed class ArquivosRaizService : IArquivosRaizService
{
    private readonly IWebHostEnvironment _env;
    private readonly DadosLocaisOptions _options;
    private readonly string _dadosRoot;

    public ArquivosRaizService(IWebHostEnvironment env, IOptions<DadosLocaisOptions> options)
    {
        _env = env;
        _options = options.Value;
        var anchor = string.IsNullOrWhiteSpace(_options.CaminhoRaizDados)
            ? env.ContentRootPath
            : _options.CaminhoRaizDados.Trim();

        _dadosRoot = Path.Combine(anchor, _options.NomePastaDados);
        UploadsRoot = Path.Combine(_dadosRoot, _options.SubPastaDocumentos);
        BackupsRoot = Path.Combine(_dadosRoot, _options.SubPastaBackups);

        GarantirPastasExistem();
    }

    public string UploadsRoot { get; }

    public string BackupsRoot { get; }

    public void GarantirPastasExistem()
    {
        Directory.CreateDirectory(_dadosRoot);
        Directory.CreateDirectory(UploadsRoot);
        Directory.CreateDirectory(BackupsRoot);
    }

    public string? ResolverCaminhoUploadFisico(string? caminhoRelativo)
    {
        if (string.IsNullOrWhiteSpace(caminhoRelativo))
            return null;

        var uploadsPath = ResolverDentroDeRaiz(UploadsRoot, caminhoRelativo);
        if (uploadsPath != null && File.Exists(uploadsPath))
            return uploadsPath;

        if (!_options.UsarFallbackWwwroot || string.IsNullOrWhiteSpace(_env.WebRootPath))
            return uploadsPath;

        var legacyPath = ResolverDentroDeRaiz(_env.WebRootPath, caminhoRelativo);
        if (legacyPath != null && File.Exists(legacyPath))
            return legacyPath;

        return uploadsPath ?? legacyPath;
    }

    public IReadOnlyList<string> ResolverCaminhosFisicos(string? caminhoRelativo)
    {
        if (string.IsNullOrWhiteSpace(caminhoRelativo))
            return Array.Empty<string>();

        var list = new List<string>(2);
        var uploadsPath = ResolverDentroDeRaiz(UploadsRoot, caminhoRelativo);
        if (uploadsPath != null)
            list.Add(uploadsPath);

        if (_options.UsarFallbackWwwroot && !string.IsNullOrWhiteSpace(_env.WebRootPath))
        {
            var legacyPath = ResolverDentroDeRaiz(_env.WebRootPath, caminhoRelativo);
            if (legacyPath != null && !list.Contains(legacyPath, StringComparer.OrdinalIgnoreCase))
                list.Add(legacyPath);
        }

        return list;
    }

    private static string? ResolverDentroDeRaiz(string root, string caminhoRelativo)
    {
        var rootFull = Path.GetFullPath(root);
        var combined = Path.GetFullPath(Path.Combine(root, caminhoRelativo.Replace('/', Path.DirectorySeparatorChar)));
        if (!combined.StartsWith(rootFull, StringComparison.OrdinalIgnoreCase))
            return null;
        return combined;
    }
}
