namespace Finalproj.Application.Common.Models;

/// <summary>
/// Conteúdo de ficheiro uploadado, independente de ASP.NET Core (HTTP/multipart).
/// </summary>
public sealed class UploadedFileContent
{
    public required string FileName { get; init; }
    public string? ContentType { get; init; }
    public required byte[] Content { get; init; }

    public long Length => Content.LongLength;
}
