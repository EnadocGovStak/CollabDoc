using Microsoft.AspNetCore.Mvc;

namespace SyncfusionDocumentConverter.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecordsController : ControllerBase
    {
        private readonly ILogger<RecordsController> _logger;

        public RecordsController(ILogger<RecordsController> logger)
        {
            _logger = logger;
        }

        [HttpGet("document-types")]
        public IActionResult GetDocumentTypes()
        {
            try
            {
                var documentTypes = new[]
                {
                    new { id = "policy", name = "Policy Document", description = "Organizational policies and procedures" },
                    new { id = "contract", name = "Contract", description = "Legal agreements and contracts" },
                    new { id = "memo", name = "Memorandum", description = "Internal communications and memos" },
                    new { id = "report", name = "Report", description = "Business reports and analysis" },
                    new { id = "procedure", name = "Procedure", description = "Standard operating procedures" },
                    new { id = "form", name = "Form", description = "Business forms and templates" },
                    new { id = "correspondence", name = "Correspondence", description = "External communications" },
                    new { id = "manual", name = "Manual", description = "User guides and manuals" },
                    new { id = "specification", name = "Specification", description = "Technical specifications" },
                    new { id = "other", name = "Other", description = "Other document types" }
                };

                return Ok(documentTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving document types");
                return StatusCode(500, new { error = "Failed to retrieve document types", details = ex.Message });
            }
        }

        [HttpGet("classifications")]
        public IActionResult GetClassifications()
        {
            try
            {
                var classifications = new[]
                {
                    new { id = "public", name = "Public", description = "Information available to the general public" },
                    new { id = "internal", name = "Internal", description = "Information for internal use only" },
                    new { id = "confidential", name = "Confidential", description = "Sensitive information with restricted access" },
                    new { id = "restricted", name = "Restricted", description = "Highly sensitive information with very limited access" }
                };

                return Ok(classifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving classifications");
                return StatusCode(500, new { error = "Failed to retrieve classifications", details = ex.Message });
            }
        }

        [HttpGet("retention-periods")]
        public IActionResult GetRetentionPeriods()
        {
            try
            {
                var retentionPeriods = new[]
                {
                    new { id = "1year", name = "1 Year", months = 12 },
                    new { id = "2years", name = "2 Years", months = 24 },
                    new { id = "3years", name = "3 Years", months = 36 },
                    new { id = "5years", name = "5 Years", months = 60 },
                    new { id = "7years", name = "7 Years", months = 84 },
                    new { id = "10years", name = "10 Years", months = 120 },
                    new { id = "permanent", name = "Permanent", months = -1 }
                };

                return Ok(retentionPeriods);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving retention periods");
                return StatusCode(500, new { error = "Failed to retrieve retention periods", details = ex.Message });
            }
        }
    }
} 