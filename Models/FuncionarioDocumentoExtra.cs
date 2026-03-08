using System.ComponentModel.DataAnnotations;

namespace Finalproj.Models;

// Documento extra do funcionário com nome personalizado; vários por funcionário
public class FuncionarioDocumentoExtra
{
    public int Id { get; set; }

    public int FuncionarioId { get; set; }
    public Funcionario Funcionario { get; set; } = null!;

    [Required(ErrorMessage = "O nome do documento é obrigatório.")]
    [StringLength(100, ErrorMessage = "O nome do documento não pode exceder 100 caracteres.")]
    [Display(Name = "Nome do documento")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "O caminho do ficheiro é obrigatório.")]
    [StringLength(500, ErrorMessage = "O caminho não pode exceder 500 caracteres.")]
    public string Caminho { get; set; } = string.Empty;
}
