using Finalproj.Application.Services;
using Xunit;

namespace Finalproj.Tests;

public class UploadFileContentRulesTests
{
    private static readonly byte[] PdfHeader = [0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34];
    private static readonly byte[] JpegHeader = [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10];
    private static readonly byte[] PngHeader =
    [
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D
    ];
    private static readonly byte[] ExeHeader = [0x4D, 0x5A, 0x90, 0x00];

    [Theory]
    [InlineData("doc.pdf", true)]
    [InlineData("foto.JPG", true)]
    [InlineData("foto.jpeg", true)]
    [InlineData("img.png", true)]
    [InlineData("malware.exe", false)]
    [InlineData("semextensao", false)]
    public void ExtensaoPermitida_respeita_lista(string fileName, bool esperado)
    {
        Assert.Equal(esperado, UploadFileContentRules.ExtensaoPermitida(fileName));
    }

    [Theory]
    [InlineData("doc.pdf", true)]
    [InlineData("foto.jpg", true)]
    [InlineData("foto.jpeg", true)]
    [InlineData("img.png", true)]
    public void Validar_aceita_magic_bytes_corretos(string fileName, bool _)
    {
        var header = HeaderFor(fileName);
        var ex = Record.Exception(() => UploadFileContentRules.Validar(fileName, header.AsSpan()));
        Assert.Null(ex);
    }

    [Fact]
    public void Validar_rejeita_pdf_com_conteudo_jpeg()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            UploadFileContentRules.Validar("doc.pdf", JpegHeader.AsSpan()));
        Assert.Contains("não corresponde", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Validar_rejeita_exe_renomeado_para_pdf()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            UploadFileContentRules.Validar("doc.pdf", ExeHeader.AsSpan()));
        Assert.Contains("conteúdo", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Validar_rejeita_ficheiro_vazio()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            UploadFileContentRules.Validar("doc.pdf", ReadOnlySpan<byte>.Empty));
        Assert.Contains("curto", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Validar_rejeita_extensao_nao_permitida()
    {
        var ex = Assert.Throws<InvalidOperationException>(() =>
            UploadFileContentRules.Validar("script.exe", ExeHeader.AsSpan()));
        Assert.Contains("Extensão", ex.Message);
    }

    private static byte[] HeaderFor(string fileName) =>
        Path.GetExtension(fileName).ToLowerInvariant() switch
        {
            ".pdf" => PdfHeader,
            ".jpg" or ".jpeg" => JpegHeader,
            ".png" => PngHeader,
            _ => ExeHeader
        };
}
