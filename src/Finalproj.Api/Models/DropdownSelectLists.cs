using Finalproj.Domain.Constants;

namespace Finalproj.Api.Models;

/// <summary>
/// Opção para dropdowns devolvidos pela API (sem dependência de MVC).
/// </summary>
public sealed class ApiDropdownOption
{
    public string Value { get; init; } = "";
    public string Text { get; init; } = "";
}

/// <summary>
/// Listas de opções para dropdowns que referenciam constantes de domínio.
/// </summary>
public static class DropdownSelectLists
{
    public static List<ApiDropdownOption> LicencasParaDropdown() =>
        ConstantesPaiol.LicencasPaiol.Select(v => new ApiDropdownOption { Value = v, Text = v + "G" }).ToList();

    public static List<ApiDropdownOption> FamiliasParaDropdown() =>
        ConstantesPaiol.FamiliasRiscoProduto.Select(v => new ApiDropdownOption
        {
            Value = v,
            Text = v == "1.4S" ? v : v + "G"
        }).ToList();

    public static List<ApiDropdownOption> TiposPaiolParaDropdown() =>
        ConstantesPaiol.TiposPaiol.Select(x => new ApiDropdownOption { Value = x.Value, Text = x.Text }).ToList();

    public static List<ApiDropdownOption> GruposParaDropdown() =>
        ConstantesCatalogo.GruposCompatibilidade.Select(x => new ApiDropdownOption { Value = x.Value, Text = x.Text }).ToList();

    public static List<ApiDropdownOption> FiltrosTecnicosParaDropdown() =>
        ConstantesCatalogo.FiltrosTecnicos.Select(x => new ApiDropdownOption { Value = x.Value, Text = x.Text }).ToList();

    public static List<ApiDropdownOption> CalibresParaDropdown() =>
        ConstantesCatalogo.Calibres.Select(x => new ApiDropdownOption { Value = x.Value, Text = x.Text }).ToList();

    public static List<ApiDropdownOption> CargosParaDropdown() =>
        ConstantesFuncionariosClientes.Cargos.Select(c => new ApiDropdownOption { Value = c, Text = c }).ToList();

    public static List<ApiDropdownOption> TiposClienteParaDropdown() =>
        ConstantesFuncionariosClientes.TiposCliente.Select(t => new ApiDropdownOption { Value = t.Value, Text = t.Text }).ToList();
}
