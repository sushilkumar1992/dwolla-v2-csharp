using Dwolla.Client;
using DwollaFullFlow.Api.Configuration;
using DwollaFullFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<DwollaOptions>(builder.Configuration.GetSection("Dwolla"));
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<IDwollaClient>(sp =>
{
    var options = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<DwollaOptions>>().Value;
    return DwollaClient.Create(options.IsSandbox);
});
builder.Services.AddScoped<IDwollaGateway, DwollaGateway>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
