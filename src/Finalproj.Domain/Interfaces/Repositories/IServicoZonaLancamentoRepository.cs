namespace Finalproj.Domain.Interfaces.Repositories;

public interface IServicoZonaLancamentoRepository
{
    Task AddAsync(ServicoZonaLancamento entity, CancellationToken cancellationToken = default);
    Task ClearForServicoAsync(int servicoId, CancellationToken cancellationToken = default);
    Task AddDistanciasPadraoAsync(int zonaId, string? divisaoDominante, CancellationToken cancellationToken = default);
}
