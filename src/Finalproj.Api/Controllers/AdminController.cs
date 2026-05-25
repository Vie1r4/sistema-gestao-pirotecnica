using Finalproj.Authorization;
using Finalproj.Application.DTOs;
using Finalproj.Application.Features.Admin.DTOs;
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
    /// <summary>Painel administrativo: utilizadores, logs, estatísticas e backups (role Admin).</summary>
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
        private readonly IAdminUserAccountService _adminUserAccounts;
        private readonly IDatabaseCleanupService _databaseCleanup;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<AdminController> _logger;
        private static readonly string[] RolesDisponiveis = ConstantesRoles.Todas;

        public AdminController(
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IDatabaseBackupService databaseBackupService,
            IAdminStatsService adminStats,
            IAdminUserAccountService adminUserAccounts,
            IDatabaseCleanupService databaseCleanup,
            IWebHostEnvironment env,
            ILogger<AdminController> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _databaseBackupService = databaseBackupService;
            _adminStats = adminStats;
            _adminUserAccounts = adminUserAccounts;
            _databaseCleanup = databaseCleanup;
            _env = env;
            _logger = logger;
        }

        /// <summary>Dashboard Admin.</summary>

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
            var utilizadoresSemEmailConfirmado = _userManager.Users.Count(u => !u.EmailConfirmed);
            return Ok(await _adminStats.GetStatsAsync(totalUtilizadores, utilizadoresSemEmailConfirmado, cancellationToken));
        }

        /// <summary>
        /// Logs do sistema (auditoria) com paginação e filtro opcional por ação.
        /// </summary>
        [HttpGet("logs")]
        public async Task<IActionResult> Logs(
            string? acao,
            string? userName,
            string? entidade,
            DateTime? dataInicio,
            DateTime? dataFim,
            int pagina = 1,
            int itensPorPagina = 50,
            CancellationToken cancellationToken = default)
        {
            if (pagina < 1) pagina = 1;
            if (itensPorPagina < 10 || itensPorPagina > 200) itensPorPagina = 50;
            return Ok(await _adminStats.GetLogsAsync(acao, userName, entidade, dataInicio, dataFim, pagina, itensPorPagina, cancellationToken));
        }

        /// <summary>Estado da API e ligação à base de dados (dashboard admin).</summary>
        [HttpGet("health")]
        public async Task<IActionResult> Health(CancellationToken cancellationToken = default)
        {
            var version = typeof(AdminController).Assembly.GetName().Version?.ToString();
            return Ok(await _adminStats.GetHealthAsync(_env.EnvironmentName, version, cancellationToken));
        }

        /// <summary>Lista utilizadores Identity com roles e funcionário associado.</summary>
        /// <response code="200">Lista de utilizadores</response>
        /// <response code="403">Sem permissão Admin</response>
        [HttpGet("utilizadores")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
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
                    FuncionarioAssociadoNome = user.Id != null && funcionariosPorUserId.TryGetValue(user.Id, out var nome) ? nome : null,
                    EmailConfirmed = user.EmailConfirmed
                });
            }
            return Ok(utilizadores);
        }

        /// <summary>Roles e funcionários disponíveis para criar uma nova conta.</summary>
        [HttpGet("utilizadores/criar-opcoes")]
        public async Task<IActionResult> CriarUtilizadorOpcoes(CancellationToken cancellationToken = default)
        {
            return Ok(await _adminUserAccounts.GetCriarOpcoesAsync(cancellationToken));
        }

        /// <summary>Cria conta Identity (roles, funcionário opcional, email de confirmação opcional).</summary>
        [HttpPost("utilizadores")]
        public async Task<IActionResult> CriarUtilizador(
            [FromBody] CreateAdminUtilizadorRequest request,
            CancellationToken cancellationToken = default)
        {
            var result = await _adminUserAccounts.CreateUtilizadorAsync(
                request,
                _userManager.GetUserId(User),
                User.Identity?.Name,
                cancellationToken);
            return MapAccountResult(result, StatusCodes.Status201Created);
        }

        /// <summary>Formulário editar roles e funcionário associado.</summary>

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

        /// <summary>Actualiza roles e associação utilizador-funcionário (apenas Admin).</summary>
        /// <response code="200">Utilizador actualizado</response>
        /// <response code="404">Utilizador não encontrado ou ID inconsistente</response>
        [HttpPut("utilizadores/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
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

        [HttpPost("utilizadores/{id}/resend-confirm-email")]
        public async Task<IActionResult> ResendConfirmEmail(string id, CancellationToken cancellationToken = default)
        {
            var result = await _adminUserAccounts.ResendConfirmEmailAsync(
                id, _userManager.GetUserId(User), User.Identity?.Name, cancellationToken);
            return MapAccountResult(result);
        }

        [HttpPost("utilizadores/{id}/confirm-email")]
        public async Task<IActionResult> ConfirmEmailAdmin(string id, CancellationToken cancellationToken = default)
        {
            var result = await _adminUserAccounts.ConfirmEmailAsync(
                id, _userManager.GetUserId(User), User.Identity?.Name, cancellationToken);
            return MapAccountResult(result);
        }

        [HttpPost("utilizadores/{id}/send-password-reset")]
        public async Task<IActionResult> SendPasswordReset(string id, CancellationToken cancellationToken = default)
        {
            var result = await _adminUserAccounts.SendPasswordResetAsync(
                id, _userManager.GetUserId(User), User.Identity?.Name, cancellationToken);
            return MapAccountResult(result);
        }

        [HttpPut("utilizadores/{id}/credenciais")]
        public async Task<IActionResult> UpdateCredenciais(
            string id,
            [FromBody] UpdateAdminUtilizadorCredenciaisRequest request,
            CancellationToken cancellationToken = default)
        {
            var result = await _adminUserAccounts.UpdateCredenciaisAsync(
                id, request, _userManager.GetUserId(User), User.Identity?.Name, cancellationToken);
            return MapAccountResult(result);
        }

        /// <summary>Apaga conta Identity; desassocia de funcionários e clientes primeiro.</summary>
        [HttpDelete("utilizadores/{id}")]
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
                return NotFound(new { error = "Limpeza de dados só está disponível em ambiente de desenvolvimento." });

            try
            {
                _logger.LogWarning(
                    "clear-all-data: utilizador {UserId} ({Email}) em Development.",
                    _userManager.GetUserId(User),
                    User.Identity?.Name);

                await _databaseCleanup.ClearAllForResetAsync(cancellationToken);

                foreach (var user in _userManager.Users.ToList())
                {
                    await _userManager.RemoveFromRolesAsync(user, await _userManager.GetRolesAsync(user));
                    await _userManager.DeleteAsync(user);
                }

                foreach (var role in _roleManager.Roles.ToList())
                    await _roleManager.DeleteAsync(role);

                foreach (var roleName in RolesDisponiveis)
                    await _roleManager.CreateAsync(new IdentityRole(roleName));

                var totalBackups = await _databaseBackupService.CountBackupsAsync(cancellationToken);
                return Ok(new
                {
                    message = "Dados, documentos e contas apagados. Roles repostas — pode registar um novo utilizador.",
                    existemBackupsAnteriores = totalBackups > 0,
                    totalBackups
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Executa backup manual imediato da base de dados (apenas Admin).
        /// </summary>
        /// <summary>Lista ficheiros de backup na pasta configurada (sem paths absolutos).</summary>
        [HttpGet("backups")]
        public async Task<IActionResult> ListBackups(CancellationToken cancellationToken = default)
        {
            var items = await _databaseBackupService.ListBackupsAsync(cancellationToken);
            var semContas = !_userManager.Users.Any();
            var resumo = await _databaseBackupService.GetBackupSummaryAsync(semContas, cancellationToken);
            return Ok(new
            {
                items = items.Select(b => new
                {
                    nomeFicheiro = b.NomeFicheiro,
                    tamanhoBytes = b.TamanhoBytes,
                    dataCriacao = b.DataCriacaoUtc,
                    temDocumentos = b.TemDocumentos,
                    nomeFicheiroDocumentos = b.NomeFicheiroDocumentos,
                    tamanhoDocumentosBytes = b.TamanhoDocumentosBytes
                }),
                resumo = new
                {
                    total = resumo.Total,
                    semContasNaBd = resumo.SemContasNaBd,
                    backupsDeInstalacaoAnterior = resumo.BackupsDeInstalacaoAnterior
                }
            });
        }

        /// <summary>Apaga um backup (.bak e ZIP de documentos associado).</summary>
        [HttpDelete("backups/{nomeFicheiro}")]
        public async Task<IActionResult> DeleteBackup(string nomeFicheiro, CancellationToken cancellationToken = default)
        {
            try
            {
                var nome = nomeFicheiro.Trim();
                _logger.LogWarning(
                    "Backup DELETE: {Ficheiro} por {UserId}.",
                    nome,
                    _userManager.GetUserId(User));

                await _databaseBackupService.DeleteBackupAsync(nome, cancellationToken);
                return Ok(new { message = "Backup apagado." });
            }
            catch (FileNotFoundException)
            {
                return NotFound(new { error = "Backup não encontrado." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("backups/run")]
        public async Task<IActionResult> RunBackupNow(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Backup RUN manual por {UserId}.", _userManager.GetUserId(User));
                var backupPath = await _databaseBackupService.ExecuteBackupNowAsync(cancellationToken);
                var info = new FileInfo(backupPath);
                var uploadsZipPath = backupPath.Replace(".bak", "_uploads.zip", StringComparison.OrdinalIgnoreCase);
                var uploadsInfo = System.IO.File.Exists(uploadsZipPath) ? new FileInfo(uploadsZipPath) : null;

                return Ok(new
                {
                    message = "Backup completo criado (base de dados + documentos).",
                    nomeFicheiro = info.Name,
                    tamanhoBytes = info.Exists ? info.Length : 0,
                    nomeFicheiroDocumentos = uploadsInfo?.Name,
                    tamanhoDocumentosBytes = uploadsInfo?.Exists == true ? uploadsInfo.Length : 0
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>Descarrega .bak ou ZIP de documentos (_uploads.zip) da pasta de backups (apenas Admin).</summary>
        [HttpGet("backups/{nomeFicheiro}/download")]
        public IActionResult DownloadBackup(string nomeFicheiro, CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var path = _databaseBackupService.ResolveBackupFullPath(nomeFicheiro);
            return PhysicalFile(path, "application/octet-stream", Path.GetFileName(path), enableRangeProcessing: true);
        }

        /// <summary>Restaura BD (.bak) e documentos (ZIP associado), se existir.</summary>
        [HttpPost("backups/restore")]
        public async Task<IActionResult> RestoreBackup(
            [FromBody] RestoreBackupRequest request,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.NomeFicheiro))
                return BadRequest(new { error = "Indique o ficheiro de backup." });

            try
            {
                var nome = request.NomeFicheiro.Trim();
                _logger.LogWarning(
                    "Backup RESTORE: {Ficheiro} por {UserId} — substitui BD e Uploads.",
                    nome,
                    _userManager.GetUserId(User));

                await _databaseBackupService.RestoreFromBackupAsync(nome, cancellationToken);
                return Ok(new
                {
                    message = "Backup completo restaurado (base de dados e documentos). Inicie sessão novamente.",
                    nomeFicheiro = Path.GetFileName(request.NomeFicheiro)
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        private IActionResult MapAccountResult(
            AdminUserAccountResult result,
            int successStatus = StatusCodes.Status200OK)
        {
            if (result.Success)
            {
                return StatusCode(successStatus, new
                {
                    success = true,
                    message = result.Message,
                    userId = result.UserId,
                });
            }

            return BadRequest(new
            {
                success = false,
                message = result.Message,
                errors = result.Errors,
            });
        }
    }
}
