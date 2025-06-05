using Microsoft.AspNetCore.Mvc;
using SyncfusionDocumentConverter.Services;
using SyncfusionDocumentConverter.DTOs;

namespace SyncfusionDocumentConverter.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentController : ControllerBase
    {
        private readonly ILogger<DocumentController> _logger;
        private readonly IDocumentService _documentService;

        public DocumentController(ILogger<DocumentController> logger, IDocumentService documentService)
        {
            _logger = logger;
            _documentService = documentService;
        }

        [HttpPost("convert-to-sfdt")]
        public async Task<IActionResult> ConvertToSfdt(IFormFile file)
        {
            var result = await _documentService.ConvertToSfdtAsync(file);
            
            if (result.Success)
            {
                return Ok(result.Content);
            }
            
            return BadRequest(new { error = result.Error, message = result.Message });
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportDocument(IFormFile files)
        {
            var result = await _documentService.ImportDocumentAsync(files);
            
            if (result.Success)
            {
                return Ok(new
                {
                    success = true,
                    fileName = result.FileName,
                    content = result.Content,
                    message = result.Message
                });
            }
            
            return BadRequest(new { error = result.Error, message = result.Message });
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveDocument([FromForm] CreateDocumentRequest request, IFormFile? document = null)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _documentService.SaveDocumentAsync(request, document);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return StatusCode(500, result);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetDocuments()
        {
            var result = await _documentService.GetDocumentsAsync();
            
            if (result.Success)
            {
                return Ok(result.Data);
            }
            
            return StatusCode(500, new { error = result.Error, message = result.Message });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDocument(string id)
        {
            var result = await _documentService.GetDocumentAsync(id);
            
            if (result.Success)
            {
                return Ok(result.Data);
            }
            
            if (result.Error == "Document not found" || result.Error == "Document not found or deleted")
            {
                return NotFound(new { error = result.Error });
            }
            
            return StatusCode(500, new { error = result.Error, message = result.Message });
        }

        [HttpGet("{id}/versions")]
        public async Task<IActionResult> GetDocumentVersions(string id)
        {
            var result = await _documentService.GetDocumentVersionsAsync(id);
            
            if (result.Success)
            {
                return Ok(result.Data);
            }
            
            if (result.Error == "Document not found")
            {
                return NotFound(new { error = result.Error });
            }
            
            return StatusCode(500, new { error = result.Error, message = result.Message });
        }

        [HttpGet("{id}/versions/{version}")]
        public async Task<IActionResult> GetDocumentVersion(string id, int version)
        {
            var result = await _documentService.GetDocumentVersionAsync(id, version);
            
            if (result.Success)
            {
                return Ok(result.Data);
            }
            
            if (result.Error == "Document not found" || result.Error == "Version not found")
            {
                return NotFound(new { error = result.Error });
            }
            
            return StatusCode(500, new { error = result.Error, message = result.Message });
        }

        [HttpPost("mail-merge")]
        public async Task<IActionResult> PerformMailMerge(IFormFile templateFile, [FromForm] string mergeData, [FromForm] bool removeEmptyParagraphs = true)
        {
            var result = await _documentService.PerformMailMergeAsync(templateFile, mergeData, removeEmptyParagraphs);
            
            if (result.Success)
            {
                return Ok(result.Data);
            }
            
            return StatusCode(500, new { error = result.Error, message = result.Message });
        }

        [HttpPost("SystemClipboard")]
        public IActionResult HandleSystemClipboard([FromBody] dynamic clipboardData)
        {
            try
            {
                _logger.LogInformation("System clipboard data received");
                return Ok(new { success = true, message = "Clipboard data processed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing clipboard data");
                return StatusCode(500, new { error = "Failed to process clipboard data" });
            }
        }

        [HttpGet("conversion/status")]
        public IActionResult GetConversionStatus()
        {
            var result = _documentService.GetConversionStatus();
            return Ok(result.Data);
        }

        [HttpGet("capabilities")]
        public IActionResult GetCapabilities()
        {
            var result = _documentService.GetCapabilities();
            return Ok(result.Data);
        }

        /// <summary>
        /// Delete document by ID
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(string id)
        {
            try
            {
                var result = await _documentService.DeleteDocumentAsync(id);
                
                if (result.Success)
                {
                    return Ok(new { success = true, message = "Document deleted successfully" });
                }
                
                if (result.Error == "Document not found")
                {
                    return NotFound(new { error = result.Error });
                }
                
                return BadRequest(new { error = result.Error, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting document {DocumentId}", id);
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            try
            {
                var status = new
                {
                    status = "UP",
                    timestamp = DateTime.UtcNow,
                    service = "Document Service",
                    version = "1.0.0",
                    capabilities = new[]
                    {
                        "Document conversion",
                        "SFDT processing",
                        "Mail merge",
                        "File import/export"
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