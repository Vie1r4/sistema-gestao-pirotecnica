using Microsoft.EntityFrameworkCore;

namespace Finalproj.Infrastructure.Persistence.Data;

public static class FinalprojDbContextOptionsExtensions
{
    /// <summary>
    /// SQL Server com split queries por defeito — evita explosão cartesiana e aviso EF
    /// quando há vários <c>Include</c> de coleções (ex.: grafo completo de Servico).
    /// </summary>
    public static DbContextOptionsBuilder UseFinalprojSqlServer(
        this DbContextOptionsBuilder options,
        string connectionString)
    {
        return options.UseSqlServer(connectionString, sql =>
            sql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery));
    }
}
