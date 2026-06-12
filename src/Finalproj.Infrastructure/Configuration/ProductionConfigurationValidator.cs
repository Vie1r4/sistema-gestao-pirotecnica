using Microsoft.Extensions.Configuration;

namespace Finalproj.Infrastructure.Configuration;

/// <summary>
/// Validação fail-fast ao arrancar em <c>Production</c> — evita expor a API com defaults de desenvolvimento.
/// </summary>
public static class ProductionConfigurationValidator
{
    private static readonly string[] LocalHostMarkers =
    [
        "localhost",
        "127.0.0.1",
        "[::1]",
        "0.0.0.0"
    ];

    public static IReadOnlyList<string> Validate(IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        var errors = new List<string>();

        if (configuration.GetValue("Bootstrap:AllowFirstUserRegistration", false))
        {
            errors.Add(
                "Bootstrap:AllowFirstUserRegistration deve ser false em produção (desativa o registo público do primeiro admin).");
        }

        var allowedHosts = configuration["AllowedHosts"]?.Trim();
        if (string.IsNullOrEmpty(allowedHosts) || allowedHosts == "*")
        {
            errors.Add(
                "AllowedHosts não pode ser '*' em produção — defina os hostnames públicos (ex.: app.seudominio.pt;api.seudominio.pt).");
        }

        var corsRaw = configuration["Cors:AllowedOrigins"]?.Trim();
        if (string.IsNullOrEmpty(corsRaw))
        {
            errors.Add("Cors:AllowedOrigins é obrigatório em produção (ex.: https://app.seudominio.pt).");
        }
        else
        {
            foreach (var origin in SplitList(corsRaw))
            {
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                {
                    errors.Add($"Cors:AllowedOrigins contém origem inválida: «{origin}».");
                    continue;
                }

                if (!string.Equals(uri.Scheme, "https", StringComparison.OrdinalIgnoreCase))
                {
                    errors.Add($"Cors:AllowedOrigins deve usar apenas HTTPS em produção: «{origin}».");
                }

                if (ContainsLocalHostMarker(uri.Host))
                {
                    errors.Add($"Cors:AllowedOrigins não pode incluir localhost em produção: «{origin}».");
                }
            }
        }

        var frontendBase = configuration["Frontend:BaseUrl"]?.Trim();
        if (string.IsNullOrEmpty(frontendBase))
        {
            errors.Add("Frontend:BaseUrl é obrigatório em produção (links de email e reset de password).");
        }
        else if (!Uri.TryCreate(frontendBase, UriKind.Absolute, out var frontendUri)
                 || !string.Equals(frontendUri.Scheme, "https", StringComparison.OrdinalIgnoreCase))
        {
            errors.Add("Frontend:BaseUrl deve ser uma URL HTTPS absoluta (ex.: https://app.seudominio.pt).");
        }
        else if (ContainsLocalHostMarker(frontendUri.Host))
        {
            errors.Add("Frontend:BaseUrl não pode apontar para localhost em produção.");
        }

        var jwtSecret = configuration["Jwt:Secret"] ?? "";
        if (string.IsNullOrWhiteSpace(jwtSecret) || jwtSecret.Length < 32)
        {
            errors.Add(
                "Jwt:Secret deve ter pelo menos 32 caracteres — defina via variável de ambiente (Jwt__Secret) ou secret manager.");
        }

        var connectionString = configuration.GetConnectionString("FinalprojContext") ?? "";
        if (connectionString.Contains("localdb", StringComparison.OrdinalIgnoreCase))
        {
            errors.Add(
                "ConnectionStrings:FinalprojContext não deve usar LocalDB em produção — use SQL Server com credenciais seguras.");
        }

        return errors;
    }

    public static void EnsureValidOrThrow(IConfiguration configuration)
    {
        var errors = Validate(configuration);
        if (errors.Count == 0) return;

        var message = string.Join(
            Environment.NewLine,
            new[] { "Configuração de produção inválida. Corrija antes de expor na internet:" }
                .Concat(errors.Select(e => "  • " + e)));
        throw new InvalidOperationException(message);
    }

    private static IEnumerable<string> SplitList(string value) =>
        value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    private static bool ContainsLocalHostMarker(string host)
    {
        if (string.IsNullOrWhiteSpace(host)) return true;
        return LocalHostMarkers.Any(m =>
            host.Equals(m, StringComparison.OrdinalIgnoreCase)
            || host.Contains(m, StringComparison.OrdinalIgnoreCase));
    }
}
