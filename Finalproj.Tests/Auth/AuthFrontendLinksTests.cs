using Finalproj.Application.Features.Auth.Email;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Finalproj.Tests.Auth;

public class AuthFrontendLinksTests
{
    [Fact]
    public void PasswordReset_UsaBaseUrlDoConfig()
    {
        var config = AuthTestConfiguration.Create();
        var link = AuthFrontendLinks.PasswordReset(config, "user@teste.pt", "tok123");

        Assert.StartsWith("http://localhost:3000/reset-password?", link);
        Assert.Contains("email=user%40teste.pt", link);
        Assert.Contains("token=tok123", link);
    }

    [Fact]
    public void ConfirmEmail_UsaBaseUrlDoConfig()
    {
        var config = AuthTestConfiguration.Create();
        var link = AuthFrontendLinks.ConfirmEmail(config, "user-id-1", "code-abc");

        Assert.StartsWith("http://localhost:3000/confirm-email?", link);
        Assert.Contains("userId=user-id-1", link);
        Assert.Contains("code=code-abc", link);
    }

    [Fact]
    public void BaseUrl_FallbackQuandoConfigEmFalta()
    {
        var config = new ConfigurationBuilder().Build();
        Assert.Equal("http://localhost:3000", AuthFrontendLinks.BaseUrl(config));
    }

    [Fact]
    public void BaseUrl_RemoveBarraFinal()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Frontend:BaseUrl"] = "http://localhost:3000/",
            })
            .Build();
        Assert.Equal("http://localhost:3000", AuthFrontendLinks.BaseUrl(config));
    }
}
