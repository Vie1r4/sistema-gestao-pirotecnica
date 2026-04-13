namespace Finalproj.Models;

/// <summary>
/// DTO para o POST Create de paiol (agrupa paiol, cargos de acesso e documentos extras).
/// Usado com [FromForm] para multipart/form-data ou form-urlencoded.
/// </summary>
public class CreatePaiolInputDto
{
    public Paiol Paiol { get; set; } = new();
    public string[]? CargosAcesso { get; set; }
    public List<DocumentoExtraInput>? DocumentosExtras { get; set; }
}
