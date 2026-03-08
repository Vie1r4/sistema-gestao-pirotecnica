using System.ComponentModel.DataAnnotations;

namespace Finalproj.Models;

// Ficha de cliente (empresa ou particular); dados comerciais e contacto
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

    [StringLength(9, MinimumLength = 9, ErrorMessage = "O NIF deve ter 9 dígitos.")]
    [Display(Name = "NIF")]
    [RegularExpression(@"^\d{9}$", ErrorMessage = "NIF inválido (apenas 9 dígitos).")]
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

    // Conta Identity se o cliente aceder ao sistema
    [StringLength(450)]
    public string? UserId { get; set; }

    // Documentos com nome à escolha
    public ICollection<ClienteDocumentoExtra> DocumentosExtras { get; set; } = new List<ClienteDocumentoExtra>();
}
