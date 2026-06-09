namespace Finalproj.Domain.Interfaces.Repositories;

public interface IReservaRepository
{
    Task<Dictionary<int, decimal>> SumQuantidadePorProdutoParaEstadosComReservaAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Reserva>> ListByEncomendaIdTrackedAsync(int encomendaId, CancellationToken cancellationToken = default);
    Task AddAsync(Reserva entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<Reserva> entities);
}

