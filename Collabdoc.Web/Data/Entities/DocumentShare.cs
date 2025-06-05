using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Collabdoc.Web.Data.Entities
{
    public class DocumentShare
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DocumentId { get; set; }

        [Required]
        [StringLength(100)]
        public string SharedWith { get; set; } = string.Empty; // User identifier

        [Required]
        [StringLength(20)]
        public string Permission { get; set; } = "Read"; // Read, Write, Admin

        [StringLength(100)]
        public string? SharedBy { get; set; }

        [Required]
        public DateTime SharedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ExpiresAt { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties
        [ForeignKey(nameof(DocumentId))]
        public virtual Document Document { get; set; } = null!;
    }
} 