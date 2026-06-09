namespace Finalproj.Domain.Constants;

/// <summary>
/// Estados da encomenda conforme fluxo do ERP (docs/Diagramas).
/// PENDENTE → ACEITE | REJEITADA; ACEITE → EM_PREPARACAO → CONCLUIDA.
/// Valores em string para persistência e vistas; use enum EstadoEncomenda em código C# quando conveniente.
/// </summary>
public static class ConstantesEncomenda
{
    public const string PENDENTE = "Pendente";
    public const string ACEITE = "Aceite";
    public const string REJEITADA = "Rejeitada";
    public const string EM_PREPARACAO = "Em preparação";
    public const string CONCLUIDA = "Concluída";

    /// <summary>Valor de query/filtro da lista: encomendas ainda no fluxo operacional.</summary>
    public const string FILTRO_ATIVAS = "Ativas";

    /// <summary> Estados em que o stock continua reservado (não libertar para catálogo). </summary>
    public static readonly string[] EstadosComReserva = { PENDENTE, ACEITE, EM_PREPARACAO };

    public static bool TemReserva(string estado) =>
        EstadosComReserva.Contains(estado ?? "");

    public static string[] TodosEstados => new[] { PENDENTE, ACEITE, REJEITADA, EM_PREPARACAO, CONCLUIDA };

    /// <summary> Converte enum para string (para BD e vistas). </summary>
    public static string FromEnum(EstadoEncomenda e) => e switch
    {
        EstadoEncomenda.Pendente => PENDENTE,
        EstadoEncomenda.Aceite => ACEITE,
        EstadoEncomenda.Rejeitada => REJEITADA,
        EstadoEncomenda.EmPreparacao => EM_PREPARACAO,
        EstadoEncomenda.Concluida => CONCLUIDA,
        _ => PENDENTE
    };

    /// <summary> Converte string (da BD) para enum; null se não reconhecido. </summary>
    public static EstadoEncomenda? ToEnum(string? s)
    {
        if (string.IsNullOrEmpty(s)) return null;
        return s.Trim() switch
        {
            PENDENTE => EstadoEncomenda.Pendente,
            ACEITE => EstadoEncomenda.Aceite,
            REJEITADA => EstadoEncomenda.Rejeitada,
            EM_PREPARACAO => EstadoEncomenda.EmPreparacao,
            CONCLUIDA => EstadoEncomenda.Concluida,
            _ => null
        };
    }

    /// <summary>Código de erro quando o coordenador associado não tem n.º CRED na ficha.</summary>
    public const string CodigoCoordenadorSemCred = "ENCOMENDA_COORDENADOR_SEM_CRED";
}
