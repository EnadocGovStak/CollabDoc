using Microsoft.AspNetCore.Mvc;
using SyncfusionDocumentConverter.Services;
using SyncfusionDocumentConverter.DTOs;
using SyncfusionDocumentConverter.Models;

namespace SyncfusionDocumentConverter.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TemplatesController : ControllerBase
    {
        private readonly ILogger<TemplatesController> _logger;
        private readonly IDocumentService _documentService;
        private readonly ITemplateService _templateService;

        public TemplatesController(ILogger<TemplatesController> logger, IDocumentService documentService, ITemplateService templateService)
        {
            _logger = logger;
            _documentService = documentService;
            _templateService = templateService;
        }

        /// <summary>
        /// Get all templates
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<TemplateResponse>>>> GetTemplates()
        {
            var result = await _templateService.GetTemplatesAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get a specific template by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<TemplateResponse>>> GetTemplate(int id)
        {
            var result = await _templateService.GetTemplateAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// Create a new template
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<TemplateResponse>>> CreateTemplate([FromForm] CreateTemplateRequest request, IFormFile? templateFile = null)
        {
            var result = await _templateService.CreateTemplateAsync(request, templateFile);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return CreatedAtAction(nameof(GetTemplate), new { id = result.Data?.Id }, result);
        }

        /// <summary>
        /// Update an existing template
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<TemplateResponse>>> UpdateTemplate(int id, [FromForm] UpdateTemplateRequest request, IFormFile? templateFile = null)
        {
            var result = await _templateService.UpdateTemplateAsync(id, request, templateFile);
            if (!result.Success)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// Delete a template
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteTemplate(int id)
        {
            var result = await _templateService.DeleteTemplateAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// Get template merge fields
        /// </summary>
        [HttpGet("{id}/merge-fields")]
        public async Task<ActionResult<ApiResponse<IEnumerable<string>>>> GetTemplateMergeFields(int id)
        {
            var result = await _templateService.GetTemplateMergeFieldsAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// Get template merge structure - returns empty JSON payload with placeholders for API consumers
        /// </summary>
        [HttpGet("{id}/merge-structure")]
        public async Task<ActionResult<ApiResponse<TemplateMergeStructureResponse>>> GetTemplateMergeStructure(int id)
        {
            try
            {
                var templateResult = await _templateService.GetTemplateAsync(id);
                if (!templateResult.Success || templateResult.Data == null)
                {
                    return NotFound(new ApiResponse<TemplateMergeStructureResponse>
                    {
                        Success = false,
                        Error = "Template not found"
                    });
                }

                var mergeFieldsResult = await _templateService.GetTemplateMergeFieldsAsync(id);
                var mergeFields = mergeFieldsResult.Data ?? new List<string>();

                var structure = new TemplateMergeStructureResponse
                {
                    TemplateId = id,
                    TemplateName = templateResult.Data.Name,
                    Fields = mergeFields.ToDictionary(
                        field => field,
                        field => new FieldStructure
                        {
                            Name = field,
                            Type = "text", // Default type
                            Required = false,
                            DefaultValue = "",
                            Format = null
                        }
                    ),
                    ClassificationPolicy = new RecordManagementPolicy
                    {
                        Classification = "Internal",
                        RetentionPeriod = "7 years",
                        RequiresApproval = false
                    }
                };

                return Ok(new ApiResponse<TemplateMergeStructureResponse>
                {
                    Success = true,
                    Data = structure,
                    Message = $"Template merge structure with {mergeFields.Count()} fields"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting template merge structure for template {TemplateId}", id);
                return StatusCode(500, new ApiResponse<TemplateMergeStructureResponse>
                {
                    Success = false,
                    Error = "Failed to get template merge structure"
                });
            }
        }

        /// <summary>
        /// Perform mail merge on template - supports both saving to library and returning as payload
        /// </summary>
        [HttpPost("{id}/merge")]
        public async Task<ActionResult<ApiResponse<DocumentResponse>>> MergeTemplate(int id, [FromBody] MergeTemplateRequest request)
        {
            try
            {
                // Convert MergeTemplateRequest to MailMergeRequest
                var mailMergeRequest = new MailMergeRequest
                {
                    MergeData = request.MergeData,
                    OutputFileName = request.DocumentName,
                    OutputFormat = request.OutputFormat,
                    RemoveEmptyParagraphs = true
                };

                var result = await _templateService.PerformMailMergeAsync(id, mailMergeRequest);
                
                if (!result.Success)
                {
                    return BadRequest(result);
                }

                // If SaveToLibrary is false, don't include content in response for large documents
                if (!request.SaveToLibrary && result.Data != null)
                {
                    result.Data.Content = request.OutputFormat == "DOCX" ? null : result.Data.Content;
                    result.Message = "Document merged successfully (not saved to library)";
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing mail merge for template {TemplateId}", id);
                return StatusCode(500, new ApiResponse<DocumentResponse>
                {
                    Success = false,
                    Error = "Failed to perform mail merge"
                });
            }
        }

        /// <summary>
        /// Create a document from template (with optional merge data)
        /// </summary>
        [HttpPost("{id}/create-document")]
        public async Task<ActionResult<ApiResponse<DocumentResponse>>> CreateDocumentFromTemplate(int id, [FromBody] CreateDocumentFromTemplateRequest request)
        {
            var result = await _templateService.CreateDocumentFromTemplateAsync(id, request);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// Get template categories
        /// </summary>
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetTemplateCategories()
        {
            var categories = await _templateService.GetTemplateCategoriesAsync();
            return Ok(categories);
        }
    }

    // Enhanced DTOs for API-based template merging
    public class MergeTemplateRequest
    {
        public Dictionary<string, object> MergeData { get; set; } = new();
        public bool SaveToLibrary { get; set; } = true;
        public string OutputFormat { get; set; } = "SFDT";
        public string? DocumentName { get; set; }
        public string? CreatedBy { get; set; }
    }

    public class TemplateMergeStructureResponse
    {
        public int TemplateId { get; set; }
        public string TemplateName { get; set; } = "";
        public Dictionary<string, FieldStructure> Fields { get; set; } = new();
        public RecordManagementPolicy? ClassificationPolicy { get; set; }
    }

    public class FieldStructure
    {
        public string Name { get; set; } = "";
        public string Type { get; set; } = "";
        public bool Required { get; set; }
        public string? DefaultValue { get; set; }
        public List<string>? Options { get; set; }
        public string? Format { get; set; }
    }

    public class RecordManagementPolicy
    {
        public string Classification { get; set; } = "";
        public string RetentionPeriod { get; set; } = "";
        public bool RequiresApproval { get; set; }
    }
} 