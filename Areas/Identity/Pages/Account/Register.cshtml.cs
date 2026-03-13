using System.ComponentModel.DataAnnotations;
using Finalproj.Data;
using Finalproj.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Finalproj.Areas.Identity.Pages.Account
{
    /// <summary>
    /// Tutorial Class 8: Registo com UserName, Perfil, Role; confirmação de email; [AllowAnonymous].
    /// </summary>
    [AllowAnonymous]
    public class RegisterModel : PageModel
    {
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly FinalprojContext _context;
        private readonly IEmailSender _emailSender;
        private static readonly string[] RolesDisponiveis = { "Admin", "Armazém", "Técnico", "Comercial" };

        public RegisterModel(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            FinalprojContext context,
            IEmailSender emailSender)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _context = context;
            _emailSender = emailSender;
        }

        [BindProperty]
        public InputModel Input { get; set; } = null!;

        public string? ReturnUrl { get; set; }

        public class InputModel
        {
            [Required(ErrorMessage = "O nome de utilizador é obrigatório.")]
            [StringLength(256)]
            [Display(Name = "Nome de utilizador")]
            public string UserName { get; set; } = string.Empty;

            [Required(ErrorMessage = "O email é obrigatório.")]
            [EmailAddress(ErrorMessage = "Email inválido.")]
            [Display(Name = "Email")]
            public string Email { get; set; } = string.Empty;

            [Required(ErrorMessage = "A palavra-passe é obrigatória.")]
            [StringLength(100, MinimumLength = 6, ErrorMessage = "A palavra-passe deve ter entre 6 e 100 caracteres.")]
            [DataType(DataType.Password)]
            [Display(Name = "Palavra-passe")]
            public string Password { get; set; } = string.Empty;

            [DataType(DataType.Password)]
            [Display(Name = "Confirmar palavra-passe")]
            [Compare("Password", ErrorMessage = "A palavra-passe e a confirmação não coincidem.")]
            public string ConfirmPassword { get; set; } = string.Empty;

            [StringLength(200)]
            [Display(Name = "Nome")]
            public string? Nome { get; set; }

            [StringLength(50)]
            [Display(Name = "Telefone")]
            public string? Telefone { get; set; }

            [Display(Name = "Cargo")]
            public string? Role { get; set; }
        }

        public IActionResult OnGet(string? returnUrl = null)
        {
            // Registo desativado: contas são criadas apenas pelo Admin a partir da ficha do Funcionário.
            return RedirectToPage("/Account/Login", new { returnUrl });
        }

        public IActionResult OnPostAsync(string? returnUrl = null)
        {
            return RedirectToPage("/Account/Login", new { returnUrl });
        }
    }
}
