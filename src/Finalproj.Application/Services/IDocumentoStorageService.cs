namespace Finalproj.Application.Services;

/// <summary>
/// Serviço para guardar e apagar ficheiros de documentos no disco (wwwroot).
/// Utilizado por ServicosController, ClientesController, FuncionariosController e PaiolController.
/// </summary>
public interface IDocumentoStorageService
{
    /// <summary>Extensões permitidas para upload (ex.: .pdf, .jpg, .jpeg, .png).</summary>
    IReadOnlyList<string> ExtensoesPermitidas { get; }

    /// <summary>Verifica se a extensão do ficheiro é permitida.</summary>
    bool ExtensaoPermitida(string fileName);

    /// <summary>Guarda o ficheiro na pasta relativa base + id da entidade; devolve caminho relativo (para guardar na BD).</summary>
    Task<string> GuardarFicheiroAsync(string pastaRelativaBase, int entidadeId, IFormFile ficheiro, string prefixoNome, CancellationToken cancellationToken = default);

    /// <summary>Apaga o ficheiro do disco se existir. Regista aviso no log em caso de falha.</summary>
    void ApagarFicheiroSeExistir(string? caminhoRelativo);

    /// <summary>Apaga a pasta e todo o conteúdo de forma recursiva. Regista aviso no log em caso de falha.</summary>
    void ApagarPastaRecursiva(string? pastaRelativa);
}
