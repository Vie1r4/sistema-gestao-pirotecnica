using Xunit;

namespace Finalproj.IntegrationTests.Infrastructure;

public abstract class IntegrationTestBase : IAsyncLifetime
{
    protected CustomWebApplicationFactory Factory { get; } = new();

    public async Task InitializeAsync() => await Factory.InitializeAsync();

    public Task DisposeAsync() => Task.CompletedTask;
}
