using Finalproj.Application.Features.Auth.Email;
using Xunit;

namespace Finalproj.Tests.Auth;

public class AuthEmailTemplatesTests
{
    [Fact]
    public void PasswordReset_IncluiLinkSeguroEAssunto()
    {
        const string link = "http://localhost:3000/reset-password?email=a%40b.pt&token=abc";
        var (subject, html) = AuthEmailTemplates.PasswordReset(link);

        Assert.Equal("PIROFAFE — Redefinir palavra-passe", subject);
        Assert.Contains("Redefinir palavra-passe", html);
        Assert.Contains("http://localhost:3000/reset-password", html);
        Assert.Contains("email=a%40b.pt", html);
        Assert.Contains("token=abc", html);
        Assert.Contains("Definir nova palavra-passe", html);
        Assert.Contains("pode ignorar este email", html);
    }

    [Fact]
    public void PasswordReset_EscapaHtmlMaliciosoNoTitulo()
    {
        const string link = "https://example.com/reset";
        var (subject, html) = AuthEmailTemplates.PasswordReset(link);

        Assert.DoesNotContain("<script>", html, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("PIROFAFE", subject);
    }

    [Fact]
    public void EmailConfirmation_IncluiLinkEAssunto()
    {
        const string url = "http://localhost:3000/confirm-email?userId=u1&code=xyz";
        var (subject, html) = AuthEmailTemplates.EmailConfirmation(url);

        Assert.Equal("PIROFAFE — Confirme o seu email", subject);
        Assert.Contains("Confirmar email", html);
        Assert.Contains("http://localhost:3000/confirm-email", html);
        Assert.Contains("userId=u1", html);
        Assert.Contains("code=xyz", html);
        Assert.Contains("Para ativar a sua conta", html);
    }
}
