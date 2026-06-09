using System.Security.Cryptography;
using Finalproj.Application.Services;
using Finalproj.Infrastructure.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Finalproj.Infrastructure.Services;

/// <summary>AES-256-GCM com cabeçalho PIRFENC1; compatível com ficheiros legados em plain text.</summary>
public sealed class CifragemEmRepousoService : ICifragemEmRepousoService
{
    private static readonly byte[] Magic = "PIRFENC1"u8.ToArray();
    private const int NonceSize = 12;
    private const int TagSize = 16;

    private readonly CifragemEmRepousoOptions _options;
    private readonly byte[]? _key;
    private readonly ILogger<CifragemEmRepousoService> _logger;

    public CifragemEmRepousoService(IOptions<CifragemEmRepousoOptions> options, ILogger<CifragemEmRepousoService> logger)
    {
        _options = options.Value;
        _logger = logger;
        _key = ResolverChave(_options);
        Ativa = _options.Ativa && _key != null;
        if (_options.Ativa && _key == null)
            _logger.LogWarning("CifragemEmRepouso:Ativa=true mas ChaveBase64 inválida — cifragem desactivada.");
    }

    public bool Ativa { get; }

    public bool FicheiroEstaCifrado(ReadOnlySpan<byte> conteudo) =>
        conteudo.Length >= Magic.Length && conteudo[..Magic.Length].SequenceEqual(Magic);

    public byte[] Cifrar(byte[] plaintext)
    {
        if (_key == null)
            throw new InvalidOperationException("Cifragem não configurada.");
        var nonce = RandomNumberGenerator.GetBytes(NonceSize);
        var ciphertext = new byte[plaintext.Length];
        var tag = new byte[TagSize];
        using var aes = new AesGcm(_key, TagSize);
        aes.Encrypt(nonce, plaintext, ciphertext, tag);

        var result = new byte[Magic.Length + NonceSize + ciphertext.Length + TagSize];
        Magic.CopyTo(result, 0);
        nonce.CopyTo(result, Magic.Length);
        ciphertext.CopyTo(result, Magic.Length + NonceSize);
        tag.CopyTo(result, Magic.Length + NonceSize + ciphertext.Length);
        return result;
    }

    public byte[] Decifrar(byte[] payload)
    {
        if (_key == null)
            throw new InvalidOperationException("Cifragem não configurada.");
        if (!FicheiroEstaCifrado(payload))
            return payload;

        var offset = Magic.Length;
        var nonce = payload.AsSpan(offset, NonceSize);
        offset += NonceSize;
        var cipherLen = payload.Length - offset - TagSize;
        if (cipherLen < 0)
            throw new InvalidDataException("Payload cifrado inválido.");
        var ciphertext = payload.AsSpan(offset, cipherLen);
        var tag = payload.AsSpan(offset + cipherLen, TagSize);
        var plain = new byte[cipherLen];
        using var aes = new AesGcm(_key, TagSize);
        aes.Decrypt(nonce, ciphertext, tag, plain);
        return plain;
    }

    public async Task<byte[]> LerBytesAsync(string caminhoFisico, CancellationToken cancellationToken = default)
    {
        var raw = await File.ReadAllBytesAsync(caminhoFisico, cancellationToken);
        return FicheiroEstaCifrado(raw) ? Decifrar(raw) : raw;
    }

    public async Task EscreverBytesAsync(string caminhoFisico, byte[] conteudo, CancellationToken cancellationToken = default)
    {
        var toWrite = Ativa ? Cifrar(conteudo) : conteudo;
        var dir = Path.GetDirectoryName(caminhoFisico);
        if (!string.IsNullOrEmpty(dir))
            Directory.CreateDirectory(dir);
        await File.WriteAllBytesAsync(caminhoFisico, toWrite, cancellationToken);
    }

    public async Task CifrarFicheiroInPlaceAsync(string caminhoFisico, CancellationToken cancellationToken = default)
    {
        if (!Ativa || !File.Exists(caminhoFisico))
            return;

        var raw = await File.ReadAllBytesAsync(caminhoFisico, cancellationToken);
        if (FicheiroEstaCifrado(raw))
            return;

        // Cifragem atómica: escrever num temporário na mesma pasta e só depois substituir o original.
        // Se o processo cair a meio (ex.: falha de energia), o ficheiro original fica intacto.
        var cifrado = Cifrar(raw);
        var caminhoFull = Path.GetFullPath(caminhoFisico);
        var dir = Path.GetDirectoryName(caminhoFull);
        if (string.IsNullOrEmpty(dir))
            throw new InvalidOperationException($"Caminho de ficheiro inválido para cifragem: '{caminhoFisico}'.");

        var temp = Path.Combine(dir, $"{Path.GetFileName(caminhoFull)}.{Guid.NewGuid():N}.tmp");
        try
        {
            await File.WriteAllBytesAsync(temp, cifrado, cancellationToken);
            File.Move(temp, caminhoFull, overwrite: true);
        }
        catch
        {
            try
            {
                if (File.Exists(temp))
                    File.Delete(temp);
            }
            catch (Exception cleanupEx)
            {
                _logger.LogWarning(cleanupEx, "Falha a apagar temporário de cifragem: {Path}", temp);
            }

            throw;
        }

        _logger.LogDebug("Ficheiro cifrado em repouso (atómico): {Path}", Path.GetFileName(caminhoFisico));
    }

    public async Task<(string CaminhoPlain, bool Temporario)> PrepararFicheiroPlaintextAsync(
        string caminhoFisico,
        CancellationToken cancellationToken = default)
    {
        if (!File.Exists(caminhoFisico))
            throw new FileNotFoundException("Ficheiro não encontrado.", caminhoFisico);

        var head = new byte[Magic.Length];
        await using (var fs = File.OpenRead(caminhoFisico))
        {
            var read = await fs.ReadAsync(head.AsMemory(0, head.Length), cancellationToken);
            if (read < Magic.Length || !FicheiroEstaCifrado(head))
                return (caminhoFisico, false);
        }

        var plain = await LerBytesAsync(caminhoFisico, cancellationToken);
        var temp = Path.Combine(Path.GetTempPath(), $"pirofafe-plain-{Guid.NewGuid():N}{Path.GetExtension(caminhoFisico)}");
        await File.WriteAllBytesAsync(temp, plain, cancellationToken);
        return (temp, true);
    }

    public void EliminarTemporarioSeNecessario(string caminhoPlain, bool temporario)
    {
        if (!temporario)
            return;
        try
        {
            if (File.Exists(caminhoPlain))
                File.Delete(caminhoPlain);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao apagar ficheiro temporário de decifragem.");
        }
    }

    private static byte[]? ResolverChave(CifragemEmRepousoOptions options)
    {
        if (string.IsNullOrWhiteSpace(options.ChaveBase64))
            return null;
        try
        {
            var key = Convert.FromBase64String(options.ChaveBase64.Trim());
            return key.Length == 32 ? key : null;
        }
        catch
        {
            return null;
        }
    }
}
