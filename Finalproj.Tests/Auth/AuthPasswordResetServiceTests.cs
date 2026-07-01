using Finalproj.Application.Features.Auth.DTOs;
using Finalproj.Application.Features.Auth.Services;
using Finalproj.Application.Services;
using Xunit;

namespace Finalproj.Tests.Auth;

public class AuthPasswordResetServiceTests
{
    [Fact]
    public async Task SendForgotPasswordEmailAsync_UtilizadorInexistente_NaoEnviaEmail()
    {
        var emailSender = new RecordingEmailSender();
        var sut = CreateSut(emailSender, new ConfigurableIdentityGateway());

        await sut.SendForgotPasswordEmailAsync("naoexiste@teste.pt");

        Assert.Empty(emailSender.Sent);
    }

    [Fact]
    public async Task SendForgotPasswordEmailAsync_UtilizadorExiste_EnviaEmailComLink()
    {
        var gateway = new ConfigurableIdentityGateway();
        var user = new AuthUserSnapshot("u1", "user@teste.pt", "user@teste.pt", true);
        gateway.UsersByEmail["user@teste.pt"] = user;
        var emailSender = new RecordingEmailSender();
        var sut = CreateSut(emailSender, gateway);

        await sut.SendForgotPasswordEmailAsync("user@teste.pt");

        Assert.Single(emailSender.Sent);
        Assert.Equal("user@teste.pt", emailSender.Sent[0].Email);
        Assert.Contains("reset-password", emailSender.Sent[0].Html);
        Assert.Contains("PIROFAFE", emailSender.Sent[0].Subject);
    }

    [Fact]
    public async Task ResetPasswordAsync_PasswordsNaoCoincidem_RetornaErro()
    {
        var sut = CreateSut(new RecordingEmailSender(), new ConfigurableIdentityGateway());
        var (ok, error, details) = await sut.ResetPasswordAsync("a@b.pt", "t", "Nova123!Aa", "Outra123!Aa");
        Assert.False(ok);
        Assert.Equal("A palavra-passe e a confirmação não coincidem.", error);
        Assert.Null(details);
    }

    [Fact]
    public async Task ResetPasswordAsync_UtilizadorInexistente_RetornaErro()
    {
        var sut = CreateSut(new RecordingEmailSender(), new ConfigurableIdentityGateway());
        var (ok, error, _) = await sut.ResetPasswordAsync("a@b.pt", "t", "Nova123!Aa", "Nova123!Aa");
        Assert.False(ok);
        Assert.Equal("Pedido inválido.", error);
    }

    [Fact]
    public async Task ResetPasswordAsync_PasswordFraca_RetornaDetalhes()
    {
        var gateway = new ConfigurableIdentityGateway();
        gateway.UsersByEmail["a@b.pt"] = new AuthUserSnapshot("u1", "a@b.pt", "a@b.pt", true);
        var validation = new FakePasswordValidation { Errors = ["Mínimo 8 caracteres."] };
        var sut = CreateSut(new RecordingEmailSender(), gateway, validation);

        var encoded = Base64UrlTokenCodec.Encode("token");
        var (ok, error, details) = await sut.ResetPasswordAsync("a@b.pt", encoded, "curta", "curta");
        Assert.False(ok);
        Assert.Equal("A palavra-passe não cumpre os requisitos.", error);
        Assert.Contains("Mínimo 8 caracteres.", details!);
    }

    [Fact]
    public async Task ResetPasswordAsync_TokenInvalido_RetornaErro()
    {
        var gateway = new ConfigurableIdentityGateway();
        gateway.UsersByEmail["a@b.pt"] = new AuthUserSnapshot("u1", "a@b.pt", "a@b.pt", true);
        var sut = CreateSut(new RecordingEmailSender(), gateway);

        var (ok, error, _) = await sut.ResetPasswordAsync("a@b.pt", "%%%invalido%%%", "Nova123!Aa", "Nova123!Aa");
        Assert.False(ok);
        Assert.Contains("Token inválido", error);
    }

    [Fact]
    public async Task ResetPasswordAsync_IdentityRejeitaToken_RetornaErroAmigavel()
    {
        var gateway = new ConfigurableIdentityGateway();
        gateway.UsersByEmail["a@b.pt"] = new AuthUserSnapshot("u1", "a@b.pt", "a@b.pt", true);
        gateway.ResetPasswordResult = AuthIdentityResult.Fail(["Invalid token"]);
        var sut = CreateSut(new RecordingEmailSender(), gateway);

        var encoded = Base64UrlTokenCodec.Encode("token");
        var (ok, error, _) = await sut.ResetPasswordAsync("a@b.pt", encoded, "Nova123!Aa", "Nova123!Aa");
        Assert.False(ok);
        Assert.Contains("Token inválido", error);
    }

    [Fact]
    public async Task ResetPasswordAsync_Sucesso_ConfirmaEmailSeNecessario()
    {
        var gateway = new ConfigurableIdentityGateway();
        gateway.UsersByEmail["a@b.pt"] = new AuthUserSnapshot("u1", "a@b.pt", "a@b.pt", false);
        var sut = CreateSut(new RecordingEmailSender(), gateway);

        var encoded = Base64UrlTokenCodec.Encode("token");
        var (ok, error, _) = await sut.ResetPasswordAsync("a@b.pt", encoded, "Nova123!Aa", "Nova123!Aa");
        Assert.True(ok);
        Assert.Null(error);
        Assert.True(gateway.EmailConfirmedAfterReset);
    }

    [Fact]
    public async Task ResetPasswordAsync_IdentityErroGenerico_RetornaMensagemGenerica()
    {
        var gateway = new ConfigurableIdentityGateway();
        gateway.UsersByEmail["a@b.pt"] = new AuthUserSnapshot("u1", "a@b.pt", "a@b.pt", true);
        gateway.ResetPasswordResult = AuthIdentityResult.Fail(["Password too weak"]);
        var sut = CreateSut(new RecordingEmailSender(), gateway);

        var encoded = Base64UrlTokenCodec.Encode("token");
        var (ok, error, details) = await sut.ResetPasswordAsync("a@b.pt", encoded, "Nova123!Aa", "Nova123!Aa");
        Assert.False(ok);
        Assert.Equal("Não foi possível redefinir a palavra-passe.", error);
        Assert.Contains("Password too weak", details!);
    }

    private static AuthPasswordResetService CreateSut(
        RecordingEmailSender emailSender,
        ConfigurableIdentityGateway gateway,
        FakePasswordValidation? validation = null) =>
        new(
            AuthTestConfiguration.Create(),
            gateway,
            emailSender,
            validation ?? new FakePasswordValidation());
}
