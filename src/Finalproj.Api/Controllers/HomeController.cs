using System.Diagnostics;
using Finalproj.Application.Common.Models;
using Finalproj.Application.DTOs;
using Finalproj.Application.Features.Home.DTOs;
using Finalproj.Application.Features.Home.Interfaces;
using Finalproj.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Finalproj.Controllers
{
    // Página inicial, perfil, preferências (tema), alterar password; LimparDados para desenvolvimento
    [Route("api/home")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class HomeController : ControllerBase
    {
        private readonly ILogger<HomeController> _logger;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly IHomeAnalyticsService _homeAnalytics;
        private readonly IDatabaseCleanupService _databaseCleanup;
        private readonly IWebHostEnvironment _env;
        private static readonly string[] RolesDisponiveis = ConstantesRoles.Todas;

        public HomeController(
            ILogger<HomeController> logger,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            SignInManager<IdentityUser> signInManager,
            IHomeAnalyticsService homeAnalytics,
            IDatabaseCleanupService databaseCleanup,
            IWebHostEnvironment env)
        {
            _logger = logger;
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _homeAnalytics = homeAnalytics;
            _databaseCleanup = databaseCleanup;
            _env = env;
        }

        // Página inicial (após login)
        [HttpGet]
        public IActionResult Index()
        {
            return Ok(new { message = (string?)null });
        }

        /// <summary>
        /// Estatísticas reais da base de dados: totais de clientes, serviços, produtos e paióis ativos.
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> Stats(CancellationToken cancellationToken = default)
        {
            return Ok(await _homeAnalytics.GetStatsAsync(cancellationToken));
        }

        /// <summary>
        /// Dashboard do Gestor/Admin: estatísticas alargadas, gráficos (encomendas por estado e por mês), alertas e atividade recente.
        /// Apenas roles Admin e Gestor.
        /// </summary>
        [HttpGet("gestor-dashboard")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = ConstantesRoles.Admin + "," + ConstantesRoles.Gestor)]
        public async Task<IActionResult> GestorDashboard(CancellationToken cancellationToken = default)
        {
            return Ok(await _homeAnalytics.GetGestorDashboardAsync(cancellationToken));
        }

        // Página de privacidade
        [HttpGet("privacy")]
        public IActionResult Privacy()
        {
            return Ok(new { message = "Política de privacidade." });
        }

        [AllowAnonymous]
        [HttpGet("error")]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            var isDev = _env.IsDevelopment();
            return Ok(new ErrorViewModel
            {
                RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier,
                IsDevelopment = isDev
            });
        }

        /// <summary>
        /// Confirmação para apagar todos os dados do site (contas e dados). Uso em desenvolvimento.
        /// </summary>
        [HttpGet("limpar-dados")]
        public IActionResult LimparDados()
        {
            return Ok(new { message = "Use POST api/home/limpar-dados para confirmar a limpeza de todos os dados. A sessão será terminada." });
        }

        [HttpPost("limpar-dados")]
        public async Task<IActionResult> LimparDadosConfirmar(CancellationToken cancellationToken = default)
        {
            foreach (var user in _userManager.Users.ToList())
                await _userManager.DeleteAsync(user);

            foreach (var role in _roleManager.Roles.ToList())
                await _roleManager.DeleteAsync(role);

            await _databaseCleanup.ClearApplicationDataAsync(cancellationToken);

            foreach (var roleName in RolesDisponiveis)
                await _roleManager.CreateAsync(new IdentityRole(roleName));

            await _signInManager.SignOutAsync();

            return Ok(new { signedOut = true, message = "Dados limpos. Faça login novamente." });
        }

        // Preferências: tema guardado por utilizador (Perfil.Tema) e em cookie
        [HttpGet("preferencias")]
        public async Task<IActionResult> Preferencias(CancellationToken cancellationToken = default)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user != null)
            {
                var temaPerfil = await _homeAnalytics.GetTemaAsync(user.Id, cancellationToken);
                if (!string.IsNullOrEmpty(temaPerfil))
                {
                    var opcoes = new CookieOptions { IsEssential = true, Expires = DateTimeOffset.UtcNow.AddYears(1) };
                    Response.Cookies.Append("Theme", temaPerfil, opcoes);
                    return Ok(new { tema = temaPerfil });
                }
            }
            var tema = Request.Cookies["Theme"] ?? "Light";
            return Ok(new { tema });
        }

        [HttpPost("preferencias")]
        public async Task<IActionResult> Preferencias([FromBody] PreferenciasDto? input, CancellationToken cancellationToken = default)
        {
            var tema = input?.Tema ?? "Light";
            if (tema != "Light" && tema != "Dark") tema = "Light";

            var user = await _userManager.GetUserAsync(User);
            if (user != null)
            {
                await _homeAnalytics.SaveTemaAsync(user.Id, tema, cancellationToken);
            }

            var opcoes = new CookieOptions { IsEssential = true, Expires = DateTimeOffset.UtcNow.AddYears(1) };
            Response.Cookies.Append("Theme", tema, opcoes);
            return Ok(new { temaGuardado = true, tema });
        }

        // Perfil: se tiver funcionário associado, edita dados da ficha do funcionário; senão usa tabela Perfil
        [HttpGet("perfil")]
        public async Task<IActionResult> Perfil(CancellationToken cancellationToken = default)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var rolesPerfil = await _userManager.GetRolesAsync(user);
            var modelPerfil = await _homeAnalytics.GetPerfilAsync(user.Id, user.UserName ?? user.Email ?? "", user.Email ?? "", rolesPerfil.ToList(), cancellationToken);
            return Ok(new { model = modelPerfil, alterarPasswordViewModel = new AlterarPasswordViewModel() });
        }

        [HttpPut("perfil")]
        public async Task<IActionResult> Perfil([FromBody] PerfilEditViewModel model, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            if (ModelState.IsValid)
            {
                await _homeAnalytics.SavePerfilAsync(user.Id, model.Nome, model.Telefone, cancellationToken);

                return Ok(new { model, perfilGuardado = true });
            }

            model.UserName = user.UserName ?? user.Email ?? "";
            model.Email = user.Email ?? "";
            var roles = await _userManager.GetRolesAsync(user);
            model.Roles = roles.ToList();
            model = await _homeAnalytics.GetPerfilAsync(user.Id, user.UserName ?? user.Email ?? "", user.Email ?? "", roles.ToList(), cancellationToken);

            return BadRequest(new { model, alterarPasswordViewModel = new AlterarPasswordViewModel(), errors = ModelState });
        }

        // Alterar palavra-passe (Identity) a partir do perfil
        [HttpPost("alterar-password")]
        public async Task<IActionResult> AlterarPassword([FromBody] AlterarPasswordViewModel model, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            if (ModelState.IsValid)
            {
                var result = await _userManager.ChangePasswordAsync(user, model.PasswordAtual, model.NovaPassword);
                if (result.Succeeded)
                {
                    await _signInManager.SignInAsync(user, isPersistent: false);
                    return Ok(new { passwordAlterada = true });
                }
                foreach (var error in result.Errors)
                    ModelState.AddModelError(string.Empty, error.Description);
            }

            var perfilModel = await ObterPerfilEditViewModelAsync(user, cancellationToken);
            return BadRequest(new { perfilModel, alterarPasswordViewModel = model, errors = ModelState });
        }

        private async Task<PerfilEditViewModel> ObterPerfilEditViewModelAsync(IdentityUser user, CancellationToken cancellationToken = default)
        {
            var rolesPerfil = await _userManager.GetRolesAsync(user);
            return await _homeAnalytics.GetPerfilAsync(user.Id, user.UserName ?? user.Email ?? "", user.Email ?? "", rolesPerfil.ToList(), cancellationToken);
        }
    }
}
