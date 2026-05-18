namespace Finalproj.Domain.Entities;

public class ServicoEquipa
{
    public int Id { get; set; }

    public int ServicoId { get; set; }
    public Servico Servico { get; set; } = null!;

    public int FuncionarioId { get; set; }
    public Funcionario Funcionario { get; set; } = null!;
}
