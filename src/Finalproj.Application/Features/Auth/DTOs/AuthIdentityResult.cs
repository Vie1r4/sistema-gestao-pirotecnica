namespace Finalproj.Application.Features.Auth.DTOs;

public sealed record AuthIdentityResult(bool Succeeded, IReadOnlyList<string> Errors)
{
    public static AuthIdentityResult Ok() => new(true, []);
    public static AuthIdentityResult Fail(params string[] errors) => new(false, errors);
}
