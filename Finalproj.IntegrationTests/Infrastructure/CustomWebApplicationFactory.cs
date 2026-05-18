using Finalproj.Application.Services;
using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.Infrastructure.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Finalproj.IntegrationTests.Infrastructure;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = $"TestDB_{Guid.NewGuid():N}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<FinalprojContext>));
            services.RemoveAll(typeof(FinalprojContext));

            services.AddDbContext<FinalprojContext>(options =>
                options.UseInMemoryDatabase(_databaseName));

            services.RemoveAll(typeof(IEmailSender));
            services.AddSingleton<IEmailSender, NoOpEmailSender>();

            services.RemoveAll(typeof(IDatabaseBackupService));
            services.AddSingleton<IDatabaseBackupService, NoOpDatabaseBackupService>();
        });
    }

    public async Task InitializeAsync()
    {
        using var scope = Services.CreateScope();
        var sp = scope.ServiceProvider;
        await SeedRoles.InitializeAsync(sp);

        var context = sp.GetRequiredService<FinalprojContext>();
        await context.Database.EnsureCreatedAsync();
        await TestDataSeeder.SeedAsync(sp);
    }

    private sealed class NoOpDatabaseBackupService : IDatabaseBackupService
    {
        public Task<string> ExecuteBackupNowAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult("noop");
    }
}
