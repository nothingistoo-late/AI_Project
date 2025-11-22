using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using TaxCalculator.Data.Data;
using TaxCalculator.Data.Repositories;
using TaxCalculator.Business.Services;
using TaxCalculator.Domain.Entities;
using Microsoft.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.WriteIndented = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Tax Calculator API", 
        Version = "v1",
        Description = "A comprehensive tax calculation API supporting multiple tax systems, gross/net conversions, and detailed breakdowns."
    });
});

// Database
builder.Services.AddDbContext<TaxCalculatorDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Server=(localdb)\\mssqllocaldb;Database=TaxCalculatorDB;Trusted_Connection=True;MultipleActiveResultSets=true"));

// Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ITaxConfigRepository, TaxConfigRepository>();
builder.Services.AddScoped<IPresetRepository, PresetRepository>();
builder.Services.AddScoped<IExchangeRateRepository, ExchangeRateRepository>();

// Services
builder.Services.AddScoped<ITaxCalculationService, TaxCalculationService>();
builder.Services.AddScoped<ITaxConfigService, TaxConfigService>();
builder.Services.AddScoped<IPresetService, PresetService>();
builder.Services.AddScoped<IExchangeRateService, ExchangeRateService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Tax Calculator API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

// Ensure database is created and migrated
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TaxCalculatorDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        // Ensure all tables are created first
        context.Database.EnsureCreated();
        
        // Check if ExchangeRates table exists and create if missing
        try
        {
            await context.Database.ExecuteSqlRawAsync("SELECT TOP 1 Id FROM ExchangeRates");
            logger.LogInformation("ExchangeRates table exists.");
        }
        catch
        {
            logger.LogInformation("ExchangeRates table not found. Creating table...");
            // Create the table manually using SQL
            await context.Database.ExecuteSqlRawAsync(@"
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ExchangeRates]') AND type in (N'U'))
                BEGIN
                    CREATE TABLE [dbo].[ExchangeRates] (
                        [Id] int IDENTITY(1,1) NOT NULL,
                        [FromCurrency] nvarchar(3) NOT NULL,
                        [ToCurrency] nvarchar(3) NOT NULL,
                        [Rate] decimal(18,2) NOT NULL,
                        [LastUpdated] datetime2 NOT NULL,
                        [Source] nvarchar(100) NULL,
                        [IsActive] bit NOT NULL,
                        CONSTRAINT [PK_ExchangeRates] PRIMARY KEY ([Id])
                    );
                    CREATE INDEX [IX_ExchangeRates_FromCurrency_ToCurrency] ON [dbo].[ExchangeRates] ([FromCurrency], [ToCurrency]);
                END
            ");
            logger.LogInformation("ExchangeRates table created successfully.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error ensuring database is created");
    }
    
    // Seed initial data if database is empty
    if (!context.TaxConfigs.Any())
    {
        await SeedInitialData(context, scope);
    }
    
    // Always ensure exchange rates are seeded (even if tax configs exist)
    if (!context.ExchangeRates.Any())
    {
        try
        {
            var exchangeRateService = scope.ServiceProvider.GetRequiredService<IExchangeRateService>();
            await exchangeRateService.RefreshRatesAsync();
            logger.LogInformation("Exchange rates seeded successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding exchange rates");
        }
    }
}

app.Run();

static async Task SeedInitialData(TaxCalculatorDbContext context, IServiceScope scope)
{
    // US Tax System (2024 example)
    var usConfig = new TaxCalculator.Domain.Entities.TaxConfig
    {
        Name = "United States - 2024",
        CountryCode = "US",
        Currency = "USD",
        IsActive = true,
        IsDefault = true,
        SocialInsuranceRate = 6.2m, // Social Security
        HealthInsuranceRate = 1.45m, // Medicare
        UnemploymentInsuranceRate = 0.6m,
        PersonalDeduction = 14600m, // Standard deduction 2024
        DependentDeduction = 0m, // Dependents handled differently in US
        MaxInsuranceBase = 168600m, // Social Security wage base 2024
        Notes = "US Federal Tax System 2024"
    };

    context.TaxConfigs.Add(usConfig);
    await context.SaveChangesAsync();

    // Add US tax brackets (2024)
    var usBrackets = new[]
    {
        new TaxCalculator.Domain.Entities.TaxBracket { TaxConfigId = usConfig.Id, MinIncome = 0, MaxIncome = 11600, Rate = 10 },
        new TaxCalculator.Domain.Entities.TaxBracket { TaxConfigId = usConfig.Id, MinIncome = 11600, MaxIncome = 47150, Rate = 12 },
        new TaxCalculator.Domain.Entities.TaxBracket { TaxConfigId = usConfig.Id, MinIncome = 47150, MaxIncome = 100525, Rate = 22 },
        new TaxCalculator.Domain.Entities.TaxBracket { TaxConfigId = usConfig.Id, MinIncome = 100525, MaxIncome = 191950, Rate = 24 },
        new TaxCalculator.Domain.Entities.TaxBracket { TaxConfigId = usConfig.Id, MinIncome = 191950, MaxIncome = 243725, Rate = 32 },
        new TaxCalculator.Domain.Entities.TaxBracket { TaxConfigId = usConfig.Id, MinIncome = 243725, MaxIncome = 609350, Rate = 35 },
        new TaxCalculator.Domain.Entities.TaxBracket { TaxConfigId = usConfig.Id, MinIncome = 609350, MaxIncome = null, Rate = 37 }
    };

    context.TaxBrackets.AddRange(usBrackets);

    // Vietnam Tax System (example)
    var vnConfig = new TaxCalculator.Domain.Entities.TaxConfig
    {
        Name = "Vietnam - 2024",
        CountryCode = "VN",
        Currency = "VND",
        IsActive = true,
        IsDefault = false,
        SocialInsuranceRate = 8m,
        HealthInsuranceRate = 1.5m,
        UnemploymentInsuranceRate = 1m,
        PersonalDeduction = 11000000m, // 11 million VND
        DependentDeduction = 4400000m, // 4.4 million VND per dependent
        MaxInsuranceBase = 36000000m, // 36 million VND
        Notes = "Vietnam Tax System 2024"
    };

    context.TaxConfigs.Add(vnConfig);
    await context.SaveChangesAsync();

    // Add Vietnam tax brackets
    var vnBrackets = new[]
    {
        new TaxCalculator.Domain.Entities.TaxBracket { TaxConfigId = vnConfig.Id, MinIncome = 0, MaxIncome = 5000000, Rate = 5 },
        new TaxCalculator.Domain.Entities.TaxBracket { TaxConfigId = vnConfig.Id, MinIncome = 5000000, MaxIncome = 10000000, Rate = 10 },
        new TaxCalculator.Domain.Entities.TaxBracket { TaxConfigId = vnConfig.Id, MinIncome = 10000000, MaxIncome = 18000000, Rate = 15 },
        new TaxCalculator.Domain.Entities.TaxBracket { TaxConfigId = vnConfig.Id, MinIncome = 18000000, MaxIncome = 32000000, Rate = 20 },
        new TaxCalculator.Domain.Entities.TaxBracket { TaxConfigId = vnConfig.Id, MinIncome = 32000000, MaxIncome = 52000000, Rate = 25 },
        new TaxCalculator.Domain.Entities.TaxBracket { TaxConfigId = vnConfig.Id, MinIncome = 52000000, MaxIncome = 80000000, Rate = 30 },
        new TaxCalculator.Domain.Entities.TaxBracket { TaxConfigId = vnConfig.Id, MinIncome = 80000000, MaxIncome = null, Rate = 35 }
    };

    context.TaxBrackets.AddRange(vnBrackets);
    await context.SaveChangesAsync();
}

