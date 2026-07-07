using Finalproj.Application.Common.Models;

namespace Finalproj.Application.Features.Clientes.DTOs;

/// <summary>Comando de importação CSV de clientes.</summary>
public class ImportClientesCsvInputDto
{
    public UploadedFileContent? Ficheiro { get; set; }

    /// <summary>ignorar (default), atualizar ou criar quando o NIF já existe.</summary>
    public string ModoDuplicadoNif { get; set; } = "ignorar";
}
