using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Finalproj.Data;
using Finalproj.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Finalproj.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly FinalprojContext _context;

        public AuthController(UserManager<IdentityUser> userManager, IConfiguration configuration, FinalprojContext context)
        {
            _userManager = userManager;
            _configuration = configuration;
            _context = context;
        }

        private static string HashRefreshToken(string token)
        {
            var bytes = Encoding.UTF8.GetBytes(token);
            var hash = SHA256.HashData(bytes);
            return Convert.ToBase64String(hash);
        }

        private async Task<string> CriarERegistarRefreshTokenAsync(string userId, CancellationToken cancellationToken)
        {
            var plainToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            var hash = HashRefreshToken(plainToken);
            var days = _configuration.GetValue<int>("Jwt:RefreshTokenExpirationDays", 7);
            var entity = new RefreshToken
            {
                UserId = userId,
                TokenHash = hash,
                ExpiresAtUtc = DateTime.UtcNow.AddDays(days),
                CreatedAtUtc = DateTime.UtcNow
            };
            _context.RefreshTokens.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
            return plainToken;
        }

        /// <summary>
        /// Indica se existem utilizadores no sistema (para mostrar mensagem "Crie o primeiro utilizador").
        /// </summary>
        [HttpGet("existem-utilizadores")]
        [AllowAnonymous]
        public async Task<IActionResult> ExistemUtilizadores(CancellationToken cancellationToken = default)
        {
            var existem = await _userManager.Users.AnyAsync(cancellationToken);
            return Ok(new { existem });
        }

        /// <summary>
        /// Regista o primeiro utilizador (apenas quando não existem contas). Atribui role Admin.
        /// </summary>
        [HttpPost("registar-primeiro-utilizador")]
        [AllowAnonymous]
        public async Task<IActionResult> RegistarPrimeiroUtilizador([FromBody] RegistarPrimeiroRequest request, CancellationToken cancellationToken = default)
        {
            if (await _userManager.Users.AnyAsync(cancellationToken))
                return BadRequest(new { error = "Já existem utilizadores no sistema. Utilize o início de sessão." });

            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { error = "Email e palavra-passe são obrigatórios." });

            if (request.Password.Length < 6)
                return BadRequest(new { error = "A palavra-passe deve ter pelo menos 6 caracteres." });

            var email = request.Email.Trim();
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
            return Ok(new { token, refreshToken, message = "Primeiro utilizador criado com sucesso.", email, nome, roles });
        }

        [HttpPost("login")]
        [AllowAnonymous]
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

            var roles = await _userManager.GetRolesAsync(user);
            var nome = await ObterNomeUtilizadorAsync(user.Id, cancellationToken);

            var token = GerarToken(user.Id, user.Email ?? user.UserName ?? "", nome, roles);
            var refreshToken = await CriarERegistarRefreshTokenAsync(user.Id, cancellationToken);
            var email = user.Email ?? user.UserName ?? "";
            var nomeExibir = !string.IsNullOrEmpty(nome) ? nome : email;
            var expirationMinutes = _configuration.GetValue<int>("Jwt:ExpirationMinutes", 60);
            return Ok(new { token, refreshToken, expiresInSeconds = expirationMinutes * 60, email = email, nome = nomeExibir, roles });
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
        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequest request, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
                return Unauthorized(new { error = "Refresh token em falta." });

            var hash = HashRefreshToken(request.RefreshToken.Trim());
            var entity = await _context.RefreshTokens
                .FirstOrDefaultAsync(r => r.TokenHash == hash && r.RevokedAtUtc == null && r.ExpiresAtUtc > DateTime.UtcNow, cancellationToken);
            if (entity == null)
                return Unauthorized(new { error = "Refresh token inválido ou expirado." });

            var user = await _userManager.FindByIdAsync(entity.UserId);
            if (user == null)
            {
                entity.RevokedAtUtc = DateTime.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);
                return Unauthorized(new { error = "Utilizador não encontrado." });
            }

            entity.RevokedAtUtc = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);

            var roles = await _userManager.GetRolesAsync(user);
            var nome = await ObterNomeUtilizadorAsync(user.Id, cancellationToken);
            var token = GerarToken(user.Id, user.Email ?? user.UserName ?? "", nome, roles);
            var newRefreshToken = await CriarERegistarRefreshTokenAsync(user.Id, cancellationToken);
            var expirationMinutes = _configuration.GetValue<int>("Jwt:ExpirationMinutes", 60);
            return Ok(new { token, refreshToken = newRefreshToken, expiresInSeconds = expirationMinutes * 60 });
        }

        /// <summary>
        /// Revoga o refresh token (logout no servidor). Opcional; o cliente deve limpar os tokens locais.
        /// </summary>
        [HttpPost("logout")]
        [AllowAnonymous]
        public async Task<IActionResult> Logout([FromBody] RefreshRequest request, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
                return Ok(new { message = "Nenhum refresh token enviado." });

            var hash = HashRefreshToken(request.RefreshToken.Trim());
            var entity = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.TokenHash == hash && r.RevokedAtUtc == null, cancellationToken);
            if (entity != null)
            {
                entity.RevokedAtUtc = DateTime.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);
            }
            return Ok(new { message = "Sessão terminada." });
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

            var result = await _userManager.ConfirmEmailAsync(user, code);
            if (!result.Succeeded)
                return BadRequest(new { error = "Não foi possível confirmar o email.", details = result.Errors.Select(e => e.Description).ToList() });

            return Ok(new { emailConfirmado = true, message = "Email confirmado com sucesso. Já pode iniciar sessão." });
        }

        private async Task<string> ObterNomeUtilizadorAsync(string userId, CancellationToken cancellationToken)
        {
            var funcionario = await _context.Funcionarios
                .AsNoTracking()
                .Where(f => f.UserId == userId)
                .Select(f => f.NomeCompleto)
                .FirstOrDefaultAsync(cancellationToken);
            if (!string.IsNullOrEmpty(funcionario))
                return funcionario;
            var perfil = await _context.Perfis
                .AsNoTracking()
                .Where(p => p.UserId == userId)
                .Select(p => p.Nome)
                .FirstOrDefaultAsync(cancellationToken);
            return perfil ?? "";
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
}
