using Finalproj.Application.Features.DocumentacaoRegulatoria.Interfaces;
using Finalproj.Application.Features.Servicos.DTOs;
using Finalproj.Application.Features.Servicos.Interfaces;
using Finalproj.Application.Services;
using Finalproj.Infrastructure.Configuration;
using Finalproj.Infrastructure.DocumentacaoRegulatoria;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace Finalproj.Infrastructure.Services;

public sealed class DocumentacaoRegulatoriaService(
    IServicoRepository servicos,
    IServicoLicencaRepository licencas,
    IServicosApiApplicationService servicosApi,
    GeradorDeclaracaoPspService gerador,
    IDocumentoStorageService storage,
    ILogSistemaService logSistema,
    IOptions<EmpresaPirotecnicaOptions> empresaOptions,
    IHostEnvironment hostEnvironment) : IDocumentacaoRegulatoriaService
{
    private const string PastaDocumentosServico = "Documentos/Servico";

    public bool DownloadExigeDocumentacaoRegulatoria(TipoLicencaServico tipo, OrigemRegistoServicoLicenca origem) =>
        tipo == TipoLicencaServico.LICENCA_PSP && origem == OrigemRegistoServicoLicenca.PedidoGerado;

    public async Task<string?> ResolverDownloadLicencaAsync(
        int servicoId,
        int licencaId,
        bool autorizadoDocumentacaoRegulatoria,
        string? userId,
        string? userName,
        CancellationToken cancellationToken = default)
    {
        var lic = await licencas.GetByServicoAndIdNoTrackingAsync(servicoId, licencaId, cancellationToken);
        if (lic == null || string.IsNullOrWhiteSpace(lic.FicheiroPath))
            return null;

        if (!DownloadExigeDocumentacaoRegulatoria(lic.TipoLicenca, lic.OrigemRegisto))
            return lic.FicheiroPath;

        if (!autorizadoDocumentacaoRegulatoria)
            return null;

        await logSistema.RegistarAsync(
            "DocumentacaoRegulatoria.DownloadDeclaracaoPsp",
            userId,
            userName,
            new { servicoId, licencaId, lic.FicheiroPath },
            cancellationToken);

        return lic.FicheiroPath;
    }

    public async Task<(int LicencaId, string CaminhoRelativo, string NomeFicheiro, string? Erro)> GerarDeclaracaoPspAsync(
        int servicoId,
        string? userId,
        string? userName,
        CancellationToken cancellationToken = default)
    {
        var servico = await servicos.GetByIdFullGraphNoTrackingAsync(servicoId, cancellationToken);
        if (servico == null)
            return (0, "", "", "Serviço não encontrado.");

        if (servico.ZonasLancamento == null || servico.ZonasLancamento.Count == 0)
            return (0, "", "", "O serviço deve ter pelo menos uma zona de lançamento para gerar a declaração.");

        if (string.IsNullOrWhiteSpace(servico.NomeEvento) && string.IsNullOrWhiteSpace(servico.Encomenda?.Nome))
            return (0, "", "", "Indique o nome do evento no serviço ou na encomenda antes de gerar a declaração.");

        if (servico.CoordenadorPirotecnicoId.HasValue)
        {
            var coord = servico.CoordenadorPirotecnico;
            if (coord == null)
                return (0, "", "", "Coordenador pirotécnico associado ao serviço não foi encontrado.");
            if (string.IsNullOrWhiteSpace(coord.NumeroCredencial))
                return (0, "", "", $"O coordenador «{coord.NomeCompleto}» não tem n.º CRED na ficha. Preencha em Funcionários → editar → «N.º credencial (CRED)».");
        }

        var empresa = empresaOptions.Value;
        var templatePath = ResolverTemplatePath(empresa.TemplateDeclaracaoPsp);
        var docxBytes = gerador.Gerar(servico, empresa, templatePath);
        byte[] bytes;
        try
        {
            bytes = DocxParaPdfConverter.Converter(docxBytes);
        }
        catch (Exception ex)
        {
            return (0, "", "", $"Não foi possível converter a declaração para PDF: {ex.Message}");
        }

        var nomeFicheiro = $"declaracao_psp_{servicoId}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
        var caminhoRelativo = Path.Combine(PastaDocumentosServico, servicoId.ToString(), "Licencas", nomeFicheiro).Replace('\\', '/');
        await storage.GuardarBytesNoCaminhoRelativoAsync(caminhoRelativo, bytes, cancellationToken);

        var model = new ServicoLicencaDto
        {
            ServicoId = servicoId,
            TipoLicenca = TipoLicencaServico.LICENCA_PSP,
            OrigemRegisto = OrigemRegistoServicoLicenca.PedidoGerado,
            NumeroDocumento = $"PED-{servicoId}-{DateTime.UtcNow:yyyyMMdd}",
            DataEmissao = DateTime.Today,
            Observacoes = "Declaração PSP gerada automaticamente pelo sistema."
        };

        var licencaExistente = await licencas.FindByServicoTipoOrigemAsync(
            servicoId, TipoLicencaServico.LICENCA_PSP, OrigemRegistoServicoLicenca.PedidoGerado, cancellationToken);

        var (lic, erro) = await servicosApi.GuardarLicencaAsync(
            servicoId, model, TipoLicencaServico.LICENCA_PSP, OrigemRegistoServicoLicenca.PedidoGerado, licencaExistente?.Id, cancellationToken);
        if (erro != null)
            return (0, "", "", erro);
        if (lic == null)
            return (0, "", "", "Erro ao registar licença.");

        if (!string.IsNullOrWhiteSpace(lic.FicheiroPath))
            storage.ApagarFicheiroSeExistir(lic.FicheiroPath);

        await servicosApi.SaveLicencaFilePathAsync(lic, caminhoRelativo, cancellationToken);

        await logSistema.RegistarAsync(
            "DocumentacaoRegulatoria.GerarDeclaracaoPsp",
            userId,
            userName,
            new { servicoId, licencaId = lic.Id, caminhoRelativo },
            cancellationToken);

        return (lic.Id, caminhoRelativo, nomeFicheiro, null);
    }

    private string? ResolverTemplatePath(string? relativo)
    {
        if (string.IsNullOrWhiteSpace(relativo))
            return null;
        var path = Path.Combine(hostEnvironment.ContentRootPath, relativo.Replace('/', Path.DirectorySeparatorChar));
        return File.Exists(path) ? path : null;
    }
}
