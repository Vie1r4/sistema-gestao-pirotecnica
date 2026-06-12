namespace Finalproj.Application.Features.Admin.DTOs;

public sealed class CreateAdminUtilizadorRequest
{
    public string? Email { get; set; }
    public string? Password { get; set; }
    public string? ConfirmPassword { get; set; }
    public List<string>? Roles { get; set; }
    public int? FuncionarioId { get; set; }
    public bool EnviarEmailConfirmacao { get; set; } = true;
}

public sealed class UpdateAdminUtilizadorCredenciaisRequest
{
    public string? Email { get; set; }
}

public sealed class AdminUserAccountResult
{
    public bool Success { get; init; }
    public string Message { get; init; } = "";
    public IReadOnlyList<string> Errors { get; init; } = Array.Empty<string>();
    public string? UserId { get; init; }
    /// <summary>True quando as roles mudaram — o cliente deve renovar o JWT.</summary>
    public bool RequiresTokenRefresh { get; init; }
}
