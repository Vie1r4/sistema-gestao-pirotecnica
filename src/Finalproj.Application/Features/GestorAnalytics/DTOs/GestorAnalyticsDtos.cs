namespace Finalproj.Application.Features.GestorAnalytics.DTOs;

public sealed class VolumeEncomendaDetalheDto
{
    public int EncomendaId { get; set; }
    public string ClienteNome { get; set; } = "";
    public string ProdutoPrincipal { get; set; } = "";
    public DateTime DataCriacao { get; set; }
}

public sealed class VolumePeriodoDto
{
    public string Rotulo { get; set; } = "";
    public string Chave { get; set; } = "";
    public int Total { get; set; }
    public decimal? VariacaoPct { get; set; }
    public decimal? MediaMovel30 { get; set; }
    public IReadOnlyList<VolumeEncomendaDetalheDto> Detalhes { get; set; } = [];
}

public sealed class VolumeResponseDto
{
    public string Granularidade { get; set; } = "";
    public IReadOnlyList<VolumePeriodoDto> Periodos { get; set; } = [];
}

public sealed class ComparacaoAnualSemanaDto
{
    public int Semana { get; set; }
    public string Chave { get; set; } = "";
    public string Rotulo { get; set; } = "";
    public bool Futuro { get; set; }
    public int Atual { get; set; }
    public int AnoAnterior { get; set; }
    public string? ProdutoDestaque { get; set; }
    public decimal QuantidadeDestaque { get; set; }
}

public sealed class ZonaPicoDto
{
    public int SemanaInicio { get; set; }
    public int SemanaFim { get; set; }
    public string Texto { get; set; } = "";
}

public sealed class FiltroOpcaoDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
}

public sealed class ComparacaoAnualResponseDto
{
    public int Ano { get; set; }
    public int AnoAnterior { get; set; }
    public IReadOnlyList<ComparacaoAnualSemanaDto> Semanas { get; set; } = [];
    public IReadOnlyList<ZonaPicoDto> ZonasPico { get; set; } = [];
    public IReadOnlyList<FiltroOpcaoDto> Materiais { get; set; } = [];
    public IReadOnlyList<FiltroOpcaoDto> Clientes { get; set; } = [];
    public int? ProdutoIdFiltro { get; set; }
    public int? ClienteIdFiltro { get; set; }
}

public sealed class ConsumoClienteLinhaDto
{
    public int EncomendaId { get; set; }
    public DateTime DataCriacao { get; set; }
    public string Estado { get; set; } = "";
    public int ProdutoId { get; set; }
    public string ProdutoNome { get; set; } = "";
    public decimal Quantidade { get; set; }
}

public sealed class ConsumoClienteResponseDto
{
    public int ClienteId { get; set; }
    public string ClienteNome { get; set; } = "";
    /// <summary>Primeiro dia do intervalo (yyyy-MM-dd, inclusivo).</summary>
    public string Desde { get; set; } = "";
    /// <summary>Último dia do intervalo (yyyy-MM-dd, inclusivo).</summary>
    public string Ate { get; set; } = "";
    public int? ProdutoIdFiltro { get; set; }
    public decimal TotalQuantidade { get; set; }
    public int TotalLinhas { get; set; }
    public int TotalEncomendas { get; set; }
    public IReadOnlyList<ConsumoClienteLinhaDto> Linhas { get; set; } = [];
    public IReadOnlyList<FiltroOpcaoDto> Materiais { get; set; } = [];
    public IReadOnlyList<FiltroOpcaoDto> Clientes { get; set; } = [];
}

public sealed class PrevisaoPontoDto
{
    public string Data { get; set; } = "";
    public decimal Valor { get; set; }
    public decimal Min { get; set; }
    public decimal Max { get; set; }
}

public sealed class PrevisaoResponseDto
{
    public int Dias { get; set; }
    public decimal CrescimentoPct { get; set; }
    public IReadOnlyList<PrevisaoPontoDto> Historico { get; set; } = [];
    public IReadOnlyList<PrevisaoPontoDto> Previsao { get; set; } = [];
    public decimal TotalPrevisto14Dias { get; set; }
    public string ResumoDestaque { get; set; } = "";
}

public sealed class TopClienteLinhaDto
{
    public int ClienteId { get; set; }
    public string Nome { get; set; } = "";
    public int Valor { get; set; }
    public int TotalEncomendas { get; set; }
    public int TotalServicos { get; set; }
    public string? UltimaEncomenda { get; set; }
    public string Tendencia { get; set; } = "estavel";
    public bool Risco { get; set; }
}

public sealed class TopClientesResponseDto
{
    public IReadOnlyList<TopClienteLinhaDto> PorEncomendas { get; set; } = [];
    public IReadOnlyList<TopClienteLinhaDto> PorServicos { get; set; } = [];
}

