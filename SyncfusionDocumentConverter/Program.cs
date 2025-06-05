using Microsoft.AspNetCore.Http.Features;
using Syncfusion.Licensing;
using SyncfusionDocumentConverter.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register application services
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<ITemplateService, TemplateService>();
builder.Services.AddScoped<DirectDocxService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? new[] { "http://localhost:3000", "http://localhost:5000" };

        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure file upload limits
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 52428800; // 50MB
});

var app = builder.Build();

// Register Syncfusion license
var licenseKey = app.Configuration["Syncfusion:LicenseKey"];
if (!string.IsNullOrEmpty(licenseKey))
{
    // Clean the license key (remove any semicolons or extra content)
    var cleanLicenseKey = licenseKey.Split(';')[0].Trim();
    SyncfusionLicenseProvider.RegisterLicense(cleanLicenseKey);
    app.Logger.LogInformation("Syncfusion license registered successfully in Program.cs");
}
else
{
    app.Logger.LogWarning("Syncfusion license key not found in configuration");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Make Program class accessible for testing
public partial class Program { } 