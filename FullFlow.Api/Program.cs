using Dwolla.Client;
using DwollaFullFlow.Api.Configuration;
using DwollaFullFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<DwollaOptions>(builder.Configuration.GetSection("Dwolla"));
builder.Services.Configure<WebhookStoreOptions>(builder.Configuration.GetSection("WebhookStore"));
builder.Services.AddMemoryCache();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy
            .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ??
                         new[] { "http://localhost:5173", "http://localhost:4173" })
            .AllowAnyHeader()
            .AllowAnyMethod());
});
builder.Services.AddSingleton<IDwollaClient>(sp =>
{
    var options = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<DwollaOptions>>().Value;
    return DwollaClient.Create(options.IsSandbox);
});
builder.Services.AddScoped<IDwollaGateway, DwollaGateway>();
builder.Services.AddSingleton<IWebhookVerifier, HmacSha256WebhookVerifier>();
builder.Services.AddSingleton<IWebhookStore, PersistentWebhookStore>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
