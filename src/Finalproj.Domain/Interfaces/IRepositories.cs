namespace Finalproj.Domain.Interfaces;

public interface IPaiolRepository
{
    Task<Paiol?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Paiol>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Paiol entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Paiol entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Paiol entity, CancellationToken cancellationToken = default);

    Task<int> CountByEstadoAsync(string estado, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Paiol>> ListByIdsOrderedAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Paiol>> ListAllOrderedAsync(CancellationToken cancellationToken = default);
    Task<Paiol?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Paiol?> GetByIdWithDocumentosTrackedAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
}

public interface IProdutoRepository
{
    Task<Produto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Produto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Produto entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Produto entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Produto entity, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Produto>> SearchAsync(
        string? pesquisa,
        string? classificacao,
        string? grupoCompatibilidade,
        string? filtroTecnico,
        string? calibre,
        CancellationToken cancellationToken = default);

    Task<Produto?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);

    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<int> CountRegistadosDesdeAsync(DateTime desdeUtc, CancellationToken cancellationToken = default);
}

public interface IEncomendaRepository
{
    Task<Encomenda?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Encomenda>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Encomenda entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Encomenda entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Encomenda entity, CancellationToken cancellationToken = default);

    Task<Encomenda?> GetByIdWithItensAndProdutosTrackedAsync(int id, CancellationToken cancellationToken = default);
    Task<Encomenda?> GetByIdWithClienteAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Encomenda>> ListConcluidasComClienteExceptEncomendaIdsAsync(IReadOnlyCollection<int> encomendaIdsUsadas, CancellationToken cancellationToken = default);

    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<int> CountCreatedSinceAsync(DateTime utcInclusiveStart, CancellationToken cancellationToken = default);
    Task<int> CountByEstadoAsync(string estado, CancellationToken cancellationToken = default);
    Task<Dictionary<string, int>> CountGroupedByEstadoAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Encomenda> Items, int TotalRegistos)> ListPagedWithClienteAsync(
        string? estadoFiltro,
        int pagina,
        int itensPorPagina,
        CancellationToken cancellationToken = default);

    Task<Encomenda?> GetByIdDetailNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task<Encomenda?> GetByIdWithClienteItensProdutoServicosNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task<Encomenda?> GetByIdWithClienteItensProdutoNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task<Encomenda?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Encomenda?> GetByIdWithItensTrackedAsync(int id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Encomenda>> ListAtivasComItensProdutoByClienteAsync(int clienteId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Encomenda> Items, int Total)> ListHistoricoClientePaginatedAsync(int clienteId, int pagina, int pageSize, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Encomenda>> ListRecentWithClienteAsync(int take, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Encomenda>> ListPendentesWithClienteAsync(int take, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<(string MesKey, int Total)>> EncomendasPorMesUltimos6MesesAsync(CancellationToken cancellationToken = default);
}

public interface IClienteRepository
{
    Task<Cliente?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Cliente>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Cliente entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Cliente entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Cliente entity, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Cliente>> SearchOrderedAsync(string? pesquisa, string? ordenar, CancellationToken cancellationToken = default);
    Task<Cliente?> GetByIdWithDocumentosTrackedAsync(int id, CancellationToken cancellationToken = default);
    Task<Cliente?> GetByIdWithDocumentosNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Cliente>> ListOrderedForSelectAsync(CancellationToken cancellationToken = default);

    Task<int> CountAsync(CancellationToken cancellationToken = default);
}

public interface IFuncionarioRepository
{
    Task<Funcionario?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Funcionario>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Funcionario entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Funcionario entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Funcionario entity, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Funcionario>> ListResponsaveisTecnicosOrdenadosAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Funcionario>> ListEquipaComLicencaOperadorOrdenadosAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<int>> GetIdsComLicencaOperadorAsync(CancellationToken cancellationToken = default);

    Task<Funcionario?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<Funcionario?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Funcionario?> GetByIdWithDocumentosTrackedAsync(int id, CancellationToken cancellationToken = default);
    Task<Funcionario?> GetByIdWithDocumentosNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Funcionario>> SearchOrderedAsync(string? pesquisa, string? cargo, string? ordenar, CancellationToken cancellationToken = default);
    Task<Dictionary<string, string>> GetNomesPorUserIdAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Funcionario>> ListDisponiveisParaUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Funcionario>> ListByUserIdTrackedAsync(string userId, CancellationToken cancellationToken = default);
    Task<string?> GetNomeCompletoByUserIdAsync(string userId, CancellationToken cancellationToken = default);

    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<int> CountRegistadosDesdeAsync(DateTime desdeUtc, CancellationToken cancellationToken = default);
}

public interface IServicoRepository
{
    Task<Servico?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Servico>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Servico entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Servico entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Servico entity, CancellationToken cancellationToken = default);

    Task<bool> ExistsParaEncomendaAsync(int encomendaId, int? excludeServicoId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<int>> GetEncomendaIdsAssociadasAsync(int? excludeServicoId, CancellationToken cancellationToken = default);
    Task<Servico?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<int> CountCreatedSinceAsync(DateTime utcInclusiveStart, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Servico> Items, int Total)> ListPagedWithIncludesAsync(
        int? clienteId,
        DateTime? dataDesde,
        DateTime? dataAteExclusive,
        int pagina,
        int itensPorPagina,
        CancellationToken cancellationToken = default);

    Task<Servico?> GetByIdFullGraphNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<(int Id, string Nome)>> ListClientesIdNomeOrderedAsync(CancellationToken cancellationToken = default);
}

public interface IEntradaPaiolRepository
{
    Task<EntradaPaiol?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EntradaPaiol>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(EntradaPaiol entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(EntradaPaiol entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(EntradaPaiol entity, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<EntradaPaiol>> ListForPreparacaoByPaiolIdsWithIncludesAsync(IReadOnlyList<int> paiolIds, CancellationToken cancellationToken = default);
    Task<Dictionary<int, decimal>> SumQuantidadePorProdutoAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<EntradaPaiol>> ListRecentWithPaiolProdutoAsync(int take, CancellationToken cancellationToken = default);
    Task<List<(int PaiolId, int ProdutoId, decimal Total)>> SumEntradasByPaiolProdutoForPaiolIdsAsync(IReadOnlyCollection<int> paiolIds, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<EntradaPaiol> Items, int Total)> ListPagedWithPaiolProdutoAsync(IReadOnlyCollection<int> paiolIds, int? paiolId, int pagina, int itensPorPagina, CancellationToken cancellationToken = default);
}

public interface ISaidaPaiolRepository
{
    Task<SaidaPaiol?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SaidaPaiol>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(SaidaPaiol entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(SaidaPaiol entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(SaidaPaiol entity, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SaidaPaiol>> ListComEntradaPaiolReferenciadaAsync(CancellationToken cancellationToken = default);
    Task<Dictionary<int, decimal>> SumQuantidadePorProdutoAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SaidaPaiol>> ListRecentWithPaiolProdutoAsync(int take, CancellationToken cancellationToken = default);
    Task<List<(int PaiolId, int ProdutoId, decimal Total)>> SumSaidasByPaiolProdutoForPaiolIdsAsync(IReadOnlyCollection<int> paiolIds, CancellationToken cancellationToken = default);
    Task<SaidaPaiol?> FindUltimaSaidaParaRotaAsync(int encomendaId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<SaidaPaiol> Items, int Total)> ListPagedWithPaiolProdutoAsync(IReadOnlyCollection<int> paiolIds, int? paiolId, int pagina, int itensPorPagina, CancellationToken cancellationToken = default);
}

public interface IPerfilRepository
{
    Task<Perfil?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(Perfil entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Perfil entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Perfil entity, CancellationToken cancellationToken = default);

    Task<Perfil?> GetByUserIdTrackedAsync(string userId, CancellationToken cancellationToken = default);
    Task<Perfil?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<string?> GetNomeByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Perfil>> ListByUserIdTrackedAsync(string userId, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<Perfil> entities);
}

public interface ILogSistemaRepository
{
    Task<LogSistema?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task AddAsync(LogSistema entity, CancellationToken cancellationToken = default);

    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<(long Id, string? Acao, string? UserId, string? UserName, string? JsonDados, DateTime Timestamp)> Items, int Total)> ListPagedAsync(
        string? acaoFiltro,
        string? userNameFiltro,
        string? entidadeFiltro,
        DateTime? dataInicio,
        DateTime? dataFim,
        int pagina,
        int itensPorPagina,
        CancellationToken cancellationToken = default);
}

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(RefreshToken entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(RefreshToken entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(RefreshToken entity, CancellationToken cancellationToken = default);

    Task<RefreshToken?> FindActiveByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task<RefreshToken?> FindActiveOrRevokedByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RefreshToken>> ListActiveByUserIdTrackedAsync(string userId, CancellationToken cancellationToken = default);
}

public interface IReservaRepository
{
    Task<Dictionary<int, decimal>> SumQuantidadePorProdutoParaEstadosComReservaAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Reserva>> ListByEncomendaIdTrackedAsync(int encomendaId, CancellationToken cancellationToken = default);
    Task AddAsync(Reserva entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<Reserva> entities);
}

public interface IServicoDocumentoExtraRepository
{
    Task<IReadOnlyList<ServicoDocumentoExtra>> ListByServicoAndIdsAsync(int servicoId, IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default);
    Task<ServicoDocumentoExtra?> GetByServicoAndIdNoTrackingAsync(int servicoId, int id, CancellationToken cancellationToken = default);
    Task AddAsync(ServicoDocumentoExtra entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<ServicoDocumentoExtra> entities);
}

public interface IServicoEquipaRepository
{
    Task<IReadOnlyList<ServicoEquipa>> ListByServicoIdAsync(int servicoId, CancellationToken cancellationToken = default);
    Task AddAsync(ServicoEquipa entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<ServicoEquipa> entities);
}

public interface IServicoDistanciaSegurancaRepository
{
    Task<IReadOnlyList<TipoReferenciaDistancia>> ListTiposByServicoIdAsync(int servicoId, CancellationToken cancellationToken = default);
    Task AddAsync(ServicoDistanciaSeguranca entity, CancellationToken cancellationToken = default);

    Task<ServicoDistanciaSeguranca?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ServicoDistanciaSeguranca>> ListByServicoIdOrderedNoTrackingAsync(int servicoId, CancellationToken cancellationToken = default);
}

public interface IPaiolAcessoRepository
{
    Task<IReadOnlyList<int>> ListPaiolIdsByRoleNamesAsync(IReadOnlyCollection<string> roleNames, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<int>> ListAllPaiolIdsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PaiolAcesso>> ListByPaiolIdTrackedAsync(int paiolId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> ListRoleNamesByPaiolIdAsync(int paiolId, CancellationToken cancellationToken = default);
    Task AddAsync(PaiolAcesso entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<PaiolAcesso> entities);
}

public interface IClienteDocumentoExtraRepository
{
    Task<IReadOnlyList<ClienteDocumentoExtra>> ListByClienteAndIdsAsync(int clienteId, IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default);
    Task<ClienteDocumentoExtra?> GetByClienteAndIdNoTrackingAsync(int clienteId, int id, CancellationToken cancellationToken = default);
    Task<ClienteDocumentoExtra?> GetByIdNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(ClienteDocumentoExtra entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<ClienteDocumentoExtra> entities);
}

public interface IPaiolDocumentoExtraRepository
{
    Task<IReadOnlyList<PaiolDocumentoExtra>> ListByPaiolAndIdsAsync(int paiolId, IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default);
    Task<PaiolDocumentoExtra?> GetByPaiolAndIdNoTrackingAsync(int paiolId, int id, CancellationToken cancellationToken = default);
    Task<PaiolDocumentoExtra?> GetByIdNoTrackingAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(PaiolDocumentoExtra entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<PaiolDocumentoExtra> entities);
}

public interface IEncomendaItemRepository
{
    Task AddAsync(EncomendaItem entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<EncomendaItem> entities);
    Task<IReadOnlyList<EncomendaItem>> ListByEncomendaIdWithProdutoNoTrackingAsync(int encomendaId, CancellationToken cancellationToken = default);
}

public interface IServicoLicencaRepository
{
    Task<ServicoLicenca?> FindTrackedByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ServicoLicenca?> FindByServicoAndIdTrackedAsync(int servicoId, int id, CancellationToken cancellationToken = default);
    Task<ServicoLicenca?> GetByServicoAndIdNoTrackingAsync(int servicoId, int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ServicoLicenca>> ListByServicoIdTrackedAsync(int servicoId, CancellationToken cancellationToken = default);
    Task AddAsync(ServicoLicenca entity, CancellationToken cancellationToken = default);
    Task<ServicoLicenca?> FindByServicoTipoOrigemAsync(int servicoId, TipoLicencaServico tipo, OrigemRegistoServicoLicenca origem, CancellationToken cancellationToken = default);
    Task<bool> ExistsOutroAsync(int servicoId, OrigemRegistoServicoLicenca origem, string? nomePersonalizado, CancellationToken cancellationToken = default);
}

public interface IFuncionarioDocumentoExtraRepository
{
    Task<IReadOnlyList<FuncionarioDocumentoExtra>> ListByFuncionarioAndIdsAsync(int funcionarioId, IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default);
    Task<FuncionarioDocumentoExtra?> GetByFuncionarioAndIdNoTrackingAsync(int funcionarioId, int id, CancellationToken cancellationToken = default);
    Task AddAsync(FuncionarioDocumentoExtra entity, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<FuncionarioDocumentoExtra> entities);
}

public interface ICompiladoRepository
{
    Task<IReadOnlyList<Compilado>> ListAllWithItensProdutoAsync(CancellationToken cancellationToken = default);
    Task<Compilado?> GetByIdWithItensProdutoAsync(int id, CancellationToken cancellationToken = default);
    Task<Compilado?> FindTrackedByIdWithItensAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(Compilado entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Compilado entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Compilado entity, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
}
