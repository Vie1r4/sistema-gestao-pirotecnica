using System.Text;
using Finalproj.Application.Services;
using Microsoft.AspNetCore.WebUtilities;
using Xunit;

namespace Finalproj.Tests;

public class PasswordResetTokenDecoderTests
{
    [Fact]
    public void Decode_remove_espacos_e_quebras_do_meio()
    {
        const string raw = "CfDJ8LongTokenValue==";
        var encoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(raw));
        var corrupted = encoded.Insert(encoded.Length / 2, "\n ");

        var decoded = PasswordResetTokenDecoder.Decode(corrupted);
        Assert.Equal(raw, decoded);
    }

    [Fact]
    public void Decode_rejeita_vazio()
    {
        Assert.Throws<FormatException>(() => PasswordResetTokenDecoder.Decode("   "));
    }
}
