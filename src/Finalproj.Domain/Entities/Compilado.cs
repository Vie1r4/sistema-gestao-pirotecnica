using System.ComponentModel.DataAnnotations;

namespace Finalproj.Domain.Entities;

/// <summary>Atalho nomeado que expande para vários produtos com quantidades fixas por unidade.</summary>
public class Compilado
{
    public int Id { get; set; }

    [Required(ErrorMessage = "O nome do compilado é obrigatório.")]
    [StringLength(200)]
    public string Nome { get; set; } = string.Empty;

    public List<CompiladoItem> Itens { get; set; } = new();
}
