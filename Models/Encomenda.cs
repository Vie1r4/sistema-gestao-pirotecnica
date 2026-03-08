using System.ComponentModel.DataAnnotations;

namespace Finalproj.Models;

// Encomenda do cliente. Ciclo: Pendente → Aceite|Rejeitada; Aceite → Em preparação → Concluída.
// Enquanto estiver Pendente/Aceite/Em preparação o stock fica reservado.
public class Encomenda
{
    public int Id { get; set; }

    public int ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;

    // Valores em ConstantesEncomenda (Pendente, Aceite, Rejeitada, etc.)
    [Required(ErrorMessage = "O estado da encomenda é obrigatório.")]
    [StringLength(20, ErrorMessage = "O estado não pode exceder 20 caracteres.")]
    public string Estado { get; set; } = ConstantesEncomenda.PENDENTE;

    [Display(Name = "Data de criação")]
    [DataType(DataType.DateTime)]
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    [Display(Name = "Data de conclusão")]
    [DataType(DataType.DateTime)]
    public DateTime? DataConclusao { get; set; }

    [Display(Name = "Data de entrega")]
    [DataType(DataType.Date)]
    public DateTime? DataEntrega { get; set; }

    [StringLength(2000)]
    [Display(Name = "Observações")]
    public string? Observacoes { get; set; }

    [StringLength(500)]
    [Display(Name = "Motivo de rejeição")]
    public string? MotivoRejeicao { get; set; }

    // UserId do Identity (quem aceitou / quem preparou)
    [StringLength(450)]
    public string? FuncionarioAceiteUserId { get; set; }
    [StringLength(450)]
    public string? FuncionarioPreparouUserId { get; set; }

    public ICollection<EncomendaItem> Itens { get; set; } = new List<EncomendaItem>();

    // Um serviço no terreno usa o material desta encomenda (só quando concluída)
    public ICollection<Servico> Servicos { get; set; } = new List<Servico>();
}
