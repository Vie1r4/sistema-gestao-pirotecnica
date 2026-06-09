using Finalproj.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Finalproj.Helpers;

/// <summary>Helper para servir ficheiros de documentos com Content-Type adequado.</summary>
public static class DocumentoFileResult
{
    public static IActionResult? FromPath(ControllerBase controller, string? caminhoFisico, string caminhoRelativo, bool attachment = false)
    {
        if (string.IsNullOrEmpty(caminhoFisico) || !System.IO.File.Exists(caminhoFisico))
            return null;

        var (contentType, nomeFicheiro) = ObterMetadados(caminhoRelativo);
        AplicarHeaders(controller, nomeFicheiro, attachment);
        return controller.PhysicalFile(caminhoFisico, contentType);
    }

    public static async Task<IActionResult?> FromPathAsync(
        ControllerBase controller,
        IDocumentoStorageService storage,
        string? caminhoRelativo,
        bool attachment = false,
        CancellationToken cancellationToken = default)
    {
        var bytes = await storage.LerConteudoAsync(caminhoRelativo, cancellationToken);
        if (bytes == null || bytes.Length == 0)
            return null;

        var (contentType, nomeFicheiro) = ObterMetadados(caminhoRelativo ?? "");
        AplicarHeaders(controller, nomeFicheiro, attachment);
        return controller.File(bytes, contentType);
    }

    private static (string ContentType, string NomeFicheiro) ObterMetadados(string caminhoRelativo)
    {
        var ext = Path.GetExtension(caminhoRelativo).ToLowerInvariant();
        var contentType = ext switch
        {
            ".pdf" => "application/pdf",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream"
        };
        return (contentType, Path.GetFileName(caminhoRelativo));
    }

    private static void AplicarHeaders(ControllerBase controller, string nomeFicheiro, bool attachment)
    {
        var disposition = attachment ? "attachment" : "inline";
        controller.Response.Headers["Content-Disposition"] =
            $"{disposition}; filename=\"{nomeFicheiro.Replace("\"", "\\\"")}\"";
        controller.Response.Headers["Cache-Control"] = "no-store";
    }
}
