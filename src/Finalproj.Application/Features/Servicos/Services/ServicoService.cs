using Finalproj.Application.Features.Servicos.DTOs;
using Finalproj.Application.Services;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Servicos.Services;

/// <summary>
/// Implementação das regras de domínio e aplicação para Serviços: validações, equipa, resumo de material, distâncias de segurança e dados para formulários.
/// </summary>
public class ServicoService : IServicoService
{
    private readonly IEncomendaRepository _encomendaRepository;
    private readonly IServicoRepository _servicoRepository;
    private readonly IFuncionarioRepository _funcionarioRepository;
    private readonly IServicoDocumentoExtraRepository _servicoDocumentoExtraRepository;
    private readonly IServicoEquipaRepository _servicoEquipaRepository;
    private readonly IServicoDistanciaSegurancaRepository _servicoDistanciaSegurancaRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDocumentoStorageService _documentoStorage;

    public ServicoService(
        IEncomendaRepository encomendaRepository,
        IServicoRepository servicoRepository,
        IFuncionarioRepository funcionarioRepository,
        IServicoDocumentoExtraRepository servicoDocumentoExtraRepository,
        IServicoEquipaRepository servicoEquipaRepository,
        IServicoDistanciaSegurancaRepository servicoDistanciaSegurancaRepository,
        IUnitOfWork unitOfWork,
        IDocumentoStorageService documentoStorage)
    {
        _encomendaRepository = encomendaRepository;
        _servicoRepository = servicoRepository;
        _funcionarioRepository = funcionarioRepository;
        _servicoDocumentoExtraRepository = servicoDocumentoExtraRepository;
        _servicoEquipaRepository = servicoEquipaRepository;
        _servicoDistanciaSegurancaRepository = servicoDistanciaSegurancaRepository;
        _unitOfWork = unitOfWork;
        _documentoStorage = documentoStorage;
    }

    /// <inheritdoc />
    public async Task<(bool Valido, string? Erro)> ValidarResponsavelEEquipaAsync(int? responsavelTecnicoId, int[]? equipaIds, CancellationToken cancellationToken = default)
    {
        if (responsavelTecnicoId.HasValue)
        {
            var resp = await _funcionarioRepository.GetByIdAsync(responsavelTecnicoId.Value, cancellationToken);
            if (resp == null || string.IsNullOrWhiteSpace(resp.DocumentoADDRCaminho) || string.IsNullOrWhiteSpace(resp.LicencaOperadorCaminho))
                return (false, "O responsável técnico tem de ser um funcionário com ADR e licença de operador.");
        }
        if (equipaIds != null && equipaIds.Length > 0)
        {
            var comLicenca = await ObterIdsFuncionariosComLicencaOperadorAsync(cancellationToken);
            var invalidos = equipaIds.Where(fid => !comLicenca.Contains(fid)).ToList();
            if (invalidos.Count > 0)
                return (false, "Só podem fazer parte da equipa funcionários com licença de operador.");
        }
        return (true, null);
    }

    /// <inheritdoc />
    public async Task<DadosFormularioServicoResult> ObterDadosFormularioAsync(int? servicoIdParaExcluirEncomenda, int? encomendaIdSugerido, CancellationToken cancellationToken = default)
    {
        var encomendasJaUsadas = await _servicoRepository.GetEncomendaIdsAssociadasAsync(servicoIdParaExcluirEncomenda, cancellationToken);

        var encomendas = await _encomendaRepository.ListConcluidasComClienteExceptEncomendaIdsAsync(encomendasJaUsadas, cancellationToken);

        var items = encomendas.Select(e => new { Id = e.Id, Texto = "#" + e.Id + " - " + e.Cliente.Nome + (e.DataConclusao.HasValue ? " (" + e.DataConclusao.Value.ToString("dd/MM/yyyy") + ")" : "") }).Cast<object>().ToList();

        var responsaveis = await _funcionarioRepository.ListResponsaveisTecnicosOrdenadosAsync(cancellationToken);

        var equipa = await _funcionarioRepository.ListEquipaComLicencaOperadorOrdenadosAsync(cancellationToken);

        return new DadosFormularioServicoResult
        {
            Encomendas = items,
            ResponsaveisTecnicos = responsaveis.ToList(),
            FuncionariosEquipa = equipa.ToList(),
            TiposAcesso = ConstantesServico.TiposAcesso
        };
    }

    /// <inheritdoc />
    public async Task<(Servico? Servico, string? Erro)> CriarServicoAsync(Servico servico, int[]? equipaIds, CancellationToken cancellationToken = default)
    {
        var encomenda = await _encomendaRepository.GetByIdWithClienteAsync(servico.EncomendaId, cancellationToken);
        if (encomenda == null)
            return (null, "Selecione uma encomenda concluída.");

        servico.ClienteId = encomenda.ClienteId;
        var encomendaJaUsada = await _servicoRepository.ExistsParaEncomendaAsync(servico.EncomendaId, null, cancellationToken);
        if (encomendaJaUsada)
            return (null, "Cada encomenda só pode ser utilizada num único serviço. Esta encomenda já está associada a outro serviço.");

        var (valid, errorMsg) = await ValidarResponsavelEEquipaAsync(servico.ResponsavelTecnicoId, equipaIds, cancellationToken);
        if (!valid)
            return (null, errorMsg);

        var equipaIdsComResponsavel = IncluirResponsavelNaEquipa(equipaIds, servico.ResponsavelTecnicoId);

        await _servicoRepository.AddAsync(servico, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await GravarEquipaAsync(servico.Id, equipaIdsComResponsavel, cancellationToken);

        return (servico, null);
    }

    /// <inheritdoc />
    public async Task AdicionarDocumentosExtrasAsync(int servicoId, IReadOnlyList<DocumentoGuardadoInput> documentos, CancellationToken cancellationToken = default)
    {
        if (documentos == null || documentos.Count == 0) return;
        foreach (var ext in documentos)
        {
            var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento" : ext.Nome.Trim();
            if (nome.Length > 100) nome = nome[..100];
            await _servicoDocumentoExtraRepository.AddAsync(new ServicoDocumentoExtra { ServicoId = servicoId, Nome = nome, Caminho = ext.Caminho }, cancellationToken);
        }
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<(Servico? Servico, string? Erro)> AtualizarServicoAsync(int id, Servico servico, int[]? equipaIds, IReadOnlyList<DocumentoGuardadoInput> documentosNovos, IReadOnlyList<int>? removerDocumentoIds, CancellationToken cancellationToken = default)
    {
        var encomenda = await _encomendaRepository.GetByIdWithClienteAsync(servico.EncomendaId, cancellationToken);
        if (encomenda != null)
        {
            servico.ClienteId = encomenda.ClienteId;
            var encomendaJaUsada = await _servicoRepository.ExistsParaEncomendaAsync(servico.EncomendaId, id, cancellationToken);
            if (encomendaJaUsada)
                return (null, "Cada encomenda só pode ser utilizada num único serviço. Esta encomenda já está associada a outro serviço.");
        }

        var (valid, errorMsg) = await ValidarResponsavelEEquipaAsync(servico.ResponsavelTecnicoId, equipaIds, cancellationToken);
        if (!valid)
            return (null, errorMsg);

        var equipaIdsComResponsavel = IncluirResponsavelNaEquipa(equipaIds, servico.ResponsavelTecnicoId);

        if (removerDocumentoIds != null && removerDocumentoIds.Count > 0)
        {
            var aRemover = await _servicoDocumentoExtraRepository.ListByServicoAndIdsAsync(id, removerDocumentoIds, cancellationToken);
            foreach (var d in aRemover)
            {
                _documentoStorage.ApagarFicheiroSeExistir(d.Caminho);
            }
            _servicoDocumentoExtraRepository.RemoveRange(aRemover);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        await _servicoRepository.UpdateAsync(servico, cancellationToken);
        var equipaAtual = await _servicoEquipaRepository.ListByServicoIdAsync(id, cancellationToken);
        _servicoEquipaRepository.RemoveRange(equipaAtual);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await GravarEquipaAsync(id, equipaIdsComResponsavel, cancellationToken);

        if (documentosNovos != null && documentosNovos.Count > 0)
        {
            foreach (var ext in documentosNovos)
            {
                var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento" : ext.Nome.Trim();
                if (nome.Length > 100) nome = nome[..100];
                await _servicoDocumentoExtraRepository.AddAsync(new ServicoDocumentoExtra { ServicoId = id, Nome = nome, Caminho = ext.Caminho }, cancellationToken);
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var updated = await _servicoRepository.FindTrackedByIdAsync(id, cancellationToken);
        return (updated, null);
    }

    /// <inheritdoc />
    public ResumoMaterialServicoViewModel CalcularResumoMaterial(int encomendaId, List<EncomendaItem> itens)
    {
        var resumo = new ResumoMaterialServicoViewModel
        {
            EncomendaId = encomendaId,
            TemItens = itens.Count > 0
        };
        if (itens.Count == 0) return resumo;

        resumo.NumeroProdutos = itens.Select(i => i.ProdutoId).Distinct().Count();
        resumo.TotalUnidades = itens.Sum(i => i.QuantidadePedida);
        resumo.MleTotalKg = itens.Sum(i => i.QuantidadePedida * (i.Produto?.NEMPorUnidade ?? 0));
        resumo.PesoBrutoKg = null;

        var familias = itens
            .Select(i => i.Produto?.FamiliaRisco)
            .Where(f => !string.IsNullOrWhiteSpace(f))
            .Distinct()
            .OrderBy(f => f)
            .ToList();
        resumo.CategoriasPresentes = string.Join(" · ", familias);

        var ordemPerigo = new[] { "1.1G", "1.3G", "1.4G", "1.4S" };
        int IndicePerigo(string? f)
        {
            var i = Array.IndexOf(ordemPerigo, f ?? "");
            return i < 0 ? 999 : i;
        }
        resumo.DivisaoDominante = familias.OrderBy(IndicePerigo).FirstOrDefault();
        resumo.CorDivisaoDominante = resumo.DivisaoDominante switch
        {
            "1.1G" => "danger",
            "1.3G" => "warning",
            "1.4G" => "warning",
            "1.4S" => "success",
            _ => "secondary"
        };
        return resumo;
    }

    /// <inheritdoc />
    public async Task EnsureDistanciasSegurancaAsync(int servicoId, string? divisaoDominante, CancellationToken cancellationToken = default)
    {
        var existentes = await _servicoDistanciaSegurancaRepository.ListTiposByServicoIdAsync(servicoId, cancellationToken);
        var tipos = Enum.GetValues<TipoReferenciaDistancia>().Where(t => t != TipoReferenciaDistancia.OUTRO).ToList();
        var faltam = tipos.Where(t => !existentes.Contains(t)).ToList();
        if (faltam.Count == 0) return;
        foreach (var tipo in faltam)
        {
            int min = tipo == TipoReferenciaDistancia.HABITACAO
                ? ConstantesDistanciaSeguranca.HabitacaoMinimaMetros(divisaoDominante)
                : tipo switch
                {
                    TipoReferenciaDistancia.ESTRADA_NACIONAL => ConstantesDistanciaSeguranca.EstradaNacional,
                    TipoReferenciaDistancia.AUTOESTRADA => ConstantesDistanciaSeguranca.Autoestrada,
                    TipoReferenciaDistancia.LINHA_ALTA_TENSAO => ConstantesDistanciaSeguranca.LinhaAltaTensao,
                    TipoReferenciaDistancia.FLORESTA => ConstantesDistanciaSeguranca.Floresta,
                    _ => 50
                };
            await _servicoDistanciaSegurancaRepository.AddAsync(new ServicoDistanciaSeguranca
            {
                ServicoId = servicoId,
                TipoReferencia = tipo,
                DescricaoReferencia = ConstantesDistanciaSeguranca.Nome(tipo),
                DistanciaMinima_m = min
            }, cancellationToken);
        }
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<List<int>> ObterIdsFuncionariosComLicencaOperadorAsync(CancellationToken cancellationToken)
    {
        var ids = await _funcionarioRepository.GetIdsComLicencaOperadorAsync(cancellationToken);
        return ids.ToList();
    }

    private static int[] IncluirResponsavelNaEquipa(int[]? equipaIds, int? responsavelTecnicoId)
    {
        if (!responsavelTecnicoId.HasValue) return equipaIds ?? Array.Empty<int>();
        var set = new HashSet<int>(equipaIds ?? Array.Empty<int>());
        set.Add(responsavelTecnicoId.Value);
        return set.ToArray();
    }

    private async Task GravarEquipaAsync(int servicoId, int[]? equipaIds, CancellationToken cancellationToken = default)
    {
        var comLicenca = await ObterIdsFuncionariosComLicencaOperadorAsync(cancellationToken);
        if (equipaIds == null || equipaIds.Length == 0) return;
        foreach (var fid in equipaIds.Distinct())
        {
            if (comLicenca.Contains(fid))
                await _servicoEquipaRepository.AddAsync(new ServicoEquipa { ServicoId = servicoId, FuncionarioId = fid }, cancellationToken);
        }
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
