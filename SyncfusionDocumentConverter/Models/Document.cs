using System.ComponentModel.DataAnnotations;

namespace SyncfusionDocumentConverter.Models
{
    public class Document
    {
        public string Id { get; set; } = string.Empty;
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        public string Content { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string DocumentType { get; set; } = "other";
        
        [StringLength(50)]
        public string Classification { get; set; } = "internal";
        
        [StringLength(50)]
        public string RetentionPeriod { get; set; } = "3years";
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int Version { get; set; } = 1;
        
        [StringLength(100)]
        public string? FileName { get; set; }
        
        [StringLength(10)]
        public string? FileExtension { get; set; }
        
        public long? FileSize { get; set; }
        
        [StringLength(100)]
        public string? CreatedBy { get; set; }
        
        [StringLength(100)]
        public string? LastModifiedBy { get; set; }
        
        public bool IsTemplate { get; set; } = false;
        public bool IsDeleted { get; set; } = false;
    }
} 