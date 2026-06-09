using Finalproj.Application.Common.Models;

namespace Finalproj.Application.DTOs;

/// <summary>
/// Entrada de um documento adicional no Create/Edit (nome + ficheiro).
/// </summary>
public class DocumentoExtraInput
{
    public string? Nome { get; set; }
    public UploadedFileContent? Ficheiro { get; set; }
}
