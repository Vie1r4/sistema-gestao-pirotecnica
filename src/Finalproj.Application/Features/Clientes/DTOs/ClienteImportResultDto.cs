namespace Finalproj.Application.Features.Clientes.DTOs;

/// <summary>Resultado da importação CSV de clientes.</summary>
public class ClienteImportResultDto
{
    public int TotalLinhas { get; set; }
    public int Importados { get; set; }
    public int Atualizados { get; set; }
    public int Ignorados { get; set; }
    public int Erros { get; set; }
    public List<ClienteImportLinhaResultDto> Linhas { get; set; } = new();
}

public class ClienteImportLinhaResultDto
{
    public int NumeroLinha { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? Nome { get; set; }
    public int? ClienteId { get; set; }
    public string? Mensagem { get; set; }
}
