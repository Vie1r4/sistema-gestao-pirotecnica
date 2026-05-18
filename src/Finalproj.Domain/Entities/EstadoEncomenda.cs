namespace Finalproj.Domain.Enums;

/// <summary>
/// Estado da encomenda no fluxo ERP. Usado para type-safety em C#; na BD persiste-se como string (ConstantesEncomenda).
/// </summary>
public enum EstadoEncomenda
{
    Pendente = 0,
    Aceite = 1,
    Rejeitada = 2,
    EmPreparacao = 3,
    Concluida = 4
}
