namespace Finalproj.Application.Services.Interfaces;

/// <summary>
/// Valida palavras-passe com os validadores do ASP.NET Identity (Program.cs).
/// </summary>
public interface IPasswordValidationService
{
    /// <summary>Devolve descrições de erro em português; lista vazia se válida.</summary>
    Task<IReadOnlyList<string>> ValidateAsync(
        string password,
        string? userName = null,
        string? email = null,
        CancellationToken cancellationToken = default);
}
