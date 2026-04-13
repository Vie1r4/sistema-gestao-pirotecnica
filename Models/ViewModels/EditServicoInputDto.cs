namespace Finalproj.Models;

/// <summary>
/// DTO para o PUT Edit de serviço (agrupa serviço, equipa, documentos e ids a remover).
/// Usado com [FromForm] para multipart/form-data ou form-urlencoded.
/// </summary>
public class EditServicoInputDto
{
    public Servico Servico { get; set; } = new();
    public int[]? EquipaIds { get; set; }
    public List<DocumentoExtraInput>? DocumentosExtras { get; set; }
    public List<int>? RemoverDocumentoExtraIds { get; set; }
}
