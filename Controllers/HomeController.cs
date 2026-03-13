using System.Diagnostics;
using Finalproj.Data;
using Finalproj.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Controllers
{
    // Página inicial, perfil, preferências (tema), alterar password; LimparDados para desenvolvimento
    [Authorize]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly FinalprojContext _context;
        private static readonly string[] RolesDisponiveis = { "Admin", "Armazém", "Técnico", "Comercial" };

        public HomeController(
            ILogger<HomeController> logger,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            SignInManager<IdentityUser> signInManager,
            FinalprojContext context)
        {
            _logger = logger;
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _context = context;
        }

        // Página inicial (após login)
        public IActionResult Index()
        {
            return View();
        }

        // Página de privacidade
        public IActionResult Privacy()
        {
            return View();
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        // Página de erro (RequestId apenas em desenvolvimento)
        public IActionResult Error()
        {
            var isDev = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment();
            return View(new ErrorViewModel
            {
                RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier,
                IsDevelopment = isDev
            });
        }

        /// <summary>
        /// Página de confirmação para apagar todos os dados do site (contas e dados adjacentes). Acessível a qualquer utilizador autenticado.
        /// </summary>
        [Authorize]
        [HttpGet]
        // Apaga contas, roles e dados; recria roles e faz logout (uso em desenvolvimento)
        public IActionResult LimparDados()
        {
            return View();
        }

        [Authorize]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [ActionName("LimparDados")]
        public async Task<IActionResult> LimparDadosConfirmar()
        {
            // Apagar utilizadores e roles primeiro (Identity)
            foreach (var user in _userManager.Users.ToList())
                await _userManager.DeleteAsync(user);

            foreach (var role in _roleManager.Roles.ToList())
                await _roleManager.DeleteAsync(role);

            // Ordem de eliminação respeitando FKs: dependentes primeiro, depois entidades principais
            await _context.LogSistema.ExecuteDeleteAsync();
            await _context.ServicoDistanciasSeguranca.ExecuteDeleteAsync();
            await _context.ServicoLicencas.ExecuteDeleteAsync();
            await _context.ServicoEquipas.ExecuteDeleteAsync();
            await _context.ServicoDocumentoExtras.ExecuteDeleteAsync();
            await _context.Servicos.ExecuteDeleteAsync();
            await _context.Reservas.ExecuteDeleteAsync();
            await _context.EncomendaItems.ExecuteDeleteAsync();
            await _context.Encomendas.ExecuteDeleteAsync();
            await _context.EntradasPaiol.ExecuteDeleteAsync();
            await _context.SaidasPaiol.ExecuteDeleteAsync();
            await _context.PaiolAcessos.ExecuteDeleteAsync();
            await _context.PaiolDocumentoExtras.ExecuteDeleteAsync();
            await _context.Paiol.ExecuteDeleteAsync();
            await _context.Produtos.ExecuteDeleteAsync();
            await _context.FuncionarioDocumentoExtras.ExecuteDeleteAsync();
            await _context.ClienteDocumentoExtras.ExecuteDeleteAsync();
            await _context.Funcionarios.ExecuteDeleteAsync();
            await _context.Clientes.ExecuteDeleteAsync();
            await _context.Perfis.ExecuteDeleteAsync();
            await _context.SaveChangesAsync();

            foreach (var roleName in RolesDisponiveis)
                await _roleManager.CreateAsync(new IdentityRole(roleName));

            await _signInManager.SignOutAsync();
            return RedirectToAction(nameof(Index));
        }

        // Preferências: tema guardado em cookie (light/dark)
        [HttpGet]
        public IActionResult Preferencias()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Preferencias(string tema, string? returnAction = null, string? returnController = null)
        {
            var opcoes = new CookieOptions { IsEssential = true, Expires = DateTimeOffset.UtcNow.AddYears(1) };
            Response.Cookies.Append("Theme", tema ?? "Light", opcoes);
            if (!string.IsNullOrEmpty(returnAction) && returnAction == nameof(Perfil))
                return RedirectToAction(nameof(Perfil));
            return RedirectToAction(nameof(Index));
        }

        // Perfil: se tiver funcionário associado, edita dados da ficha do funcionário; senão usa tabela Perfil
        [HttpGet]
        public async Task<IActionResult> Perfil()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction(nameof(Index));

            var funcionario = await _context.Funcionarios.FirstOrDefaultAsync(f => f.UserId == user.Id);
            if (funcionario != null)
            {
                // Utilizador associado a funcionário: mostrar e editar dados da ficha do funcionário (sincronizado com a lista)
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
                ViewData["AlterarPasswordViewModel"] = new AlterarPasswordViewModel();
                return View(model);
            }

            // Sem funcionário associado: usar dados da tabela Perfil (como antes)
            var perfil = await _context.Perfis.FirstOrDefaultAsync(p => p.UserId == user.Id);
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
            ViewData["AlterarPasswordViewModel"] = new AlterarPasswordViewModel();
            return View(modelPerfil);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Perfil(PerfilEditViewModel model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction(nameof(Index));

            if (ModelState.IsValid)
            {
                var funcionario = await _context.Funcionarios.FirstOrDefaultAsync(f => f.UserId == user.Id);
                if (funcionario != null)
                {
                    // Atualizar a ficha do funcionário para que as alterações apareçam na lista de Funcionários
                    funcionario.NomeCompleto = model.Nome ?? funcionario.NomeCompleto;
                    funcionario.Telefone = model.Telefone ?? funcionario.Telefone;
                }

                var perfil = await _context.Perfis.FirstOrDefaultAsync(p => p.UserId == user.Id);
                if (perfil == null)
                {
                    perfil = new Perfil { UserId = user.Id, DataRegisto = DateTime.UtcNow };
                    _context.Perfis.Add(perfil);
                }
                perfil.Nome = model.Nome;
                perfil.Telefone = model.Telefone;
                await _context.SaveChangesAsync();
                TempData["PerfilGuardado"] = true;
                return RedirectToAction(nameof(Perfil));
            }

            model.UserName = user.UserName ?? user.Email ?? "";
            model.Email = user.Email ?? "";
            var roles = await _userManager.GetRolesAsync(user);
            model.Roles = roles.ToList();
            var funcionarioReload = await _context.Funcionarios.FirstOrDefaultAsync(f => f.UserId == user.Id);
            if (funcionarioReload != null)
            {
                model.DataRegisto = funcionarioReload.DataRegisto;
                model.EstaAssociadoAFuncionario = true;
            }
            else
            {
                var perfilReload = await _context.Perfis.FirstOrDefaultAsync(p => p.UserId == user.Id);
                model.DataRegisto = perfilReload?.DataRegisto;
            }
            ViewData["AlterarPasswordViewModel"] = new AlterarPasswordViewModel();
            return View(model);
        }

        // Alterar palavra-passe (Identity) a partir do perfil
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AlterarPassword(AlterarPasswordViewModel model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return RedirectToAction(nameof(Perfil));

            if (ModelState.IsValid)
            {
                var result = await _userManager.ChangePasswordAsync(user, model.PasswordAtual, model.NovaPassword);
                if (result.Succeeded)
                {
                    await _signInManager.SignInAsync(user, isPersistent: false);
                    TempData["PasswordAlterada"] = true;
                    return RedirectToAction(nameof(Perfil));
                }
                foreach (var error in result.Errors)
                    ModelState.AddModelError(string.Empty, error.Description);
            }

            var perfilModel = await ObterPerfilEditViewModelAsync(user);
            ViewData["AlterarPasswordViewModel"] = model;
            return View("Perfil", perfilModel);
        }

        private async Task<PerfilEditViewModel> ObterPerfilEditViewModelAsync(IdentityUser user)
        {
            var funcionario = await _context.Funcionarios.FirstOrDefaultAsync(f => f.UserId == user.Id);
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
            var perfil = await _context.Perfis.FirstOrDefaultAsync(p => p.UserId == user.Id);
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
