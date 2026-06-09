namespace Finalproj.Infrastructure.Configuration;

/// <summary>Dados fixos da empresa pirotécnica para a declaração PSP (não vivem na BD).</summary>
public class EmpresaPirotecnicaOptions
{
    public const string SectionName = "EmpresaPirotecnica";

    public string Designacao { get; set; } = "PIROFAFE, LDA";
    public string Morada { get; set; } = "TRAVESSA DAS LAGES, 67 4820-114 PAÇOS-FAFE";
    public string Alvara { get; set; } = "06/2018";
    public string Contactos { get; set; } = "914748483/914201477/916048699";

    /// <summary>Caminho relativo ao ContentRoot (ex.: Templates/psp/declaracao-psp.docx). Opcional — se vazio, gera documento programaticamente.</summary>
    public string? TemplateDeclaracaoPsp { get; set; }
}
