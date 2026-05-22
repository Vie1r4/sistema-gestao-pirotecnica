using System.ComponentModel.DataAnnotations;

namespace Finalproj.Domain.Entities;

public class Encomenda
{
    public int Id { get; set; }

    public int ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;

    [Required(ErrorMessage = "O estado da encomenda é obrigatório.")]
    [StringLength(20, ErrorMessage = "O estado não pode exceder 20 caracteres.")]
    public string Estado { get; set; } = ConstantesEncomenda.PENDENTE;

    [Display(Name = "Data de criação")]
    [DataType(DataType.DateTime)]
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    [Display(Name = "Data de conclusão")]
    [DataType(DataType.DateTime)]
    public DateTime? DataConclusao { get; set; }

    [Display(Name = "Data de aceitação")]
    [DataType(DataType.DateTime)]
    public DateTime? DataAceite { get; set; }

    [Display(Name = "Data de início de preparação")]
    [DataType(DataType.DateTime)]
    public DateTime? DataEmPreparacao { get; set; }

    [Display(Name = "Data de entrega")]
    [DataType(DataType.Date)]
    public DateTime? DataEntrega { get; set; }

    [StringLength(2000)]
    [Display(Name = "Observações")]
    public string? Observacoes { get; set; }

    [StringLength(500)]
    [Display(Name = "Motivo de rejeição")]
    public string? MotivoRejeicao { get; set; }

    [StringLength(450)]
    public string? FuncionarioAceiteUserId { get; set; }
    [StringLength(450)]
    public string? FuncionarioPreparouUserId { get; set; }

    public ICollection<EncomendaItem> Itens { get; set; } = new List<EncomendaItem>();

    public ICollection<Servico> Servicos { get; set; } = new List<Servico>();
}
