using System.ComponentModel.DataAnnotations;

namespace Finalproj.Domain.Entities;

public class Cliente
{
    public int Id { get; set; }

    [Required(ErrorMessage = "O nome ou designação é obrigatório.")]
    [StringLength(200)]
    [Display(Name = "Nome / Designação")]
    public string Nome { get; set; } = string.Empty;

    [StringLength(20)]
    [Display(Name = "Tipo")]
    public string TipoCliente { get; set; } = "Particular";

    [StringLength(20)]
    [Display(Name = "NIF")]
    public string? NIF { get; set; }

    [EmailAddress(ErrorMessage = "Email inválido.")]
    [StringLength(256)]
    [Display(Name = "Email")]
    public string? Email { get; set; }

    [StringLength(20)]
    [Display(Name = "Telefone")]
    [Phone(ErrorMessage = "Telefone inválido.")]
    public string? Telefone { get; set; }

    [StringLength(300)]
    [Display(Name = "Morada")]
    public string? Morada { get; set; }

    [StringLength(10)]
    [Display(Name = "Código-postal")]
    public string? CodigoPostal { get; set; }

    [StringLength(100)]
    [Display(Name = "Localidade")]
    public string? Localidade { get; set; }

    [StringLength(500)]
    [Display(Name = "Notas")]
    public string? Notas { get; set; }

    [Display(Name = "Data de registo")]
    [DataType(DataType.DateTime)]
    public DateTime? DataRegisto { get; set; }

    [StringLength(450)]
    public string? UserId { get; set; }

    /// <summary>Preenchido em eliminação lógica; a ficha deixa de estar disponível mas o registo permanece para histórico.</summary>
    public DateTime? EliminadoEm { get; set; }

    public bool EstaDisponivel => EliminadoEm == null;

    public ICollection<ClienteDocumentoExtra> DocumentosExtras { get; set; } = new List<ClienteDocumentoExtra>();
}
