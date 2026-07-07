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
    private readonly IServicoZonaLancamentoRepository _zonasRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDocumentoStorageService _documentoStorage;

    public ServicoService(
        IEncomendaRepository encomendaRepository,
        IServicoRepository servicoRepository,
        IFuncionarioRepository funcionarioRepository,
        IServicoDocumentoExtraRepository servicoDocumentoExtraRepository,
        IServicoEquipaRepository servicoEquipaRepository,
        IServicoDistanciaSegurancaRepository servicoDistanciaSegurancaRepository,
        IServicoZonaLancamentoRepository zonasRepository,
        IUnitOfWork unitOfWork,
        IDocumentoStorageService documentoStorage)
    {
        _encomendaRepository = encomendaRepository;
        _servicoRepository = servicoRepository;
        _funcionarioRepository = funcionarioRepository;
        _servicoDocumentoExtraRepository = servicoDocumentoExtraRepository;
        _servicoEquipaRepository = servicoEquipaRepository;
        _servicoDistanciaSegurancaRepository = servicoDistanciaSegurancaRepository;
        _zonasRepository = zonasRepository;
        _unitOfWork = unitOfWork;
        _documentoStorage = documentoStorage;
    }

    /// <inheritdoc />
    public async Task<(bool Valido, string? Erro)> ValidarEquipaServicoAsync(
        int? coordenadorPirotecnicoId,
        int[]? equipaIds,
        IReadOnlyList<ServicoZonaLancamentoInputDto>? zonas,
        CancellationToken cancellationToken = default)
    {
        var equipaSet = new HashSet<int>(equipaIds ?? Array.Empty<int>());

        if (coordenadorPirotecnicoId.HasValue)
        {
            var coord = await _funcionarioRepository.GetByIdAsync(coordenadorPirotecnicoId.Value, cancellationToken);
            if (coord == null || string.IsNullOrWhiteSpace(coord.LicencaOperadorCaminho))
                return (false, "O coordenador pirotécnico tem de ser um funcionário com credencial.");
            if (!equipaSet.Contains(coordenadorPirotecnicoId.Value))
                return (false, "O coordenador pirotécnico tem de ser um membro da equipa.");
        }
        foreach (var fid in equipaSet)
        {
            var func = await _funcionarioRepository.GetByIdAsync(fid, cancellationToken);
            if (func == null)
                return (false, "A equipa contém um funcionário inválido ou inexistente.");
        }

        if (zonas != null)
        {
            for (var i = 0; i < zonas.Count; i++)
            {
                var respId = zonas[i].ResponsavelPirotecnicoId;
                if (!respId.HasValue)
                    continue;
                if (!equipaSet.Contains(respId.Value))
                    return (false, $"O responsável pirotécnico da zona {(i + 1)} tem de ser um membro da equipa.");
                var resp = await _funcionarioRepository.GetByIdAsync(respId.Value, cancellationToken);
                if (resp == null)
                    return (false, $"O responsável pirotécnico da zona {(i + 1)} não existe.");
            }
        }

        return (true, null);
    }

    /// <inheritdoc />
    public async Task<DadosFormularioServicoResult> ObterDadosFormularioAsync(int? servicoIdParaExcluirEncomenda, int? encomendaIdSugerido, CancellationToken cancellationToken = default)
    {
        var encomendasJaUsadas = await _servicoRepository.GetEncomendaIdsAssociadasAsync(servicoIdParaExcluirEncomenda, cancellationToken);

        var encomendas = await _encomendaRepository.ListConcluidasComClienteExceptEncomendaIdsAsync(encomendasJaUsadas, cancellationToken);

        var items = encomendas.Select(e => new { Id = e.Id, Texto = "#" + e.Id + " - " + e.Cliente.Nome + (e.DataConclusao.HasValue ? " (" + e.DataConclusao.Value.ToString("dd/MM/yyyy") + ")" : "") }).Cast<object>().ToList();

        var todosFuncionarios = (await _funcionarioRepository.GetAllAsync(cancellationToken))
            .OrderBy(f => f.NomeCompleto)
            .ToList();

        return new DadosFormularioServicoResult
        {
            Encomendas = items,
            Funcionarios = todosFuncionarios,
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

        var (valid, errorMsg) = await ValidarEquipaServicoAsync(servico.CoordenadorPirotecnicoId, equipaIds, null, cancellationToken);
        if (!valid)
            return (null, errorMsg);

        servico.ResponsavelTecnicoId = null;
        servico.DataRegisto ??= DateTime.UtcNow;

        await _servicoRepository.AddAsync(servico, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await GravarEquipaAsync(servico.Id, equipaIds, cancellationToken);

        return (servico, null);
    }

    /// <inheritdoc />
    public async Task<(Servico? Servico, string? Erro)> CriarServicoComZonasAsync(ServicoSaveRequestDto dto, CancellationToken cancellationToken = default)
    {
        var erroValidacao = ValidarPedidoZonas(dto);
        if (erroValidacao != null)
            return (null, erroValidacao);

        var itens = (await _encomendaRepository.GetByIdWithClienteItensProdutoNoTrackingAsync(dto.EncomendaId, cancellationToken))?.Itens
            ?.ToList() ?? new List<EncomendaItem>();
        var erroMaterial = ValidarMaterialZonas(dto.Zonas, itens);
        if (erroMaterial != null)
            return (null, erroMaterial);

        var (validEquipa, erroEquipa) = await ValidarEquipaServicoAsync(dto.CoordenadorPirotecnicoId, dto.EquipaIds, dto.Zonas, cancellationToken);
        if (!validEquipa)
            return (null, erroEquipa);

        var servico = MapearServicoDePedido(dto);
        var encomenda = await _encomendaRepository.GetByIdWithClienteAsync(dto.EncomendaId, cancellationToken);
        if (string.IsNullOrWhiteSpace(servico.NomeEvento) && !string.IsNullOrWhiteSpace(encomenda?.Nome))
            servico.NomeEvento = encomenda.Nome.Trim();
        servico.DataServico = DerivarDataServico(dto);

        var (created, erro) = await CriarServicoAsync(servico, dto.EquipaIds, cancellationToken);
        if (erro != null || created == null)
            return (null, erro);

        await GravarZonasAsync(created.Id, dto.Zonas, itens, cancellationToken);
        await AtualizarRaioPublicoServicoAsync(created, dto.Zonas, itens, cancellationToken);
        return (created, null);
    }

    /// <inheritdoc />
    public async Task<(Servico? Servico, string? Erro)> AtualizarServicoComZonasAsync(
        int id,
        ServicoSaveRequestDto dto,
        IReadOnlyList<DocumentoGuardadoInput> documentosNovos,
        IReadOnlyList<int>? removerDocumentoIds,
        CancellationToken cancellationToken = default)
    {
        var erroValidacao = ValidarPedidoZonas(dto);
        if (erroValidacao != null)
            return (null, erroValidacao);

        var itens = (await _encomendaRepository.GetByIdWithClienteItensProdutoNoTrackingAsync(dto.EncomendaId, cancellationToken))?.Itens
            ?.ToList() ?? new List<EncomendaItem>();
        var erroMaterial = ValidarMaterialZonas(dto.Zonas, itens);
        if (erroMaterial != null)
            return (null, erroMaterial);

        var existente = await _servicoRepository.GetByIdWithZonasTrackedAsync(id, cancellationToken);
        if (existente == null)
            return (null, "Serviço não encontrado.");

        AplicarCamposServico(existente, dto);
        existente.DataServico = DerivarDataServico(dto);

        var (valid, errorMsg) = await ValidarEquipaServicoAsync(dto.CoordenadorPirotecnicoId, dto.EquipaIds, dto.Zonas, cancellationToken);
        if (!valid)
            return (null, errorMsg);

        var encomenda = await _encomendaRepository.GetByIdWithClienteAsync(dto.EncomendaId, cancellationToken);
        if (encomenda != null)
        {
            existente.ClienteId = encomenda.ClienteId;
            var encomendaJaUsada = await _servicoRepository.ExistsParaEncomendaAsync(dto.EncomendaId, id, cancellationToken);
            if (encomendaJaUsada)
                return (null, "Cada encomenda só pode ser utilizada num único serviço. Esta encomenda já está associada a outro serviço.");
        }

        if (removerDocumentoIds != null && removerDocumentoIds.Count > 0)
        {
            var aRemover = await _servicoDocumentoExtraRepository.ListByServicoAndIdsAsync(id, removerDocumentoIds, cancellationToken);
            foreach (var d in aRemover)
                _documentoStorage.ApagarFicheiroSeExistir(d.Caminho);
            _servicoDocumentoExtraRepository.RemoveRange(aRemover);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        await _servicoRepository.UpdateAsync(existente, cancellationToken);
        var equipaAtual = await _servicoEquipaRepository.ListByServicoIdAsync(id, cancellationToken);
        _servicoEquipaRepository.RemoveRange(equipaAtual);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await GravarEquipaAsync(id, dto.EquipaIds, cancellationToken);

        await _zonasRepository.ClearForServicoAsync(id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await GravarZonasAsync(id, dto.Zonas, itens, cancellationToken);
        await AtualizarRaioPublicoServicoAsync(existente, dto.Zonas, itens, cancellationToken);

        if (documentosNovos != null && documentosNovos.Count > 0)
            await AdicionarDocumentosExtrasAsync(id, documentosNovos, cancellationToken);

        var updated = await _servicoRepository.FindTrackedByIdAsync(id, cancellationToken);
        return (updated, null);
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
    public async Task<string?> RemoverDocumentoExtraAsync(int servicoId, int documentoExtraId, CancellationToken cancellationToken = default)
    {
        var aRemover = await _servicoDocumentoExtraRepository.ListByServicoAndIdsAsync(servicoId, new[] { documentoExtraId }, cancellationToken);
        var doc = aRemover.FirstOrDefault();
        if (doc == null)
            return "Documento não encontrado.";
        _documentoStorage.ApagarFicheiroSeExistir(doc.Caminho);
        _servicoDocumentoExtraRepository.RemoveRange(aRemover);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return null;
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

        var (valid, errorMsg) = await ValidarEquipaServicoAsync(servico.CoordenadorPirotecnicoId, equipaIds, null, cancellationToken);
        if (!valid)
            return (null, errorMsg);

        servico.ResponsavelTecnicoId = null;

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
        await GravarEquipaAsync(id, equipaIds, cancellationToken);

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
    public ResumoMaterialZonaViewModel CalcularResumoMaterialZona(int zonaId, string? designacao, int encomendaId, List<EncomendaItem> itens)
    {
        var baseResumo = CalcularResumoMaterial(encomendaId, itens);
        return new ResumoMaterialZonaViewModel
        {
            ZonaId = zonaId,
            Designacao = designacao,
            NumeroProdutos = baseResumo.NumeroProdutos,
            TotalUnidades = baseResumo.TotalUnidades,
            MleTotalKg = baseResumo.MleTotalKg,
            DivisaoDominante = baseResumo.DivisaoDominante,
            CorDivisaoDominante = baseResumo.CorDivisaoDominante,
            CategoriasPresentes = baseResumo.CategoriasPresentes
        };
    }

    /// <inheritdoc />
    public async Task EnsureDistanciasSegurancaAsync(int servicoId, string? divisaoDominante, CancellationToken cancellationToken = default)
    {
        await EnsureDistanciasSegurancaZonasAsync(servicoId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task EnsureDistanciasSegurancaZonasAsync(int servicoId, CancellationToken cancellationToken = default)
    {
        var servico = await _servicoRepository.GetByIdFullGraphNoTrackingAsync(servicoId, cancellationToken);
        if (servico?.ZonasLancamento == null || servico.ZonasLancamento.Count == 0)
            return;

        int? maxServico = null;
        foreach (var zona in servico.ZonasLancamento)
        {
            var linhas = zona.Linhas?.ToList() ?? new List<ServicoZonaLinha>();
            var produtosPorId = linhas
                .Where(l => l.Produto != null)
                .GroupBy(l => l.ProdutoId)
                .ToDictionary(g => g.Key, g => g.First().Produto!);
            var distanciaExigida = CalculoAreaSegurancaPublico.CalcularRaioMetros(linhas.Select(l => l.ProdutoId), produtosPorId);
            await _zonasRepository.SyncDistanciasSegurancaZonaAsync(zona.Id, distanciaExigida, cancellationToken);
            if (distanciaExigida.HasValue)
                maxServico = maxServico.HasValue ? Math.Max(maxServico.Value, distanciaExigida.Value) : distanciaExigida;
        }

        await _servicoDistanciaSegurancaRepository.SyncDistanciasSegurancaServicoAsync(servicoId, maxServico, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static string? ValidarPedidoZonas(ServicoSaveRequestDto dto)
    {
        if (dto.Zonas == null || dto.Zonas.Count == 0)
            return "O serviço deve ter pelo menos uma zona de lançamento.";
        for (var i = 0; i < dto.Zonas.Count; i++)
        {
            var z = dto.Zonas[i];
            if (z.Linhas == null || z.Linhas.Count == 0)
                return $"A zona {(i + 1)} deve ter pelo menos uma linha de lançamento (data, hora e material).";
            if (!z.CoordenadasLat.HasValue || !z.CoordenadasLng.HasValue)
                return $"A zona «{z.Designacao ?? (i + 1).ToString()}» deve ter coordenadas no mapa.";
            foreach (var linha in z.Linhas)
            {
                if (!linha.HoraInicio.HasValue)
                    return "A hora de início é obrigatória em cada linha de lançamento.";
                if (!linha.HoraFim.HasValue)
                    return "A hora de fim é obrigatória em cada linha de lançamento.";
                if (linha.HoraFim <= linha.HoraInicio)
                    return "A hora de fim deve ser posterior à hora de início em cada linha de lançamento.";
            }
        }
        return null;
    }

    private static string? ValidarMaterialZonas(IReadOnlyList<ServicoZonaLancamentoInputDto> zonas, IReadOnlyList<EncomendaItem> itensEncomenda)
    {
        var pedidoPorProduto = itensEncomenda
            .GroupBy(i => i.ProdutoId)
            .ToDictionary(g => g.Key, g => g.Sum(x => x.QuantidadePedida));
        var produtosEncomenda = pedidoPorProduto.Keys.ToHashSet();

        var alocado = new Dictionary<int, decimal>();
        foreach (var linha in zonas.SelectMany(z => z.Linhas))
        {
            if (!produtosEncomenda.Contains(linha.ProdutoId))
                return "Só pode alocar produtos que fazem parte da encomenda.";
            alocado.TryGetValue(linha.ProdutoId, out var atual);
            alocado[linha.ProdutoId] = atual + linha.Quantidade;
        }

        foreach (var (produtoId, qtd) in alocado)
        {
            if (!pedidoPorProduto.TryGetValue(produtoId, out var max) || qtd > max)
                return "A quantidade alocada por zona excede a quantidade pedida na encomenda para um ou mais produtos.";
        }
        return null;
    }

    private static Servico MapearServicoDePedido(ServicoSaveRequestDto dto) =>
        new()
        {
            EncomendaId = dto.EncomendaId,
            NomeEvento = string.IsNullOrWhiteSpace(dto.NomeEvento) ? null : dto.NomeEvento.Trim(),
            DataServico = dto.DataServico.Date,
            Local = dto.Local?.Trim(),
            MoradaCompleta = dto.MoradaCompleta?.Trim(),
            Distrito = dto.Distrito?.Trim(),
            Cidade = dto.Cidade?.Trim(),
            Municipio = dto.Municipio?.Trim(),
            PublicoPrivado = dto.PublicoPrivado?.Trim(),
            ResponsavelTecnicoId = null,
            CoordenadorPirotecnicoId = dto.CoordenadorPirotecnicoId,
            Observacoes = dto.Observacoes?.Trim()
        };

    private static void AplicarCamposServico(Servico servico, ServicoSaveRequestDto dto)
    {
        servico.EncomendaId = dto.EncomendaId;
        servico.NomeEvento = string.IsNullOrWhiteSpace(dto.NomeEvento) ? null : dto.NomeEvento.Trim();
        servico.Local = dto.Local?.Trim();
        servico.MoradaCompleta = dto.MoradaCompleta?.Trim();
        servico.Distrito = dto.Distrito?.Trim();
        servico.Cidade = dto.Cidade?.Trim();
        servico.Municipio = dto.Municipio?.Trim();
        servico.PublicoPrivado = dto.PublicoPrivado?.Trim();
        servico.ResponsavelTecnicoId = null;
        servico.CoordenadorPirotecnicoId = dto.CoordenadorPirotecnicoId;
        servico.Observacoes = dto.Observacoes?.Trim();
    }

    private static DateTime DerivarDataServico(ServicoSaveRequestDto dto)
    {
        var datas = dto.Zonas
            .SelectMany(z => z.Linhas)
            .Select(l => l.Data.Date)
            .ToList();
        if (datas.Count > 0)
            return datas.Min();
        return dto.DataServico.Date;
    }

    private async Task GravarZonasAsync(int servicoId, IReadOnlyList<ServicoZonaLancamentoInputDto> zonasDto, IReadOnlyList<EncomendaItem> itensEncomenda, CancellationToken cancellationToken)
    {
        var produtosPorId = itensEncomenda
            .Where(i => i.Produto != null)
            .GroupBy(i => i.ProdutoId)
            .ToDictionary(g => g.Key, g => g.First().Produto!);

        int? maxServico = null;
        foreach (var zDto in zonasDto)
        {
            var produtoIdsZona = zDto.Linhas.Select(l => l.ProdutoId);
            var raioCalculado = CalculoAreaSegurancaPublico.CalcularRaioMetros(produtoIdsZona, produtosPorId);

            var zona = new ServicoZonaLancamento
            {
                ServicoId = servicoId,
                Designacao = zDto.Designacao?.Trim(),
                CoordenadasLat = zDto.CoordenadasLat,
                CoordenadasLng = zDto.CoordenadasLng,
                RaioPublico = raioCalculado,
                ResponsavelPirotecnicoId = zDto.ResponsavelPirotecnicoId,
                Observacoes = zDto.Observacoes?.Trim()
            };
            foreach (var lDto in zDto.Linhas)
            {
                zona.Linhas.Add(new ServicoZonaLinha
                {
                    Data = lDto.Data.Date,
                    HoraInicio = lDto.HoraInicio,
                    HoraFim = lDto.HoraFim,
                    ProdutoId = lDto.ProdutoId,
                    Quantidade = lDto.Quantidade
                });
            }
            await _zonasRepository.AddAsync(zona, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await _zonasRepository.SyncDistanciasSegurancaZonaAsync(zona.Id, raioCalculado, cancellationToken);
            if (raioCalculado.HasValue)
                maxServico = maxServico.HasValue ? Math.Max(maxServico.Value, raioCalculado.Value) : raioCalculado;
        }

        await _servicoDistanciaSegurancaRepository.SyncDistanciasSegurancaServicoAsync(servicoId, maxServico, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task AtualizarRaioPublicoServicoAsync(
        Servico servico,
        IReadOnlyList<ServicoZonaLancamentoInputDto> zonasDto,
        IReadOnlyList<EncomendaItem> itensEncomenda,
        CancellationToken cancellationToken)
    {
        var produtosPorId = itensEncomenda
            .Where(i => i.Produto != null)
            .GroupBy(i => i.ProdutoId)
            .ToDictionary(g => g.Key, g => g.First().Produto!);

        int? maxRaio = null;
        foreach (var zDto in zonasDto)
        {
            var raio = CalculoAreaSegurancaPublico.CalcularRaioMetros(zDto.Linhas.Select(l => l.ProdutoId), produtosPorId);
            if (!raio.HasValue)
                continue;
            maxRaio = maxRaio.HasValue ? Math.Max(maxRaio.Value, raio.Value) : raio;
        }

        servico.RaioPublico = maxRaio;
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task GravarEquipaAsync(int servicoId, int[]? equipaIds, CancellationToken cancellationToken = default)
    {
        if (equipaIds == null || equipaIds.Length == 0) return;
        foreach (var fid in equipaIds.Distinct())
        {
            await _servicoEquipaRepository.AddAsync(new ServicoEquipa { ServicoId = servicoId, FuncionarioId = fid }, cancellationToken);
        }
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
