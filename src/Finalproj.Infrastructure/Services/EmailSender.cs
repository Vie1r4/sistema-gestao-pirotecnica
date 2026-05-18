using Finalproj.Application.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace Finalproj.Infrastructure.Services;

/// <summary>
/// Envio de email (confirmação de conta): se SMTP configurado envia; senão grava em ficheiro.
/// </summary>
public class EmailSender : IEmailSender
{
    private const string FicheiroEmails = "emails_confirmacao.txt";
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;
    private readonly ILogger<EmailSender> _logger;

    public EmailSender(
        IWebHostEnvironment env,
        IConfiguration config,
        ILogger<EmailSender> logger)
    {
        _env = env;
        _config = config;
        _logger = logger;
    }

    /// <inheritdoc />
    public Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var smtpHost = _config["Email:SmtpHost"];
        if (!string.IsNullOrWhiteSpace(smtpHost))
            return EnviarPorSmtpAsync(email, subject, htmlMessage);

        return GravarEmFicheiroAsync(email, subject, htmlMessage);
    }

    private async Task GravarEmFicheiroAsync(string email, string subject, string htmlMessage)
    {
        var path = Path.Combine(_env.ContentRootPath, FicheiroEmails);
        var linha = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Para: {email} | Assunto: {subject}\n{htmlMessage}\n{new string('-', 80)}\n";
        await File.AppendAllTextAsync(path, linha);
        _logger.LogInformation("Email de confirmação gravado em {Path} para {Email}", path, email);
    }

    private async Task EnviarPorSmtpAsync(string email, string subject, string htmlMessage)
    {
        var host = _config["Email:SmtpHost"];
        var port = int.Parse(_config["Email:SmtpPort"] ?? "587");
        var user = _config["Email:SmtpUser"];
        var password = _config["Email:SmtpPassword"];
        var from = _config["Email:From"] ?? user;

        if (string.IsNullOrWhiteSpace(host))
        {
            await GravarEmFicheiroAsync(email, subject, htmlMessage);
            return;
        }

        if (string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(password))
        {
            _logger.LogWarning(
                "SMTP configurado (host={Host}) mas Email:SmtpUser ou Email:SmtpPassword está vazio — não é possível autenticar. A gravar em ficheiro.",
                host);
            await GravarEmFicheiroAsync(email, subject, htmlMessage);
            return;
        }

        try
        {
            _logger.LogInformation(
                "A enviar email por SMTP: host={Host} port={Port} from={From} to={To} assunto={Subject}",
                host,
                port,
                from ?? user,
                email,
                subject);

            using var client = new System.Net.Mail.SmtpClient(host, port);
            // Evita o cliente SMTP usar credenciais Windows por defeito (em alguns PCs isso faz falhar o login no Gmail).
            client.UseDefaultCredentials = false;
            client.EnableSsl = true;
            client.Credentials = new System.Net.NetworkCredential(user, password);

            var msg = new System.Net.Mail.MailMessage(
                from ?? "noreply@pirofafe.local",
                email,
                subject,
                htmlMessage)
            { IsBodyHtml = true };
            await client.SendMailAsync(msg);
            _logger.LogInformation("Email enviado por SMTP para {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao enviar email por SMTP ({Message}); a gravar em ficheiro.", ex.Message);
            await GravarEmFicheiroAsync(email, subject, htmlMessage);
        }
    }
}
