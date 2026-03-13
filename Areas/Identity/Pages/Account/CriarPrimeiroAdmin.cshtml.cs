using System.ComponentModel.DataAnnotations;
using Finalproj.Data;
using Finalproj.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Areas.Identity.Pages.Account
{
    /// <summary>
    /// Aparece apenas quando não existe nenhum utilizador (ex.: após Limpar dados).
    /// Permite criar o primeiro administrador; a partir daí só esse Admin pode criar contas (via Funcionários).
    /// </summary>
    [AllowAnonymous]
    public class CriarPrimeiroAdminModel : PageModel
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly FinalprojContext _context;
        private readonly IEmailSender _emailSender;

        public CriarPrimeiroAdminModel(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            FinalprojContext context,
            IEmailSender emailSender)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _emailSender = emailSender;
        }

        [BindProperty]
        public InputModel Input { get; set; } = null!;

        public string? ReturnUrl { get; set; }

        public class InputModel
        {
            [Required(ErrorMessage = "O email é obrigatório.")]
            [EmailAddress(ErrorMessage = "Email inválido.")]
            [Display(Name = "Email")]
            public string Email { get; set; } = string.Empty;

            [Required(ErrorMessage = "A palavra-passe é obrigatória.")]
            [DataType(DataType.Password)]
            [Display(Name = "Palavra-passe")]
            public string Password { get; set; } = string.Empty;

            [DataType(DataType.Password)]
            [Display(Name = "Confirmar palavra-passe")]
            [Compare("Password", ErrorMessage = "A confirmação não coincide com a palavra-passe.")]
            public string ConfirmPassword { get; set; } = string.Empty;
        }

        public async Task<IActionResult> OnGetAsync(string? returnUrl = null)
        {
            ReturnUrl = returnUrl;
            var count = await _userManager.Users.CountAsync();
            if (count > 0)
                return RedirectToPage("/Account/Login", new { returnUrl });
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string? returnUrl = null)
        {
            returnUrl ??= Url.Content("~/");
            ReturnUrl = returnUrl;

            var count = await _userManager.Users.CountAsync();
            if (count > 0)
                return RedirectToPage("/Account/Login", new { returnUrl });

            if (!ModelState.IsValid)
                return Page();

            var email = Input.Email.Trim();
            var user = new IdentityUser { UserName = email, Email = email };
            var result = await _userManager.CreateAsync(user, Input.Password);
            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                    ModelState.AddModelError(string.Empty, error.Description);
                return Page();
            }

            user.EmailConfirmed = true;
            await _userManager.UpdateAsync(user);
            await _userManager.AddToRoleAsync(user, "Admin");
            _context.Perfis.Add(new Perfil
            {
                UserId = user.Id,
                Nome = "Administrador",
                DataRegisto = DateTime.UtcNow
            });
            // Criar ficha de funcionário para o primeiro admin (apenas funcionários têm acesso à aplicação)
            _context.Funcionarios.Add(new Funcionario
            {
                NomeCompleto = "Administrador",
                Email = email,
                Cargo = "Admin",
                UserId = user.Id,
                DataRegisto = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            try
            {
                var loginUrl = $"{Request.Scheme}://{Request.Host}/Identity/Account/Login";
                var assunto = "Conta de administrador criada";
                var corpo = $@"<p>A sua conta de administrador foi criada.</p><p>Email: {email}</p><p>Pode entrar em: <a href=""{loginUrl}"">{loginUrl}</a></p>";
                await _emailSender.SendEmailAsync(email, assunto, corpo);
            }
            catch { /* não falhar o fluxo se o email falhar */ }

            await _signInManager.SignInAsync(user, isPersistent: false);
            return LocalRedirect(returnUrl);
        }
    }
}
