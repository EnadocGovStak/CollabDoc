using Microsoft.AspNetCore.Mvc;
using SyncfusionDocumentConverter.Services;
using System.Text.Json;

namespace SyncfusionDocumentConverter.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DirectDocxController : ControllerBase
    {
        private readonly ILogger<DirectDocxController> _logger;
        private readonly DirectDocxService _directDocxService;

        public DirectDocxController(ILogger<DirectDocxController> logger, DirectDocxService directDocxService)
        {
            _logger = logger;
            _directDocxService = directDocxService;
        }

        /// <summary>
        /// Demonstrates direct DOCX handling capabilities
        /// GET /api/DirectDocx/demo
        /// </summary>
        [HttpGet("demo")]
        public async Task<IActionResult> RunDemo()
        {
            _logger.LogInformation("Running Direct DOCX demonstration");
            
            var result = await _directDocxService.DemonstrateDirectDocxHandlingAsync();
            
            if (result.Success)
            {
                return Ok(result.Data);
            }
            
            return StatusCode(500, new { error = result.Error, message = result.Message });
        }

        /// <summary>
        /// Creates a new Word document with sample content
        /// POST /api/DirectDocx/create
        /// </summary>
        [HttpPost("create")]
        public async Task<IActionResult> CreateDocument()
        {
            _logger.LogInformation("Creating new Word document");
            
            var result = await _directDocxService.CreateNewDocumentAsync();
            
            if (result.Success && result.Data != null)
            {
                return File(result.Data, 
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
                    "DirectDocIO_Demo.docx");
            }
            
            return StatusCode(500, new { error = result.Error, message = result.Message });
        }

        /// <summary>
        /// Modifies an existing Word document with text replacements
        /// POST /api/DirectDocx/modify
        /// </summary>
        [HttpPost("modify")]
        public async Task<IActionResult> ModifyDocument(IFormFile file, [FromForm] string replacements)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { error = "No file provided" });
            }

            if (string.IsNullOrEmpty(replacements))
            {
                return BadRequest(new { error = "No replacements provided" });
            }

            try
            {
                var replacementDict = JsonSerializer.Deserialize<Dictionary<string, string>>(replacements);
                if (replacementDict == null || !replacementDict.Any())
                {
                    return BadRequest(new { error = "Invalid replacements format" });
                }

                _logger.LogInformation("Modifying document with {Count} replacements", replacementDict.Count);
                
                var result = await _directDocxService.ModifyWordDocumentAsync(file, replacementDict);
                
                if (result.Success && result.Data != null)
                {
                    var fileName = Path.GetFileNameWithoutExtension(file.FileName) + "_modified.docx";
                    return File(result.Data, 
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
                        fileName);
                }
                
                return StatusCode(500, new { error = result.Error, message = result.Message });
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Invalid JSON format for replacements");
                return BadRequest(new { error = "Invalid JSON format for replacements" });
            }
        }

        /// <summary>
        /// Extracts text and metadata from a Word document
        /// POST /api/DirectDocx/extract-text
        /// </summary>
        [HttpPost("extract-text")]
        public async Task<IActionResult> ExtractText(IFormFile? file = null)
        {
            _logger.LogInformation("Extracting text from document");
            
            var result = await _directDocxService.ExtractTextFromDocumentAsync(file);
            
            if (result.Success)
            {
                return Ok(result.Data);
            }
            
            if (result.Error == "No document provided and demo document not found")
            {
                return BadRequest(new { error = result.Error, message = result.Message });
            }
            
            return StatusCode(500, new { error = result.Error, message = result.Message });
        }

        /// <summary>
        /// Analyzes document structure and properties
        /// POST /api/DirectDocx/analyze
        /// </summary>
        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzeDocument(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { error = "No file provided" });
            }

            _logger.LogInformation("Analyzing document structure");
            
            var result = await _directDocxService.ExtractTextFromDocumentAsync(file);
            
            if (result.Success)
            {
                return Ok(new
                {
                    success = true,
                    analysis = result.Data,
                    message = "Document analysis completed successfully"
                });
            }
            
            return StatusCode(500, new { error = result.Error, message = result.Message });
        }

        /// <summary>
        /// Gets the capabilities of the Direct DOCX service
        /// GET /api/DirectDocx/capabilities
        /// </summary>
        [HttpGet("capabilities")]
        public IActionResult GetCapabilities()
        {
            _logger.LogInformation("Getting Direct DOCX service capabilities");
            
            var result = _directDocxService.GetCapabilities();
            
            return Ok(result.Data);
        }

        /// <summary>
        /// Health check for Direct DOCX service
        /// GET /api/DirectDocx/health
        /// </summary>
        [HttpGet("health")]
        public IActionResult Health()
        {
            try
            {
                var status = new
                {
                    status = "UP",
                    timestamp = DateTime.UtcNow,
                    service = "Direct DOCX Service",
                    version = "1.0.0",
                    capabilities = new[]
                    {
                        "Direct DOCX manipulation",
                        "Text replacement",
                        "Document creation",
                        "Text extraction",
                        "Document analysis"
                    }
                };

                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Health check failed");
                return StatusCode(500, new { status = "DOWN", error = ex.Message });
            }
        }
    }
} 