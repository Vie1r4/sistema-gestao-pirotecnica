namespace Finalproj.Domain.Interfaces.Repositories;

public interface IServicoDistanciaSegurancaRepository
{
    Task<IReadOnlyList<TipoReferenciaDistancia>> ListTiposByServicoIdAsync(int servicoId, CancellationToken cancellationToken = default);
    Task AddAsync(ServicoDistanciaSeguranca entity, CancellationToken cancellationToken = default);

    Task<ServicoDistanciaSeguranca?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ServicoDistanciaSeguranca>> ListByServicoIdOrderedNoTrackingAsync(int servicoId, CancellationToken cancellationToken = default);
    /// <summary>Sincroniza distâncias do serviço com o máximo entre zonas; remove se null.</summary>
    Task SyncDistanciasSegurancaServicoAsync(int servicoId, int? distanciaExigida_m, CancellationToken cancellationToken = default);
}

