using Finalproj.Application.Common.Models;
using Finalproj.Application.Services;
using Finalproj.Infrastructure.Configuration;
using Microsoft.Extensions.Options;

namespace Finalproj.Infrastructure.Services;

/// <inheritdoc />
public sealed class UploadFileContentValidator : IUploadFileContentValidator
{
    public Task ValidarAsync(UploadedFileContent ficheiro, CancellationToken cancellationToken = default)
    {
        if (ficheiro.Content.Length == 0)
            throw new InvalidOperationException("O ficheiro está vazio.");

        UploadFileContentRules.Validar(ficheiro.FileName, ficheiro.Content.AsSpan(0, Math.Min(ficheiro.Content.Length, UploadFileContentRules.HeaderSize)));
        return Task.CompletedTask;
    }
}
