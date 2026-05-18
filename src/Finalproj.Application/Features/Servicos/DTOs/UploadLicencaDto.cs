namespace Finalproj.Application.Features.Servicos.DTOs;

/// <summary>
/// DTO para o POST UploadLicenca (dados da licença + ficheiro).
/// Usado com [FromForm] para multipart/form-data.
/// </summary>
public class UploadLicencaDto
{
    public ServicoLicenca Licenca { get; set; } = new();
    public IFormFile? Ficheiro { get; set; }
}
