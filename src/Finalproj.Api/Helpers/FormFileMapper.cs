using Finalproj.Application.Common.Models;

namespace Finalproj.Api.Helpers;

/// <summary>
/// Mapeia tipos HTTP (<see cref="IFormFile"/>) para modelos neutros da Application.
/// </summary>
public static class FormFileMapper
{
    public static async Task<UploadedFileContent?> ToUploadedFileContentAsync(
        IFormFile? file,
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
            return null;

        await using var ms = new MemoryStream();
        await file.CopyToAsync(ms, cancellationToken);
        return new UploadedFileContent
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            Content = ms.ToArray()
        };
    }
}
