namespace Finalproj.Application.Features.DocumentacaoRegulatoria.Interfaces;
public interface IDocumentacaoRegulatoriaService
{
    /// <summary>Gera a declaração PSP em DOCX, regista licença PedidoGerado e devolve metadados.</summary>
    Task<(int LicencaId, string CaminhoRelativo, string NomeFicheiro, string? Erro)> GerarDeclaracaoPspAsync(
        int servicoId,
        string? userId,
        string? userName,
        CancellationToken cancellationToken = default);

    /// <summary>Resolve caminho de download; devolve null se não autorizado (404) ou inexistente.</summary>
    Task<string?> ResolverDownloadLicencaAsync(
        int servicoId,
        int licencaId,
        bool autorizadoDocumentacaoRegulatoria,
        string? userId,
        string? userName,
        CancellationToken cancellationToken = default);

    /// <summary>Indica se o download desta licença exige política de documentação regulatória.</summary>
    bool DownloadExigeDocumentacaoRegulatoria(TipoLicencaServico tipo, OrigemRegistoServicoLicenca origem);
}
