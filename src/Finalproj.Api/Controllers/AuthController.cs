using System.Security.Claims;
using Finalproj.Api.Models.Auth;
using Finalproj.Api.Services;
using Finalproj.Application.Features.Auth.Interfaces;
using Finalproj.Application.Services.Interfaces;
using Finalproj.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Finalproj.Controllers;

/// <summary>Autenticação JWT, refresh em cookie HttpOnly, registo do primeiro administrador e recuperação de palavra-passe.</summary>
[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IAuthAccountInfoService _accountInfo;
    private readonly IAuthTokenService _tokens;
    private readonly IAuthRefreshCookieAccessor _refreshCookies;
    private readonly IAuthBootstrapService _bootstrap;
    private readonly IAuthPasswordResetService _passwordReset;
    private readonly IAuthEmailConfirmationService _emailConfirmation;
    private readonly IDatabaseBackupService _databaseBackupService;
    private readonly IWebHostEnvironment _env;

    public AuthController(
        UserManager<IdentityUser> userManager,
        IAuthAccountInfoService accountInfo,
        IAuthTokenService tokens,
        IAuthRefreshCookieAccessor refreshCookies,
        IAuthBootstrapService bootstrap,
        IAuthPasswordResetService passwordReset,
        IAuthEmailConfirmationService emailConfirmation,
        IDatabaseBackupService databaseBackupService,
        IWebHostEnvironment env)
    {
        _userManager = userManager;
        _accountInfo = accountInfo;
        _tokens = tokens;
        _refreshCookies = refreshCookies;
        _bootstrap = bootstrap;
        _passwordReset = passwordReset;
        _emailConfirmation = emailConfirmation;
        _databaseBackupService = databaseBackupService;
        _env = env;
    }

    [HttpGet("existem-utilizadores")]
    [AllowAnonymous]
    [EnableRateLimiting("bootstrap-status")]
    public async Task<IActionResult> ExistemUtilizadores(CancellationToken cancellationToken = default)
    {
        if (!_bootstrap.IsBootstrapEnabled || await _bootstrap.AnyUsersExistAsync(cancellationToken))
            return Ok(new { primeiroRegistoDisponivel = false });

        var existemBackups = await _databaseBackupService.CountBackupsAsync(cancellationToken) > 0;
        return Ok(new { primeiroRegistoDisponivel = true, existemBackupsAnteriores = existemBackups });
    }

    [HttpPost("registar-primeiro-utilizador")]
    [AllowAnonymous]
    [EnableRateLimiting("bootstrap-register")]
    public async Task<IActionResult> RegistarPrimeiroUtilizador([FromBody] RegistarPrimeiroRequest request, CancellationToken cancellationToken = default)
    {
        if (!_bootstrap.IsBootstrapEnabled)
            return NotFound();

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { error = "Email e palavra-passe são obrigatórios." });

        var (ok, error, details, session) = await _bootstrap.RegisterFirstAdminAsync(
            request.Email.Trim(),
            request.Password,
            request.Nome,
            cancellationToken);

        if (!ok)
            return details is { Count: > 0 }
                ? BadRequest(new { error, details })
                : BadRequest(new { error });

        WriteRefreshCookie(session!.RefreshTokenPlain);
        return Ok(new
        {
            token = session.AccessToken,
            message = "Primeiro utilizador criado com sucesso.",
            email = session.Email,
            nome = session.NomeExibir,
            roles = session.Roles
        });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { error = "Email e palavra-passe são obrigatórios." });

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized(new { error = "Credenciais inválidas." });

        if (!user.EmailConfirmed)
            return Unauthorized(new { error = "Email não confirmado. Verifique a sua caixa de entrada e confirme o email para poder iniciar sessão." });

        var session = await _tokens.IssueSessionAsync(user.Id, cancellationToken);
        WriteRefreshCookie(session.RefreshTokenPlain);
        return Ok(new { token = session.AccessToken, expiresInSeconds = session.ExpiresInSeconds, email = session.Email, nome = session.NomeExibir, roles = session.Roles });
    }

    [HttpGet("me")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> Me(CancellationToken cancellationToken = default)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return Unauthorized();

        var roles = await _userManager.GetRolesAsync(user);
        var nome = await _accountInfo.GetNomeUtilizadorAsync(user.Id, cancellationToken);
        return Ok(new
        {
            id = user.Id,
            email = user.Email ?? user.UserName,
            userName = user.UserName,
            nome,
            roles,
            permissions = Finalproj.Authorization.PoliticasAutorizacao.ObterPermissoes(roles)
        });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _tokens.RefreshAsync(_refreshCookies.GetRefreshTokenFromCookie() ?? request.RefreshToken?.Trim(), cancellationToken);
        if (!result.Succeeded)
            return Unauthorized(new { error = result.Error });

        WriteRefreshCookie(result.RefreshTokenPlain!);
        return Ok(new { token = result.AccessToken, expiresInSeconds = result.ExpiresInSeconds });
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest request, CancellationToken cancellationToken = default)
    {
        var raw = _refreshCookies.GetRefreshTokenFromCookie() ?? request.RefreshToken?.Trim();
        if (string.IsNullOrWhiteSpace(raw))
        {
            ClearRefreshCookie();
            return Ok(new { message = "Nenhum refresh token enviado." });
        }

        await _tokens.RevokeRefreshTokenIfPresentAsync(raw, cancellationToken);
        ClearRefreshCookie();
        return Ok(new { message = "Sessão terminada." });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrWhiteSpace(request.Email?.Trim()))
            await _passwordReset.SendForgotPasswordEmailAsync(request.Email.Trim(), cancellationToken);
        return Ok(new { message = "Se o email existir no sistema, será enviado um link para redefinir a palavra-passe." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest(new { error = "Email, token e nova palavra-passe são obrigatórios." });

        var (ok, error, details) = await _passwordReset.ResetPasswordAsync(
            request.Email.Trim(), request.Token, request.NewPassword, request.ConfirmPassword, cancellationToken);
        if (!ok)
            return BadRequest(new { error, details });

        return Ok(new { message = "Palavra-passe atualizada com sucesso. Já pode iniciar sessão." });
    }

    [HttpGet("confirm-email")]
    [AllowAnonymous]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string code, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(code))
            return BadRequest(new { error = "Parâmetros inválidos." });

        var (ok, error, details, session) = await _emailConfirmation.ConfirmEmailAsync(userId, code, cancellationToken);
        if (!ok)
            return error == "Utilizador não encontrado."
                ? NotFound(new { error })
                : BadRequest(new { error, details });

        WriteRefreshCookie(session!.RefreshTokenPlain);
        return Ok(new
        {
            emailConfirmado = true,
            message = "Email confirmado com sucesso. Sessão iniciada.",
            token = session.AccessToken,
            expiresInSeconds = session.ExpiresInSeconds,
            email = session.Email,
            nome = session.NomeExibir,
            roles = session.Roles
        });
    }

    [HttpPost("resend-confirm-email")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ResendConfirmEmail([FromBody] ResendConfirmEmailRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email?.Trim();
        if (!string.IsNullOrWhiteSpace(email))
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user?.EmailConfirmed == true)
                return Ok(new { message = "Email já está confirmado. Já pode iniciar sessão." });
            await _emailConfirmation.SendConfirmationEmailAsync(email, cancellationToken);
        }

        return Ok(new { message = "Se o email existir no sistema, será reenviado um link de confirmação." });
    }

    private void WriteRefreshCookie(string refreshToken) =>
        _refreshCookies.SetRefreshToken(refreshToken, _tokens.RefreshTokenExpirationDays, _env.IsDevelopment(), Request.IsHttps);

    private void ClearRefreshCookie() =>
        _refreshCookies.ClearRefreshToken(_env.IsDevelopment(), Request.IsHttps);
}
