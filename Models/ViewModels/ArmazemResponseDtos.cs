namespace Finalproj.Models;

/// <summary> Paiol mínimo para filtros e listagens (movimentos). </summary>
public class PaiolListagemNomeDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
}

/// <summary> Produto em linha de movimento (sem dados internos sensíveis). </summary>
public class ProdutoMovimentoDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public decimal NEMPorUnidade { get; set; }
}

/// <summary> Entrada no histórico de movimentos — sem UserId do Identity; nome resolvido no servidor. </summary>
public class EntradaPaiolMovimentoDto
{
    public int Id { get; set; }
    public int PaiolId { get; set; }
    public int ProdutoId { get; set; }
    public decimal Quantidade { get; set; }
    public DateTime DataEntrada { get; set; }
    public string? NumeroLote { get; set; }
    public DateTime? DataFabrico { get; set; }
    public DateTime? DataValidade { get; set; }
    public PaiolListagemNomeDto? Paiol { get; set; }
    public ProdutoMovimentoDto? Produto { get; set; }
    /// <summary> Nome de utilizador (display), ou null. </summary>
    public string? RegistadoPor { get; set; }
}

/// <summary> Saída no histórico de movimentos — sem UserId do Identity. </summary>
public class SaidaPaiolMovimentoDto
{
    public int Id { get; set; }
    public int PaiolId { get; set; }
    public int ProdutoId { get; set; }
    public decimal Quantidade { get; set; }
    public DateTime DataSaida { get; set; }
    public int? EncomendaId { get; set; }
    public int? EntradaPaiolId { get; set; }
    public PaiolListagemNomeDto? Paiol { get; set; }
    public ProdutoMovimentoDto? Produto { get; set; }
    public string? RetiradoPor { get; set; }
}

/// <summary> Resposta após POST entrada-paiol/registar (sem FuncionarioRegistouUserId). </summary>
public class EntradaPaiolRegistadaDto
{
    public int Id { get; set; }
    public int PaiolId { get; set; }
    public int ProdutoId { get; set; }
    public decimal Quantidade { get; set; }
    public DateTime DataEntrada { get; set; }
    public string? NumeroLote { get; set; }
    public DateTime? DataFabrico { get; set; }
    public DateTime? DataValidade { get; set; }
}

/// <summary> Resposta após POST saida-paiol/registar (sem FuncionarioRetirouUserId). </summary>
public class SaidaPaiolRegistadaDto
{
    public int Id { get; set; }
    public int PaiolId { get; set; }
    public int ProdutoId { get; set; }
    public decimal Quantidade { get; set; }
    public DateTime DataSaida { get; set; }
    public int? EncomendaId { get; set; }
    public int? EntradaPaiolId { get; set; }
}

public static class ArmazemResponseDtoMapping
{
    public static PaiolListagemNomeDto MapPaiolNome(Paiol p) =>
        new() { Id = p.Id, Nome = p.Nome };

    public static EntradaPaiolMovimentoDto MapEntradaMovimento(EntradaPaiol e, IReadOnlyDictionary<string, string> nomesPorUserId)
    {
        string? registadoPor = null;
        if (!string.IsNullOrEmpty(e.FuncionarioRegistouUserId))
            nomesPorUserId.TryGetValue(e.FuncionarioRegistouUserId, out registadoPor);

        return new EntradaPaiolMovimentoDto
        {
            Id = e.Id,
            PaiolId = e.PaiolId,
            ProdutoId = e.ProdutoId,
            Quantidade = e.Quantidade,
            DataEntrada = e.DataEntrada,
            NumeroLote = e.NumeroLote,
            DataFabrico = e.DataFabrico,
            DataValidade = e.DataValidade,
            Paiol = e.Paiol != null ? MapPaiolNome(e.Paiol) : null,
            Produto = e.Produto == null
                ? null
                : new ProdutoMovimentoDto
                {
                    Id = e.Produto.Id,
                    Nome = e.Produto.Nome,
                    NEMPorUnidade = e.Produto.NEMPorUnidade
                },
            RegistadoPor = registadoPor
        };
    }

    public static SaidaPaiolMovimentoDto MapSaidaMovimento(SaidaPaiol s, IReadOnlyDictionary<string, string> nomesPorUserId)
    {
        string? retiradoPor = null;
        if (!string.IsNullOrEmpty(s.FuncionarioRetirouUserId))
            nomesPorUserId.TryGetValue(s.FuncionarioRetirouUserId, out retiradoPor);

        return new SaidaPaiolMovimentoDto
        {
            Id = s.Id,
            PaiolId = s.PaiolId,
            ProdutoId = s.ProdutoId,
            Quantidade = s.Quantidade,
            DataSaida = s.DataSaida,
            EncomendaId = s.EncomendaId,
            EntradaPaiolId = s.EntradaPaiolId,
            Paiol = s.Paiol != null ? MapPaiolNome(s.Paiol) : null,
            Produto = s.Produto == null
                ? null
                : new ProdutoMovimentoDto
                {
                    Id = s.Produto.Id,
                    Nome = s.Produto.Nome,
                    NEMPorUnidade = s.Produto.NEMPorUnidade
                },
            RetiradoPor = retiradoPor
        };
    }

    public static EntradaPaiolRegistadaDto MapEntradaRegistada(EntradaPaiol e) =>
        new()
        {
            Id = e.Id,
            PaiolId = e.PaiolId,
            ProdutoId = e.ProdutoId,
            Quantidade = e.Quantidade,
            DataEntrada = e.DataEntrada,
            NumeroLote = e.NumeroLote,
            DataFabrico = e.DataFabrico,
            DataValidade = e.DataValidade
        };

    public static SaidaPaiolRegistadaDto MapSaidaRegistada(SaidaPaiol s) =>
        new()
        {
            Id = s.Id,
            PaiolId = s.PaiolId,
            ProdutoId = s.ProdutoId,
            Quantidade = s.Quantidade,
            DataSaida = s.DataSaida,
            EncomendaId = s.EncomendaId,
            EntradaPaiolId = s.EntradaPaiolId
        };

    /// <summary> Modelo vazio para GET api/paiol/create (sem entidade EF). </summary>
    public static PaiolResponseDto EmptyPaiolParaFormulario()
    {
        return new PaiolResponseDto
        {
            Id = 0,
            Nome = string.Empty,
            Localizacao = null,
            CoordenadasLat = null,
            CoordenadasLng = null,
            LimiteMLE = 1,
            PerfilRisco = "1.3",
            Estado = ConstantesPaiol.EstadoAtivo,
            DataValidadeLicenca = null,
            NumeroLicenca = null,
            DivisaoDominante = null,
            DocumentosExtras = new List<PaiolDocumentoExtraDto>()
        };
    }
}
