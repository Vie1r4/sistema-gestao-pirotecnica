namespace Finalproj.Models;

/// <summary>Licença de serviço sem caminho de ficheiro (uso em respostas da API).</summary>
public class ServicoLicencaDto
{
    public int Id { get; set; }
    public int ServicoId { get; set; }
    public TipoLicencaServico TipoLicenca { get; set; }
    public string? NomePersonalizado { get; set; }
    public string? NumeroDocumento { get; set; }
    public DateTime? DataEmissao { get; set; }
    public DateTime? DataValidade { get; set; }
    public string? Observacoes { get; set; }
    public bool HasFicheiro { get; set; }

    public static ServicoLicencaDto FromEntity(ServicoLicenca? l)
    {
        if (l == null) return new ServicoLicencaDto { ServicoId = 0, TipoLicenca = default };
        return new ServicoLicencaDto
        {
            Id = l.Id,
            ServicoId = l.ServicoId,
            TipoLicenca = l.TipoLicenca,
            NomePersonalizado = l.NomePersonalizado,
            NumeroDocumento = l.NumeroDocumento,
            DataEmissao = l.DataEmissao,
            DataValidade = l.DataValidade,
            Observacoes = l.Observacoes,
            HasFicheiro = !string.IsNullOrWhiteSpace(l.FicheiroPath)
        };
    }
}
