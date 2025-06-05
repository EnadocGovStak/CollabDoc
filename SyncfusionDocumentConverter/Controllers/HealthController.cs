using Microsoft.AspNetCore.Mvc;

namespace SyncfusionDocumentConverter.Controllers
{
    [ApiController]
    [Route("api")]
    public class HealthController : ControllerBase
    {
        private readonly ILogger<HealthController> _logger;
        private readonly IConfiguration _configuration;

        public HealthController(ILogger<HealthController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            try
            {
                var licenseKey = _configuration["Syncfusion:LicenseKey"];
                var hasLicense = !string.IsNullOrEmpty(licenseKey);
                
                return Ok(new 
                {
                    status = "UP",
                    timestamp = DateTime.UtcNow,
                    service = "CollabDoc Backend",
                    version = "1.0.0",
                    components = new
                    {
                        syncfusion = new
                        {
                            status = "UP",
                            hasLicense = hasLicense,
                            licenseConfigured = hasLicense ? "Yes" : "No",
                            version = "29.1.33"
                        },
                        documentService = new
                        {
                            status = "UP",
                            description = "Document conversion and processing"
                        },
                        templateService = new
                        {
                            status = "UP", 
                            description = "Template management"
                        },
                        recordsService = new
                        {
                            status = "UP",
                            description = "Records management"
                        }
                    },
                    endpoints = new[]
                    {
                        "/api/document/*",
                        "/api/templates/*", 
                        "/api/records/*",
                        "/api/health"
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Health check failed");
                return StatusCode(500, new 
                { 
                    status = "DOWN",
                    timestamp = DateTime.UtcNow,
                    error = "Health check failed",
                    details = ex.Message
                });
            }
        }
    }
} 