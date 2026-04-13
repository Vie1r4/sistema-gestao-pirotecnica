namespace Finalproj.Models;

/// <summary>
/// Nomes das roles (cargos) do sistema. Fonte única para Identity e autorização.
/// Regras: Admin = tudo; Gestor = tudo exceto painel Admin; Comercial = Armazém (só stock/conteudo/entrada/saída), Catálogo (ver), Encomendas e Serviços (tudo exceto apagar); Armazém = só Armazém (stock, conteudo, entrada/saída).
/// </summary>
public static class ConstantesRoles
{
    public const string Admin = "Admin";
    /// <summary> Antigo "Técnico"; acesso a tudo exceto painel de utilizadores. </summary>
    public const string Gestor = "Gestor";
    public const string Comercial = "Comercial";
    public const string Armazem = "Armazém";

    /// <summary> Todas as roles existentes no sistema (para seed e dropdowns). </summary>
    public static readonly string[] Todas = { Admin, Gestor, Comercial, Armazem };

    /// <summary> Roles que podem ser atribuídas a uma conta de funcionário (dropdown). </summary>
    public static readonly string[] ParaContaFuncionario = { Admin, Gestor, Comercial, Armazem };

    public static bool IsAdmin(string? role) => string.Equals(role, Admin, StringComparison.OrdinalIgnoreCase);
    public static bool IsGestor(string? role) => string.Equals(role, Gestor, StringComparison.OrdinalIgnoreCase);
    public static bool IsComercial(string? role) => string.Equals(role, Comercial, StringComparison.OrdinalIgnoreCase);
    public static bool IsArmazem(string? role) => string.Equals(role, Armazem, StringComparison.OrdinalIgnoreCase);
}
