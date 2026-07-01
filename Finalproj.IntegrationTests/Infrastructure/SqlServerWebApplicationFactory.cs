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

/// <summary>Factory de integração com SQL Server real (Testcontainers) — locks FIFO e concorrência.</summary>
public sealed class SqlServerWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _connectionString;

    public SqlServerWebApplicationFactory(string connectionString)
    {
        _connectionString = connectionString;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<FinalprojContext>));
            services.RemoveAll(typeof(FinalprojContext));

            services.AddDbContext<FinalprojContext>(options =>
                options.UseSqlServer(_connectionString));

            services.RemoveAll(typeof(IEmailSender));
            services.AddSingleton<IEmailSender, NoOpEmailSender>();

            services.RemoveAll(typeof(IDatabaseBackupService));
            services.AddSingleton<IDatabaseBackupService, NoOpDatabaseBackupService>();
        });
    }

    public async Task InitializeAsync()
    {
        await InitializeDatabaseAsync(seedBusinessData: true);
    }

    /// <summary>Migrações + roles, sem dados de negócio — para testar bootstrap do 1.º admin.</summary>
    public async Task InitializeBootstrapOnlyAsync()
    {
        await InitializeDatabaseAsync(seedBusinessData: false);
    }

    private async Task InitializeDatabaseAsync(bool seedBusinessData)
    {
        using var scope = Services.CreateScope();
        var sp = scope.ServiceProvider;

        var context = sp.GetRequiredService<FinalprojContext>();
        await context.Database.MigrateAsync();
        await SeedRoles.InitializeAsync(sp);
        if (seedBusinessData)
            await TestDataSeeder.SeedAsync(sp);
    }

    private sealed class NoOpEmailSender : IEmailSender
    {
        public Task SendEmailAsync(string email, string subject, string htmlMessage) => Task.CompletedTask;
    }

    private sealed class NoOpDatabaseBackupService : IDatabaseBackupService
    {
        public Task<string> ExecuteBackupNowAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult("noop.bak");

        public Task<IReadOnlyList<BackupListItem>> ListBackupsAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<BackupListItem>>(Array.Empty<BackupListItem>());

        public string ResolveBackupFullPath(string nomeFicheiro) => nomeFicheiro;

        public Task RestoreFromBackupAsync(string nomeFicheiro, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;

        public Task<int> CountBackupsAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(0);

        public Task<BackupCatalogSummary> GetBackupSummaryAsync(bool semContasNaBd, CancellationToken cancellationToken = default) =>
            Task.FromResult(new BackupCatalogSummary(0, semContasNaBd, false));

        public Task DeleteBackupAsync(string nomeFicheiroBak, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;
    }
}
