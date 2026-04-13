using Finalproj.Models;
using Microsoft.AspNetCore.Authorization;

namespace Finalproj.Authorization;

/// <summary>
/// Nomes das políticas de autorização e quais roles as satisfazem.
/// Admin: tudo. Gestor: tudo exceto painel Admin. Comercial: Armazém (só stock/conteudo/entrada/saída), Catálogo (ver), Encomendas e Serviços (tudo exceto apagar). Armazém: Armazém (stock, conteudo, entrada/saída) e Catálogo (só ver/navegar).
/// </summary>
public static class PoliticasAutorizacao
{
    public const string PodeAcederAdmin = "PodeAcederAdmin";
    public const string PodeGerirClientes = "PodeGerirClientes";
    public const string PodeVerProdutos = "PodeVerProdutos";
    public const string PodeGerirProdutos = "PodeGerirProdutos";
    public const string PodeGerirEncomendas = "PodeGerirEncomendas";
    public const string PodeApagarEncomendas = "PodeApagarEncomendas";
    public const string PodeGerirServicos = "PodeGerirServicos";
    public const string PodeApagarServicos = "PodeApagarServicos";
    public const string PodeVerArmazemStock = "PodeVerArmazemStock";
    public const string PodeGerirArmazem = "PodeGerirArmazem";
    public const string PodeGerirFuncionarios = "PodeGerirFuncionarios";

    public static void ConfigurarPoliticas(AuthorizationOptions options)
    {
        options.AddPolicy(PodeAcederAdmin, p => p.RequireRole(ConstantesRoles.Admin));

        options.AddPolicy(PodeGerirClientes, p => p.RequireRole(ConstantesRoles.Admin, ConstantesRoles.Gestor));

        options.AddPolicy(PodeVerProdutos, p => p.RequireRole(ConstantesRoles.Admin, ConstantesRoles.Gestor, ConstantesRoles.Comercial, ConstantesRoles.Armazem));
        options.AddPolicy(PodeGerirProdutos, p => p.RequireRole(ConstantesRoles.Admin, ConstantesRoles.Gestor));

        options.AddPolicy(PodeGerirEncomendas, p => p.RequireRole(ConstantesRoles.Admin, ConstantesRoles.Gestor, ConstantesRoles.Comercial));
        options.AddPolicy(PodeApagarEncomendas, p => p.RequireRole(ConstantesRoles.Admin, ConstantesRoles.Gestor));

        options.AddPolicy(PodeGerirServicos, p => p.RequireRole(ConstantesRoles.Admin, ConstantesRoles.Gestor, ConstantesRoles.Comercial));
        options.AddPolicy(PodeApagarServicos, p => p.RequireRole(ConstantesRoles.Admin, ConstantesRoles.Gestor));

        options.AddPolicy(PodeVerArmazemStock, p => p.RequireRole(ConstantesRoles.Admin, ConstantesRoles.Gestor, ConstantesRoles.Comercial, ConstantesRoles.Armazem));
        options.AddPolicy(PodeGerirArmazem, p => p.RequireRole(ConstantesRoles.Admin, ConstantesRoles.Gestor));

        options.AddPolicy(PodeGerirFuncionarios, p => p.RequireRole(ConstantesRoles.Admin, ConstantesRoles.Gestor));
    }

    /// <summary>Devolve a lista de permissões (para o frontend) consoante as roles do utilizador.</summary>
    public static IReadOnlyList<string> ObterPermissoes(IEnumerable<string> roles)
    {
        var perms = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var r in roles ?? Array.Empty<string>())
        {
            if (string.Equals(r, ConstantesRoles.Admin, StringComparison.OrdinalIgnoreCase))
            {
                perms.Add("admin"); perms.Add("clientes.gerir"); perms.Add("produtos.ver"); perms.Add("produtos.gerir");
                perms.Add("encomendas.gerir"); perms.Add("encomendas.apagar"); perms.Add("servicos.gerir"); perms.Add("servicos.apagar");
                perms.Add("armazem.stock"); perms.Add("armazem.gerir"); perms.Add("funcionarios.gerir");
            }
            else if (string.Equals(r, ConstantesRoles.Gestor, StringComparison.OrdinalIgnoreCase))
            {
                perms.Add("clientes.gerir"); perms.Add("produtos.ver"); perms.Add("produtos.gerir");
                perms.Add("encomendas.gerir"); perms.Add("encomendas.apagar"); perms.Add("servicos.gerir"); perms.Add("servicos.apagar");
                perms.Add("armazem.stock"); perms.Add("armazem.gerir"); perms.Add("funcionarios.gerir");
            }
            else if (string.Equals(r, ConstantesRoles.Comercial, StringComparison.OrdinalIgnoreCase))
            {
                perms.Add("produtos.ver"); perms.Add("encomendas.gerir"); perms.Add("servicos.gerir"); perms.Add("armazem.stock");
            }
            else if (string.Equals(r, ConstantesRoles.Armazem, StringComparison.OrdinalIgnoreCase))
            {
                perms.Add("armazem.stock");
                perms.Add("produtos.ver");
            }
        }
        return perms.ToList();
    }
}
