using System.Text;
using Finalproj.Application.Features.Admin.DTOs;
using Finalproj.Application.Features.Admin.Interfaces;
using Finalproj.Application.Features.Home.Interfaces;
using Finalproj.Application.Services;
using Finalproj.Application.Services.Interfaces;
using Finalproj.Domain.Constants;
using Finalproj.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;

namespace Finalproj.Infrastructure.Services;

public sealed class AdminUserAccountService(
    UserManager<IdentityUser> userManager,
    IAdminStatsService adminStats,
    IFuncionarioRepository funcionarios,
    IHomeAnalyticsService homeAnalytics,
    IEmailSender emailSender,
    IConfiguration configuration,
    IPasswordValidationService passwordValidation,
    ILogSistemaService logSistema) : IAdminUserAccountService
{
    private static readonly string[] RolesPermitidas = ConstantesRoles.ParaContaFuncionario;

    public async Task<object> GetCriarOpcoesAsync(CancellationToken cancellationToken = default)
    {
        var disponiveis = await adminStats.GetFuncionariosDisponiveisAsync("", cancellationToken);
        return new
        {
            roles = RolesPermitidas,
            funcionariosDisponiveis = disponiveis,
        };
    }

    public async Task<AdminUserAccountResult> CreateUtilizadorAsync(
        CreateAdminUtilizadorRequest request,
        string? adminUserId,
        string? adminUserName,
        CancellationToken cancellationToken = default)
    {
        var email = request.Email?.Trim() ?? "";
        if (string.IsNullOrWhiteSpace(email))
            return Fail("O email é obrigatório.");
        if (string.IsNullOrWhiteSpace(request.Password))
            return Fail("A palavra-passe é obrigatória.");
        if (!string.IsNullOrWhiteSpace(request.ConfirmPassword) && request.Password != request.ConfirmPassword)
            return Fail("A palavra-passe e a confirmação não coincidem.");

        if (await userManager.FindByEmailAsync(email) != null)
            return Fail("Já existe uma conta com este email.");

        var passwordErrors = await passwordValidation.ValidateAsync(request.Password, email, email, cancellationToken);
        if (passwordErrors.Count > 0)
            return Fail("A palavra-passe não cumpre os requisitos.", passwordErrors);

        var roles = NormalizeRoles(request.Roles);
        if (roles.Count == 0)
            return Fail("Selecione pelo menos uma role.");

        var user = new IdentityUser { UserName = email, Email = email };
        var createResult = await userManager.CreateAsync(user, request.Password!);
        if (!createResult.Succeeded)
            return Fail("Não foi possível criar a conta.", createResult.Errors.Select(e => e.Description));

        foreach (var role in roles)
            await userManager.AddToRoleAsync(user, role);

        if (request.FuncionarioId.HasValue)
        {
            var func = await funcionarios.GetByIdAsync(request.FuncionarioId.Value, cancellationToken);
            if (func == null)
            {
                await userManager.DeleteAsync(user);
                return Fail("Funcionário não encontrado.");
            }
            if (!string.IsNullOrEmpty(func.UserId) && func.UserId != user.Id)
            {
                await userManager.DeleteAsync(user);
                return Fail("Esse funcionário já tem outra conta associada.");
            }
            await adminStats.AssociarFuncionarioAUtilizadorAsync(user.Id!, request.FuncionarioId, cancellationToken);
            await homeAnalytics.SavePerfilAsync(user.Id!, func.NomeCompleto, func.Telefone, cancellationToken);
        }

        if (request.EnviarEmailConfirmacao)
            await SendConfirmEmailAsync(user, email, cancellationToken);

        await logSistema.RegistarAsync(
            "ADMIN_UTILIZADOR_CRIADO",
            adminUserId,
            adminUserName,
            new { userId = user.Id, email, roles, funcionarioId = request.FuncionarioId },
            cancellationToken);

        return new AdminUserAccountResult
        {
            Success = true,
            Message = request.EnviarEmailConfirmacao
                ? "Conta criada. Foi enviado um email de confirmação."
                : "Conta criada com sucesso.",
            UserId = user.Id,
        };
    }

    public async Task<AdminUserAccountResult> ResendConfirmEmailAsync(
        string userId,
        string? adminUserId,
        string? adminUserName,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return Fail("Utilizador não encontrado.");
        var email = user.Email ?? user.UserName ?? "";
        if (string.IsNullOrWhiteSpace(email)) return Fail("Conta sem email.");
        if (user.EmailConfirmed)
            return Fail("O email já está confirmado.");

        await SendConfirmEmailAsync(user, email, cancellationToken);
        await logSistema.RegistarAsync(
            "ADMIN_EMAIL_CONFIRMACAO_REENVIADO",
            adminUserId,
            adminUserName,
            new { userId, email },
            cancellationToken);

        return Ok("Email de confirmação reenviado.");
    }

    public async Task<AdminUserAccountResult> ConfirmEmailAsync(
        string userId,
        string? adminUserId,
        string? adminUserName,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return Fail("Utilizador não encontrado.");
        if (user.EmailConfirmed)
            return Ok("O email já estava confirmado.");

        user.EmailConfirmed = true;
        var update = await userManager.UpdateAsync(user);
        if (!update.Succeeded)
            return Fail("Não foi possível confirmar o email.", update.Errors.Select(e => e.Description));

        await logSistema.RegistarAsync(
            "ADMIN_EMAIL_CONFIRMADO",
            adminUserId,
            adminUserName,
            new { userId, email = user.Email },
            cancellationToken);

        return Ok("Email marcado como confirmado.");
    }

    public async Task<AdminUserAccountResult> SendPasswordResetAsync(
        string userId,
        string? adminUserId,
        string? adminUserName,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return Fail("Utilizador não encontrado.");
        var email = user.Email ?? user.UserName ?? "";
        if (string.IsNullOrWhiteSpace(email)) return Fail("Conta sem email.");

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var encoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        var baseUrl = GetFrontendBaseUrl();
        var link =
            $"{baseUrl}/reset-password?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(encoded)}";

        await emailSender.SendEmailAsync(
            email,
            "PIROFAFE — Redefinir palavra-passe",
            BuildActionEmailHtml("Redefinir palavra-passe", "Foi solicitada a redefinição da palavra-passe desta conta.", "Definir nova palavra-passe", link));

        await logSistema.RegistarAsync(
            "ADMIN_PASSWORD_RESET_ENVIADO",
            adminUserId,
            adminUserName,
            new { userId, email },
            cancellationToken);

        return Ok("Email de redefinição de palavra-passe enviado.");
    }

    public async Task<AdminUserAccountResult> UpdateCredenciaisAsync(
        string userId,
        UpdateAdminUtilizadorCredenciaisRequest request,
        string? adminUserId,
        string? adminUserName,
        CancellationToken cancellationToken = default)
    {
        var newEmail = request.Email?.Trim() ?? "";
        if (string.IsNullOrWhiteSpace(newEmail))
            return Fail("O email é obrigatório.");

        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return Fail("Utilizador não encontrado.");

        var existing = await userManager.FindByEmailAsync(newEmail);
        if (existing != null && existing.Id != user.Id)
            return Fail("Já existe outra conta com este email.");

        var oldEmail = user.Email ?? user.UserName ?? "";

        var setUserName = await userManager.SetUserNameAsync(user, newEmail);
        if (!setUserName.Succeeded)
            return Fail("Não foi possível atualizar o identificador.", setUserName.Errors.Select(e => e.Description));

        var setEmail = await userManager.SetEmailAsync(user, newEmail);
        if (!setEmail.Succeeded)
            return Fail("Não foi possível atualizar o email.", setEmail.Errors.Select(e => e.Description));

        await logSistema.RegistarAsync(
            "ADMIN_UTILIZADOR_EMAIL_ALTERADO",
            adminUserId,
            adminUserName,
            new { userId, emailAnterior = oldEmail, emailNovo = newEmail },
            cancellationToken);

        return Ok("Email da conta atualizado.");
    }

    private static List<string> NormalizeRoles(List<string>? roles)
    {
        if (roles == null || roles.Count == 0) return [];
        return roles
            .Select(r => r.Trim())
            .Where(r => RolesPermitidas.Contains(r, StringComparer.OrdinalIgnoreCase))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private async Task SendConfirmEmailAsync(IdentityUser user, string email, CancellationToken cancellationToken)
    {
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var encoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        var baseUrl = GetFrontendBaseUrl();
        var confirmUrl =
            $"{baseUrl}/confirm-email?userId={Uri.EscapeDataString(user.Id!)}&code={Uri.EscapeDataString(encoded)}";

        await emailSender.SendEmailAsync(
            email,
            "PIROFAFE — Confirmar email",
            BuildActionEmailHtml(
                "Confirmar email",
                "Confirme o email da sua conta para poder iniciar sessão.",
                "Confirmar email",
                confirmUrl));
    }

    private string GetFrontendBaseUrl()
    {
        var baseUrl = configuration["Frontend:BaseUrl"]?.Trim();
        if (string.IsNullOrWhiteSpace(baseUrl))
            baseUrl = "http://localhost:3000";
        return baseUrl.TrimEnd('/');
    }

    private static string BuildActionEmailHtml(string title, string body, string buttonLabel, string link)
    {
        var safeLink = System.Net.WebUtility.HtmlEncode(link);
        return $"""
            <!doctype html>
            <html lang="pt">
              <body style="margin:0;padding:24px;background:#f8f7f5;font-family:system-ui,sans-serif;">
                <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e7e5e4;border-radius:16px;padding:24px;">
                  <div style="font-weight:800;color:#ea580c;margin-bottom:16px;">PIROFAFE</div>
                  <h1 style="font-size:20px;margin:0 0 12px;">{System.Net.WebUtility.HtmlEncode(title)}</h1>
                  <p style="color:#374151;line-height:1.5;">{System.Net.WebUtility.HtmlEncode(body)}</p>
                  <p style="margin:24px 0;">
                    <a href="{link}" style="display:inline-block;background:#f97316;color:#111827;padding:12px 16px;border-radius:12px;font-weight:700;text-decoration:none;">{System.Net.WebUtility.HtmlEncode(buttonLabel)}</a>
                  </p>
                  <p style="font-size:12px;color:#6b7280;word-break:break-all;"><a href="{link}" style="color:#ea580c;">{safeLink}</a></p>
                </div>
              </body>
            </html>
            """;
    }

    private static AdminUserAccountResult Ok(string message) =>
        new() { Success = true, Message = message };

    private static AdminUserAccountResult Fail(string message, IEnumerable<string>? errors = null) =>
        new()
        {
            Success = false,
            Message = message,
            Errors = errors?.ToList() ?? [],
        };
}
