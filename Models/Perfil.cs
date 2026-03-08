using System.ComponentModel.DataAnnotations;

namespace Finalproj.Models
{
    // Dados extra do utilizador quando não está associado a um funcionário (nome, telefone, data registo)
    public class Perfil
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O identificador do utilizador é obrigatório.")]
        public string UserId { get; set; } = string.Empty;

        [StringLength(200)]
        [Display(Name = "Nome")]
        public string? Nome { get; set; }

        [StringLength(50)]
        [Display(Name = "Telefone")]
        public string? Telefone { get; set; }

        [Display(Name = "Data de registo")]
        public DateTime? DataRegisto { get; set; }
    }
}
