using Finalproj.Data;
using Finalproj.Models;
using Finalproj.Services;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Services.Domain;

/// <summary>
/// Implementação das regras de domínio e aplicação para Serviços: validações, equipa, resumo de material, distâncias de segurança e dados para formulários.
/// </summary>
public class ServicoService : IServicoService
{
    private readonly FinalprojContext _context;
    private readonly IDocumentoStorageService _documentoStorage;

    public ServicoService(FinalprojContext context, IDocumentoStorageService documentoStorage)
    {
        _context = context;
        _documentoStorage = documentoStorage;
    }

    /// <inheritdoc />
    public async Task<(bool Valido, string? Erro)> ValidarResponsavelEEquipaAsync(int? responsavelTecnicoId, int[]? equipaIds, CancellationToken cancellationToken = default)
    {
        if (responsavelTecnicoId.HasValue)
        {
            var resp = await _context.Funcionarios.AsNoTracking().FirstOrDefaultAsync(f => f.Id == responsavelTecnicoId.Value, cancellationToken);
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
        var encomendasJaUsadas = await _context.Servicos.AsNoTracking()
            .Where(s => !servicoIdParaExcluirEncomenda.HasValue || s.Id != servicoIdParaExcluirEncomenda.Value)
            .Select(s => s.EncomendaId)
            .ToListAsync(cancellationToken);

        var encomendas = await _context.Encomendas.AsNoTracking().Include(e => e.Cliente)
            .Where(e => e.Estado == ConstantesEncomenda.CONCLUIDA && !encomendasJaUsadas.Contains(e.Id))
            .OrderByDescending(e => e.DataConclusao)
            .ToListAsync(cancellationToken);

        var items = encomendas.Select(e => new { Id = e.Id, Texto = "#" + e.Id + " - " + e.Cliente.Nome + (e.DataConclusao.HasValue ? " (" + e.DataConclusao.Value.ToString("dd/MM/yyyy") + ")" : "") }).Cast<object>().ToList();

        var responsaveis = await _context.Funcionarios
            .Where(f => !string.IsNullOrWhiteSpace(f.DocumentoADDRCaminho) && !string.IsNullOrWhiteSpace(f.LicencaOperadorCaminho))
            .OrderBy(f => f.NomeCompleto)
            .ToListAsync(cancellationToken);

        var equipa = await _context.Funcionarios
            .Where(f => !string.IsNullOrWhiteSpace(f.LicencaOperadorCaminho))
            .OrderBy(f => f.NomeCompleto)
            .ToListAsync(cancellationToken);

        return new DadosFormularioServicoResult
        {
            Encomendas = items,
            ResponsaveisTecnicos = responsaveis,
            FuncionariosEquipa = equipa,
            TiposAcesso = ConstantesServico.TiposAcesso
        };
    }

    /// <inheritdoc />
    public async Task<(Servico? Servico, string? Erro)> CriarServicoAsync(Servico servico, int[]? equipaIds, CancellationToken cancellationToken = default)
    {
        var encomenda = await _context.Encomendas.Include(e => e.Cliente).FirstOrDefaultAsync(e => e.Id == servico.EncomendaId, cancellationToken);
        if (encomenda == null)
            return (null, "Selecione uma encomenda concluída.");

        servico.ClienteId = encomenda.ClienteId;
        var encomendaJaUsada = await _context.Servicos.AnyAsync(s => s.EncomendaId == servico.EncomendaId, cancellationToken);
        if (encomendaJaUsada)
            return (null, "Cada encomenda só pode ser utilizada num único serviço. Esta encomenda já está associada a outro serviço.");

        var (valid, errorMsg) = await ValidarResponsavelEEquipaAsync(servico.ResponsavelTecnicoId, equipaIds, cancellationToken);
        if (!valid)
            return (null, errorMsg);

        var equipaIdsComResponsavel = IncluirResponsavelNaEquipa(equipaIds, servico.ResponsavelTecnicoId);

        _context.Servicos.Add(servico);
        await _context.SaveChangesAsync(cancellationToken);

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
            _context.ServicoDocumentoExtras.Add(new ServicoDocumentoExtra { ServicoId = servicoId, Nome = nome, Caminho = ext.Caminho });
        }
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<(Servico? Servico, string? Erro)> AtualizarServicoAsync(int id, Servico servico, int[]? equipaIds, IReadOnlyList<DocumentoGuardadoInput> documentosNovos, IReadOnlyList<int>? removerDocumentoIds, CancellationToken cancellationToken = default)
    {
        var encomenda = await _context.Encomendas.Include(e => e.Cliente).FirstOrDefaultAsync(e => e.Id == servico.EncomendaId, cancellationToken);
        if (encomenda != null)
        {
            servico.ClienteId = encomenda.ClienteId;
            var encomendaJaUsada = await _context.Servicos.AnyAsync(s => s.EncomendaId == servico.EncomendaId && s.Id != id, cancellationToken);
            if (encomendaJaUsada)
                return (null, "Cada encomenda só pode ser utilizada num único serviço. Esta encomenda já está associada a outro serviço.");
        }

        var (valid, errorMsg) = await ValidarResponsavelEEquipaAsync(servico.ResponsavelTecnicoId, equipaIds, cancellationToken);
        if (!valid)
            return (null, errorMsg);

        var equipaIdsComResponsavel = IncluirResponsavelNaEquipa(equipaIds, servico.ResponsavelTecnicoId);

        if (removerDocumentoIds != null && removerDocumentoIds.Count > 0)
        {
            var aRemover = await _context.ServicoDocumentoExtras
                .Where(d => d.ServicoId == id && removerDocumentoIds.Contains(d.Id))
                .ToListAsync(cancellationToken);
            foreach (var d in aRemover)
            {
                _documentoStorage.ApagarFicheiroSeExistir(d.Caminho);
            }
            _context.ServicoDocumentoExtras.RemoveRange(aRemover);
            await _context.SaveChangesAsync(cancellationToken);
        }

        _context.Update(servico);
        var equipaAtual = await _context.ServicoEquipas.Where(e => e.ServicoId == id).ToListAsync(cancellationToken);
        _context.ServicoEquipas.RemoveRange(equipaAtual);
        await _context.SaveChangesAsync(cancellationToken);
        await GravarEquipaAsync(id, equipaIdsComResponsavel, cancellationToken);

        if (documentosNovos != null && documentosNovos.Count > 0)
        {
            foreach (var ext in documentosNovos)
            {
                var nome = string.IsNullOrWhiteSpace(ext.Nome) ? "Documento" : ext.Nome.Trim();
                if (nome.Length > 100) nome = nome[..100];
                _context.ServicoDocumentoExtras.Add(new ServicoDocumentoExtra { ServicoId = id, Nome = nome, Caminho = ext.Caminho });
            }
            await _context.SaveChangesAsync(cancellationToken);
        }

        var updated = await _context.Servicos.FindAsync(new object[] { id }, cancellationToken);
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
        var existentes = await _context.ServicoDistanciasSeguranca
            .Where(d => d.ServicoId == servicoId)
            .Select(d => d.TipoReferencia)
            .ToListAsync(cancellationToken);
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
            _context.ServicoDistanciasSeguranca.Add(new ServicoDistanciaSeguranca
            {
                ServicoId = servicoId,
                TipoReferencia = tipo,
                DescricaoReferencia = ConstantesDistanciaSeguranca.Nome(tipo),
                DistanciaMinima_m = min
            });
        }
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<List<int>> ObterIdsFuncionariosComLicencaOperadorAsync(CancellationToken cancellationToken)
    {
        return await _context.Funcionarios
            .Where(f => !string.IsNullOrWhiteSpace(f.LicencaOperadorCaminho))
            .Select(f => f.Id)
            .ToListAsync(cancellationToken);
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
                _context.ServicoEquipas.Add(new ServicoEquipa { ServicoId = servicoId, FuncionarioId = fid });
        }
        await _context.SaveChangesAsync(cancellationToken);
    }
}
