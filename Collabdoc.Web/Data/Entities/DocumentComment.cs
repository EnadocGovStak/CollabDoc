using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Collabdoc.Web.Data.Entities
{
    public class DocumentComment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DocumentId { get; set; }

        [Required]
        [StringLength(2000)]
        public string Content { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Author { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public bool IsResolved { get; set; } = false;

        public int? ParentCommentId { get; set; }

        [StringLength(50)]
        public string? ElementId { get; set; } // For targeting specific document elements

        // Navigation properties
        [ForeignKey(nameof(DocumentId))]
        public virtual Document Document { get; set; } = null!;

        [ForeignKey(nameof(ParentCommentId))]
        public virtual DocumentComment? ParentComment { get; set; }

        public virtual ICollection<DocumentComment> Replies { get; set; } = new List<DocumentComment>();
    }
} 