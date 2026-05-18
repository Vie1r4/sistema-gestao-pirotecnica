using Finalproj.Application.Features.Clientes.DTOs;
using Finalproj.Application.Features.Encomendas.DTOs;
using Finalproj.Application.Features.Funcionarios.DTOs;
using Finalproj.Application.Features.Paiols.DTOs;
using Finalproj.Application.Features.Servicos.DTOs;
using Finalproj.Application.Features.Servicos.Interfaces;
using Finalproj.Domain.Interfaces;

namespace Finalproj.Application.Features.Servicos.Services;

public sealed class ServicosApiApplicationService(
    IServicoRepository servicos,
    IEncomendaItemRepository encomendaItens,
    ISaidaPaiolRepository saidas,
    IServicoService servicoService,
    IServicoDocumentoExtraRepository documentos,
    IServicoLicencaRepository licencas,
    IServicoDistanciaSegurancaRepository distancias,
    IUnitOfWork unitOfWork) : IServicosApiApplicationService
{
    public async Task<object> ListAsync(int? clienteId, DateTime? dataDesde, DateTime? dataAte, int pagina, int itensPorPagina, CancellationToken cancellationToken = default)
    {
        var fim = dataAte?.Date.AddDays(1);
        var (items, total) = await servicos.ListPagedWithIncludesAsync(clienteId, dataDesde, fim, pagina, itensPorPagina, cancellationToken);
        return new
        {
            lista = items.Select(s => ServicoResponseDtoMapping.Map(s)).ToList(),
            clientes = (await servicos.ListClientesIdNomeOrderedAsync(cancellationToken)).Select(c => new { c.Id, c.Nome }).ToList(),
            clienteIdFiltro = clienteId,
            dataDesde = dataDesde?.ToString("yyyy-MM-dd") ?? "",
            dataAte = dataAte?.ToString("yyyy-MM-dd") ?? "",
            paginaAtual = pagina,
            itensPorPagina,
            totalRegistos = total
        };
    }

    public Task<Servico?> GetFullAsync(int id, CancellationToken cancellationToken = default) =>
        servicos.GetByIdFullGraphNoTrackingAsync(id, cancellationToken);

    public async Task<Servico?> GetFullAfterChangeAsync(int id, CancellationToken cancellationToken = default) =>
        await servicos.GetByIdFullGraphNoTrackingAsync(id, cancellationToken);

    public async Task<object?> GetDetailsDataAsync(int id, CancellationToken cancellationToken = default)
    {
        var servico = await servicos.GetByIdFullGraphNoTrackingAsync(id, cancellationToken);
        if (servico == null)
            return null;
        var itens = servico.EncomendaId > 0
            ? (await encomendaItens.ListByEncomendaIdWithProdutoNoTrackingAsync(servico.EncomendaId, cancellationToken)).ToList()
            : new List<EncomendaItem>();
        var resumoMaterial = servico.EncomendaId > 0 ? servicoService.CalcularResumoMaterial(servico.EncomendaId, itens) : null;
        await servicoService.EnsureDistanciasSegurancaAsync(servico.Id, resumoMaterial?.DivisaoDominante, cancellationToken);
        var distanciasSeguranca = await distancias.ListByServicoIdOrderedNoTrackingAsync(servico.Id, cancellationToken);
        PaiolResponseDto? paiolParaRotaDto = null;
        double? distanciaPaiolKm = null;
        if (servico.EncomendaId > 0 && servico.CoordenadasLat.HasValue && servico.CoordenadasLng.HasValue)
        {
            var saida = await saidas.FindUltimaSaidaParaRotaAsync(servico.EncomendaId, cancellationToken);
            if (saida?.Paiol != null)
            {
                paiolParaRotaDto = PaiolResponseDtoMapping.Map(saida.Paiol);
                distanciaPaiolKm = (double)GeoHelper.CalcularDistanciaKm(saida.Paiol.CoordenadasLat!.Value, saida.Paiol.CoordenadasLng!.Value, servico.CoordenadasLat!.Value, servico.CoordenadasLng!.Value);
            }
        }
        var obrigatorios = ConstantesServicoLicenca.TiposObrigatoriosPara(servico.PublicoPrivado).ToList();
        var linhas = BuildLicencasEvento(servico.Licencas?.ToList() ?? [], obrigatorios);
        var servicoDto = ServicoResponseDtoMapping.Map(servico, distanciasSeguranca);
        return new
        {
            servico = servicoDto,
            resumoMaterial,
            itensEncomenda = itens.Select(EncomendaResponseDtoMapping.MapItem).ToList(),
            distanciasSeguranca = servicoDto.DistanciasSeguranca,
            paiolParaRota = paiolParaRotaDto,
            distanciaPaiolKm,
            licencasEvento = linhas.Select(l => new { tipo = l.Tipo, nomeExibicao = l.NomeExibicao, tooltip = l.Tooltip, obrigatorio = l.Obrigatorio, estadoPedido = l.EstadoPedido, estadoDefinitiva = l.EstadoDefinitiva, licencaPedido = l.LicencaPedido, licencaDefinitiva = l.LicencaDefinitiva }).ToList(),
            licencasObrigatoriasTotal = obrigatorios.Count,
            licencasObrigatoriasEntregues = linhas.Count(l => l.Obrigatorio && l.EstadoDefinitiva == 2)
        };
    }

    public async Task<object?> GetEditDataAsync(int id, CancellationToken cancellationToken = default)
    {
        var servico = await servicos.GetByIdFullGraphNoTrackingAsync(id, cancellationToken);
        if (servico == null)
            return null;
        var dados = await servicoService.ObterDadosFormularioAsync(id, servico.EncomendaId, cancellationToken);
        return new
        {
            servico = ServicoResponseDtoMapping.Map(servico),
            encomendas = dados.Encomendas,
            responsaveisTecnicos = dados.ResponsaveisTecnicos.Select(f => FuncionarioResponseDtoMapping.Map(f, false)).ToList(),
            funcionariosEquipa = dados.FuncionariosEquipa.Select(f => FuncionarioResponseDtoMapping.Map(f, false)).ToList(),
            tiposAcesso = dados.TiposAcesso,
            equipaIds = servico.Equipa.Select(e => e.FuncionarioId).ToList()
        };
    }

    public async Task<string?> GetDocumentoExtraPathAsync(int servicoId, int extraId, CancellationToken cancellationToken = default) =>
        (await documentos.GetByServicoAndIdNoTrackingAsync(servicoId, extraId, cancellationToken))?.Caminho;

    public async Task<object?> GetUploadLicencaDataAsync(int servicoId, TipoLicencaServico tipo, OrigemRegistoServicoLicenca origem, int? licencaId, CancellationToken cancellationToken = default)
    {
        if (!await servicos.ExistsAsync(servicoId, cancellationToken))
            return null;
        ServicoLicenca? lic = licencaId.HasValue
            ? await licencas.FindByServicoAndIdTrackedAsync(servicoId, licencaId.Value, cancellationToken)
            : tipo != TipoLicencaServico.OUTRO ? await licencas.FindByServicoTipoOrigemAsync(servicoId, tipo, origem, cancellationToken) : null;
        if (lic == null && licencaId.HasValue)
            return null;
        return new
        {
            servicoId,
            tipoLicenca = (int)tipo,
            tipoNome = ConstantesServicoLicenca.Nome(tipo),
            origemRegisto = (int)origem,
            licenca = lic != null ? ServicoLicencaDto.FromEntity(lic) : new ServicoLicencaDto { ServicoId = servicoId, TipoLicenca = tipo, OrigemRegisto = origem }
        };
    }

    public async Task<string?> GetLicencaFilePathAsync(int servicoId, int licencaId, CancellationToken cancellationToken = default) =>
        (await licencas.GetByServicoAndIdNoTrackingAsync(servicoId, licencaId, cancellationToken))?.FicheiroPath;

    public async Task<Servico?> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var servico = await servicos.FindTrackedByIdAsync(id, cancellationToken);
        if (servico == null)
            return null;
        await servicos.DeleteAsync(servico, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return servico;
    }

    public async Task<(ServicoLicenca? Licenca, string? Erro)> GuardarLicencaAsync(int servicoId, ServicoLicencaDto model, TipoLicencaServico tipo, OrigemRegistoServicoLicenca origem, int? licencaId, CancellationToken cancellationToken = default)
    {
        var licenca = licencaId.HasValue ? await licencas.FindByServicoAndIdTrackedAsync(servicoId, licencaId.Value, cancellationToken) : null;
        if (licenca == null)
        {
            if (tipo != TipoLicencaServico.OUTRO && await licencas.FindByServicoTipoOrigemAsync(servicoId, tipo, origem, cancellationToken) != null)
                return (null, "Já existe um registo deste tipo e origem para este serviço.");
            if (tipo == TipoLicencaServico.OUTRO && await licencas.ExistsOutroAsync(servicoId, origem, model.NomePersonalizado, cancellationToken))
                return (null, string.IsNullOrWhiteSpace(model.NomePersonalizado) ? "Já existe um documento «Outro» sem nome para esta origem. Indique um nome personalizado." : "Já existe um documento «Outro» com este nome para esta origem.");
            licenca = new ServicoLicenca { ServicoId = servicoId, TipoLicenca = tipo, OrigemRegisto = origem };
            await licencas.AddAsync(licenca, cancellationToken);
        }
        licenca.NumeroDocumento = model.NumeroDocumento;
        licenca.DataEmissao = model.DataEmissao;
        licenca.DataValidade = model.DataValidade;
        licenca.NomePersonalizado = model.NomePersonalizado;
        licenca.Observacoes = model.Observacoes;
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return (licenca, null);
    }

    public async Task SaveLicencaFilePathAsync(ServicoLicenca licenca, string caminhoRelativo, CancellationToken cancellationToken = default)
    {
        licenca.FicheiroPath = caminhoRelativo;
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<ServicoDistanciaSeguranca?> GuardarDistanciaAsync(int servicoId, int distanciaId, decimal? distanciaMedida, CancellationToken cancellationToken = default)
    {
        var distancia = await distancias.FindTrackedByIdAsync(distanciaId, cancellationToken);
        if (distancia == null || distancia.ServicoId != servicoId)
            return null;
        distancia.DistanciaMedida_m = distanciaMedida.HasValue ? (int?)decimal.ToInt32(distanciaMedida.Value) : null;
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return distancia;
    }

    private static List<LicencaServicoLinhaViewModel> BuildLicencasEvento(List<ServicoLicenca> licencasDoServico, List<TipoLicencaServico> obrigatorios)
    {
        var linhas = new List<LicencaServicoLinhaViewModel>();
        foreach (var tipo in ConstantesServicoLicenca.TodosTiposPredefinidos())
        {
            var licPed = licencasDoServico.FirstOrDefault(l => l.TipoLicenca == tipo && l.OrigemRegisto == OrigemRegistoServicoLicenca.PedidoGerado);
            var licDef = licencasDoServico.FirstOrDefault(l => l.TipoLicenca == tipo && l.OrigemRegisto == OrigemRegistoServicoLicenca.AutorizacaoDefinitiva);
            linhas.Add(new LicencaServicoLinhaViewModel
            {
                Tipo = tipo,
                Obrigatorio = obrigatorios.Contains(tipo),
                LicencaPedido = licPed != null ? ServicoLicencaDto.FromEntity(licPed) : null,
                LicencaDefinitiva = licDef != null ? ServicoLicencaDto.FromEntity(licDef) : null,
                EstadoPedido = LicencaServicoLinhaViewModel.CalcularEstado(licPed),
                EstadoDefinitiva = LicencaServicoLinhaViewModel.CalcularEstado(licDef)
            });
        }
        foreach (var lic in licencasDoServico.Where(l => l.TipoLicenca == TipoLicencaServico.OUTRO))
        {
            var vm = new LicencaServicoLinhaViewModel { Tipo = TipoLicencaServico.OUTRO, Obrigatorio = false };
            if (lic.OrigemRegisto == OrigemRegistoServicoLicenca.PedidoGerado)
            {
                vm.LicencaPedido = ServicoLicencaDto.FromEntity(lic);
                vm.EstadoPedido = LicencaServicoLinhaViewModel.CalcularEstado(lic);
            }
            else
            {
                vm.LicencaDefinitiva = ServicoLicencaDto.FromEntity(lic);
                vm.EstadoDefinitiva = LicencaServicoLinhaViewModel.CalcularEstado(lic);
            }
            linhas.Add(vm);
        }
        return linhas;
    }
}
