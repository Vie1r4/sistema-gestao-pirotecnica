using System.ComponentModel.DataAnnotations;

namespace Finalproj.Models;

// Membro da equipa num serviço (N:N Serviço–Funcionário)
public class ServicoEquipa
{
    public int Id { get; set; }

    public int ServicoId { get; set; }
    public Servico Servico { get; set; } = null!;

    public int FuncionarioId { get; set; }
    public Funcionario Funcionario { get; set; } = null!;
}
