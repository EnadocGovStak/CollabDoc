using SyncfusionDocumentConverter.DTOs;

namespace Collabdoc.Web.Services
{
    public interface IRecordManagementService
    {
        Task<ApiResponse<DocumentRecord>> CreateRecordAsync(CreateDocumentRecordRequest request);
        Task<ApiResponse<IEnumerable<DocumentRecord>>> GetRecordsAsync();
        Task<ApiResponse<DocumentRecord>> GetRecordAsync(int id);
        Task<ApiResponse<bool>> UpdateRecordAsync(int id, UpdateDocumentRecordRequest request);
        Task<ApiResponse<bool>> DeleteRecordAsync(int id);
        Task<ApiResponse<bool>> ArchiveRecordAsync(int id);
        Task<ApiResponse<IEnumerable<RecordRetentionPolicy>>> GetRetentionPoliciesAsync();
        Task<ApiResponse<IEnumerable<DocumentRecord>>> GetRecordsNearingRetentionAsync();
        Task<ApiResponse<bool>> ApplyRetentionPolicyAsync(int recordId, string policyId);
    }

    public class DocumentRecord
    {
        public int Id { get; set; }
        public string DocumentId { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public string RecordType { get; set; } = string.Empty;
        public string Classification { get; set; } = string.Empty;
        public string RetentionPeriod { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? RetentionDate { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Dictionary<string, string> Metadata { get; set; } = new();
        public List<RecordAction> Actions { get; set; } = new();
        public bool RequiresApproval { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
    }

    public class RecordAction
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string PerformedBy { get; set; } = string.Empty;
        public DateTime PerformedAt { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    public class CreateDocumentRecordRequest
    {
        public string DocumentId { get; set; } = string.Empty;
        public string DocumentName { get; set; } = string.Empty;
        public string RecordType { get; set; } = string.Empty;
        public string Classification { get; set; } = string.Empty;
        public string RetentionPeriod { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public Dictionary<string, string> Metadata { get; set; } = new();
    }

    public class UpdateDocumentRecordRequest
    {
        public string? RecordType { get; set; }
        public string? Classification { get; set; }
        public string? RetentionPeriod { get; set; }
        public string? Description { get; set; }
        public Dictionary<string, string>? Metadata { get; set; }
    }

    public class RecordRetentionPolicy
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public string Classification { get; set; } = string.Empty;
        public bool AutoArchive { get; set; }
        public bool RequireApproval { get; set; }
    }
} 