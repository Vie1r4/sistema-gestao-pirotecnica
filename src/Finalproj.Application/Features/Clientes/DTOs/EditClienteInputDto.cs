using Finalproj.Application.DTOs;

namespace Finalproj.Application.Features.Clientes.DTOs;

/// <summary>
/// DTO para o PUT Edit de cliente (agrupa cliente, documentos extras e ids a remover).
/// Usado com [FromForm] para multipart/form-data ou form-urlencoded.
/// </summary>
public class EditClienteInputDto
{
    public Cliente Cliente { get; set; } = new();
    public List<DocumentoExtraInput>? DocumentosExtras { get; set; }
    public List<int>? RemoverDocumentoExtraIds { get; set; }
}
