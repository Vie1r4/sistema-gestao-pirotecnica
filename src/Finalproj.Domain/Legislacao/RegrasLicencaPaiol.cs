namespace Finalproj.Domain.Legislacao;

/// <summary>
/// Regras de compatibilidade entre a licença do paiol e a classificação de risco do produto.
/// A matriz legal (ADR 7.5.2.2) está em <see cref="ParametrosLegaisPirotecnia.LicencaPaiolAceitaFamilias"/>.
/// </summary>
public static class RegrasLicencaPaiol
{
    public static bool ProdutoPodeEntrar(string licencaPaiol, string familiaProduto) =>
        ParametrosLegaisPirotecnia.LicencaAceitaFamilia(licencaPaiol, familiaProduto);

    public static string MensagemRecusa(string licencaPaiol, string familiaProduto)
    {
        var licenca = ParametrosLegaisPirotecnia.NormalizarDivisao(licencaPaiol);
        var familia = ParametrosLegaisPirotecnia.NormalizarDivisao(familiaProduto);
        return licenca switch
        {
            "1.1" => "Paiol 1.1G só pode conter produtos 1.1G (ADR 7.5.2.2). O produto é " + familia + ".",
            "1.2" => "Paiol 1.2G só pode conter produtos 1.2G (ADR 7.5.2.2). O produto é " + familia + ".",
            "1.3" => "Paiol 1.3G aceita apenas produtos 1.3G, 1.4G ou 1.4S. O produto é " + familia + ".",
            "1.4" => "Paiol 1.4G aceita apenas produtos 1.4G ou 1.4S — não pode receber 1.3G nem divisões mais perigosas (ADR 7.5.2.2). O produto é " + familia + ".",
            "1.4S" => "Paiol 1.4S aceita apenas produtos 1.4S — não pode receber 1.3G, 1.4G nem divisões mais perigosas (ADR 7.5.2.2). O produto é " + familia + ".",
            _ => "Este produto não tem autorização para entrar neste paiol (licença " + licenca + ", produto " + familia + ")."
        };
    }
}
