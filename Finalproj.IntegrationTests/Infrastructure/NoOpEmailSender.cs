using Finalproj.Application.Services;

namespace Finalproj.IntegrationTests.Infrastructure;

public sealed class NoOpEmailSender : IEmailSender
{
    public Task SendEmailAsync(string email, string subject, string htmlMessage) => Task.CompletedTask;
}
