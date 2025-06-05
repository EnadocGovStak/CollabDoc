using Syncfusion.Blazor;
using Collabdoc.Web.Services;
using Collabdoc.Web.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        options.DetailedErrors = true;
    }
});
builder.Services.AddControllersWithViews();

// Add Entity Framework
builder.Services.AddDbContext<CollabdocDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register Syncfusion license BEFORE adding Syncfusion services
var licenseKey = builder.Configuration["Syncfusion:LicenseKey"];
if (!string.IsNullOrEmpty(licenseKey) && licenseKey != "YOUR_SYNCFUSION_LICENSE_KEY_HERE")
{
    Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense(licenseKey);
    Console.WriteLine("Syncfusion license registered successfully");
}
else
{
    Console.WriteLine("WARNING: Syncfusion license key not found or not set properly. Please add your license key to appsettings.json");
}

// Add Syncfusion Blazor service
builder.Services.AddSyncfusionBlazor();

// Add HTTP client for API calls
builder.Services.AddHttpClient<IDocumentApiService, DocumentApiService>(client =>
{
    client.BaseAddress = new Uri("http://localhost:5003"); // API base URL
    client.Timeout = TimeSpan.FromMinutes(5);
});

// Add application services
builder.Services.AddSingleton<IDocumentStorageService, DocumentStorageService>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<IMergeFieldService, MergeFieldService>();
builder.Services.AddScoped<IRecordManagementService, RecordManagementService>();

var app = builder.Build();

// Ensure database is created and migrations are applied
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CollabdocDbContext>();
    try
    {
        context.Database.EnsureCreated();
        app.Logger.LogInformation("Database created/updated successfully");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Error creating/updating database");
    }
}

// Configure the HTTP request pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.MapRazorPages();
app.MapBlazorHub();
app.MapFallbackToPage("/_Host");
app.MapControllers();

// Ensure Documents directory exists
var documentsPath = Path.Combine(app.Environment.ContentRootPath, "Documents");
if (!Directory.Exists(documentsPath))
{
    Directory.CreateDirectory(documentsPath);
}

app.Run(); 