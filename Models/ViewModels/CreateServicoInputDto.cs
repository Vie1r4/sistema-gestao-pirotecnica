namespace Finalproj.Models;

/// <summary>
/// DTO para o POST Create de serviço (agrupa serviço, equipa e documentos extras).
/// Usado com [FromForm] para multipart/form-data ou form-urlencoded.
/// </summary>
public class CreateServicoInputDto
{
    public Servico Servico { get; set; } = new();
    public int[]? EquipaIds { get; set; }
    public List<DocumentoExtraInput>? DocumentosExtras { get; set; }
}
