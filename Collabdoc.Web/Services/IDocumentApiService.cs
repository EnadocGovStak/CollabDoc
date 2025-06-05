using SyncfusionDocumentConverter.DTOs;

namespace Collabdoc.Web.Services
{
    public interface IDocumentApiService
    {
        // Dashboard operations
        Task<ApiResponse<DashboardStats>> GetDashboardStatsAsync();
        Task<ApiResponse<IEnumerable<DocumentInfo>>> GetRecentDocumentsAsync(int count = 10);

        // Direct DOCX operations
        Task<ApiResponse<byte[]>> CreateDirectDocxAsync();
        Task<ApiResponse<byte[]>> ModifyDirectDocxAsync(byte[] fileData, string fileName, Dictionary<string, string> replacements);
        Task<ApiResponse<TextExtractionResult>> ExtractTextFromDirectDocxAsync(byte[] fileData, string fileName);
        Task<ApiResponse<object>> AnalyzeDirectDocxAsync(byte[] fileData, string fileName);
        Task<ApiResponse<string>> RunDirectDocxDemoAsync();
        Task<ApiResponse<object>> GetDirectDocxCapabilitiesAsync();
        Task<ApiResponse<object>> CheckDirectDocxHealthAsync();

        // Document operations
        Task<ApiResponse<string>> ConvertToSfdtAsync(byte[] fileData, string fileName);
        Task<ApiResponse<DocumentInfo>> ImportDocumentAsync(Stream fileStream, string fileName);
        Task<ApiResponse<IEnumerable<DocumentInfo>>> GetDocumentsAsync();
        Task<ApiResponse<DocumentInfo>> GetDocumentAsync(int id);
        Task<HttpResponseMessage> GetDocumentAsync(string documentId);
        Task<HttpResponseMessage> SaveDocumentAsync(string documentName, string sfdtContent);
        Task<ApiResponse<DocumentInfo>> UploadDocumentAsync(byte[] fileData, string fileName);
        Task<ApiResponse<bool>> DeleteDocumentAsync(int id);

        // Template operations
        Task<ApiResponse<IEnumerable<TemplateInfo>>> GetTemplatesAsync();
        Task<ApiResponse<TemplateInfo>> GetTemplateAsync(int id);
        Task<ApiResponse<TemplateInfo>> CreateTemplateAsync(TemplateCreateRequest request);
        Task<ApiResponse<bool>> DeleteTemplateAsync(int id);

        // Records operations
        Task<ApiResponse<IEnumerable<RecordInfo>>> GetRecordsAsync();
        Task<ApiResponse<RecordInfo>> GetRecordAsync(int id);
        Task<ApiResponse<RecordInfo>> CreateRecordAsync(RecordCreateRequest request);
        Task<ApiResponse<bool>> DeleteRecordAsync(int id);
    }

    // DTOs for the web application
    public class DashboardStats
    {
        public int TotalDocuments { get; set; }
        public int TotalTemplates { get; set; }
        public int TotalRecords { get; set; }
        public int ProcessingJobs { get; set; }
    }

    public class DocumentInfo
    {
        public int Id { get; set; }
        public string DocumentId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public long Size { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastModified { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class TemplateInfo
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class RecordInfo
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Classification { get; set; } = string.Empty;
        public string RetentionPeriod { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class TemplateCreateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public byte[]? Content { get; set; }
    }

    public class RecordCreateRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Classification { get; set; } = string.Empty;
        public string RetentionPeriod { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class TextExtractionResult
    {
        public TextContent? TextContent { get; set; }
        public DocumentMetadata? Metadata { get; set; }
    }

    public class TextContent
    {
        public string FullText { get; set; } = string.Empty;
        public int WordCount { get; set; }
        public int CharacterCount { get; set; }
        public int ParagraphCount { get; set; }
    }

    public class DocumentMetadata
    {
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
} 