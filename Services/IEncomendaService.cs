using Finalproj.Models;

namespace Finalproj.Services;

// Preparação de encomenda: saídas por FIFO e actualização de estado; valida acesso aos paióis
public interface IEncomendaService
{
    Task<(bool Sucesso, string? Erro)> RegistarPreparacaoAsync(
        int encomendaId,
        string? userId,
        IReadOnlyList<int> idsPaióisComAcesso,
        List<RetiradaPreparacaoInput> retiradas,
        string? userName,
        CancellationToken cancellationToken = default);
}
