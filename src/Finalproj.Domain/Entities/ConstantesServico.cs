namespace Finalproj.Domain.Constants;

/// <summary>
/// Opções para o tipo de evento (público/privado).
/// </summary>
public static class ConstantesServico
{
    public const string Publico = "Público";
    public const string Privado = "Privado";

    public static readonly string[] TiposAcesso = { Publico, Privado };
}
