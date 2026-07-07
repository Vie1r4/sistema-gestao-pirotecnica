using System.Text.RegularExpressions;

namespace Finalproj.Application.Features.Funcionarios.Validators;

/// <summary>Validação partilhada ao registar cartão de cidadão (criar/editar funcionário).</summary>
public static class CartaoCidadaoRegistoValidator
{
    private static readonly Regex NifRegex = new(@"^\d{9}$", RegexOptions.Compiled);

    public sealed record Erro(string Campo, string Mensagem);

    public static IReadOnlyList<Erro> Validar(
        bool registarCartao,
        string? nif,
        string? morada,
        DateTime? dataValidade,
        bool temFicheiro)
    {
        if (!registarCartao)
            return Array.Empty<Erro>();

        var erros = new List<Erro>();
        if (string.IsNullOrWhiteSpace(nif))
            erros.Add(new Erro("Funcionario.NIF", "O NIF é obrigatório quando regista o cartão de cidadão."));
        else if (!NifRegex.IsMatch(nif.Trim()))
            erros.Add(new Erro("Funcionario.NIF", "O NIF deve ter exatamente 9 dígitos."));

        if (string.IsNullOrWhiteSpace(morada))
            erros.Add(new Erro("Funcionario.Morada", "A morada é obrigatória quando regista o cartão de cidadão."));

        if (!dataValidade.HasValue)
            erros.Add(new Erro(
                "Funcionario.DataValidadeCartaoCidadao",
                "A data de validade é obrigatória quando regista o cartão de cidadão."));
        else if (dataValidade.Value.Date < DateTime.UtcNow.Date)
            erros.Add(new Erro(
                "Funcionario.DataValidadeCartaoCidadao",
                "A data de validade não pode ser anterior a hoje."));

        if (!temFicheiro)
            erros.Add(new Erro("CartaoCidadaoFicheiro", "O documento do cartão de cidadão é obrigatório."));

        return erros;
    }
}
