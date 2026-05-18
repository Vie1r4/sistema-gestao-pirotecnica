using Finalproj.Domain.Constants;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace Finalproj.Application.Common.Models;

/// <summary>
/// Listas <see cref="SelectListItem"/> para vistas MVC/API que referenciam constantes de domínio.
/// Mantém o núcleo de domínio livre de dependências ASP.NET Core.
/// </summary>
public static class DropdownSelectLists
{
    public static List<SelectListItem> LicencasParaDropdown() =>
        ConstantesPaiol.LicencasPaiol.Select(v => new SelectListItem { Value = v, Text = v + "G" }).ToList();

    public static List<SelectListItem> FamiliasParaDropdown() =>
        ConstantesPaiol.FamiliasRiscoProduto.Select(v => new SelectListItem
        {
            Value = v,
            Text = v == "1.4S" ? v : v + "G"
        }).ToList();

    public static List<SelectListItem> TiposPaiolParaDropdown() =>
        ConstantesPaiol.TiposPaiol.Select(x => new SelectListItem { Value = x.Value, Text = x.Text }).ToList();

    public static List<SelectListItem> GruposParaDropdown() =>
        ConstantesCatalogo.GruposCompatibilidade.Select(x => new SelectListItem { Value = x.Value, Text = x.Text }).ToList();

    public static List<SelectListItem> FiltrosTecnicosParaDropdown() =>
        ConstantesCatalogo.FiltrosTecnicos.Select(x => new SelectListItem { Value = x.Value, Text = x.Text }).ToList();

    public static List<SelectListItem> CalibresParaDropdown() =>
        ConstantesCatalogo.Calibres.Select(x => new SelectListItem { Value = x.Value, Text = x.Text }).ToList();

    public static List<SelectListItem> CargosParaDropdown() =>
        ConstantesFuncionariosClientes.Cargos.Select(c => new SelectListItem { Value = c, Text = c }).ToList();

    public static List<SelectListItem> TiposClienteParaDropdown() =>
        ConstantesFuncionariosClientes.TiposCliente.Select(t => new SelectListItem { Value = t.Value, Text = t.Text }).ToList();
}
