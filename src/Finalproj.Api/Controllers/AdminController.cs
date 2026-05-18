using Finalproj.Authorization;
using Finalproj.Application.DTOs;
using Finalproj.Application.Features.Admin.Interfaces;
using Finalproj.Application.Services.Interfaces;
using Finalproj.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Finalproj.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = PoliticasAutorizacao.PodeAcederAdmin)]
    [EnableRateLimiting("admin")]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IDatabaseBackupService _databaseBackupService;
        private readonly IAdminStatsService _adminStats;
        private readonly IDatabaseCleanupService _databaseCleanup;
        private readonly IWebHostEnvironment _env;
        private static readonly string[] RolesDisponiveis = ConstantesRoles.Todas;

        public AdminController(
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IDatabaseBackupService databaseBackupService,
            IAdminStatsService adminStats,
            IDatabaseCleanupService databaseCleanup,
            IWebHostEnvironment env)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _databaseBackupService = databaseBackupService;
            _adminStats = adminStats;
            _databaseCleanup = databaseCleanup;
            _env = env;
        }

        // Dashboard Admin
        [HttpGet]
        public IActionResult Index()
        {
            return Ok(new { message = "Área Admin. Use GET api/admin/utilizadores para listar utilizadores." });
        }

        /// <summary>
        /// Estatísticas para o dashboard admin: totais de utilizadores, encomendas, serviços, clientes, etc.
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> Stats(CancellationToken cancellationToken = default)
        {
            var totalUtilizadores = _userManager.Users.Count();
            return Ok(await _adminStats.GetStatsAsync(totalUtilizadores, cancellationToken));
        }

        /// <summary>
        /// Logs do sistema (auditoria) com paginação e filtro opcional por ação.
        /// </summary>
        [HttpGet("logs")]
        public async Task<IActionResult> Logs(string? acao, int pagina = 1, int itensPorPagina = 50, CancellationToken cancellationToken = default)
        {
            if (pagina < 1) pagina = 1;
            if (itensPorPagina < 10 || itensPorPagina > 200) itensPorPagina = 50;
            return Ok(await _adminStats.GetLogsAsync(acao, pagina, itensPorPagina, cancellationToken));
        }

        // Lista de utilizadores com roles e nome do funcionário associado (se houver)
        [HttpGet("utilizadores")]
        public async Task<IActionResult> Utilizadores(CancellationToken cancellationToken = default)
        {
            var utilizadores = new List<UtilizadorComRolesViewModel>();
            var funcionariosPorUserId = await _adminStats.GetFuncionariosPorUserIdAsync(cancellationToken);
            foreach (var user in _userManager.Users.OrderBy(u => u.UserName))
            {
                var roles = await _userManager.GetRolesAsync(user);
                utilizadores.Add(new UtilizadorComRolesViewModel
                {
                    Id = user.Id ?? "",
                    UserName = user.UserName ?? "",
                    Email = user.Email ?? "",
                    Roles = roles,
                    FuncionarioAssociadoNome = user.Id != null && funcionariosPorUserId.TryGetValue(user.Id, out var nome) ? nome : null
                });
            }
            return Ok(utilizadores);
        }

        // GET: formulário editar roles e funcionário associado
        [HttpGet("utilizadores/{id}")]
        public async Task<IActionResult> EditarUtilizador(string id, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(id)) return NotFound();
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();
            var userRoles = await _userManager.GetRolesAsync(user);

            var funcionariosDisponiveis = await _adminStats.GetFuncionariosDisponiveisAsync(user.Id, cancellationToken);
            var funcionarioAtualId = await _adminStats.GetFuncionarioIdByUserIdAsync(user.Id, cancellationToken);

            var model = new EditarUtilizadorRolesViewModel
            {
                Id = user.Id,
                UserName = user.UserName ?? "",
                Email = user.Email ?? "",
                FuncionarioId = funcionarioAtualId,
                Roles = RolesDisponiveis.Select(r => new RoleItemViewModel { Nome = r, Atribuido = userRoles.Contains(r) }).ToList()
            };
            return Ok(new { model, funcionariosDisponiveis });
        }

        [HttpPut("utilizadores/{id}")]
        // Grava roles e associação utilizador-funcionário
        public async Task<IActionResult> EditarUtilizador(string id, [FromBody] EditarUtilizadorRolesViewModel model, CancellationToken cancellationToken = default)
        {
            if (id != model.Id) return NotFound();
            var user = await _userManager.FindByIdAsync(model.Id);
            if (user == null) return NotFound();

            var rolesAtuais = await _userManager.GetRolesAsync(user);
            foreach (var role in RolesDisponiveis)
            {
                var deveTer = model.Roles?.Any(r => r.Nome == role && r.Atribuido) ?? false;
                if (deveTer && !rolesAtuais.Contains(role))
                    await _userManager.AddToRoleAsync(user, role);
                else if (!deveTer && rolesAtuais.Contains(role))
                    await _userManager.RemoveFromRoleAsync(user, role);
            }

            await _adminStats.AssociarFuncionarioAUtilizadorAsync(user.Id, model.FuncionarioId, cancellationToken);

            return Ok(new { model, success = true });
        }

        [HttpDelete("utilizadores/{id}")]
        // Apaga conta Identity; desassocia de funcionários e clientes primeiro
        public async Task<IActionResult> EliminarUtilizador(string id, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(id)) return NotFound();

            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            var currentUserId = _userManager.GetUserId(User);
            if (currentUserId == id)
                return BadRequest(new { error = "Não pode eliminar a sua própria conta de administrador." });

            await _adminStats.DesassociarUtilizadorAsync(id, cancellationToken);

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return BadRequest(new { error = "Não foi possível eliminar o utilizador." });

            return NoContent();
        }

        /// <summary>
        /// Limpa todos os dados da base de dados e todas as contas (apenas para testes).
        /// Requer role Admin. Após a chamada, a base fica vazia.
        /// </summary>
        [HttpPost("clear-all-data")]
        public async Task<IActionResult> ClearAllData(CancellationToken cancellationToken = default)
        {
            if (!_env.IsDevelopment())
                return NotFound();

            await _databaseCleanup.ClearApplicationDataAsync(cancellationToken);

            var users = _userManager.Users.ToList();
            foreach (var user in users)
            {
                await _userManager.RemoveFromRolesAsync(user, await _userManager.GetRolesAsync(user));
                await _userManager.DeleteAsync(user);
            }

            return Ok(new { message = "Todos os dados e contas foram apagados." });
        }

        /// <summary>
        /// Executa backup manual imediato da base de dados (apenas Admin).
        /// </summary>
        [HttpPost("backups/run")]
        public async Task<IActionResult> RunBackupNow(CancellationToken cancellationToken = default)
        {
            var backupPath = await _databaseBackupService.ExecuteBackupNowAsync(cancellationToken);
            var info = new FileInfo(backupPath);

            return Ok(new
            {
                message = "Backup executado com sucesso.",
                nomeFicheiro = info.Name,
                tamanhoBytes = info.Exists ? info.Length : 0
            });
        }
    }
}
