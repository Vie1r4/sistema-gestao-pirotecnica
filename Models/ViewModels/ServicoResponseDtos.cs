namespace Finalproj.Models;

/// <summary>Encomenda ligada ao serviço — sem navegações EF nem dados sensíveis do cliente além do resumo.</summary>
public class ServicoEncomendaResumoDto
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; }
    public DateTime? DataEntrega { get; set; }
    public DateTime? DataConclusao { get; set; }
    public EncomendaClienteResumoDto? Cliente { get; set; }
}

/// <summary>Distância de segurança sem navegação para Servico.</summary>
public class ServicoDistanciaSegurancaResponseDto
{
    public int Id { get; set; }
    public int ServicoId { get; set; }
    public TipoReferenciaDistancia TipoReferencia { get; set; }
    public string? DescricaoReferencia { get; set; }
    public int DistanciaMinima_m { get; set; }
    public int? DistanciaMedida_m { get; set; }
    public string? Observacoes { get; set; }
    public bool Cumpre { get; set; }
}

/// <summary>Resposta de serviço para API (lista e detalhe); sem caminhos de ficheiros em licenças (usa ServicoLicencaDto).</summary>
public class ServicoResponseDto
{
    public int Id { get; set; }
    public int EncomendaId { get; set; }
    public int ClienteId { get; set; }
    public DateTime DataServico { get; set; }
    public string? Local { get; set; }
    public string? MoradaCompleta { get; set; }
    public string? Distrito { get; set; }
    public string? Cidade { get; set; }
    public string? Municipio { get; set; }
    public decimal? CoordenadasLat { get; set; }
    public decimal? CoordenadasLng { get; set; }
    public int? RaioPublico { get; set; }
    public string? PublicoPrivado { get; set; }
    public int? ResponsavelTecnicoId { get; set; }
    public string? Observacoes { get; set; }

    public ClienteResponseDto? Cliente { get; set; }
    public ServicoEncomendaResumoDto? Encomenda { get; set; }
    public FuncionarioResponseDto? ResponsavelTecnico { get; set; }
    public List<ServicoDocumentoExtraDto> DocumentosExtras { get; set; } = new();
    public List<ServicoLicencaDto> Licencas { get; set; } = new();
    public List<FuncionarioResponseDto> Equipa { get; set; } = new();
    public List<ServicoDistanciaSegurancaResponseDto> DistanciasSeguranca { get; set; } = new();
}

public static class ServicoResponseDtoMapping
{
    public static ServicoEncomendaResumoDto? MapEncomenda(Encomenda? e)
    {
        if (e == null) return null;
        return new ServicoEncomendaResumoDto
        {
            Id = e.Id,
            ClienteId = e.ClienteId,
            Estado = e.Estado,
            DataCriacao = e.DataCriacao,
            DataEntrega = e.DataEntrega,
            DataConclusao = e.DataConclusao,
            Cliente = e.Cliente != null ? new EncomendaClienteResumoDto { Id = e.Cliente.Id, Nome = e.Cliente.Nome } : null
        };
    }

    public static ServicoDistanciaSegurancaResponseDto MapDistancia(ServicoDistanciaSeguranca d) =>
        new()
        {
            Id = d.Id,
            ServicoId = d.ServicoId,
            TipoReferencia = d.TipoReferencia,
            DescricaoReferencia = d.DescricaoReferencia,
            DistanciaMinima_m = d.DistanciaMinima_m,
            DistanciaMedida_m = d.DistanciaMedida_m,
            Observacoes = d.Observacoes,
            Cumpre = d.Cumpre
        };

    /// <param name="distanciasSegurancaOverride">Se não for null, substitui a coleção vinda da entidade (ex.: após <c>EnsureDistanciasSegurancaAsync</c>).</param>
    public static ServicoResponseDto Map(Servico s, IEnumerable<ServicoDistanciaSeguranca>? distanciasSegurancaOverride = null)
    {
        var distSrc = distanciasSegurancaOverride ?? s.DistanciasSeguranca;
        return new ServicoResponseDto
        {
            Id = s.Id,
            EncomendaId = s.EncomendaId,
            ClienteId = s.ClienteId,
            DataServico = s.DataServico,
            Local = s.Local,
            MoradaCompleta = s.MoradaCompleta,
            Distrito = s.Distrito,
            Cidade = s.Cidade,
            Municipio = s.Municipio,
            CoordenadasLat = s.CoordenadasLat,
            CoordenadasLng = s.CoordenadasLng,
            RaioPublico = s.RaioPublico,
            PublicoPrivado = s.PublicoPrivado,
            ResponsavelTecnicoId = s.ResponsavelTecnicoId,
            Observacoes = s.Observacoes,
            Cliente = s.Cliente != null ? ClienteResponseDtoMapping.Map(s.Cliente, includeSensitive: false) : null,
            Encomenda = MapEncomenda(s.Encomenda),
            ResponsavelTecnico = s.ResponsavelTecnico != null ? FuncionarioResponseDtoMapping.Map(s.ResponsavelTecnico, includeSensitive: false) : null,
            DocumentosExtras = (s.DocumentosExtras ?? new List<ServicoDocumentoExtra>())
                .Select(d => new ServicoDocumentoExtraDto { Id = d.Id, Nome = d.Nome })
                .ToList(),
            Licencas = (s.Licencas ?? new List<ServicoLicenca>()).Select(ServicoLicencaDto.FromEntity).ToList(),
            Equipa = (s.Equipa ?? new List<ServicoEquipa>())
                .Where(e => e.Funcionario != null)
                .Select(e => FuncionarioResponseDtoMapping.Map(e.Funcionario!, includeSensitive: false))
                .ToList(),
            DistanciasSeguranca = (distSrc ?? Array.Empty<ServicoDistanciaSeguranca>())
                .Select(MapDistancia)
                .ToList()
        };
    }
}
