namespace Finalproj.Models;

/// <summary>
/// Nomes, descrições e regras de obrigatoriedade dos tipos de licença do serviço.
/// </summary>
public static class ConstantesServicoLicenca
{
    public const string Publico = "Público";
    public const string Privado = "Privado";

    public static string Nome(TipoLicencaServico tipo)
    {
        return tipo switch
        {
            TipoLicencaServico.LICENCA_PSP => "Licença PSP de Espetáculo Pirotécnico",
            TipoLicencaServico.LER => "Licença Especial de Ruído (LER)",
            TipoLicencaServico.PARECER_BOMBEIROS => "Parecer dos Bombeiros / Proteção Civil",
            TipoLicencaServico.SEGURO_RC => "Seguro de Responsabilidade Civil do Evento",
            TipoLicencaServico.PARECER_CAMARA => "Parecer / Autorização da Câmara Municipal",
            TipoLicencaServico.LICENCA_RECINTOS => "Licença de Recintos Improvisados (IGAC)",
            TipoLicencaServico.AUTORIZACAO_IP => "Autorização de Infraestruturas de Portugal",
            TipoLicencaServico.OUTRO => "Outro documento específico",
            _ => tipo.ToString()
        };
    }

    public static string? Tooltip(TipoLicencaServico tipo)
    {
        return tipo switch
        {
            TipoLicencaServico.LICENCA_PSP => "Emitida pela PSP local; requerida com 10 dias úteis de antecedência.",
            TipoLicencaServico.LER => "Emitida pela Câmara Municipal; pode haver isenção em zonas industriais ou rurais.",
            TipoLicencaServico.PARECER_BOMBEIROS => "Pode ser condição da PSP. Obrigatório para eventos com mais de 500 pessoas.",
            TipoLicencaServico.SEGURO_RC => "Obrigatório pelo RFACEPE e Regulamento 1/2025 PSP.",
            TipoLicencaServico.PARECER_CAMARA => "Exigido em espaços públicos municipais.",
            TipoLicencaServico.LICENCA_RECINTOS => "Aplica-se quando o evento é num espaço não permanente com público.",
            TipoLicencaServico.AUTORIZACAO_IP => "Obrigatório se o local for junto a autoestrada, ferrovia ou infraestrutura nacional.",
            TipoLicencaServico.OUTRO => "Campo livre para documentos não listados.",
            _ => null
        };
    }

    /// <summary>
    /// Indica se este tipo é obrigatório para evento Público.
    /// </summary>
    public static bool ObrigatorioPublico(TipoLicencaServico tipo)
    {
        return tipo switch
        {
            TipoLicencaServico.LICENCA_PSP => true,
            TipoLicencaServico.LER => true,
            TipoLicencaServico.PARECER_BOMBEIROS => true,
            TipoLicencaServico.SEGURO_RC => true,
            TipoLicencaServico.PARECER_CAMARA => true,
            TipoLicencaServico.LICENCA_RECINTOS => false,
            TipoLicencaServico.AUTORIZACAO_IP => false,
            TipoLicencaServico.OUTRO => false,
            _ => false
        };
    }

    /// <summary>
    /// Indica se este tipo é obrigatório para evento Privado.
    /// </summary>
    public static bool ObrigatorioPrivado(TipoLicencaServico tipo)
    {
        return tipo switch
        {
            TipoLicencaServico.LICENCA_PSP => true,
            TipoLicencaServico.SEGURO_RC => true,
            _ => false
        };
    }

    /// <summary>
    /// Tipos obrigatórios para o serviço conforme Público/Privado.
    /// </summary>
    public static IEnumerable<TipoLicencaServico> TiposObrigatoriosPara(string? publicoPrivado)
    {
        var isPublico = string.Equals(publicoPrivado, Publico, StringComparison.OrdinalIgnoreCase);
        var isPrivado = string.Equals(publicoPrivado, Privado, StringComparison.OrdinalIgnoreCase);
        return Enum.GetValues<TipoLicencaServico>()
            .Where(t => t != TipoLicencaServico.OUTRO && (isPublico && ObrigatorioPublico(t) || isPrivado && ObrigatorioPrivado(t)))
            .ToList();
    }

    /// <summary>
    /// Todos os tipos predefinidos (exceto OUTRO, que se adiciona à parte).
    /// </summary>
    public static IEnumerable<TipoLicencaServico> TodosTiposPredefinidos()
    {
        return Enum.GetValues<TipoLicencaServico>().Where(t => t != TipoLicencaServico.OUTRO);
    }
}
