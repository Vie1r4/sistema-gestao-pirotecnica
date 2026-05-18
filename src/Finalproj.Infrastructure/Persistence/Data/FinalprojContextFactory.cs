using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Finalproj.Infrastructure.Persistence.Data;

/// <summary>
/// Permite criar o DbContext em tempo de design (migrações EF) sem executar o Startup completo (evita exigir Jwt:Secret, etc.).
/// </summary>
public class FinalprojContextFactory : IDesignTimeDbContextFactory<FinalprojContext>
{
    public FinalprojContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();
        var config = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var conn = config.GetConnectionString("FinalprojContext")
            ?? "Server=(localdb)\\mssqllocaldb;Database=FinalprojContext;Trusted_Connection=True;MultipleActiveResultSets=true";

        var optionsBuilder = new DbContextOptionsBuilder<FinalprojContext>();
        optionsBuilder.UseSqlServer(conn);

        return new FinalprojContext(optionsBuilder.Options);
    }
}
