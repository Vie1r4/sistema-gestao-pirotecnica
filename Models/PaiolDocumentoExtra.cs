using System.ComponentModel.DataAnnotations;

namespace Finalproj.Models;

// Documento do paiol (licença, planta) com nome à escolha; caminho do ficheiro
public class PaiolDocumentoExtra
{
    public int Id { get; set; }

    public int PaiolId { get; set; }
    public Paiol Paiol { get; set; } = null!;

    [Required(ErrorMessage = "O nome do documento é obrigatório.")]
    [StringLength(100, ErrorMessage = "O nome do documento não pode exceder 100 caracteres.")]
    [Display(Name = "Nome do documento")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "O caminho do ficheiro é obrigatório.")]
    [StringLength(500, ErrorMessage = "O caminho não pode exceder 500 caracteres.")]
    public string Caminho { get; set; } = string.Empty;
}
