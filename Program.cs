using Finalproj.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Toda a app exige login; só Login/Registo são públicos
builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(new AuthorizeFilter());
});
builder.Services.AddRazorPages();

builder.Services.AddDbContext<FinalprojContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("FinalprojContext")));

builder.Services.AddDefaultIdentity<IdentityUser>(options =>
{
    options.SignIn.RequireConfirmedAccount = true;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<FinalprojContext>()
    .AddDefaultTokenProviders();

// Erros do Identity em português
builder.Services.AddScoped<Microsoft.AspNetCore.Identity.IdentityErrorDescriber, Finalproj.Services.IdentityErrorDescriberPt>();

// Serviços da aplicação
builder.Services.AddSingleton<Microsoft.AspNetCore.Identity.UI.Services.IEmailSender, Finalproj.Services.EmailSender>();
builder.Services.AddScoped<Finalproj.Services.ILogSistemaService, Finalproj.Services.LogSistemaService>();
builder.Services.AddScoped<Finalproj.Services.IStockDisponivelService, Finalproj.Services.StockDisponivelService>();
builder.Services.AddScoped<Finalproj.Services.IEncomendaService, Finalproj.Services.EncomendaService>();
builder.Services.AddScoped<Finalproj.Services.IDocumentoStorageService, Finalproj.Services.DocumentoStorageService>();

// Sessão (para rascunho de encomenda) e cookies de autenticação
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(20);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Identity/Account/Login";
    options.LogoutPath = "/Identity/Account/Logout";
    options.AccessDeniedPath = "/Identity/Account/AccessDenied";
});

var app = builder.Build();

// Aplica migrações e garante roles/admin no arranque
await InicializarAsync(app);

static async Task InicializarAsync(WebApplication app)
{
    // Migrações + seed de dados + roles (Admin, Armazém, etc.)
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
    await context.Database.MigrateAsync();
    DbInitializer.Initialize(context);
    await SeedRoles.InitializeAsync(scope.ServiceProvider);
}

// Pipeline: erros, HTTPS, estáticos, sessão, auth
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapRazorPages();

app.Run();
