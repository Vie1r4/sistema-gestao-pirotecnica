namespace Finalproj.Domain.Interfaces.Repositories;

public interface IPaiolAcessoRepository
{
    Task<IReadOnlyList<int>> ListPaiolIdsByRoleNamesAsync(IReadOnlyCollection<string> roleNames, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<int>> ListAllPaiolIdsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PaiolAcesso>> ListByPaiolIdTrackedAsync(int paiolId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> ListRoleNamesByPaiolIdAsync(int paiolId, CancellationToken cancellationToken = default);
    Task AddAsync(PaiolAcesso entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<PaiolAcesso> entities);
}

