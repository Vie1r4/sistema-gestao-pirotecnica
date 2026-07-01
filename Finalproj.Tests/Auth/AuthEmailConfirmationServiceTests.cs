using Finalproj.Application.Features.Auth.DTOs;
using Finalproj.Application.Features.Auth.Services;
using Finalproj.Application.Services;
using Xunit;

namespace Finalproj.Tests.Auth;

public class AuthEmailConfirmationServiceTests
{
    [Fact]
    public async Task SendConfirmationEmailAsync_UtilizadorInexistente_NaoEnvia()
    {
        var emailSender = new RecordingEmailSender();
        var sut = CreateSut(emailSender, new ConfigurableIdentityGateway(), new FakeAuthTokenService());

        await sut.SendConfirmationEmailAsync("naoexiste@teste.pt");

        Assert.Empty(emailSender.Sent);
    }

    [Fact]
    public async Task SendConfirmationEmailAsync_EmailJaConfirmado_NaoEnvia()
    {
        var gateway = new ConfigurableIdentityGateway();
        gateway.UsersByEmail["a@b.pt"] = new AuthUserSnapshot("u1", "a@b.pt", "a@b.pt", true);
        var emailSender = new RecordingEmailSender();
        var sut = CreateSut(emailSender, gateway, new FakeAuthTokenService());

        await sut.SendConfirmationEmailAsync("a@b.pt");

        Assert.Empty(emailSender.Sent);
    }

    [Fact]
    public async Task SendConfirmationEmailAsync_Pendente_EnviaEmail()
    {
        var gateway = new ConfigurableIdentityGateway();
        gateway.UsersByEmail["a@b.pt"] = new AuthUserSnapshot("u1", "a@b.pt", "a@b.pt", false);
        var emailSender = new RecordingEmailSender();
        var sut = CreateSut(emailSender, gateway, new FakeAuthTokenService());

        await sut.SendConfirmationEmailAsync("a@b.pt");

        Assert.Single(emailSender.Sent);
        Assert.Contains("confirm-email", emailSender.Sent[0].Html);
    }

    [Fact]
    public async Task ConfirmEmailAsync_UtilizadorInexistente_RetornaErro()
    {
        var sut = CreateSut(new RecordingEmailSender(), new ConfigurableIdentityGateway(), new FakeAuthTokenService());
        var (ok, error, _, session) = await sut.ConfirmEmailAsync("missing", "code");
        Assert.False(ok);
        Assert.Equal("Utilizador não encontrado.", error);
        Assert.Null(session);
    }

    [Fact]
    public async Task ConfirmEmailAsync_TokenInvalido_RetornaErro()
    {
        var gateway = new ConfigurableIdentityGateway();
        gateway.UsersById["u1"] = new AuthUserSnapshot("u1", "a@b.pt", "a@b.pt", false);
        gateway.VerifyEmailOk = false;
        var sut = CreateSut(new RecordingEmailSender(), gateway, new FakeAuthTokenService());

        var (ok, error, _, session) = await sut.ConfirmEmailAsync("u1", "bad");
        Assert.False(ok);
        Assert.Contains("Link inválido", error);
        Assert.Null(session);
    }

    [Fact]
    public async Task ConfirmEmailAsync_Sucesso_EmiteSessao()
    {
        var gateway = new ConfigurableIdentityGateway();
        gateway.UsersById["u1"] = new AuthUserSnapshot("u1", "a@b.pt", "a@b.pt", false);
        var tokenService = new FakeAuthTokenService();
        var sut = CreateSut(new RecordingEmailSender(), gateway, tokenService);

        var encoded = Base64UrlTokenCodec.Encode("confirm");
        var (ok, error, _, session) = await sut.ConfirmEmailAsync("u1", encoded);
        Assert.True(ok);
        Assert.Null(error);
        Assert.NotNull(session);
        Assert.Equal("access-token", session!.AccessToken);
    }

    [Fact]
    public async Task ConfirmEmailAsync_JaConfirmado_EmiteSessaoSemReconfirmar()
    {
        var gateway = new ConfigurableIdentityGateway();
        gateway.UsersById["u1"] = new AuthUserSnapshot("u1", "a@b.pt", "a@b.pt", true);
        gateway.ConfirmEmailResult = AuthIdentityResult.Fail(["should not be called"]);
        var tokenService = new FakeAuthTokenService();
        var sut = CreateSut(new RecordingEmailSender(), gateway, tokenService);

        var (ok, _, _, session) = await sut.ConfirmEmailAsync("u1", "raw-code");
        Assert.True(ok);
        Assert.NotNull(session);
    }

    [Fact]
    public async Task ConfirmEmailAsync_ConfirmacaoIdentityFalha_RetornaErro()
    {
        var gateway = new ConfigurableIdentityGateway();
        gateway.UsersById["u1"] = new AuthUserSnapshot("u1", "a@b.pt", "a@b.pt", false);
        gateway.ConfirmEmailResult = AuthIdentityResult.Fail(["Falha Identity"]);
        var sut = CreateSut(new RecordingEmailSender(), gateway, new FakeAuthTokenService());

        var encoded = Base64UrlTokenCodec.Encode("confirm");
        var (ok, error, details, session) = await sut.ConfirmEmailAsync("u1", encoded);
        Assert.False(ok);
        Assert.Equal("Não foi possível confirmar o email.", error);
        Assert.Contains("Falha Identity", details!);
        Assert.Null(session);
    }

    private static AuthEmailConfirmationService CreateSut(
        RecordingEmailSender emailSender,
        ConfigurableIdentityGateway gateway,
        FakeAuthTokenService tokenService) =>
        new(AuthTestConfiguration.Create(), gateway, tokenService, emailSender);
}
