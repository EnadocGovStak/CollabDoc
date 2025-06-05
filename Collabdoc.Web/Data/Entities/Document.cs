using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Collabdoc.Web.Data.Entities
{
    public class Document
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(36)]
        public string DocumentId { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [StringLength(10)]
        public string FileType { get; set; } = "SFDT";

        [Required]
        public long Size { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty; // SFDT content as JSON string

        // NEW: Metadata field to store JSON data like merge fields, template settings, etc.
        public string? Metadata { get; set; }

        [StringLength(100)]
        public string? CreatedBy { get; set; }

        [StringLength(100)]
        public string? LastModifiedBy { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime LastModified { get; set; } = DateTime.UtcNow;

        [StringLength(20)]
        public string Status { get; set; } = "Active";

        [StringLength(50)]
        public string? Category { get; set; }

        [StringLength(100)]
        public string? Tags { get; set; }

        public bool IsTemplate { get; set; } = false;

        public bool IsPublic { get; set; } = true;

        public int Version { get; set; } = 1;

        // NEW: Template classification and document management properties
        public int? TemplateId { get; set; }  // Reference to source template

        [StringLength(50)]
        public string? ClassificationPolicy { get; set; }  // Inherited from template

        [StringLength(100)]
        public string? RetentionPolicy { get; set; }

        public bool RequiresApproval { get; set; } = false;

        public DateTime? ExpiryDate { get; set; }

        // Navigation properties
        public virtual ICollection<DocumentVersion> Versions { get; set; } = new List<DocumentVersion>();
        public virtual ICollection<DocumentShare> Shares { get; set; } = new List<DocumentShare>();
        public virtual ICollection<DocumentComment> Comments { get; set; } = new List<DocumentComment>();
    }
} 