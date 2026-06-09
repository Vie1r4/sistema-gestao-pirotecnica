using System.Security.Cryptography;
using Finalproj.Application.Services;
using Finalproj.Infrastructure.Configuration;
using Finalproj.Infrastructure.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Finalproj.Tests.Security;

public class CifragemEmRepousoServiceTests
{
    private static readonly byte[] Key = RandomNumberGenerator.GetBytes(32);

    private static CifragemEmRepousoService CreateService(bool ativa = true) =>
        new(
            Options.Create(new CifragemEmRepousoOptions
            {
                Ativa = ativa,
                ChaveBase64 = Convert.ToBase64String(Key),
                CifrarBackups = true
            }),
            NullLogger<CifragemEmRepousoService>.Instance);

    [Fact]
    public void Cifrar_Decifrar_Roundtrip()
    {
        var svc = CreateService();
        var plain = "conteudo pirotécnico confidencial"u8.ToArray();
        var cipher = svc.Cifrar(plain);
        Assert.True(svc.FicheiroEstaCifrado(cipher));
        var back = svc.Decifrar(cipher);
        Assert.Equal(plain, back);
    }

    [Fact]
    public void Decifrar_Plaintext_Legacy_PassThrough()
    {
        var svc = CreateService();
        var plain = "%PDF-1.4 fake pdf header"u8.ToArray();
        Assert.False(svc.FicheiroEstaCifrado(plain));
        Assert.Equal(plain, svc.Decifrar(plain));
    }

    [Fact]
    public async Task Escrever_Ler_Ficheiro_Cifrado()
    {
        var svc = CreateService();
        var path = Path.Combine(Path.GetTempPath(), $"pirofafe-test-{Guid.NewGuid():N}.bin");
        try
        {
            var plain = new byte[] { 1, 2, 3, 4, 5 };
            await svc.EscreverBytesAsync(path, plain);
            var raw = await File.ReadAllBytesAsync(path);
            Assert.True(svc.FicheiroEstaCifrado(raw));
            var read = await svc.LerBytesAsync(path);
            Assert.Equal(plain, read);
        }
        finally
        {
            if (File.Exists(path))
                File.Delete(path);
        }
    }

    [Fact]
    public async Task CifrarInPlace_Atomico_DeixaFicheiroCifrado_SemTemporarios()
    {
        var svc = CreateService();
        var dir = Path.Combine(Path.GetTempPath(), $"pirofafe-bak-{Guid.NewGuid():N}");
        Directory.CreateDirectory(dir);
        var path = Path.Combine(dir, "db-backup_Teste.bak");
        try
        {
            var plain = new byte[] { 10, 20, 30, 40, 50 };
            await File.WriteAllBytesAsync(path, plain);

            await svc.CifrarFicheiroInPlaceAsync(path);

            var raw = await File.ReadAllBytesAsync(path);
            Assert.True(svc.FicheiroEstaCifrado(raw));
            Assert.Equal(plain, await svc.LerBytesAsync(path));
            Assert.Empty(Directory.GetFiles(dir, "*.tmp"));
        }
        finally
        {
            if (Directory.Exists(dir))
                Directory.Delete(dir, recursive: true);
        }
    }

    [Fact]
    public async Task CifrarInPlace_Idempotente_NaoRecifraFicheiroJaCifrado()
    {
        var svc = CreateService();
        var path = Path.Combine(Path.GetTempPath(), $"pirofafe-test-{Guid.NewGuid():N}.bak");
        try
        {
            await svc.EscreverBytesAsync(path, new byte[] { 1, 2, 3 });
            var antes = await File.ReadAllBytesAsync(path);

            await svc.CifrarFicheiroInPlaceAsync(path);

            var depois = await File.ReadAllBytesAsync(path);
            Assert.Equal(antes, depois);
        }
        finally
        {
            if (File.Exists(path))
                File.Delete(path);
        }
    }

    [Fact]
    public async Task PrepararPlaintext_Temporario_Quando_Cifrado()
    {
        var svc = CreateService();
        var path = Path.Combine(Path.GetTempPath(), $"pirofafe-test-{Guid.NewGuid():N}.bak");
        try
        {
            await svc.EscreverBytesAsync(path, new byte[] { 9, 8, 7 });
            var (plain, temp) = await svc.PrepararFicheiroPlaintextAsync(path);
            Assert.True(temp);
            Assert.NotEqual(path, plain);
            var bytes = await File.ReadAllBytesAsync(plain);
            Assert.Equal(new byte[] { 9, 8, 7 }, bytes);
            svc.EliminarTemporarioSeNecessario(plain, temp);
            Assert.False(File.Exists(plain));
        }
        finally
        {
            if (File.Exists(path))
                File.Delete(path);
        }
    }
}
