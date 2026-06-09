namespace Finalproj.Application.Services;

/// <summary>Cifragem simétrica em repouso (AES-256-GCM) para uploads e backups.</summary>
public interface ICifragemEmRepousoService
{
    bool Ativa { get; }

    bool FicheiroEstaCifrado(ReadOnlySpan<byte> conteudo);

    byte[] Cifrar(byte[] plaintext);

    byte[] Decifrar(byte[] payload);

    /// <summary>Lê bytes do disco; decifra se o ficheiro tiver cabeçalho PIRFENC1.</summary>
    Task<byte[]> LerBytesAsync(string caminhoFisico, CancellationToken cancellationToken = default);

    /// <summary>Grava bytes no disco; cifra se <see cref="Ativa"/>.</summary>
    Task EscreverBytesAsync(string caminhoFisico, byte[] conteudo, CancellationToken cancellationToken = default);

    /// <summary>Substitui o ficheiro pela versão cifrada (no-op se já cifrado ou inactivo).</summary>
    Task CifrarFicheiroInPlaceAsync(string caminhoFisico, CancellationToken cancellationToken = default);

    /// <summary>Devolve caminho legível (plain): o original ou um temporário decifrado.</summary>
    Task<(string CaminhoPlain, bool Temporario)> PrepararFicheiroPlaintextAsync(
        string caminhoFisico,
        CancellationToken cancellationToken = default);

    /// <summary>Apaga temporário criado por <see cref="PrepararFicheiroPlaintextAsync"/>.</summary>
    void EliminarTemporarioSeNecessario(string caminhoPlain, bool temporario);
}
