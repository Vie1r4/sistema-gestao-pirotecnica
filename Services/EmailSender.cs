using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Configuration;

namespace Finalproj.Services;

// Envio de email (confirmação de conta): se SMTP configurado envia; senão grava em ficheiro
public class EmailSender : IEmailSender
{
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;
    private readonly ILogger<EmailSender> _logger;
    private const string FicheiroEmails = "emails_confirmacao.txt";

    public EmailSender(
        IWebHostEnvironment env,
        IConfiguration config,
        ILogger<EmailSender> logger)
    {
        _env = env;
        _config = config;
        _logger = logger;
    }

    // Envia por SMTP se configurado; senão grava em ficheiro
    public Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var smtpHost = _config["Email:SmtpHost"];
        if (!string.IsNullOrWhiteSpace(smtpHost))
            return EnviarPorSmtpAsync(email, subject, htmlMessage);

        return GravarEmFicheiroAsync(email, subject, htmlMessage);
    }

    // Acrescenta linha ao ficheiro emails_confirmacao.txt
    private async Task GravarEmFicheiroAsync(string email, string subject, string htmlMessage)
    {
        var path = Path.Combine(_env.ContentRootPath, FicheiroEmails);
        var linha = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] Para: {email} | Assunto: {subject}\n{htmlMessage}\n{new string('-', 80)}\n";
        await File.AppendAllTextAsync(path, linha);
        _logger.LogInformation("Email de confirmação gravado em {Path} para {Email}", path, email);
    }

    // Envia por SMTP; em falha grava em ficheiro
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

        try
        {
            using var client = new System.Net.Mail.SmtpClient(host, port);
            client.EnableSsl = true;
            if (!string.IsNullOrWhiteSpace(user) && !string.IsNullOrWhiteSpace(password))
                client.Credentials = new System.Net.NetworkCredential(user, password);

            var msg = new System.Net.Mail.MailMessage(
                from ?? "noreply@pirofafe.local",
                email,
                subject,
                htmlMessage)
            { IsBodyHtml = true };
            await client.SendMailAsync(msg);
            _logger.LogInformation("Email de confirmação enviado para {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao enviar email por SMTP; a gravar em ficheiro.");
            await GravarEmFicheiroAsync(email, subject, htmlMessage);
        }
    }
}
