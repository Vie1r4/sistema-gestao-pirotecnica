using Finalproj.Infrastructure.Configuration;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Finalproj.Tests.Security;

public class ProductionConfigurationValidatorTests
{
    private static IConfiguration BuildConfig(Dictionary<string, string?> values)
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(values!)
            .Build();
    }

    private static Dictionary<string, string?> ValidProduction() => new()
    {
        ["Bootstrap:AllowFirstUserRegistration"] = "false",
        ["AllowedHosts"] = "app.example.com;api.example.com",
        ["Cors:AllowedOrigins"] = "https://app.example.com",
        ["Frontend:BaseUrl"] = "https://app.example.com",
        ["Jwt:Secret"] = new string('x', 32),
        ["ConnectionStrings:FinalprojContext"] = "Server=sql.example.com;Database=Pirofafe;User Id=app;Password=secret;",
    };

    [Fact]
    public void Validate_ConfiguracaoValida_SemErros()
    {
        var errors = ProductionConfigurationValidator.Validate(BuildConfig(ValidProduction()));
        Assert.Empty(errors);
    }

    [Fact]
    public void Validate_BootstrapAtivo_ReportaErro()
    {
        var cfg = ValidProduction();
        cfg["Bootstrap:AllowFirstUserRegistration"] = "true";

        var errors = ProductionConfigurationValidator.Validate(BuildConfig(cfg));

        Assert.Contains(errors, e => e.Contains("Bootstrap", StringComparison.Ordinal));
    }

    [Fact]
    public void Validate_CorsLocalhost_ReportaErro()
    {
        var cfg = ValidProduction();
        cfg["Cors:AllowedOrigins"] = "https://localhost:3000";

        var errors = ProductionConfigurationValidator.Validate(BuildConfig(cfg));

        Assert.Contains(errors, e => e.Contains("localhost", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Validate_CorsHttp_ReportaErro()
    {
        var cfg = ValidProduction();
        cfg["Cors:AllowedOrigins"] = "http://app.example.com";

        var errors = ProductionConfigurationValidator.Validate(BuildConfig(cfg));

        Assert.Contains(errors, e => e.Contains("HTTPS", StringComparison.Ordinal));
    }

    [Fact]
    public void Validate_AllowedHostsWildcard_ReportaErro()
    {
        var cfg = ValidProduction();
        cfg["AllowedHosts"] = "*";

        var errors = ProductionConfigurationValidator.Validate(BuildConfig(cfg));

        Assert.Contains(errors, e => e.Contains("AllowedHosts", StringComparison.Ordinal));
    }

    [Fact]
    public void Validate_LocalDb_ReportaErro()
    {
        var cfg = ValidProduction();
        cfg["ConnectionStrings:FinalprojContext"] =
            "Server=(localdb)\\mssqllocaldb;Database=Test;Trusted_Connection=True;";

        var errors = ProductionConfigurationValidator.Validate(BuildConfig(cfg));

        Assert.Contains(errors, e => e.Contains("LocalDB", StringComparison.Ordinal));
    }

    [Fact]
    public void EnsureValidOrThrow_ComErros_LancaInvalidOperationException()
    {
        var cfg = BuildConfig(new Dictionary<string, string?>());

        var ex = Assert.Throws<InvalidOperationException>(() =>
            ProductionConfigurationValidator.EnsureValidOrThrow(cfg));

        Assert.Contains("produção inválida", ex.Message, StringComparison.OrdinalIgnoreCase);
    }
}
