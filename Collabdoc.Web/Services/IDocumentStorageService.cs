namespace Collabdoc.Web.Services
{
    public interface IDocumentStorageService
    {
        Task<string> SaveDocumentAsync(string documentId, string documentName, string sfdtContent);
        Task<DocumentStorageResult> LoadDocumentAsync(string documentId);
        Task<bool> DeleteDocumentAsync(string documentId);
        Task<IEnumerable<StoredDocumentMetadata>> GetDocumentListAsync();
        Task<bool> DocumentExistsAsync(string documentId);
        Task<string> ConvertSfdtToDocxAsync(string sfdtContent);
        Task<string> ConvertDocxToSfdtAsync(byte[] docxContent);
    }

    public class DocumentStorageResult
    {
        public bool Success { get; set; }
        public string? Content { get; set; }
        public string? DocumentName { get; set; }
        public DateTime? LastModified { get; set; }
        public string? Error { get; set; }
    }

    public class StoredDocumentMetadata
    {
        public string DocumentId { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime LastModified { get; set; }
        public long Size { get; set; }
        public string FileType { get; set; } = "SFDT";
    }
} 