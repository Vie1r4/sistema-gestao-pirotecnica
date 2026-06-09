using Finalproj.Application.Features.Servicos.DTOs;

namespace Finalproj.Application.Features.Servicos.Services;

/// <summary>
/// Regras de domínio e aplicação para Serviços: validações, equipa, resumo de material, distâncias de segurança e dados para formulários.
/// </summary>
public interface IServicoService{
    /// <summary>Valida coordenador pirotécnico, equipa e responsáveis pirotécnicos por zona.</summary>
    Task<(bool Valido, string? Erro)> ValidarEquipaServicoAsync(
        int? coordenadorPirotecnicoId,
        int[]? equipaIds,
        IReadOnlyList<ServicoZonaLancamentoInputDto>? zonas,
        CancellationToken cancellationToken = default);

    /// <summary>Dados para o formulário de criar/editar: encomendas disponíveis, responsáveis, equipa, tipos de acesso. Exclui encomendas já usadas (exceto encomendaIdSeForEdit se fornecido).</summary>
    Task<DadosFormularioServicoResult> ObterDadosFormularioAsync(int? servicoIdParaExcluirEncomenda, int? encomendaIdSugerido, CancellationToken cancellationToken = default);

    /// <summary>Cria o serviço e grava equipa. Valida encomenda e responsável/equipa. Documentos extras devem ser adicionados depois com <see cref="AdicionarDocumentosExtrasAsync"/> (após guardar ficheiros com o Id do serviço).</summary>
    Task<(Servico? Servico, string? Erro)> CriarServicoAsync(Servico servico, int[]? equipaIds, CancellationToken cancellationToken = default);

    /// <summary>Cria serviço com zonas de lançamento, linhas e distâncias de segurança por zona.</summary>
    Task<(Servico? Servico, string? Erro)> CriarServicoComZonasAsync(ServicoSaveRequestDto dto, CancellationToken cancellationToken = default);

    /// <summary>Atualiza serviço e substitui zonas de lançamento (linhas e distâncias).</summary>
    Task<(Servico? Servico, string? Erro)> AtualizarServicoComZonasAsync(int id, ServicoSaveRequestDto dto, IReadOnlyList<DocumentoGuardadoInput> documentosNovos, IReadOnlyList<int>? removerDocumentoIds, CancellationToken cancellationToken = default);

    /// <summary>Adiciona documentos extras ao serviço (caminhos já guardados em disco pelo controller).</summary>
    Task AdicionarDocumentosExtrasAsync(int servicoId, IReadOnlyList<DocumentoGuardadoInput> documentos, CancellationToken cancellationToken = default);

    /// <summary>Remove um documento extra do serviço e apaga o ficheiro em disco.</summary>
    Task<string?> RemoverDocumentoExtraAsync(int servicoId, int documentoExtraId, CancellationToken cancellationToken = default);

    /// <summary>Atualiza o serviço, equipa e documentos (remover os indicados, adicionar os novos). Valida encomenda e responsável/equipa.</summary>
    Task<(Servico? Servico, string? Erro)> AtualizarServicoAsync(int id, Servico servico, int[]? equipaIds, IReadOnlyList<DocumentoGuardadoInput> documentosNovos, IReadOnlyList<int>? removerDocumentoIds, CancellationToken cancellationToken = default);

    /// <summary>Calcula o resumo de material da encomenda (unidades, MLE, divisão dominante, etc.).</summary>
    ResumoMaterialServicoViewModel CalcularResumoMaterial(int encomendaId, List<EncomendaItem> itens);

    /// <summary>Resumo de material alocado numa zona de lançamento.</summary>
    ResumoMaterialZonaViewModel CalcularResumoMaterialZona(int zonaId, string? designacao, int encomendaId, List<EncomendaItem> itens);

    /// <summary>Garante que existem linhas de distâncias de segurança para o serviço (cria as que faltam).</summary>
    Task EnsureDistanciasSegurancaAsync(int servicoId, string? divisaoDominante, CancellationToken cancellationToken = default);

    /// <summary>Garante distâncias de segurança em todas as zonas do serviço (a partir do material de cada zona).</summary>
    Task EnsureDistanciasSegurancaZonasAsync(int servicoId, CancellationToken cancellationToken = default);
}

/// <summary>Documento já guardado em disco (nome e caminho relativo). Passado ao serviço após o controller guardar o ficheiro.</summary>
public record DocumentoGuardadoInput(string Nome, string Caminho);

/// <summary>Resultado da carga de dados para o formulário de criar/editar serviço.</summary>
public class DadosFormularioServicoResult
{
    public List<object> Encomendas { get; set; } = new();
    public List<Funcionario> Funcionarios { get; set; } = new();
    public string[] TiposAcesso { get; set; } = Array.Empty<string>();
}
