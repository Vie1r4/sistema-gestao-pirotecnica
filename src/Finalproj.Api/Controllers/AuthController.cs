using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Finalproj.Application.DTOs;
using Finalproj.Application.Features.Auth.Interfaces;
using Finalproj.Application.Services;
using Finalproj.Application.Services.Interfaces;
using Finalproj.Infrastructure.Configuration;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;

namespace Finalproj.Controllers
{
    /// <summary>Autenticação JWT, refresh em cookie HttpOnly, registo do primeiro administrador e recuperação de palavra-passe.</summary>
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private const string RefreshTokenCookieName = "pirofafe_rt";
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailSender _emailSender;
        private readonly IAuthAccountInfoService _accountInfo;
        private readonly IIdentityUserLookupService _identityUsers;
        private readonly IPasswordValidationService _passwordValidation;
        private readonly BootstrapOptions _bootstrap;
        private readonly IWebHostEnvironment _env;

        public AuthController(
            UserManager<IdentityUser> userManager,
            IConfiguration configuration,
            IEmailSender emailSender,
            IAuthAccountInfoService accountInfo,
            IIdentityUserLookupService identityUsers,
            IPasswordValidationService passwordValidation,
            IOptions<BootstrapOptions> bootstrapOptions,
            IWebHostEnvironment env)
        {
            _userManager = userManager;
            _configuration = configuration;
            _emailSender = emailSender;
            _accountInfo = accountInfo;
            _identityUsers = identityUsers;
            _passwordValidation = passwordValidation;
            _bootstrap = bootstrapOptions.Value;
            _env = env;
        }

        private static string HashRefreshToken(string token)
        {
            var bytes = Encoding.UTF8.GetBytes(token);
            var hash = SHA256.HashData(bytes);
            return Convert.ToBase64String(hash);
        }

        private CookieOptions BuildRefreshCookieOptions(DateTimeOffset? expires = null)
        {
            var crossOriginDev = _env.IsDevelopment();
            return new CookieOptions
            {
                HttpOnly = true,
                Secure = crossOriginDev || Request.IsHttps,
                SameSite = crossOriginDev ? SameSiteMode.None : SameSiteMode.Lax,
                Path = "/api/auth",
                Expires = expires
            };
        }

        private void SetRefreshTokenCookie(string refreshToken, int days)
        {
            var options = BuildRefreshCookieOptions(DateTimeOffset.UtcNow.AddDays(Math.Max(days, 1)));
            Response.Cookies.Append(RefreshTokenCookieName, refreshToken, options);
        }

        private void ClearRefreshTokenCookie()
        {
            Response.Cookies.Delete(RefreshTokenCookieName, BuildRefreshCookieOptions());
        }

        private string? GetRefreshTokenFromCookie()
        {
            if (Request.Cookies.TryGetValue(RefreshTokenCookieName, out var value) && !string.IsNullOrWhiteSpace(value))
                return value;
            return null;
        }

        private async Task<string> CriarERegistarRefreshTokenAsync(string userId, CancellationToken cancellationToken)
        {
            var days = _configuration.GetValue<int>("Jwt:RefreshTokenExpirationDays", 7);
            return await _accountInfo.CreateRefreshTokenAsync(userId, days, HashRefreshToken, cancellationToken);
        }

        /// <summary>
        /// Indica se o registo do primeiro administrador está disponível (bootstrap).
        /// Não expõe se já existem contas — resposta idêntica quando o bootstrap está desativado ou já há utilizadores.
        /// </summary>
        [HttpGet("existem-utilizadores")]
        [AllowAnonymous]
        [EnableRateLimiting("bootstrap")]
        public async Task<IActionResult> ExistemUtilizadores(CancellationToken cancellationToken = default)
        {
            if (!_bootstrap.AllowFirstUserRegistration)
                return Ok(new { primeiroRegistoDisponivel = false });

            var existem = await _identityUsers.AnyUsersAsync(cancellationToken);
            return Ok(new { primeiroRegistoDisponivel = !existem });
        }

        /// <summary>
        /// Regista o primeiro utilizador (apenas quando não existem contas). Atribui role Admin.
        /// </summary>
        [HttpPost("registar-primeiro-utilizador")]
        [AllowAnonymous]
        [EnableRateLimiting("bootstrap")]
        public async Task<IActionResult> RegistarPrimeiroUtilizador([FromBody] RegistarPrimeiroRequest request, CancellationToken cancellationToken = default)
        {
            if (!_bootstrap.AllowFirstUserRegistration)
                return NotFound();

            if (await _identityUsers.AnyUsersAsync(cancellationToken))
                return BadRequest(new { error = "Já existem utilizadores no sistema. Utilize o início de sessão." });

            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { error = "Email e palavra-passe são obrigatórios." });

            var email = request.Email.Trim();
            var passwordErrors = await _passwordValidation.ValidateAsync(request.Password, email, email, cancellationToken);
            if (passwordErrors.Count > 0)
                return BadRequest(new { error = "A palavra-passe não cumpre os requisitos.", details = passwordErrors.ToList() });

            var user = new IdentityUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true
            };
            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                return BadRequest(new { error = result.Errors.FirstOrDefault()?.Description ?? "Não foi possível criar a conta." });

            await _userManager.AddToRoleAsync(user, "Admin");
            var roles = await _userManager.GetRolesAsync(user);
            var nome = request.Nome?.Trim() ?? email;
            var token = GerarToken(user.Id!, user.Email ?? user.UserName ?? "", nome, roles);
            var refreshToken = await CriarERegistarRefreshTokenAsync(user.Id!, cancellationToken);
            var refreshDays = _configuration.GetValue<int>("Jwt:RefreshTokenExpirationDays", 7);
            SetRefreshTokenCookie(refreshToken, refreshDays);
            return Ok(new { token, message = "Primeiro utilizador criado com sucesso.", email, nome, roles });
        }

        /// <summary>Autentica um utilizador. O refresh token é emitido em cookie HttpOnly; o access token deve ficar em memória no cliente.</summary>
        /// <response code="200">JWT e dados do utilizador</response>
        /// <response code="401">Credenciais inválidas ou email não confirmado</response>
        [HttpPost("login")]
        [AllowAnonymous]
        [EnableRateLimiting("auth")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { error = "Email e palavra-passe são obrigatórios." });

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return Unauthorized(new { error = "Credenciais inválidas." });

            var valid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!valid)
                return Unauthorized(new { error = "Credenciais inválidas." });

            if (!user.EmailConfirmed)
                return Unauthorized(new { error = "Email não confirmado. Verifique a sua caixa de entrada e confirme o email para poder iniciar sessão." });

            var roles = await _userManager.GetRolesAsync(user);
            var nome = await ObterNomeUtilizadorAsync(user.Id, cancellationToken);

            var token = GerarToken(user.Id, user.Email ?? user.UserName ?? "", nome, roles);
            var refreshToken = await CriarERegistarRefreshTokenAsync(user.Id, cancellationToken);
            var email = user.Email ?? user.UserName ?? "";
            var nomeExibir = !string.IsNullOrEmpty(nome) ? nome : email;
            var expirationMinutes = _configuration.GetValue<int>("Jwt:ExpirationMinutes", 60);
            var refreshDays = _configuration.GetValue<int>("Jwt:RefreshTokenExpirationDays", 7);
            SetRefreshTokenCookie(refreshToken, refreshDays);
            return Ok(new { token, expiresInSeconds = expirationMinutes * 60, email = email, nome = nomeExibir, roles });
        }

        /// <summary>
        /// Devolve o perfil do utilizador autenticado (roles e permissões derivadas das políticas de autorização).
        /// </summary>
        /// <response code="200">Perfil com roles e permissões</response>
        /// <response code="401">Token em falta ou inválido</response>
        [HttpGet("me")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Me(CancellationToken cancellationToken = default)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();

            var roles = await _userManager.GetRolesAsync(user);
            var nome = await ObterNomeUtilizadorAsync(user.Id, cancellationToken);
            var permissions = Finalproj.Authorization.PoliticasAutorizacao.ObterPermissoes(roles);

            return Ok(new
            {
                id = user.Id,
                email = user.Email ?? user.UserName,
                userName = user.UserName,
                nome,
                roles,
                permissions
            });
        }

        /// <summary>
        /// Renova o access token usando um refresh token válido. Rotação: o refresh token usado fica revogado e é devolvido um novo.
        /// </summary>
        /// <response code="200">Novo JWT</response>
        /// <response code="401">Refresh inválido, expirado ou já utilizado</response>
        [HttpPost("refresh")]
        [AllowAnonymous]
        [EnableRateLimiting("auth")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequest request, CancellationToken cancellationToken = default)
        {
            var rawRefreshToken = GetRefreshTokenFromCookie() ?? request.RefreshToken?.Trim();
            if (string.IsNullOrWhiteSpace(rawRefreshToken))
                return Unauthorized(new { error = "Refresh token em falta." });

            var hash = HashRefreshToken(rawRefreshToken);
            var entity = await _accountInfo.GetActiveRefreshTokenAsync(hash, cancellationToken);
            if (entity == null)
                return Unauthorized(new { error = "Refresh token inválido ou expirado." });

            var user = await _userManager.FindByIdAsync(entity.UserId);
            if (user == null)
            {
                await _accountInfo.RevokeRefreshTokenAsync(entity, cancellationToken);
                return Unauthorized(new { error = "Utilizador não encontrado." });
            }

            await _accountInfo.RevokeRefreshTokenAsync(entity, cancellationToken);

            var roles = await _userManager.GetRolesAsync(user);
            var nome = await ObterNomeUtilizadorAsync(user.Id, cancellationToken);
            var token = GerarToken(user.Id, user.Email ?? user.UserName ?? "", nome, roles);
            var newRefreshToken = await CriarERegistarRefreshTokenAsync(user.Id, cancellationToken);
            var expirationMinutes = _configuration.GetValue<int>("Jwt:ExpirationMinutes", 60);
            var refreshDays = _configuration.GetValue<int>("Jwt:RefreshTokenExpirationDays", 7);
            SetRefreshTokenCookie(newRefreshToken, refreshDays);
            return Ok(new { token, expiresInSeconds = expirationMinutes * 60 });
        }

        /// <summary>
        /// Revoga o refresh token (logout no servidor). Opcional; o cliente deve limpar os tokens locais.
        /// </summary>
        /// <response code="200">Sessão revogada no servidor</response>
        [HttpPost("logout")]
        [AllowAnonymous]
        [EnableRateLimiting("auth")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Logout([FromBody] RefreshRequest request, CancellationToken cancellationToken = default)
        {
            var rawRefreshToken = GetRefreshTokenFromCookie() ?? request.RefreshToken?.Trim();
            if (string.IsNullOrWhiteSpace(rawRefreshToken))
            {
                ClearRefreshTokenCookie();
                return Ok(new { message = "Nenhum refresh token enviado." });
            }

            var hash = HashRefreshToken(rawRefreshToken);
            var entity = await _accountInfo.GetActiveRefreshTokenAsync(hash, cancellationToken);
            if (entity != null)
                await _accountInfo.RevokeRefreshTokenAsync(entity, cancellationToken);
            ClearRefreshTokenCookie();
            return Ok(new { message = "Sessão terminada." });
        }

        /// <summary>
        /// Inicia o fluxo "Esqueci-me da palavra-passe": se o utilizador existir, envia email com link de reset.
        /// Por segurança, responde sempre 200 (não revela se o email existe).
        /// </summary>
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var email = request.Email?.Trim();
            if (string.IsNullOrWhiteSpace(email))
                return Ok(new { message = "Se o email existir no sistema, será enviado um link para redefinir a palavra-passe." });

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return Ok(new { message = "Se o email existir no sistema, será enviado um link para redefinir a palavra-passe." });

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var baseUrl = _configuration["Frontend:BaseUrl"]?.Trim();
            if (string.IsNullOrWhiteSpace(baseUrl))
                baseUrl = "http://localhost:3000";
            baseUrl = baseUrl.TrimEnd('/');

            var link =
                $"{baseUrl}/reset-password?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(encoded)}";

            var subject = "PIROFAFE — Redefinir palavra-passe";
            var safeLinkText = System.Net.WebUtility.HtmlEncode(link);
            var html =
                $"""
                <!doctype html>
                <html lang="pt">
                  <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta name="color-scheme" content="light dark" />
                    <meta name="supported-color-schemes" content="light dark" />
                    <title>PIROFAFE — Redefinir palavra-passe</title>
                  </head>
                  <body style="margin:0;padding:0;background:#f8f7f5;">
                    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
                      Link para redefinir a sua palavra-passe no PIROFAFE.
                    </div>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f5;padding:28px 14px;">
                      <tr>
                        <td align="center">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
                            <tr>
                              <td style="padding:0 0 14px 0;text-align:center;">
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-weight:800; letter-spacing:-0.02em; font-size:18px; color:#ea580c;">
                                  PIROFAFE
                                </div>
                              </td>
                            </tr>

                            <tr>
                              <td style="background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;padding:22px 22px 18px 22px;">
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:22px; line-height:1.25; font-weight:800; letter-spacing:-0.02em; color:#111827;">
                                  Redefinir palavra-passe
                                </div>
                                <div style="height:10px;"></div>
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:14px; line-height:1.55; color:#374151;">
                                  Recebemos um pedido para redefinir a sua palavra-passe. Para escolher uma nova palavra-passe, carregue no botão abaixo.
                                </div>

                                <div style="height:18px;"></div>

                                <table role="presentation" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="background:#f97316;border-radius:14px;">
                                      <a href="{link}" style="display:inline-block;padding:12px 16px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:14px; font-weight:700; color:#111827; text-decoration:none;">
                                        Definir nova palavra-passe
                                      </a>
                                    </td>
                                  </tr>
                                </table>

                                <div style="height:14px;"></div>

                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:12px; line-height:1.55; color:#6b7280;">
                                  Se o botão não funcionar, copie e cole este link no browser:<br />
                                  <a href="{link}" style="color:#ea580c;text-decoration:underline;word-break:break-all;">{safeLinkText}</a>
                                </div>

                                <div style="height:18px;"></div>

                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:12px; line-height:1.55; color:#6b7280;">
                                  Se não foi você que pediu esta alteração, pode ignorar este email.
                                </div>
                              </td>
                            </tr>

                            <tr>
                              <td style="padding:14px 4px 0 4px;text-align:center;">
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:11px; line-height:1.5; color:#9ca3af;">
                                  Este email foi enviado automaticamente. Não responda a esta mensagem.
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """;

            await _emailSender.SendEmailAsync(email, subject, html);
            return Ok(new { message = "Se o email existir no sistema, será enviado um link para redefinir a palavra-passe." });
        }

        /// <summary>
        /// Conclui o reset da palavra-passe com token enviado por email.
        /// </summary>
        [HttpPost("reset-password")]
        [AllowAnonymous]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken = default)
        {
            var email = request.Email?.Trim();
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest(new { error = "Email, token e nova palavra-passe são obrigatórios." });

            if (!string.IsNullOrWhiteSpace(request.ConfirmPassword) && request.NewPassword != request.ConfirmPassword)
                return BadRequest(new { error = "A palavra-passe e a confirmação não coincidem." });

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return BadRequest(new { error = "Pedido inválido." });

            var passwordErrors = await _passwordValidation.ValidateAsync(request.NewPassword, user.UserName, user.Email, cancellationToken);
            if (passwordErrors.Count > 0)
                return BadRequest(new { error = "A palavra-passe não cumpre os requisitos.", details = passwordErrors.ToList() });

            string decodedToken;
            try
            {
                decodedToken = PasswordResetTokenDecoder.Decode(request.Token);
            }
            catch (FormatException)
            {
                return BadRequest(new { error = "Token inválido ou expirado. Peça um novo link em «Esqueci-me da palavra-passe»." });
            }

            var result = await _userManager.ResetPasswordAsync(user, decodedToken, request.NewPassword);
            if (!result.Succeeded)
            {
                var details = result.Errors.Select(e => e.Description).ToList();
                var invalidToken = details.Any(d =>
                    d.Contains("Invalid token", StringComparison.OrdinalIgnoreCase)
                    || d.Contains("inválido", StringComparison.OrdinalIgnoreCase));
                return BadRequest(new
                {
                    error = invalidToken
                        ? "Token inválido ou expirado. Peça um novo link em «Esqueci-me da palavra-passe»."
                        : "Não foi possível redefinir a palavra-passe.",
                    details
                });
            }

            // Quem conclui o reset provou acesso ao email — desbloqueia login se a conta ainda não estava confirmada.
            if (!user.EmailConfirmed)
            {
                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);
            }

            return Ok(new { message = "Palavra-passe atualizada com sucesso. Já pode iniciar sessão." });
        }

        /// <summary>
        /// Confirma o email de um utilizador Identity usando o token gerado pelo UserManager.
        /// API-only (substitui a página /Identity/Account/ConfirmEmail).
        /// </summary>
        [HttpGet("confirm-email")]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string code)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(code))
                return BadRequest(new { error = "Parâmetros inválidos." });

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { error = "Utilizador não encontrado." });

            string decodedCode;
            try
            {
                var bytes = WebEncoders.Base64UrlDecode(code.Trim());
                decodedCode = Encoding.UTF8.GetString(bytes);
            }
            catch
            {
                // Compatibilidade: links antigos podem enviar o token cru (sem Base64Url).
                decodedCode = code;
            }

            // Validar o token (mesmo se já estiver confirmado) para evitar login só com userId.
            var provider = _userManager.Options.Tokens.EmailConfirmationTokenProvider;
            var okToken = await _userManager.VerifyUserTokenAsync(user, provider, "EmailConfirmation", decodedCode);
            if (!okToken)
                return BadRequest(new { error = "Link inválido ou expirado. Peça um novo email de confirmação." });

            if (!user.EmailConfirmed)
            {
                var result = await _userManager.ConfirmEmailAsync(user, decodedCode);
                if (!result.Succeeded)
                    return BadRequest(new { error = "Não foi possível confirmar o email.", details = result.Errors.Select(e => e.Description).ToList() });
            }

            // Autenticar imediatamente: devolver JWT e escrever refresh token em cookie HttpOnly.
            var roles = await _userManager.GetRolesAsync(user);
            var nome = await ObterNomeUtilizadorAsync(user.Id, cancellationToken: default);
            var token = GerarToken(user.Id, user.Email ?? user.UserName ?? "", nome, roles);
            var refreshToken = await CriarERegistarRefreshTokenAsync(user.Id, cancellationToken: default);
            var refreshDays = _configuration.GetValue<int>("Jwt:RefreshTokenExpirationDays", 7);
            SetRefreshTokenCookie(refreshToken, refreshDays);
            var expirationMinutes = _configuration.GetValue<int>("Jwt:ExpirationMinutes", 60);
            var email = user.Email ?? user.UserName ?? "";
            var nomeExibir = !string.IsNullOrEmpty(nome) ? nome : email;

            return Ok(new
            {
                emailConfirmado = true,
                message = "Email confirmado com sucesso. Sessão iniciada.",
                token,
                expiresInSeconds = expirationMinutes * 60,
                email,
                nome = nomeExibir,
                roles
            });
        }

        /// <summary>
        /// Reenvia o email de confirmação (responde sempre 200 por segurança).
        /// Útil quando o link inicial foi corrompido por encoding do token.
        /// </summary>
        [HttpPost("resend-confirm-email")]
        [AllowAnonymous]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ResendConfirmEmail([FromBody] ResendConfirmEmailRequest request)
        {
            var email = request.Email?.Trim();
            if (string.IsNullOrWhiteSpace(email))
                return Ok(new { message = "Se o email existir no sistema, será reenviado um link de confirmação." });

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return Ok(new { message = "Se o email existir no sistema, será reenviado um link de confirmação." });

            if (user.EmailConfirmed)
                return Ok(new { message = "Email já está confirmado. Já pode iniciar sessão." });

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var baseUrl = _configuration["Frontend:BaseUrl"]?.Trim();
            if (string.IsNullOrWhiteSpace(baseUrl))
                baseUrl = "http://localhost:3000";
            baseUrl = baseUrl.TrimEnd('/');

            var confirmUrl =
                $"{baseUrl}/confirm-email?userId={Uri.EscapeDataString(user.Id)}&code={Uri.EscapeDataString(encoded)}";

            var subject = "PIROFAFE — Confirme o seu email";
            var safeUrl = System.Net.WebUtility.HtmlEncode(confirmUrl);
            var html =
                $"""
                <!doctype html>
                <html lang="pt">
                  <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>PIROFAFE — Confirmar email</title>
                  </head>
                  <body style="margin:0;padding:0;background:#f8f7f5;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f5;padding:28px 14px;">
                      <tr>
                        <td align="center">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
                            <tr>
                              <td style="padding:0 0 14px 0;text-align:center;">
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-weight:800; letter-spacing:-0.02em; font-size:18px; color:#ea580c;">
                                  PIROFAFE
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td style="background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;padding:22px 22px 18px 22px;">
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:22px; line-height:1.25; font-weight:800; letter-spacing:-0.02em; color:#111827;">
                                  Confirmar email
                                </div>
                                <div style="height:10px;"></div>
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:14px; line-height:1.55; color:#374151;">
                                  Para ativar a sua conta, confirme o seu email através do botão abaixo.
                                </div>
                                <div style="height:18px;"></div>
                                <table role="presentation" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="background:#f97316;border-radius:14px;">
                                      <a href="{confirmUrl}" style="display:inline-block;padding:12px 16px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:14px; font-weight:700; color:#111827; text-decoration:none;">
                                        Confirmar email
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                                <div style="height:14px;"></div>
                                <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:12px; line-height:1.55; color:#6b7280;">
                                  Se o botão não funcionar, copie e cole este link no browser:<br />
                                  <a href="{confirmUrl}" style="color:#ea580c;text-decoration:underline;word-break:break-all;">{safeUrl}</a>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """;

            await _emailSender.SendEmailAsync(email, subject, html);
            return Ok(new { message = "Se o email existir no sistema, será reenviado um link de confirmação." });
        }

        private async Task<string> ObterNomeUtilizadorAsync(string userId, CancellationToken cancellationToken)
        {
            return await _accountInfo.GetNomeUtilizadorAsync(userId, cancellationToken);
        }

        private string GerarToken(string userId, string email, string nome, IList<string> roles)
        {
            var secret = _configuration["Jwt:Secret"] ?? "";
            var issuer = _configuration["Jwt:Issuer"] ?? "";
            var audience = _configuration["Jwt:Audience"] ?? "";
            var expirationMinutes = _configuration.GetValue<int>("Jwt:ExpirationMinutes", 60);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, userId),
                new(ClaimTypes.Email, email ?? ""),
                new("nome", nome ?? "")
            };
            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    public class RegistarPrimeiroRequest
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? Nome { get; set; }
    }

    public class RefreshRequest
    {
        public string? RefreshToken { get; set; }
    }

    public class ForgotPasswordRequest
    {
        public string? Email { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string? Email { get; set; }
        public string? Token { get; set; }
        public string? NewPassword { get; set; }
        public string? ConfirmPassword { get; set; }
    }

    public class ResendConfirmEmailRequest
    {
        public string? Email { get; set; }
    }
}
