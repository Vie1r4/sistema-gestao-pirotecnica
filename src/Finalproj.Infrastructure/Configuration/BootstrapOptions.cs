namespace Finalproj.Infrastructure.Configuration;

/// <summary>
/// Arranque inicial (primeiro utilizador). Em produção manter <see cref="AllowFirstUserRegistration"/> desativado
/// após a primeira conta estar criada.
/// </summary>
public class BootstrapOptions
{
    public const string SectionName = "Bootstrap";

    /// <summary>
    /// Permite GET bootstrap e POST registar-primeiro-utilizador quando ainda não existem contas.
    /// </summary>
    public bool AllowFirstUserRegistration { get; set; }
}
