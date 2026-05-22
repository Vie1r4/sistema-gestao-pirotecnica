using Microsoft.AspNetCore.Http;

namespace Finalproj.Application.Services;

/// <summary>
/// Valida uploads por extensão e assinatura de conteúdo (magic bytes).
/// </summary>
public interface IUploadFileContentValidator
{
    /// <summary>Valida nome, extensão e primeiros bytes do ficheiro.</summary>
    Task ValidarAsync(IFormFile ficheiro, CancellationToken cancellationToken = default);
}
