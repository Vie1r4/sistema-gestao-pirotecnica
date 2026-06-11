namespace Finalproj.Domain.Interfaces;

public interface IGestorAnalyticsRepository
{
    Task<IReadOnlyList<(DateTime DataCriacao, int EncomendaId, int ClienteId)>> ListEncomendaDatasAsync(
        DateTime desdeUtc,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<(DateTime DataCriacao, decimal Peso)>> ListYoYContagemAsync(
        DateTime desdeUtc,
        DateTime ateUtc,
        CancellationToken cancellationToken = default,
        int? clienteId = null,
        int? produtoId = null);

    Task<IReadOnlyList<(DateTime DataCriacao, int EncomendaId, string ClienteNome, string ProdutoPrincipal)>> ListEncomendaVolumeDetalheAsync(
        DateTime desdeUtc,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<(DateTime DataCriacao, int EncomendaId, string ClienteNome, string ProdutoPrincipal)>> ListYoYEncomendaDetalheAsync(
        DateTime desdeUtc,
        DateTime ateUtc,
        CancellationToken cancellationToken = default,
        int? clienteId = null,
        int? produtoId = null);

    Task<int> CountClientesRegistadosDesdeAsync(DateTime desdeUtc, CancellationToken cancellationToken = default);

    Task<int> CountEncomendasCreatedBetweenAsync(DateTime desdeUtc, DateTime ateUtc, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<(int Ano, int SemanaIso, int Total)>> CountEncomendasPorSemanaIsoAsync(
        int anoInicio,
        int anoFim,
        CancellationToken cancellationToken = default,
        int? clienteId = null,
        int? produtoId = null);

    Task<IReadOnlyList<(int SemanaIso, int ProdutoId, string ProdutoNome, decimal Quantidade)>> TopProdutosPorSemanaAnoAsync(
        int ano,
        CancellationToken cancellationToken = default,
        int? clienteId = null,
        int? produtoId = null);

    Task<IReadOnlyList<(int Id, string Nome)>> ListProdutosFiltroYoYAsync(
        int anoReferencia,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<(int Id, string Nome)>> ListClientesFiltroYoYAsync(
        int anoReferencia,
        CancellationToken cancellationToken = default);

    Task<Dictionary<string, int>> CountAtivosPorEstadoAsync(CancellationToken cancellationToken = default);

    Task<int> CountConcluidasDesdeAsync(DateTime desdeUtc, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<(string Estado, double Horas)>> ListTemposPorEstadoAsync(
        DateTime desdeUtc,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<(int ClienteId, string Nome, DateTime DataCriacao, int EncomendaId)>> ListEncomendasConcluidasClienteAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<(int ClienteId, string Nome, int TotalEncomendas, int TotalServicos, DateTime? UltimaEncomenda)>> TopClientesRawAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<(int EncomendaId, int ClienteId, string ClienteNome, string? Localidade, string Estado, DateTime DataCriacao, DateTime? DataEntrega, string? ProdutoNome)>> ListEncomendasOperacionaisAsync(
        string? estado,
        int? clienteId,
        string? localidade,
        int pagina,
        int itensPorPagina,
        CancellationToken cancellationToken = default);

    Task<int> CountEncomendasOperacionaisAsync(
        string? estado,
        int? clienteId,
        string? localidade,
        CancellationToken cancellationToken = default);

    Task BackfillTimestampsFromLogsAsync(CancellationToken cancellationToken = default);

    Task<string?> GetClienteNomeAsync(int clienteId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<(
        int EncomendaId,
        DateTime DataCriacao,
        string Estado,
        int ProdutoId,
        string ProdutoNome,
        decimal Quantidade)>> ListConsumoClienteAsync(
        int clienteId,
        DateTime desdeUtc,
        DateTime ateUtc,
        int? produtoId,
        CancellationToken cancellationToken = default);
}
