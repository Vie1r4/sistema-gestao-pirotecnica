using Finalproj.Application.DTOs;

namespace Finalproj.Application.Features.Paiols.DTOs;

/// <summary>
/// DTO para o PUT Edit de paiol (agrupa paiol, cargos, documentos e ids a remover).
/// Usado com [FromForm] para multipart/form-data ou form-urlencoded.
/// </summary>
public class EditPaiolInputDto
{
    public Paiol Paiol { get; set; } = new();
    public string[]? CargosAcesso { get; set; }
    public List<DocumentoExtraInput>? DocumentosExtras { get; set; }
    public List<int>? RemoverDocumentoExtraIds { get; set; }
}
