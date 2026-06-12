namespace Finalproj.Application.Services.Interfaces;

/// <summary>
/// Sincronização e validação de roles Identity (um cargo operacional por utilizador; proteção do último Admin).
/// </summary>
public interface IIdentityRolesService
{
    /// <summary>
    /// Define as roles operacionais do utilizador (substitui todas as roles do sistema).
    /// </summary>
    Task<IdentityRoleOperationResult> SetOperationalRolesAsync(
        string userId,
        IReadOnlyList<string> desiredRoles,
        CancellationToken cancellationToken = default);
}

public sealed class IdentityRoleOperationResult
{
    public bool Success { get; init; }
    public string Message { get; init; } = "";
    public bool RolesChanged { get; init; }

    public static IdentityRoleOperationResult Ok(bool rolesChanged, string message = "") =>
        new() { Success = true, RolesChanged = rolesChanged, Message = message };

    public static IdentityRoleOperationResult Fail(string message) =>
        new() { Success = false, Message = message };
}
