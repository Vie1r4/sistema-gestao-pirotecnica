namespace Finalproj.Domain.Constants;

/// <summary>
/// Valores fixos para formulários de funcionários e clientes.
/// Listas para dropdowns na API: Finalproj.Api.Models.DropdownSelectLists.
/// </summary>
public static class ConstantesFuncionariosClientes
{
    /// <summary> Cargos disponíveis (alinhado aos roles do sistema). </summary>
    public static readonly string[] Cargos = ConstantesRoles.ParaContaFuncionario;

    /// <summary> Tipos de cliente. </summary>
    public static readonly (string Value, string Text)[] TiposCliente =
    {
        ("Particular", "Particular"),
        ("Empresa", "Empresa")
    };
}
