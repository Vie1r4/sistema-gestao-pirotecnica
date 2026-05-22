using Finalproj.Application.Services;
using Microsoft.AspNetCore.Http;

namespace Finalproj.Infrastructure.Services;

/// <inheritdoc />
public sealed class UploadFileContentValidator : IUploadFileContentValidator
{
    public async Task ValidarAsync(IFormFile ficheiro, CancellationToken cancellationToken = default)
    {
        if (ficheiro.Length == 0)
            throw new InvalidOperationException("O ficheiro está vazio.");

        await using var stream = ficheiro.OpenReadStream();
        var buffer = new byte[UploadFileContentRules.HeaderSize];
        var read = await stream.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken);

        UploadFileContentRules.Validar(ficheiro.FileName, buffer.AsSpan(0, read));
    }
}
