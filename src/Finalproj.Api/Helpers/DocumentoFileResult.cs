using Microsoft.AspNetCore.Mvc;

namespace Finalproj.Helpers;

/// <summary>Helper para servir ficheiros de documentos com Content-Type adequado.</summary>
public static class DocumentoFileResult
{
    public static IActionResult? FromPath(ControllerBase controller, string? caminhoFisico, string caminhoRelativo)
    {
        if (string.IsNullOrEmpty(caminhoFisico) || !System.IO.File.Exists(caminhoFisico))
            return null;

        var ext = Path.GetExtension(caminhoRelativo).ToLowerInvariant();
        var contentType = ext switch
        {
            ".pdf" => "application/pdf",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream"
        };
        var nomeFicheiro = Path.GetFileName(caminhoRelativo);
        controller.Response.Headers["Content-Disposition"] =
            "inline; filename=\"" + nomeFicheiro.Replace("\"", "\\\"") + "\"";
        return controller.PhysicalFile(caminhoFisico, contentType);
    }
}
