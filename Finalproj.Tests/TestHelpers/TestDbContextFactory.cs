using Finalproj.Data;
using Microsoft.EntityFrameworkCore;

namespace Finalproj.Tests.TestHelpers;

/// <summary>
/// Base de dados em memória isolada por nome (evita partilha entre testes paralelos).
/// </summary>
public static class TestDbContextFactory
{
    public static FinalprojContext Create(string? databaseName = null)
    {
        var options = new DbContextOptionsBuilder<FinalprojContext>()
            .UseInMemoryDatabase(databaseName ?? $"test-{Guid.NewGuid():N}")
            .Options;
        return new FinalprojContext(options);
    }
}
