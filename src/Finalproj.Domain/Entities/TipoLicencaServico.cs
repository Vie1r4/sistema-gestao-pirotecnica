namespace Finalproj.Domain.Enums;

/// <summary>
/// Tipos de licença/documento predefinidos para um serviço (evento pirotécnico).
/// Obrigatoriedade depende de o evento ser Público ou Privado.
/// </summary>
public enum TipoLicencaServico
{
    LICENCA_PSP = 0,
    LER = 1,
    PARECER_BOMBEIROS = 2,
    SEGURO_RC = 3,
    PARECER_CAMARA = 4,
    LICENCA_RECINTOS = 5,
    AUTORIZACAO_IP = 6,
    OUTRO = 7
}
