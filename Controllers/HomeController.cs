using System.Diagnostics;
using Finalproj.Data;
using Finalproj.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        private readonly FinalprojContext _context;
        private readonly IWebHostEnvironment _env;
        private static readonly string[] RolesDisponiveis = ConstantesRoles.Todas;

        public HomeController(
            ILogger<HomeController> logger,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            SignInManager<IdentityUser> signInManager,
            FinalprojContext context,
            IWebHostEnvironment env)
        {
            _logger = logger;
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _context = context;
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
            var totalClientes = await _context.Clientes.CountAsync(cancellationToken);
            var totalServicos = await _context.Servicos.CountAsync(cancellationToken);
            var totalProdutos = await _context.Produtos.CountAsync(cancellationToken);
            var totalPaioisAtivos = await _context.Paiol
                .CountAsync(p => p.Estado == ConstantesPaiol.EstadoAtivo, cancellationToken);

            return Ok(new
            {
                totalClientes,
                totalServicos,
                totalProdutos,
                totalPaioisAtivos
            });
        }

        /// <summary>
        /// Dashboard do Gestor/Admin: estatísticas alargadas, gráficos (encomendas por estado e por mês), alertas e atividade recente.
        /// Apenas roles Admin e Gestor.
        /// </summary>
        [HttpGet("gestor-dashboard")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = ConstantesRoles.Admin + "," + ConstantesRoles.Gestor)]
        public async Task<IActionResult> GestorDashboard(CancellationToken cancellationToken = default)
        {
            var totalClientes = await _context.Clientes.CountAsync(cancellationToken);
            var totalServicos = await _context.Servicos.CountAsync(cancellationToken);
            var totalProdutos = await _context.Produtos.CountAsync(cancellationToken);
            var totalPaioisAtivos = await _context.Paiol.CountAsync(p => p.Estado == ConstantesPaiol.EstadoAtivo, cancellationToken);
            var totalFuncionarios = await _context.Funcionarios.CountAsync(cancellationToken);
            var encomendasPendentes = await _context.Encomendas.CountAsync(e => e.Estado == ConstantesEncomenda.PENDENTE, cancellationToken);

            var totaisPorEstado = await _context.Encomendas
                .AsNoTracking()
                .GroupBy(e => e.Estado)
                .Select(g => new { Estado = g.Key, Total = g.Count() })
                .ToDictionaryAsync(x => x.Estado, x => x.Total, cancellationToken);

            var hoje = DateTime.UtcNow.Date;
            var primeiroDia = new DateTime(hoje.Year, hoje.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-5);
            var encomendasPorMesDb = await _context.Encomendas
                .AsNoTracking()
                .Where(e => e.DataCriacao >= primeiroDia && e.DataCriacao < hoje.AddMonths(1))
                .GroupBy(e => new { e.DataCriacao.Year, e.DataCriacao.Month })
                .Select(g => new { Ano = g.Key.Year, Mes = g.Key.Month, Total = g.Count() })
                .ToListAsync(cancellationToken);
            var dictPorMes = encomendasPorMesDb.ToDictionary(x => $"{x.Ano}-{x.Mes:D2}", x => x.Total);
            var encomendasPorMesList = new List<(string mes, int total)>();
            for (var i = 0; i < 6; i++)
            {
                var d = primeiroDia.AddMonths(i);
                var key = $"{d.Year}-{d.Month:D2}";
                encomendasPorMesList.Add((key, dictPorMes.GetValueOrDefault(key, 0)));
            }

            var paioisEmManutencao = await _context.Paiol
                .AsNoTracking()
                .Where(p => p.Estado == ConstantesPaiol.EstadoEmManutencao)
                .Select(p => new { p.Id, p.Nome })
                .ToListAsync(cancellationToken);

            var ultimasEncomendas = await _context.Encomendas
                .AsNoTracking()
                .Include(e => e.Cliente)
                .OrderByDescending(e => e.DataCriacao)
                .Take(5)
                .ToListAsync(cancellationToken);
            var ultimasEncomendasDto = ultimasEncomendas.Select(EncomendaResponseDtoMapping.MapToList).ToList();

            var ultimasEntradas = await _context.EntradasPaiol
                .AsNoTracking()
                .Include(e => e.Paiol)
                .Include(e => e.Produto)
                .OrderByDescending(e => e.DataEntrada)
                .Take(5)
                .ToListAsync(cancellationToken);
            var ultimasSaidas = await _context.SaidasPaiol
                .AsNoTracking()
                .Include(s => s.Paiol)
                .Include(s => s.Produto)
                .OrderByDescending(s => s.DataSaida)
                .Take(5)
                .ToListAsync(cancellationToken);

            var entradasRecentes = ultimasEntradas.Select(e => new
            {
                tipo = "Entrada",
                id = e.Id,
                data = e.DataEntrada,
                paiolNome = e.Paiol?.Nome ?? "",
                produtoNome = e.Produto?.Nome ?? "",
                quantidade = e.Quantidade,
                encomendaId = (int?)null
            }).ToList();
            var saidasRecentes = ultimasSaidas.Select(s => new
            {
                tipo = "Saída",
                id = s.Id,
                data = s.DataSaida,
                paiolNome = s.Paiol?.Nome ?? "",
                produtoNome = s.Produto?.Nome ?? "",
                quantidade = s.Quantidade,
                encomendaId = s.EncomendaId
            }).ToList();

            return Ok(new
            {
                totalClientes,
                totalServicos,
                totalProdutos,
                totalPaioisAtivos,
                totalFuncionarios,
                encomendasPendentes,
                encomendasPorEstado = totaisPorEstado,
                encomendasPorMes = encomendasPorMesList.Select(x => new { x.mes, x.total }).ToList(),
                paioisEmManutencao,
                ultimasEncomendas = ultimasEncomendasDto,
                entradasRecentes,
                saidasRecentes
            });
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

            await _context.LogSistema.ExecuteDeleteAsync(cancellationToken);
            await _context.ServicoDistanciasSeguranca.ExecuteDeleteAsync(cancellationToken);
            await _context.ServicoLicencas.ExecuteDeleteAsync(cancellationToken);
            await _context.ServicoEquipas.ExecuteDeleteAsync(cancellationToken);
            await _context.ServicoDocumentoExtras.ExecuteDeleteAsync(cancellationToken);
            await _context.Servicos.ExecuteDeleteAsync(cancellationToken);
            await _context.Reservas.ExecuteDeleteAsync(cancellationToken);
            await _context.EncomendaItems.ExecuteDeleteAsync(cancellationToken);
            await _context.Encomendas.ExecuteDeleteAsync(cancellationToken);
            await _context.EntradasPaiol.ExecuteDeleteAsync(cancellationToken);
            await _context.SaidasPaiol.ExecuteDeleteAsync(cancellationToken);
            await _context.PaiolAcessos.ExecuteDeleteAsync(cancellationToken);
            await _context.PaiolDocumentoExtras.ExecuteDeleteAsync(cancellationToken);
            await _context.Paiol.ExecuteDeleteAsync(cancellationToken);
            await _context.Produtos.ExecuteDeleteAsync(cancellationToken);
            await _context.FuncionarioDocumentoExtras.ExecuteDeleteAsync(cancellationToken);
            await _context.ClienteDocumentoExtras.ExecuteDeleteAsync(cancellationToken);
            await _context.Funcionarios.ExecuteDeleteAsync(cancellationToken);
            await _context.Clientes.ExecuteDeleteAsync(cancellationToken);
            await _context.Perfis.ExecuteDeleteAsync(cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

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
                var perfil = await _context.Perfis.FirstOrDefaultAsync(p => p.UserId == user.Id, cancellationToken);
                if (!string.IsNullOrEmpty(perfil?.Tema))
                {
                    var opcoes = new CookieOptions { IsEssential = true, Expires = DateTimeOffset.UtcNow.AddYears(1) };
                    Response.Cookies.Append("Theme", perfil.Tema, opcoes);
                    return Ok(new { tema = perfil.Tema });
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
                var perfil = await _context.Perfis.FirstOrDefaultAsync(p => p.UserId == user.Id, cancellationToken);
                if (perfil == null)
                {
                    perfil = new Perfil { UserId = user.Id, DataRegisto = DateTime.UtcNow };
                    _context.Perfis.Add(perfil);
                }
                perfil.Tema = tema;
                await _context.SaveChangesAsync(cancellationToken);
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

            var funcionario = await _context.Funcionarios.FirstOrDefaultAsync(f => f.UserId == user.Id, cancellationToken);
            if (funcionario != null)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var model = new PerfilEditViewModel
                {
                    UserName = user.UserName ?? user.Email ?? "",
                    Email = user.Email ?? "",
                    Nome = funcionario.NomeCompleto,
                    Telefone = funcionario.Telefone,
                    Roles = roles.ToList(),
                    DataRegisto = funcionario.DataRegisto,
                    EstaAssociadoAFuncionario = true
                };
                return Ok(new { model, alterarPasswordViewModel = new AlterarPasswordViewModel() });
            }

            var perfil = await _context.Perfis.FirstOrDefaultAsync(p => p.UserId == user.Id, cancellationToken);
            var rolesPerfil = await _userManager.GetRolesAsync(user);
            var modelPerfil = new PerfilEditViewModel
            {
                UserName = user.UserName ?? user.Email ?? "",
                Email = user.Email ?? "",
                Nome = perfil?.Nome,
                Telefone = perfil?.Telefone,
                Roles = rolesPerfil.ToList(),
                DataRegisto = perfil?.DataRegisto
            };
            return Ok(new { model = modelPerfil, alterarPasswordViewModel = new AlterarPasswordViewModel() });
        }

        [HttpPut("perfil")]
        public async Task<IActionResult> Perfil([FromBody] PerfilEditViewModel model, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            if (ModelState.IsValid)
            {
                var funcionario = await _context.Funcionarios.FirstOrDefaultAsync(f => f.UserId == user.Id, cancellationToken);
                if (funcionario != null)
                {
                    funcionario.NomeCompleto = model.Nome ?? funcionario.NomeCompleto;
                    funcionario.Telefone = model.Telefone ?? funcionario.Telefone;
                }

                var perfil = await _context.Perfis.FirstOrDefaultAsync(p => p.UserId == user.Id, cancellationToken);
                if (perfil == null)
                {
                    perfil = new Perfil { UserId = user.Id, DataRegisto = DateTime.UtcNow };
                    _context.Perfis.Add(perfil);
                }
                perfil.Nome = model.Nome;
                perfil.Telefone = model.Telefone;
                await _context.SaveChangesAsync(cancellationToken);

                return Ok(new { model, perfilGuardado = true });
            }

            model.UserName = user.UserName ?? user.Email ?? "";
            model.Email = user.Email ?? "";
            var roles = await _userManager.GetRolesAsync(user);
            model.Roles = roles.ToList();
            var funcionarioReload = await _context.Funcionarios.FirstOrDefaultAsync(f => f.UserId == user.Id, cancellationToken);
            if (funcionarioReload != null)
            {
                model.DataRegisto = funcionarioReload.DataRegisto;
                model.EstaAssociadoAFuncionario = true;
            }
            else
            {
                var perfilReload = await _context.Perfis.FirstOrDefaultAsync(p => p.UserId == user.Id, cancellationToken);
                model.DataRegisto = perfilReload?.DataRegisto;
            }

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
            var funcionario = await _context.Funcionarios.FirstOrDefaultAsync(f => f.UserId == user.Id, cancellationToken);
            if (funcionario != null)
            {
                var roles = await _userManager.GetRolesAsync(user);
                return new PerfilEditViewModel
                {
                    UserName = user.UserName ?? user.Email ?? "",
                    Email = user.Email ?? "",
                    Nome = funcionario.NomeCompleto,
                    Telefone = funcionario.Telefone,
                    Roles = roles.ToList(),
                    DataRegisto = funcionario.DataRegisto,
                    EstaAssociadoAFuncionario = true
                };
            }
            var perfil = await _context.Perfis.FirstOrDefaultAsync(p => p.UserId == user.Id, cancellationToken);
            var rolesPerfil = await _userManager.GetRolesAsync(user);
            return new PerfilEditViewModel
            {
                UserName = user.UserName ?? user.Email ?? "",
                Email = user.Email ?? "",
                Nome = perfil?.Nome,
                Telefone = perfil?.Telefone,
                Roles = rolesPerfil.ToList(),
                DataRegisto = perfil?.DataRegisto
            };
        }
    }
}
