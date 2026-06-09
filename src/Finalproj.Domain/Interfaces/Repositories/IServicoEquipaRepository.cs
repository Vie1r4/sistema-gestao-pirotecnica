namespace Finalproj.Domain.Interfaces.Repositories;

public interface IServicoEquipaRepository
{
    Task<IReadOnlyList<ServicoEquipa>> ListByServicoIdAsync(int servicoId, CancellationToken cancellationToken = default);
    Task AddAsync(ServicoEquipa entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<ServicoEquipa> entities);
}

