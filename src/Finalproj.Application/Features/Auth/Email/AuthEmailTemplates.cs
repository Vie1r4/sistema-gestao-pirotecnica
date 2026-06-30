namespace Finalproj.Application.Features.Auth.Email;

public static class AuthEmailTemplates
{
    public static (string Subject, string Html) PasswordReset(string link) =>
    (
        "PIROFAFE — Redefinir palavra-passe",
        BuildLayout(
            "Redefinir palavra-passe",
            "Recebemos um pedido para redefinir a sua palavra-passe. Para escolher uma nova palavra-passe, carregue no botão abaixo.",
            link,
            "Definir nova palavra-passe",
            "Se não foi você que pediu esta alteração, pode ignorar este email.",
            "Link para redefinir a sua palavra-passe no PIROFAFE.")
    );

    public static (string Subject, string Html) EmailConfirmation(string confirmUrl) =>
    (
        "PIROFAFE — Confirme o seu email",
        BuildSimpleLayout(
            "Confirmar email",
            "Para ativar a sua conta, confirme o seu email através do botão abaixo.",
            confirmUrl,
            "Confirmar email")
    );

    private static string BuildLayout(
        string title,
        string body,
        string link,
        string buttonLabel,
        string footerNote,
        string preheader)
    {
        var safeLinkText = System.Net.WebUtility.HtmlEncode(link);
        return $"""
            <!doctype html>
            <html lang="pt">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="color-scheme" content="light dark" />
                <meta name="supported-color-schemes" content="light dark" />
                <title>PIROFAFE — {System.Net.WebUtility.HtmlEncode(title)}</title>
              </head>
              <body style="margin:0;padding:0;background:#f8f7f5;">
                <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
                  {System.Net.WebUtility.HtmlEncode(preheader)}
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f5;padding:28px 14px;">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
                        <tr>
                          <td style="padding:0 0 14px 0;text-align:center;">
                            <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-weight:800; letter-spacing:-0.02em; font-size:18px; color:#ea580c;">
                              PIROFAFE
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;padding:22px 22px 18px 22px;">
                            <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:22px; line-height:1.25; font-weight:800; letter-spacing:-0.02em; color:#111827;">
                              {System.Net.WebUtility.HtmlEncode(title)}
                            </div>
                            <div style="height:10px;"></div>
                            <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:14px; line-height:1.55; color:#374151;">
                              {System.Net.WebUtility.HtmlEncode(body)}
                            </div>
                            <div style="height:18px;"></div>
                            <table role="presentation" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="background:#f97316;border-radius:14px;">
                                  <a href="{link}" style="display:inline-block;padding:12px 16px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:14px; font-weight:700; color:#111827; text-decoration:none;">
                                    {System.Net.WebUtility.HtmlEncode(buttonLabel)}
                                  </a>
                                </td>
                              </tr>
                            </table>
                            <div style="height:14px;"></div>
                            <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:12px; line-height:1.55; color:#6b7280;">
                              Se o botão não funcionar, copie e cole este link no browser:<br />
                              <a href="{link}" style="color:#ea580c;text-decoration:underline;word-break:break-all;">{safeLinkText}</a>
                            </div>
                            <div style="height:18px;"></div>
                            <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:12px; line-height:1.55; color:#6b7280;">
                              {System.Net.WebUtility.HtmlEncode(footerNote)}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:14px 4px 0 4px;text-align:center;">
                            <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:11px; line-height:1.5; color:#9ca3af;">
                              Este email foi enviado automaticamente. Não responda a esta mensagem.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
            """;
    }

    private static string BuildSimpleLayout(string title, string body, string link, string buttonLabel)
    {
        var safeUrl = System.Net.WebUtility.HtmlEncode(link);
        return $"""
            <!doctype html>
            <html lang="pt">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>PIROFAFE — {System.Net.WebUtility.HtmlEncode(title)}</title>
              </head>
              <body style="margin:0;padding:0;background:#f8f7f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f5;padding:28px 14px;">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
                        <tr>
                          <td style="padding:0 0 14px 0;text-align:center;">
                            <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-weight:800; letter-spacing:-0.02em; font-size:18px; color:#ea580c;">
                              PIROFAFE
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;padding:22px 22px 18px 22px;">
                            <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:22px; line-height:1.25; font-weight:800; letter-spacing:-0.02em; color:#111827;">
                              {System.Net.WebUtility.HtmlEncode(title)}
                            </div>
                            <div style="height:10px;"></div>
                            <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:14px; line-height:1.55; color:#374151;">
                              {System.Net.WebUtility.HtmlEncode(body)}
                            </div>
                            <div style="height:18px;"></div>
                            <table role="presentation" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="background:#f97316;border-radius:14px;">
                                  <a href="{link}" style="display:inline-block;padding:12px 16px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:14px; font-weight:700; color:#111827; text-decoration:none;">
                                    {System.Net.WebUtility.HtmlEncode(buttonLabel)}
                                  </a>
                                </td>
                              </tr>
                            </table>
                            <div style="height:14px;"></div>
                            <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; font-size:12px; line-height:1.55; color:#6b7280;">
                              Se o botão não funcionar, copie e cole este link no browser:<br />
                              <a href="{link}" style="color:#ea580c;text-decoration:underline;word-break:break-all;">{safeUrl}</a>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
            """;
    }
}
