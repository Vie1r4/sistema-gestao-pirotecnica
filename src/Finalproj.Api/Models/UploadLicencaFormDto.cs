using Finalproj.Domain.Entities;

using Finalproj.Domain.Entities;

namespace Finalproj.Api.Models;

/// <summary>
/// Binding multipart para upload de licença (camada HTTP).
/// </summary>
public sealed class UploadLicencaFormDto
{
    public ServicoLicenca Licenca { get; set; } = new();
    public IFormFile? Ficheiro { get; set; }
}
