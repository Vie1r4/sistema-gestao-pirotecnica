using Finalproj.Application.Features.Compilados.DTOs;

namespace Finalproj.Application.Features.Compilados.Interfaces;

public interface ICompiladoApplicationService
{
    Task<IReadOnlyList<CompiladoResponseDto>> ListAsync(CancellationToken cancellationToken = default);
    Task<CompiladoResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<(CompiladoResponseDto? Result, string? Error)> CreateAsync(SaveCompiladoDto input, CancellationToken cancellationToken = default);
    Task<(CompiladoResponseDto? Result, string? Error)> UpdateAsync(int id, SaveCompiladoDto input, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    /// <summary>Expande um compilado para linhas de produto (produtoId → quantidade total).</summary>
    Task<(IReadOnlyDictionary<int, decimal> Expansao, string? Error)> ExpandirAsync(int compiladoId, decimal quantidadeCompilado, CancellationToken cancellationToken = default);
}
