namespace Finalproj.Domain.Interfaces.Repositories;

public interface IServicoZonaLancamentoRepository
{
    Task AddAsync(ServicoZonaLancamento entity, CancellationToken cancellationToken = default);
    Task ClearForServicoAsync(int servicoId, CancellationToken cancellationToken = default);
    /// <summary>Sincroniza distâncias da zona com o valor exigido (MAX catálogo); remove se null.</summary>
    Task SyncDistanciasSegurancaZonaAsync(int zonaId, int? distanciaExigida_m, CancellationToken cancellationToken = default);
}
