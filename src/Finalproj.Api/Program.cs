using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Finalproj.Infrastructure.Configuration;
using Finalproj.Infrastructure.Persistence.Data;
using Finalproj.Middleware;
using Microsoft.Extensions.Logging;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsProduction())
    ProductionConfigurationValidator.EnsureValidOrThrow(builder.Configuration);

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
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        options.Lockout.AllowedForNewUsers = true;
        // Token do link de confirmação expira em 1 hora
        options.Tokens.EmailConfirmationTokenProvider = "email_confirm_1h";
    })
    .AddEntityFrameworkStores<FinalprojContext>()
    .AddTokenProvider<DataProtectorTokenProvider<IdentityUser>>("email_confirm_1h")
    .AddDefaultTokenProviders();

// Lifespan específico para o token de confirmação do email (1h).
builder.Services.Configure<DataProtectionTokenProviderOptions>("email_confirm_1h", options =>
{
    options.TokenLifespan = TimeSpan.FromHours(1);
});

// Erros do Identity em português
builder.Services.AddScoped<Microsoft.AspNetCore.Identity.IdentityErrorDescriber, Finalproj.Infrastructure.Services.IdentityErrorDescriberPt>();

// FluentValidation (validadores com mensagens em português)
builder.Services.AddScoped<FluentValidation.IValidator<Finalproj.Application.Features.Clientes.DTOs.CreateClienteInputDto>, Finalproj.Application.Features.Clientes.Validators.CreateClienteInputDtoValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<Finalproj.Application.Features.Paiols.DTOs.SaidaPaiolViewModel>, Finalproj.Application.Features.Paiols.Validators.SaidaPaiolViewModelValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<Finalproj.Application.Features.Encomendas.DTOs.EditEncomendaDto>, Finalproj.Application.Features.Encomendas.Validators.EditEncomendaDtoValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<Finalproj.Application.Features.Paiols.DTOs.CreatePaiolInputDto>, Finalproj.Application.Features.Paiols.Validators.CreatePaiolInputDtoValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<Finalproj.Application.Features.Funcionarios.DTOs.CreateFuncionarioInputDto>, Finalproj.Application.Features.Funcionarios.Validators.CreateFuncionarioInputDtoValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<Finalproj.Application.Features.Paiols.DTOs.EntradaPaiolViewModel>, Finalproj.Application.Features.Paiols.Validators.EntradaPaiolViewModelValidator>();
builder.Services.AddScoped<FluentValidation.IValidator<Finalproj.Application.Features.Servicos.DTOs.ServicoSaveRequestDto>, Finalproj.Application.Features.Servicos.Validators.ServicoSaveRequestDtoValidator>();

// Opções de documentos (tamanho máximo de upload) e pastas locais portáteis
builder.Services.Configure<Finalproj.Infrastructure.Configuration.DadosLocaisOptions>(builder.Configuration.GetSection(Finalproj.Infrastructure.Configuration.DadosLocaisOptions.SectionName));
builder.Services.Configure<Finalproj.Infrastructure.Configuration.BootstrapOptions>(builder.Configuration.GetSection(Finalproj.Infrastructure.Configuration.BootstrapOptions.SectionName));
builder.Services.Configure<Finalproj.Infrastructure.Configuration.DocumentosOptions>(builder.Configuration.GetSection(Finalproj.Infrastructure.Configuration.DocumentosOptions.SectionName));
builder.Services.AddSingleton<Finalproj.Application.Services.IArquivosRaizService, Finalproj.Infrastructure.Services.ArquivosRaizService>();
builder.Services.Configure<Finalproj.Infrastructure.Services.DatabaseBackupOptions>(
    builder.Configuration.GetSection(Finalproj.Infrastructure.Services.DatabaseBackupOptions.SectionName));
builder.Services.Configure<Finalproj.Infrastructure.Configuration.CifragemEmRepousoOptions>(
    builder.Configuration.GetSection(Finalproj.Infrastructure.Configuration.CifragemEmRepousoOptions.SectionName));
builder.Services.Configure<Finalproj.Infrastructure.Configuration.EmpresaPirotecnicaOptions>(
    builder.Configuration.GetSection(Finalproj.Infrastructure.Configuration.EmpresaPirotecnicaOptions.SectionName));
builder.Services.AddSingleton<Finalproj.Application.Services.ICifragemEmRepousoService, Finalproj.Infrastructure.Services.CifragemEmRepousoService>();
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    var maxBytes = builder.Configuration.GetValue<long>("Documentos:MaxFileSizeBytes", 10 * 1024 * 1024);
    options.MultipartBodyLengthLimit = Math.Max(maxBytes, 1);
});

// Serviços da aplicação e infraestrutura
builder.Services.AddSingleton<Finalproj.Application.Services.IEmailSender, Finalproj.Infrastructure.Services.EmailSender>();
builder.Services.AddScoped<Finalproj.Application.Services.ILogSistemaService, Finalproj.Infrastructure.Services.LogSistemaService>();
builder.Services.AddScoped<Finalproj.Application.Features.Paiols.Interfaces.IStockDisponivelService, Finalproj.Application.Features.Paiols.Services.StockDisponivelService>();
builder.Services.AddScoped<Finalproj.Application.Features.Encomendas.Interfaces.IEncomendaService, Finalproj.Application.Features.Encomendas.Services.EncomendaService>();
builder.Services.AddScoped<Finalproj.Application.Features.Servicos.Services.IServicoService, Finalproj.Application.Features.Servicos.Services.ServicoService>();
builder.Services.AddScoped<Finalproj.Application.Services.IUploadFileContentValidator, Finalproj.Infrastructure.Services.UploadFileContentValidator>();
builder.Services.AddScoped<Finalproj.Application.Services.IDocumentoStorageService, Finalproj.Infrastructure.Services.DocumentoStorageService>();
builder.Services.AddScoped<Finalproj.Application.Features.Common.Interfaces.IUserDisplayNameService, Finalproj.Application.Features.Common.Services.UserDisplayNameService>();
builder.Services.AddScoped<Finalproj.Application.Features.Produtos.Interfaces.IProdutoApplicationService, Finalproj.Application.Features.Produtos.Services.ProdutoApplicationService>();
builder.Services.AddScoped<Finalproj.Application.Features.Compilados.Interfaces.ICompiladoApplicationService, Finalproj.Application.Features.Compilados.Services.CompiladoApplicationService>();
builder.Services.AddScoped<Finalproj.Application.Features.Clientes.Interfaces.IClienteApplicationService, Finalproj.Application.Features.Clientes.Services.ClienteApplicationService>();
builder.Services.AddScoped<Finalproj.Application.Features.Paiols.Interfaces.IPaiolApplicationService, Finalproj.Application.Features.Paiols.Services.PaiolApplicationService>();
builder.Services.AddScoped<Finalproj.Application.Features.Paiols.Interfaces.IEntradaPaiolApplicationService, Finalproj.Application.Features.Paiols.Services.EntradaPaiolApplicationService>();
builder.Services.AddScoped<Finalproj.Application.Features.Paiols.Interfaces.ISaidaPaiolApplicationService, Finalproj.Application.Features.Paiols.Services.SaidaPaiolApplicationService>();
builder.Services.AddScoped<Finalproj.Application.Features.Funcionarios.Interfaces.IFuncionarioApplicationService, Finalproj.Application.Features.Funcionarios.Services.FuncionarioApplicationService>();
builder.Services.AddScoped<Finalproj.Application.Features.Admin.Interfaces.IAdminStatsService, Finalproj.Application.Features.Admin.Services.AdminStatsService>();
builder.Services.AddScoped<Finalproj.Application.Features.Admin.Interfaces.IAdminUserAccountService, Finalproj.Infrastructure.Services.AdminUserAccountService>();
builder.Services.AddScoped<Finalproj.Application.Features.Home.Interfaces.IHomeAnalyticsService, Finalproj.Application.Features.Home.Services.HomeAnalyticsService>();
builder.Services.AddScoped<Finalproj.Application.Features.GestorAnalytics.Interfaces.IGestorAnalyticsService, Finalproj.Application.Features.GestorAnalytics.Services.GestorAnalyticsService>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.IGestorAnalyticsRepository, Finalproj.Infrastructure.Repositories.GestorAnalyticsRepository>();
builder.Services.AddScoped<Finalproj.Application.Features.Encomendas.Interfaces.IEncomendaWorkflowService, Finalproj.Application.Features.Encomendas.Services.EncomendaWorkflowService>();
builder.Services.AddScoped<Finalproj.Application.Features.Servicos.Interfaces.IServicosApiApplicationService, Finalproj.Application.Features.Servicos.Services.ServicosApiApplicationService>();
builder.Services.AddSingleton<Finalproj.Infrastructure.DocumentacaoRegulatoria.GeradorDeclaracaoPspService>();
builder.Services.AddScoped<Finalproj.Application.Features.DocumentacaoRegulatoria.Interfaces.IDocumentacaoRegulatoriaService, Finalproj.Infrastructure.Services.DocumentacaoRegulatoriaService>();
builder.Services.AddScoped<Finalproj.Application.Features.Auth.Interfaces.IAuthAccountInfoService, Finalproj.Application.Features.Auth.Services.AuthAccountInfoService>();
builder.Services.AddScoped<Finalproj.Application.Services.Interfaces.IIdentityUserLookupService, Finalproj.Infrastructure.Services.IdentityUserLookupService>();
builder.Services.AddScoped<Finalproj.Application.Services.Interfaces.IPasswordValidationService, Finalproj.Infrastructure.Services.IdentityPasswordValidationService>();
builder.Services.AddScoped<Finalproj.Application.Services.Interfaces.IDatabaseCleanupService, Finalproj.Infrastructure.Services.DatabaseCleanupService>();

builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IPaiolRepository, Finalproj.Infrastructure.Repositories.PaiolRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IProdutoRepository, Finalproj.Infrastructure.Repositories.ProdutoRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.ICompiladoRepository, Finalproj.Infrastructure.Repositories.CompiladoRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IEncomendaRepository, Finalproj.Infrastructure.Repositories.EncomendaRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IClienteRepository, Finalproj.Infrastructure.Repositories.ClienteRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IFuncionarioRepository, Finalproj.Infrastructure.Repositories.FuncionarioRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IServicoRepository, Finalproj.Infrastructure.Repositories.ServicoRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IEntradaPaiolRepository, Finalproj.Infrastructure.Repositories.EntradaPaiolRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.ISaidaPaiolRepository, Finalproj.Infrastructure.Repositories.SaidaPaiolRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IPerfilRepository, Finalproj.Infrastructure.Repositories.PerfilRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.ILogSistemaRepository, Finalproj.Infrastructure.Repositories.LogSistemaRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IRefreshTokenRepository, Finalproj.Infrastructure.Repositories.RefreshTokenRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.IUnitOfWork, Finalproj.Infrastructure.Repositories.UnitOfWork>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IReservaRepository, Finalproj.Infrastructure.Repositories.ReservaRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IServicoDocumentoExtraRepository, Finalproj.Infrastructure.Repositories.ServicoDocumentoExtraRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IServicoEquipaRepository, Finalproj.Infrastructure.Repositories.ServicoEquipaRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IServicoDistanciaSegurancaRepository, Finalproj.Infrastructure.Repositories.ServicoDistanciaSegurancaRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IServicoZonaLancamentoRepository, Finalproj.Infrastructure.Repositories.ServicoZonaLancamentoRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IPaiolAcessoRepository, Finalproj.Infrastructure.Repositories.PaiolAcessoRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IClienteDocumentoExtraRepository, Finalproj.Infrastructure.Repositories.ClienteDocumentoExtraRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IPaiolDocumentoExtraRepository, Finalproj.Infrastructure.Repositories.PaiolDocumentoExtraRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IEncomendaItemRepository, Finalproj.Infrastructure.Repositories.EncomendaItemRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IServicoLicencaRepository, Finalproj.Infrastructure.Repositories.ServicoLicencaRepository>();
builder.Services.AddScoped<Finalproj.Domain.Interfaces.Repositories.IFuncionarioDocumentoExtraRepository, Finalproj.Infrastructure.Repositories.FuncionarioDocumentoExtraRepository>();
builder.Services.AddSingleton<Finalproj.Infrastructure.Services.DatabaseBackupHostedService>();
builder.Services.AddSingleton<Finalproj.Infrastructure.Services.IDatabaseBackupService>(sp =>
    sp.GetRequiredService<Finalproj.Infrastructure.Services.DatabaseBackupHostedService>());
builder.Services.AddHostedService(sp => sp.GetRequiredService<Finalproj.Infrastructure.Services.DatabaseBackupHostedService>());

// Sessão (para rascunho de encomenda) e cookies de autenticação
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(20);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    if (builder.Environment.IsDevelopment())
    {
        // Next.js (http://localhost:3000) → API (https://localhost:7225) é cross-site; Lax não envia o cookie de sessão.
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    }
    else
    {
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    }
});

// Rate limiting (protege endpoints sensíveis: login/reset/refresh/admin)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = (context, token) =>
    {
        if (!context.HttpContext.Response.HasStarted)
        {
            context.HttpContext.Response.ContentType = "application/json";
            return new ValueTask(context.HttpContext.Response.WriteAsJsonAsync(
                new { error = "Demasiadas tentativas. Aguarde e tente novamente." }, token));
        }
        return ValueTask.CompletedTask;
    };

    options.AddPolicy("auth", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });

    options.AddPolicy("admin", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 30,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });

    // Bootstrap: políticas separadas para não esgotar o limite no GET ao abrir o login
    options.AddPolicy("bootstrap-status", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 60,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });

    options.AddPolicy("bootstrap-register", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 15,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });
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
builder.Services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationMiddlewareResultHandler, Finalproj.Authorization.NotFoundWhenForbiddenHandler>();
builder.Services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, Finalproj.Authorization.DocumentacaoRegulatoriaRequirementHandler>();

// Swagger apenas em Development — em produção não expor documentação nem UI interativa.
if (builder.Environment.IsDevelopment())
{
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

        var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
            options.IncludeXmlComments(xmlPath);
    });
}

var corsOrigins = builder.Configuration["Cors:AllowedOrigins"] ?? "http://localhost:3000,https://localhost:3000";
var origins = corsOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
if (origins.Length == 0) origins = new[] { "http://localhost:3000", "https://localhost:3000" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        // Em Development: permitir Next.js em localhost, 127.0.0.1 e IPs privados (ex.: http://172.24.16.1:3000 — WSL/Hyper-V).
        // Em produção: apenas origens explícitas em Cors:AllowedOrigins.
        if (builder.Environment.IsDevelopment())
        {
            policy.SetIsOriginAllowed(IsAllowedDevelopmentFrontendOrigin)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithExposedHeaders(CorrelationIdConstants.HttpHeaderName);
        }
        else
        {
            policy.WithOrigins(origins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials() // necessário para pedidos com credentials: 'include' (ex.: POST create encomenda)
                .WithExposedHeaders(CorrelationIdConstants.HttpHeaderName);
        }
    });
});

var app = builder.Build();

// Correlation id + log estruturado de latência por pedido (antes do resto do pipeline)
app.UseMiddleware<RequestDiagnosticsMiddleware>();

// Aplica migrações e garante roles/admin no arranque (omitido em ambiente Testing — testes de integração)
if (!app.Environment.IsEnvironment("Testing"))
    await InicializarAsync(app);

static async Task InicializarAsync(WebApplication app)
{
    // Migrações + roles Identity (sem dados de negócio automáticos)
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<FinalprojContext>();
    await context.Database.MigrateAsync();
    // Se o histórico de migrações estiver desalinhado, a coluna pode faltar e o GET serviço falha (500).
    await GarantirColunaOrigemRegistoServicoLicencaAsync(context);
    await GarantirColunaCargoFuncionarioAsync(context);
    await GarantirColunaTemaPerfilAsync(context);
    await GarantirColunaDistanciaSegurancaPublicoProdutoAsync(context);
    await GarantirColunasSoftDeleteClienteFuncionarioAsync(context);
    await SeedRoles.InitializeAsync(scope.ServiceProvider);
}

static async Task GarantirColunaOrigemRegistoServicoLicencaAsync(FinalprojContext context)
{
    await context.Database.ExecuteSqlRawAsync(
        """
        IF OBJECT_ID(N'[dbo].[ServicoLicencas]', N'U') IS NOT NULL
           AND COL_LENGTH(N'ServicoLicencas', N'OrigemRegisto') IS NULL
        BEGIN
            ALTER TABLE [ServicoLicencas] ADD [OrigemRegisto] TINYINT NOT NULL CONSTRAINT DF_ServicoLicencas_OrigemRegisto DEFAULT 1;
        END
        """);
}

static async Task GarantirColunaCargoFuncionarioAsync(FinalprojContext context)
{
    await context.Database.ExecuteSqlRawAsync(
        """
        IF OBJECT_ID(N'[dbo].[Funcionarios]', N'U') IS NOT NULL
           AND COL_LENGTH(N'Funcionarios', N'Cargo') IS NULL
        BEGIN
            ALTER TABLE [Funcionarios] ADD [Cargo] NVARCHAR(50) NULL;
        END
        """);
}

static async Task GarantirColunaTemaPerfilAsync(FinalprojContext context)
{
    await context.Database.ExecuteSqlRawAsync(
        """
        IF OBJECT_ID(N'[dbo].[Perfis]', N'U') IS NOT NULL
           AND COL_LENGTH(N'Perfis', N'Tema') IS NULL
        BEGIN
            ALTER TABLE [Perfis] ADD [Tema] NVARCHAR(10) NULL;
        END
        """);
}

static async Task GarantirColunaDistanciaSegurancaPublicoProdutoAsync(FinalprojContext context)
{
    await context.Database.ExecuteSqlRawAsync(
        """
        IF OBJECT_ID(N'[dbo].[Produtos]', N'U') IS NOT NULL
           AND COL_LENGTH(N'Produtos', N'DistanciaSegurancaPublico_m') IS NULL
        BEGIN
            ALTER TABLE [Produtos] ADD [DistanciaSegurancaPublico_m] INT NOT NULL CONSTRAINT DF_Produtos_DistanciaSegurancaPublico DEFAULT 50;
        END
        """);
}

static async Task GarantirColunasSoftDeleteClienteFuncionarioAsync(FinalprojContext context)
{
    await context.Database.ExecuteSqlRawAsync(
        """
        IF OBJECT_ID(N'[dbo].[Clientes]', N'U') IS NOT NULL
           AND COL_LENGTH(N'Clientes', N'EliminadoEm') IS NULL
        BEGIN
            ALTER TABLE [Clientes] ADD [EliminadoEm] DATETIME2 NULL;
        END
        IF OBJECT_ID(N'[dbo].[Funcionarios]', N'U') IS NOT NULL
           AND COL_LENGTH(N'Funcionarios', N'EliminadoEm') IS NULL
        BEGIN
            ALTER TABLE [Funcionarios] ADD [EliminadoEm] DATETIME2 NULL;
        END
        """);
}

// Pipeline: erros, HTTPS, estáticos, sessão, auth
var isDevelopment = app.Environment.IsDevelopment();
var apiErrorLogger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Finalproj.Http.ApiErrorHandling");
if (!isDevelopment)
{
    app.UseHsts();
}

// Rotas /api/*: em caso de exceção devolver sempre JSON (não HTML). Em produção não expor detalhes.
app.Use(async (context, next) =>
{
    Exception? exceptionHandledAsApi500 = null;
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
            exceptionHandledAsApi500 = ex;
            context.Response.Clear();
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";
            var correlationId = context.GetCorrelationId();
            if (isDevelopment)
                await context.Response.WriteAsJsonAsync(new { error = "Erro no servidor.", detail = ex.Message, correlationId });
            else
                await context.Response.WriteAsJsonAsync(new { error = "Erro no servidor. Tente novamente mais tarde.", correlationId });
        }
        else
            throw;
    }
    finally
    {
        var path = context.Request.Path.Value ?? "";
        if (path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase)
            && context.Response.StatusCode == StatusCodes.Status500InternalServerError)
        {
            var correlationId = context.GetCorrelationId();
            if (exceptionHandledAsApi500 != null)
                apiErrorLogger.LogError(exceptionHandledAsApi500, "Resposta HTTP 500 (API). CorrelationId={CorrelationId}", correlationId);
            else
                apiErrorLogger.LogWarning("Resposta HTTP 500 (API) sem exceção propagada a este middleware. CorrelationId={CorrelationId}", correlationId);
        }
    }
});

// Em Development, não redirecionar HTTP→HTTPS: permite o telemóvel usar http://<IP>:5078 sem certificado.
if (!isDevelopment)
    app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Headers de hardening (API e ficheiros servidos pelo backend)
app.Use((context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Content-Security-Policy"] = "frame-ancestors 'none'; base-uri 'self'; object-src 'none'";
    return next();
});

app.UseCors("FrontendPolicy");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PIROFAFE API v1");
        c.DocumentTitle = "PIROFAFE API";
    });
}

app.UseSession();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers(); // Rotas da API ([Route("api/...")])

app.Run();

static bool IsAllowedDevelopmentFrontendOrigin(string? origin)
{
    if (string.IsNullOrEmpty(origin)) return false;
    Uri uri;
    try
    {
        uri = new Uri(origin);
    }
    catch (UriFormatException)
    {
        return false;
    }

    if (uri.Scheme is not ("http" or "https")) return false;
    // Next.js dev (porto 3000 por defeito)
    if (uri.Port != 3000) return false;

    var h = uri.IdnHost;
    if (h.Equals("localhost", StringComparison.OrdinalIgnoreCase)) return true;
    if (h == "127.0.0.1") return true;

    if (!IPAddress.TryParse(h, out var ip)) return false;

    if (ip.AddressFamily == AddressFamily.InterNetworkV6)
        return IPAddress.IPv6Loopback.Equals(ip);

    var b = ip.GetAddressBytes();
    if (b.Length != 4) return false;
    if (b[0] == 10) return true;
    if (b[0] == 172 && b[1] >= 16 && b[1] <= 31) return true;
    if (b[0] == 192 && b[1] == 168) return true;
    return false;
}

public partial class Program { }
