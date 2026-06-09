using MiniSoftware;

namespace Finalproj.Infrastructure.DocumentacaoRegulatoria;

/// <summary>Converte DOCX em PDF (formato intermédio da declaração PSP).</summary>
public static class DocxParaPdfConverter
{
    public static byte[] Converter(byte[] docxBytes)
    {
        if (docxBytes.Length == 0)
            throw new InvalidOperationException("O documento Word está vazio.");

        using var input = new MemoryStream(docxBytes, writable: false);
        return MiniPdf.ConvertDocxToPdf(input);
    }
}
