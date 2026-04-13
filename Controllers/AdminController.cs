using Finalproj.Authorization;
using Finalproj.Data;
using Finalproj.Models;
using Finalproj.Services.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = PoliticasAutorizacao.PodeAcederAdmin)]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly FinalprojContext _context;
        private readonly IDatabaseBackupService _databaseBackupService;
        private static readonly string[] RolesDisponiveis = ConstantesRoles.Todas;

        public AdminController(
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            FinalprojContext context,
            IDatabaseBackupService databaseBackupService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
            _databaseBackupService = databaseBackupService;
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
            var agora = DateTime.UtcNow;
            var inicioDoMes = new DateTime(agora.Year, agora.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var totalUtilizadores = await _userManager.Users.CountAsync(cancellationToken);
            var totalEncomendas = await _context.Encomendas.CountAsync(cancellationToken);
            var encomendasEsteMes = await _context.Encomendas.CountAsync(e => e.DataCriacao >= inicioDoMes, cancellationToken);
            var totalServicos = await _context.Servicos.CountAsync(cancellationToken);
            var servicosEsteMes = await _context.Servicos.CountAsync(s => s.DataServico >= inicioDoMes.Date, cancellationToken);
            var totalClientes = await _context.Clientes.CountAsync(cancellationToken);
            var totalFuncionarios = await _context.Funcionarios.CountAsync(cancellationToken);
            var totalProdutos = await _context.Produtos.CountAsync(cancellationToken);
            var totalPaiois = await _context.Paiol.CountAsync(cancellationToken);
            var totalLogs = await _context.LogSistema.CountAsync(cancellationToken);
            return Ok(new
            {
                totalUtilizadores,
                totalEncomendas,
                encomendasEsteMes,
                totalServicos,
                servicosEsteMes,
                totalClientes,
                totalFuncionarios,
                totalProdutos,
                totalPaiois,
                totalLogs
            });
        }

        /// <summary>
        /// Logs do sistema (auditoria) com paginação e filtro opcional por ação.
        /// </summary>
        [HttpGet("logs")]
        public async Task<IActionResult> Logs(string? acao, int pagina = 1, int itensPorPagina = 50, CancellationToken cancellationToken = default)
        {
            if (pagina < 1) pagina = 1;
            if (itensPorPagina < 10 || itensPorPagina > 200) itensPorPagina = 50;
            IQueryable<LogSistema> query = _context.LogSistema.AsNoTracking().OrderByDescending(l => l.Timestamp);
            if (!string.IsNullOrWhiteSpace(acao))
                query = query.Where(l => l.Acao != null && l.Acao.Contains(acao));
            var total = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((pagina - 1) * itensPorPagina)
                .Take(itensPorPagina)
                .Select(l => new { l.Id, l.Acao, l.UserId, l.UserName, l.JsonDados, l.Timestamp })
                .ToListAsync(cancellationToken);
            return Ok(new
            {
                items,
                paginaAtual = pagina,
                itensPorPagina,
                totalRegistos = total
            });
        }

        // Lista de utilizadores com roles e nome do funcionário associado (se houver)
        [HttpGet("utilizadores")]
        public async Task<IActionResult> Utilizadores(CancellationToken cancellationToken = default)
        {
            var utilizadores = new List<UtilizadorComRolesViewModel>();
            var funcionariosPorUserId = await _context.Funcionarios
                .AsNoTracking()
                .Where(f => f.UserId != null)
                .ToDictionaryAsync(f => f.UserId!, f => f.NomeCompleto, cancellationToken);
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

            var funcionariosDisponiveis = await _context.Funcionarios
                .AsNoTracking()
                .Where(f => f.UserId == null || f.UserId == user.Id)
                .OrderBy(f => f.NomeCompleto)
                .Select(f => new { f.Id, f.NomeCompleto })
                .ToListAsync(cancellationToken);
            var funcionarioAtual = await _context.Funcionarios
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.UserId == user.Id, cancellationToken);

            var model = new EditarUtilizadorRolesViewModel
            {
                Id = user.Id,
                UserName = user.UserName ?? "",
                Email = user.Email ?? "",
                FuncionarioId = funcionarioAtual?.Id,
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

            var funcionariosComEsteUser = await _context.Funcionarios.Where(f => f.UserId == user.Id).ToListAsync(cancellationToken);
            foreach (var f in funcionariosComEsteUser)
                f.UserId = null;
            if (model.FuncionarioId.HasValue)
            {
                var funcionario = await _context.Funcionarios.FindAsync(model.FuncionarioId.Value);
                if (funcionario != null)
                {
                    var outro = await _context.Funcionarios.FirstOrDefaultAsync(f => f.UserId == user.Id && f.Id != funcionario.Id, cancellationToken);
                    if (outro != null) outro.UserId = null;
                    funcionario.UserId = user.Id;
                }
            }
            await _context.SaveChangesAsync(cancellationToken);

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

            var funcionarios = await _context.Funcionarios.Where(f => f.UserId == id).ToListAsync(cancellationToken);
            foreach (var f in funcionarios)
                f.UserId = null;

            var clientes = await _context.Clientes.Where(c => c.UserId == id).ToListAsync(cancellationToken);
            foreach (var c in clientes)
                c.UserId = null;

            await _context.SaveChangesAsync(cancellationToken);

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
            // Ordem: apagar entidades que referenciam outras primeiro
            _context.ServicoDistanciasSeguranca.RemoveRange(await _context.ServicoDistanciasSeguranca.ToListAsync(cancellationToken));
            _context.ServicoLicencas.RemoveRange(await _context.ServicoLicencas.ToListAsync(cancellationToken));
            _context.ServicoEquipas.RemoveRange(await _context.ServicoEquipas.ToListAsync(cancellationToken));
            _context.ServicoDocumentoExtras.RemoveRange(await _context.ServicoDocumentoExtras.ToListAsync(cancellationToken));
            _context.Servicos.RemoveRange(await _context.Servicos.ToListAsync(cancellationToken));
            _context.EncomendaItems.RemoveRange(await _context.EncomendaItems.ToListAsync(cancellationToken));
            _context.Reservas.RemoveRange(await _context.Reservas.ToListAsync(cancellationToken));
            _context.Encomendas.RemoveRange(await _context.Encomendas.ToListAsync(cancellationToken));
            _context.SaidasPaiol.RemoveRange(await _context.SaidasPaiol.ToListAsync(cancellationToken));
            _context.EntradasPaiol.RemoveRange(await _context.EntradasPaiol.ToListAsync(cancellationToken));
            _context.PaiolAcessos.RemoveRange(await _context.PaiolAcessos.ToListAsync(cancellationToken));
            _context.PaiolDocumentoExtras.RemoveRange(await _context.PaiolDocumentoExtras.ToListAsync(cancellationToken));
            _context.Paiol.RemoveRange(await _context.Paiol.ToListAsync(cancellationToken));
            _context.ClienteDocumentoExtras.RemoveRange(await _context.ClienteDocumentoExtras.ToListAsync(cancellationToken));
            _context.Clientes.RemoveRange(await _context.Clientes.ToListAsync(cancellationToken));
            _context.FuncionarioDocumentoExtras.RemoveRange(await _context.FuncionarioDocumentoExtras.ToListAsync(cancellationToken));
            _context.Perfis.RemoveRange(await _context.Perfis.ToListAsync(cancellationToken));
            _context.Funcionarios.RemoveRange(await _context.Funcionarios.ToListAsync(cancellationToken));
            _context.Produtos.RemoveRange(await _context.Produtos.ToListAsync(cancellationToken));
            _context.LogSistema.RemoveRange(await _context.LogSistema.ToListAsync(cancellationToken));
            await _context.SaveChangesAsync(cancellationToken);

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
                caminho = backupPath,
                nomeFicheiro = info.Name,
                tamanhoBytes = info.Exists ? info.Length : 0
            });
        }
    }
}
