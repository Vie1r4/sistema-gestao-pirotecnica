using Finalproj.Application.Common.Models;

namespace Finalproj.Application.Services;

/// <summary>
/// Serviço para guardar e apagar ficheiros de documentos no disco (PirofafeData/Uploads).
/// Utilizado por ServicosController, ClientesController, FuncionariosController e PaiolController.
/// </summary>
public interface IDocumentoStorageService
{
    /// <summary>Extensões permitidas para upload (ex.: .pdf, .jpg, .jpeg, .png).</summary>
    IReadOnlyList<string> ExtensoesPermitidas { get; }

    /// <summary>Verifica se a extensão do ficheiro é permitida.</summary>
    bool ExtensaoPermitida(string fileName);

    /// <summary>Valida extensão e conteúdo (magic bytes: PDF, JPEG, PNG). Lança <see cref="InvalidOperationException"/> se inválido.</summary>
    Task ValidarFicheiroParaUploadAsync(UploadedFileContent ficheiro, CancellationToken cancellationToken = default);

    /// <summary>Guarda o ficheiro na pasta relativa base + id da entidade; devolve caminho relativo (para guardar na BD).</summary>
    Task<string> GuardarFicheiroAsync(string pastaRelativaBase, int entidadeId, UploadedFileContent ficheiro, string prefixoNome, CancellationToken cancellationToken = default);

    /// <summary>Resolve caminho físico seguro para leitura (uploads + fallback wwwroot).</summary>
    string? ResolverCaminhoFisicoParaLeitura(string? caminhoRelativo);

    /// <summary>Grava ficheiro num caminho relativo completo (ex. licenças em Documentos/Servico/5/Licencas/...).</summary>
    Task<string> GuardarFicheiroNoCaminhoRelativoAsync(string caminhoRelativo, UploadedFileContent ficheiro, CancellationToken cancellationToken = default);

    /// <summary>Grava bytes gerados (ex. DOCX) num caminho relativo, sem validação de upload.</summary>
    Task<string> GuardarBytesNoCaminhoRelativoAsync(string caminhoRelativo, byte[] conteudo, CancellationToken cancellationToken = default);

    /// <summary>Apaga o ficheiro do disco se existir. Regista aviso no log em caso de falha.</summary>
    void ApagarFicheiroSeExistir(string? caminhoRelativo);

    /// <summary>Apaga a pasta e todo o conteúdo de forma recursiva. Regista aviso no log em caso de falha.</summary>
    void ApagarPastaRecursiva(string? pastaRelativa);

    /// <summary>Lê o conteúdo do ficheiro (decifrado se aplicável). Devolve null se não existir.</summary>
    Task<byte[]?> LerConteudoAsync(string? caminhoRelativo, CancellationToken cancellationToken = default);
}
