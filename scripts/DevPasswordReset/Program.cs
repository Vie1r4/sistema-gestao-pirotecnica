using Finalproj.Domain.Constants;
using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

static string FindApiDirectory()
{
    var dir = new DirectoryInfo(AppContext.BaseDirectory);
    while (dir != null)
    {
        var candidate = Path.Combine(dir.FullName, "src", "Finalproj.Api", "appsettings.json");
        if (File.Exists(candidate))
            return Path.Combine(dir.FullName, "src", "Finalproj.Api");
        dir = dir.Parent;
    }
    throw new DirectoryNotFoundException("Nao foi encontrado src/Finalproj.Api/appsettings.json a partir de " + AppContext.BaseDirectory);
}

var apiDir = FindApiDirectory();
var config = new ConfigurationBuilder()
    .SetBasePath(apiDir)
    .AddJsonFile("appsettings.json", optional: false)
    .AddJsonFile("appsettings.Development.json", optional: true)
    .Build();

var emailArg = args.Length > 0 ? args[0] : Environment.GetEnvironmentVariable("PIROFAFE_ADMIN_EMAIL");
var password = args.Length > 1 ? args[1]
    : Environment.GetEnvironmentVariable("PIROFAFE_ADMIN_PASSWORD") ?? "Teste123!Aa";

var services = new ServiceCollection();
services.AddLogging();
services.AddDbContext<FinalprojContext>(o =>
    o.UseFinalprojSqlServer(config.GetConnectionString("FinalprojContext")!));
services.AddIdentity<IdentityUser, IdentityRole>(options =>
    {
        options.SignIn.RequireConfirmedAccount = true;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;
    })
    .AddEntityFrameworkStores<FinalprojContext>()
    .AddDefaultTokenProviders();
services.AddScoped<IdentityErrorDescriber, IdentityErrorDescriberPt>();

await using var sp = services.BuildServiceProvider();
var userManager = sp.GetRequiredService<UserManager<IdentityUser>>();
var db = sp.GetRequiredService<FinalprojContext>();

IdentityUser? user = null;
if (!string.IsNullOrWhiteSpace(emailArg))
{
    user = await userManager.FindByEmailAsync(emailArg.Trim());
}
else
{
    var adminRoleId = await db.Roles
        .Where(r => r.Name == ConstantesRoles.Admin)
        .Select(r => r.Id)
        .FirstOrDefaultAsync();
    if (adminRoleId != null)
    {
        var adminUserId = await db.UserRoles
            .Where(ur => ur.RoleId == adminRoleId)
            .Select(ur => ur.UserId)
            .FirstOrDefaultAsync();
        if (adminUserId != null)
            user = await db.Users.FindAsync(adminUserId);
    }
    user ??= await db.Users.OrderBy(u => u.Email).FirstOrDefaultAsync();
}

if (user == null || string.IsNullOrEmpty(user.Email))
{
    Console.Error.WriteLine("Nenhum utilizador Admin encontrado. Indique email como argumento.");
    return 1;
}

if (!await userManager.IsInRoleAsync(user, ConstantesRoles.Admin))
    await userManager.AddToRoleAsync(user, ConstantesRoles.Admin);

if (!user.EmailConfirmed)
{
    var confirmToken = await userManager.GenerateEmailConfirmationTokenAsync(user);
    await userManager.ConfirmEmailAsync(user, confirmToken);
}

var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);
var result = await userManager.ResetPasswordAsync(user, resetToken, password);
if (!result.Succeeded)
{
    Console.Error.WriteLine(string.Join("; ", result.Errors.Select(e => e.Description)));
    return 1;
}

Console.WriteLine(user.Email);
return 0;
