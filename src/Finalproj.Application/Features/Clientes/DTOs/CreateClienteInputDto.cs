using Finalproj.Application.DTOs;

namespace Finalproj.Application.Features.Clientes.DTOs;

/// <summary>
/// DTO para o POST Create de cliente (agrupa cliente e documentos extras).
/// Usado com [FromForm] para multipart/form-data ou form-urlencoded.
/// </summary>
public class CreateClienteInputDto
{
    public Cliente Cliente { get; set; } = new();
    public List<DocumentoExtraInput>? DocumentosExtras { get; set; }
}
