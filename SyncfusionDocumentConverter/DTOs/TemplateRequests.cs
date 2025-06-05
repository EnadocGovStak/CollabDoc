using System.ComponentModel.DataAnnotations;

namespace SyncfusionDocumentConverter.DTOs
{
    public class CreateTemplateRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        public string Category { get; set; } = string.Empty;
        
        public bool IsActive { get; set; } = true;
        public bool IsPublic { get; set; } = true;
        
        public string? CreatedBy { get; set; }
        
        public Dictionary<string, object>? Metadata { get; set; }
        
        public List<string>? Tags { get; set; }
        
        // Classification and record management
        public string? ClassificationPolicy { get; set; }
        public string? RetentionPolicy { get; set; }
        public bool RequiresApproval { get; set; } = false;
    }

    public class UpdateTemplateRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; }
        public bool? IsActive { get; set; }
        public Dictionary<string, object>? Metadata { get; set; }
    }

    public class TemplateResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? FilePath { get; set; }
        public long? FileSize { get; set; }
        public Dictionary<string, object>? Metadata { get; set; }
        public IEnumerable<string>? MergeFields { get; set; }
        
        // Additional properties for enhanced functionality
        public string? Content { get; set; }
        public List<string>? Tags { get; set; }
        public string? ClassificationPolicy { get; set; }
        public string? RetentionPolicy { get; set; }
        public bool RequiresApproval { get; set; }
        public bool IsPublic { get; set; }
        public int Version { get; set; } = 1;
    }

    public class MailMergeRequest
    {
        [Required]
        public Dictionary<string, object> MergeData { get; set; } = new();
        
        public bool RemoveEmptyParagraphs { get; set; } = true;
        public bool SaveToLibrary { get; set; } = true;
        
        public string? OutputFileName { get; set; }
        public string? DocumentName { get; set; }
        
        public string OutputFormat { get; set; } = "SFDT"; // SFDT, DOCX, PDF
        
        public string? CreatedBy { get; set; }
    }

    public class CreateDocumentFromTemplateRequest
    {
        [Required]
        public string DocumentName { get; set; } = string.Empty;
        
        public Dictionary<string, object>? MergeData { get; set; }
        
        public string? Description { get; set; }
        public string? Category { get; set; }
        public bool? IsPublic { get; set; }
        
        public string? CreatedBy { get; set; }
    }
} 