using Finalproj.Application.Services;
using Xunit;

namespace Finalproj.Tests.Services;

public class Base64UrlTokenCodecTests
{
    [Fact]
    public void EncodeDecode_RoundTrip()
    {
        const string value = "token-identity-com-caracteres+/=";
        var encoded = Base64UrlTokenCodec.Encode(value);
        Assert.DoesNotContain("+", encoded);
        Assert.DoesNotContain("/", encoded);
        Assert.DoesNotContain("=", encoded);
        Assert.Equal(value, Base64UrlTokenCodec.DecodeToString(encoded));
    }

    [Fact]
    public void DecodeToStringOrRaw_TokenInvalido_DevolveRaw()
    {
        const string raw = "not-base64-url!!!";
        Assert.Equal(raw, Base64UrlTokenCodec.DecodeToStringOrRaw(raw));
    }

    [Fact]
    public void DecodeToString_AceitaPaddingVariavel()
    {
        var encoded = Base64UrlTokenCodec.Encode("ab");
        Assert.Equal("ab", Base64UrlTokenCodec.DecodeToString(encoded));
    }
}
