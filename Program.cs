using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Finalproj.Data;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Autenticação por controller: API usa JWT ([Authorize(AuthenticationSchemes = JwtBearer...)]), outras áreas usam cookies.
// Não usar AuthorizeFilter global para não forçar Cookies e redirecionar a API para login (HTML).
builder.Services.AddControllers(options =>
    {
        // Decimal com cultura invariante (ponto como separador) para form/query — evita "value is not valid for Latitude"
        options.ModelBinderProviders.Insert(0, new Finalproj.ModelBinders.DecimalInvariantModelBinderProvider());
        options.Filters.Add<Finalproj.Filters.InvalidOperationExceptionFilter>();
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
// Projeto API-only (frontend em Next.js). Não usamos MVC/Razor Views nem Identity UI pages.

builder.Services.AddDbContext<FinalprojContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("FinalprojContext")));

builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
    {
        options.SignIn.RequireConfirmedAccount = true;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 6;
    })
    .AddEntityFrameworkStores<FinalprojContext>()
    .AddDefaultTokenProviders();

// Erros do Identity em português
builder.Services.AddScoped<Microsoft.AspNetCore.Identity.IdentityErrorDescriber, Finalproj.Services.Infrastructure.IdentityErrorDescriberPt>();

// FluentValidation (validadores com mensagens em português)
builder.Services.AddScoped<FluentValidation.IValidator<Finalproj.Models.CreateClienteInputDto>, Finalproj.Validators.CreateClienteInputDtoValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<Finalproj.Models.SaidaPaiolViewModel>, Finalproj.Validators.SaidaPaiolViewModelValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<Finalproj.Models.EditEncomendaDto>, Finalproj.Validators.EditEncomendaDtoValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<Finalproj.Models.CreatePaiolInputDto>, Finalproj.Validators.CreatePaiolInputDtoValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<Finalproj.Models.CreateFuncionarioInputDto>, Finalproj.Validators.CreateFuncionarioInputDtoValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<Finalproj.Models.EntradaPaiolViewModel>, Finalproj.Validators.EntradaPaiolViewModelValidator>();

// Opções de documentos (tamanho máximo de upload)
builder.Services.Configure<Finalproj.Services.DocumentosOptions>(builder.Configuration.GetSection(Finalproj.Services.DocumentosOptions.SectionName));
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    var maxBytes = builder.Configuration.GetValue<long>("Documentos:MaxFileSizeBytes", 10 * 1024 * 1024);
    options.MultipartBodyLengthLimit = Math.Max(maxBytes, 1);
});

// Serviços da aplicação: interfaces em Finalproj.Services, implementações em Domain (regras de negócio) e Infrastructure (I/O, cross-cutting)
builder.Services.AddSingleton<Finalproj.Services.IEmailSender, Finalproj.Services.Infrastructure.EmailSender>();
builder.Services.AddScoped<Finalproj.Services.ILogSistemaService, Finalproj.Services.Infrastructure.LogSistemaService>();
builder.Services.AddScoped<Finalproj.Services.IStockDisponivelService, Finalproj.Services.Domain.StockDisponivelService>();
builder.Services.AddScoped<Finalproj.Services.IEncomendaService, Finalproj.Services.Domain.EncomendaService>();
builder.Services.AddScoped<Finalproj.Services.IServicoService, Finalproj.Services.Domain.ServicoService>();
builder.Services.AddScoped<Finalproj.Services.IDocumentoStorageService, Finalproj.Services.Infrastructure.DocumentoStorageService>();

// Sessão (para rascunho de encomenda) e cookies de autenticação
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(20);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    // Permite enviar o cookie de sessão em pedidos cross-origin (frontend localhost:3000 → API localhost:7225)
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "";
var jwtExpirationMinutes = builder.Configuration.GetValue<int>("Jwt:ExpirationMinutes", 60);
if (string.IsNullOrWhiteSpace(jwtSecret) || jwtSecret.Length < 32)
{
    throw new InvalidOperationException(
        "Jwt:Secret deve estar definido (mín. 32 caracteres). Em desenvolvimento use: dotnet user-secrets set \"Jwt:Secret\" \"sua-chave-secreta-longa-min-32-chars\". Em produção use variáveis de ambiente ou Key Vault.");
}
builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = IdentityConstants.ApplicationScheme;
        options.DefaultChallengeScheme = IdentityConstants.ApplicationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.Zero
        };
        // Evitar redirect para página de login (HTML); devolver 401 em JSON para a API
        options.Events = new JwtBearerEvents
        {
            OnChallenge = context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";
                return context.Response.WriteAsJsonAsync(new { error = "Não autorizado. Token em falta ou inválido." });
            }
        };
    });

builder.Services.AddAuthorization(options => Finalproj.Authorization.PoliticasAutorizacao.ConfigurarPoliticas(options));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "PIROFAFE API",
        Description = "API REST do sistema de gestão pirotécnica. A maioria dos endpoints requer autenticação JWT. " +
                      "Use **POST /api/auth/login** para obter um token e clique em **Authorize** para o colar.",
        Version = "v1",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact { Name = "PIROFAFE" }
    });
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Token JWT obtido em POST /api/auth/login. Ex.: Bearer {token}"
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var corsOrigins = builder.Configuration["Cors:AllowedOrigins"] ?? "http://localhost:3000,https://localhost:3000";
var origins = corsOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
if (origins.Length == 0) origins = new[] { "http://localhost:3000", "https://localhost:3000" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // necessário para pedidos com credentials: 'include' (ex.: POST create encomenda)
    });
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
var isDevelopment = app.Environment.IsDevelopment();
if (!isDevelopment)
{
    app.UseHsts();
}

// Rotas /api/*: em caso de exceção devolver sempre JSON (não HTML). Em produção não expor detalhes.
app.Use(async (context, next) =>
{
    try
    {
        await next(context);
    }
    catch (Exception ex)
    {
        if (context.Response.HasStarted) return;
        var path = context.Request.Path.Value ?? "";
        if (path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase))
        {
            context.Response.Clear();
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";
            if (isDevelopment)
                await context.Response.WriteAsJsonAsync(new { error = "Erro no servidor.", detail = ex.Message });
            else
                await context.Response.WriteAsJsonAsync(new { error = "Erro no servidor. Tente novamente mais tarde." });
        }
        else
            throw;
    }
});

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCors("FrontendPolicy");

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "PIROFAFE API v1");
    c.DocumentTitle = "PIROFAFE API";
});

app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers(); // Rotas da API ([Route("api/...")])

app.Run();
