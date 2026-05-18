using Finalproj.Application.Features.Servicos.DTOs;

namespace Finalproj.Application.Features.Servicos.Interfaces;

public interface IServicosApiApplicationService
{
    Task<object> ListAsync(int? clienteId, DateTime? dataDesde, DateTime? dataAte, int pagina, int itensPorPagina, CancellationToken cancellationToken = default);
    Task<Servico?> GetFullAsync(int id, CancellationToken cancellationToken = default);
    Task<object?> GetDetailsDataAsync(int id, CancellationToken cancellationToken = default);
    Task<object?> GetEditDataAsync(int id, CancellationToken cancellationToken = default);
    Task<string?> GetDocumentoExtraPathAsync(int servicoId, int extraId, CancellationToken cancellationToken = default);
    Task<object?> GetUploadLicencaDataAsync(int servicoId, TipoLicencaServico tipo, OrigemRegistoServicoLicenca origem, int? licencaId, CancellationToken cancellationToken = default);
    Task<string?> GetLicencaFilePathAsync(int servicoId, int licencaId, CancellationToken cancellationToken = default);
    Task<Servico?> GetFullAfterChangeAsync(int id, CancellationToken cancellationToken = default);
    Task<Servico?> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<(ServicoLicenca? Licenca, string? Erro)> GuardarLicencaAsync(int servicoId, ServicoLicencaDto model, TipoLicencaServico tipo, OrigemRegistoServicoLicenca origem, int? licencaId, CancellationToken cancellationToken = default);
    Task SaveLicencaFilePathAsync(ServicoLicenca licenca, string caminhoRelativo, CancellationToken cancellationToken = default);
    Task<ServicoDistanciaSeguranca?> GuardarDistanciaAsync(int servicoId, int distanciaId, decimal? distanciaMedida, CancellationToken cancellationToken = default);
}
