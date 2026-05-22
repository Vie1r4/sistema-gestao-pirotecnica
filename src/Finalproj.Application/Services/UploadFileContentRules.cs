namespace Finalproj.Application.Services;

/// <summary>
/// Regras de validação de conteúdo de upload (magic bytes) alinhadas a <see cref="IDocumentoStorageService.ExtensoesPermitidas"/>.
/// </summary>
public static class UploadFileContentRules
{
    public const int HeaderSize = 12;

    private static readonly string[] ExtensoesPermitidas = [".pdf", ".jpg", ".jpeg", ".png"];

    public static IReadOnlyList<string> ExtensoesPermitidasLista => ExtensoesPermitidas;

    public static bool ExtensaoPermitida(string fileName)
    {
        var ext = Path.GetExtension(fileName);
        return !string.IsNullOrEmpty(ext) && ExtensoesPermitidas.Contains(ext, StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Valida extensão e assinatura do conteúdo. Lança <see cref="InvalidOperationException"/> se inválido.
    /// </summary>
    public static void Validar(string fileName, ReadOnlySpan<byte> header)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new InvalidOperationException("Nome de ficheiro inválido.");

        if (!ExtensaoPermitida(fileName))
            throw new InvalidOperationException("Extensão de ficheiro não permitida.");

        if (header.Length < 3)
            throw new InvalidOperationException("O ficheiro está vazio ou o conteúdo é demasiado curto.");

        if (!TryDetectContentType(header, out var detected))
            throw new InvalidOperationException("O conteúdo do ficheiro não corresponde a PDF, JPEG ou PNG válido.");

        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        if (!ExtensionMatchesContent(detected, ext))
            throw new InvalidOperationException(
                "O conteúdo do ficheiro não corresponde à extensão indicada. Envie um PDF, JPEG ou PNG genuíno.");
    }

    internal static bool TryDetectContentType(ReadOnlySpan<byte> header, out UploadContentType type)
    {
        // PDF: %PDF
        if (header.Length >= 4
            && header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46)
        {
            type = UploadContentType.Pdf;
            return true;
        }

        // JPEG: FF D8 FF
        if (header.Length >= 3
            && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
        {
            type = UploadContentType.Jpeg;
            return true;
        }

        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (header.Length >= 8
            && header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47
            && header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A)
        {
            type = UploadContentType.Png;
            return true;
        }

        type = UploadContentType.Unknown;
        return false;
    }

    internal static bool ExtensionMatchesContent(UploadContentType type, string extension) =>
        type switch
        {
            UploadContentType.Pdf => extension == ".pdf",
            UploadContentType.Jpeg => extension is ".jpg" or ".jpeg",
            UploadContentType.Png => extension == ".png",
            _ => false
        };

    internal enum UploadContentType
    {
        Unknown,
        Pdf,
        Jpeg,
        Png
    }
}
