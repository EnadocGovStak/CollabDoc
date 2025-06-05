using System.ComponentModel.DataAnnotations;

namespace SyncfusionDocumentConverter.DTOs
{
    public class CreateDocumentRequest
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        public string Content { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string? DocumentType { get; set; }
        
        [StringLength(50)]
        public string? Classification { get; set; }
        
        [StringLength(50)]
        public string? RetentionPeriod { get; set; }
    }

    public class DocumentResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public string Classification { get; set; } = string.Empty;
        public string RetentionPeriod { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int Version { get; set; }
        public string? FileName { get; set; }
        public string? FileExtension { get; set; }
        public long? FileSize { get; set; }
        public bool IsTemplate { get; set; }
    }

    public class DocumentListResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public string Classification { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int Version { get; set; }
        public string? FileName { get; set; }
        public long? FileSize { get; set; }
        public bool IsTemplate { get; set; }
    }

    public class ConversionResponse
    {
        public bool Success { get; set; }
        public string? Content { get; set; }
        public string? FileName { get; set; }
        public string? Error { get; set; }
        public string? Message { get; set; }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
        public string? Error { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
} 