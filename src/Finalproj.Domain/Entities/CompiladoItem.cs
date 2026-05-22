using System.ComponentModel.DataAnnotations;

namespace Finalproj.Domain.Entities;

/// <summary>Linha de um compilado: quantidade de produto por cada unidade do atalho.</summary>
public class CompiladoItem
{
    public int Id { get; set; }

    public int CompiladoId { get; set; }
    public Compilado Compilado { get; set; } = null!;

    public int ProdutoId { get; set; }
    public Produto Produto { get; set; } = null!;

    [Range(0.0001, double.MaxValue, ErrorMessage = "A quantidade por unidade deve ser positiva.")]
    public decimal QuantidadePorUnidade { get; set; }
}
