using System.ComponentModel.DataAnnotations;

namespace Finalproj.Domain.Entities;

public class PaiolAcesso
{
    public int Id { get; set; }

    public int PaiolId { get; set; }
    public Paiol Paiol { get; set; } = null!;

    [Required(ErrorMessage = "O nome do cargo é obrigatório.")]
    [StringLength(50, ErrorMessage = "O nome do cargo não pode exceder 50 caracteres.")]
    public string RoleName { get; set; } = string.Empty;
}
