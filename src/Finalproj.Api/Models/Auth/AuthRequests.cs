namespace Finalproj.Api.Models.Auth;

public class LoginRequest
{
    public string? Email { get; set; }
    public string? Password { get; set; }
}

public class RegistarPrimeiroRequest
{
    public string? Email { get; set; }
    public string? Password { get; set; }
    public string? Nome { get; set; }
}

public class RefreshRequest
{
    public string? RefreshToken { get; set; }
}

public class ForgotPasswordRequest
{
    public string? Email { get; set; }
}

public class ResetPasswordRequest
{
    public string? Email { get; set; }
    public string? Token { get; set; }
    public string? NewPassword { get; set; }
    public string? ConfirmPassword { get; set; }
}

public class ResendConfirmEmailRequest
{
    public string? Email { get; set; }
}
