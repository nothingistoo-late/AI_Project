using PokerGame.Business.Services;
using Microsoft.OpenApi.Models;

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
        Title = "Poker Game API", 
        Version = "v1",
        Description = "Texas Hold'em Poker Game API"
    });
});

// Register services
builder.Services.AddSingleton<IHandEvaluator, HandEvaluator>();
builder.Services.AddSingleton<IOddsCalculator, OddsCalculator>();
builder.Services.AddSingleton<IPokerMathService, PokerMathService>();
builder.Services.AddSingleton<IBotService, BotService>();
builder.Services.AddSingleton<IGameService, GameService>();

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
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Poker Game API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowReactApp");
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();

