namespace Finalproj.Application.Features.Auth.DTOs;

public sealed record AuthUserSnapshot(
    string UserId,
    string Email,
    string UserName,
    bool EmailConfirmed);
