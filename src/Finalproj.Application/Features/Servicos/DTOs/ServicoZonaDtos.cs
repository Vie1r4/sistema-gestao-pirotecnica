using System.ComponentModel.DataAnnotations;
using Finalproj.Application.Features.Funcionarios.DTOs;

namespace Finalproj.Application.Features.Servicos.DTOs;

/// <summary>Linha de lançamento (data/hora/produto/quantidade) dentro de uma zona.</summary>
public class ServicoZonaLinhaInputDto
{
    public int? Id { get; set; }

    [Required]
    public DateTime Data { get; set; }

    public TimeSpan? HoraInicio { get; set; }
    public TimeSpan? HoraFim { get; set; }

    [Range(1, int.MaxValue)]
    public int ProdutoId { get; set; }

    [Range(0.0001, double.MaxValue)]
    public decimal Quantidade { get; set; }
}

/// <summary>Zona de lançamento com coordenadas, responsável e linhas.</summary>
public class ServicoZonaLancamentoInputDto
{
    public int? Id { get; set; }

    [StringLength(200)]
    public string? Designacao { get; set; }

    public decimal? CoordenadasLat { get; set; }
    public decimal? CoordenadasLng { get; set; }
    public int? RaioPublico { get; set; }
    public int? ResponsavelPirotecnicoId { get; set; }

    [StringLength(500)]
    public string? Observacoes { get; set; }

    [MinLength(1, ErrorMessage = "Cada zona deve ter pelo menos uma linha de lançamento.")]
    public List<ServicoZonaLinhaInputDto> Linhas { get; set; } = new();
}

/// <summary>Dados do serviço (evento) para criar ou atualizar, com zonas de lançamento.</summary>
public class ServicoSaveRequestDto
{
    public int Id { get; set; }

    [Range(1, int.MaxValue)]
    public int EncomendaId { get; set; }

    [StringLength(200)]
    public string? NomeEvento { get; set; }

    [Required]
    public DateTime DataServico { get; set; }

    [StringLength(300)]
    public string? Local { get; set; }
    [StringLength(500)]
    public string? MoradaCompleta { get; set; }
    [StringLength(100)]
    public string? Distrito { get; set; }
    [StringLength(100)]
    public string? Cidade { get; set; }
    [StringLength(100)]
    public string? Municipio { get; set; }

    [StringLength(20)]
    public string? PublicoPrivado { get; set; }

    public int? ResponsavelTecnicoId { get; set; }
    public int? CoordenadorPirotecnicoId { get; set; }

    [StringLength(2000)]
    public string? Observacoes { get; set; }

    public int[]? EquipaIds { get; set; }

    [MinLength(1, ErrorMessage = "O serviço deve ter pelo menos uma zona de lançamento.")]
    public List<ServicoZonaLancamentoInputDto> Zonas { get; set; } = new();
}

public class ServicoZonaLinhaResponseDto
{
    public int Id { get; set; }
    public int ZonaId { get; set; }
    public DateTime Data { get; set; }
    public TimeSpan? HoraInicio { get; set; }
    public TimeSpan? HoraFim { get; set; }
    public int ProdutoId { get; set; }
    public string? ProdutoNome { get; set; }
    public string? ProdutoCalibre { get; set; }
    public string? ProdutoCategoria { get; set; }
    public decimal Quantidade { get; set; }
}

public class ServicoZonaDistanciaSegurancaResponseDto
{
    public int Id { get; set; }
    public int ZonaId { get; set; }
    public TipoReferenciaDistancia TipoReferencia { get; set; }
    public string? DescricaoReferencia { get; set; }
    public int DistanciaMinima_m { get; set; }
    public int? DistanciaMedida_m { get; set; }
    public string? Observacoes { get; set; }
    public bool Cumpre { get; set; }
}

public class ServicoZonaLancamentoResponseDto
{
    public int Id { get; set; }
    public int ServicoId { get; set; }
    public string? Designacao { get; set; }
    public decimal? CoordenadasLat { get; set; }
    public decimal? CoordenadasLng { get; set; }
    public int? RaioPublico { get; set; }
    public int? ResponsavelPirotecnicoId { get; set; }
    public FuncionarioResponseDto? ResponsavelPirotecnico { get; set; }
    public string? Observacoes { get; set; }
    public List<ServicoZonaLinhaResponseDto> Linhas { get; set; } = new();
    public List<ServicoZonaDistanciaSegurancaResponseDto> DistanciasSeguranca { get; set; } = new();
    public ResumoMaterialZonaViewModel? ResumoMaterial { get; set; }
}
