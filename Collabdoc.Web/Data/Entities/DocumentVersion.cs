using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Collabdoc.Web.Data.Entities
{
    public class DocumentVersion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DocumentId { get; set; }

        [Required]
        public int VersionNumber { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty; // SFDT content

        [StringLength(500)]
        public string? ChangeDescription { get; set; }

        [StringLength(100)]
        public string? CreatedBy { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public long Size { get; set; }

        // Navigation properties
        [ForeignKey(nameof(DocumentId))]
        public virtual Document Document { get; set; } = null!;
    }
} 