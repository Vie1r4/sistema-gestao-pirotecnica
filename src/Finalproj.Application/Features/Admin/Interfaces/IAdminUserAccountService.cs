using Finalproj.Application.DTOs;
using Finalproj.Application.Features.Admin.DTOs;

namespace Finalproj.Application.Features.Admin.Interfaces;

public interface IAdminUserAccountService
{
    Task<object> GetCriarOpcoesAsync(CancellationToken cancellationToken = default);

    Task<AdminUserAccountResult> CreateUtilizadorAsync(
        CreateAdminUtilizadorRequest request,
        string? adminUserId,
        string? adminUserName,
        CancellationToken cancellationToken = default);

    Task<AdminUserAccountResult> ResendConfirmEmailAsync(
        string userId,
        string? adminUserId,
        string? adminUserName,
        CancellationToken cancellationToken = default);

    Task<AdminUserAccountResult> ConfirmEmailAsync(
        string userId,
        string? adminUserId,
        string? adminUserName,
        CancellationToken cancellationToken = default);

    Task<AdminUserAccountResult> SendPasswordResetAsync(
        string userId,
        string? adminUserId,
        string? adminUserName,
        CancellationToken cancellationToken = default);

    Task<AdminUserAccountResult> UpdateCredenciaisAsync(
        string userId,
        UpdateAdminUtilizadorCredenciaisRequest request,
        string? adminUserId,
        string? adminUserName,
        CancellationToken cancellationToken = default);

    Task<AdminUserAccountResult> UpdateUtilizadorRolesAsync(
        string userId,
        EditarUtilizadorRolesViewModel model,
        string? adminUserId,
        string? adminUserName,
        CancellationToken cancellationToken = default);
}
